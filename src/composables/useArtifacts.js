import { ref, shallowRef, computed, watch } from 'vue'
import { i18n } from 'boot/i18n'

export const SLOTS = ['weapon', 'shield', 'torso', 'head', 'feet', 'cape', 'neck', 'ring', 'misc']
export const RARITIES = ['treasure', 'minor', 'major', 'relic']

const BASE = import.meta.env.BASE_URL || '/'
const asset = (path) => BASE + String(path).replace(/^\//, '')

/* Общее состояние: грузится один раз на всё приложение */
const list = shallowRef([])
const byId = shallowRef({})
const partsOf = shallowRef({}) // comboId -> [partId]
const combosOf = shallowRef({}) // partId -> [comboId]
const translations = shallowRef({})
const loading = ref(false)
const error = ref(null)
let loadPromise = null

async function loadData() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(asset('artifacts.json'))
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()

    const ids = {}
    const names = {}
    for (const a of data) {
      a.image = asset(a.image)
      ids[a.id] = a
      names[a.name] = a.id
    }
    const parts = {}
    const combos = {}
    for (const a of data) {
      for (const comboName of a.leadsTo || []) {
        const comboId = names[comboName]
        if (!comboId) continue
        ;(parts[comboId] ||= []).push(a.id)
        ;(combos[a.id] ||= []).push(comboId)
      }
    }
    byId.value = ids
    partsOf.value = parts
    combosOf.value = combos
    list.value = data
  } catch (e) {
    console.error('Не удалось загрузить artifacts.json', e)
    error.value = e
    loadPromise = null
  } finally {
    loading.value = false
  }
}

async function loadTranslations(lang) {
  if (lang === 'en') {
    translations.value = {}
    return
  }
  try {
    const res = await fetch(asset(`i18n/artifacts.${lang}.json`))
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    translations.value = await res.json()
  } catch {
    translations.value = {}
  }
}

watch(i18n.global.locale, (l) => loadTranslations(l), { immediate: true })

const collator = computed(
  () => new Intl.Collator(i18n.global.locale.value, { sensitivity: 'base', numeric: true }),
)

function nameOf(idOrArt) {
  const a = typeof idOrArt === 'string' ? byId.value[idOrArt] : idOrArt
  if (!a) return typeof idOrArt === 'string' ? idOrArt : ''
  return translations.value[a.id]?.name || a.name
}

function effectsOf(idOrArt) {
  const a = typeof idOrArt === 'string' ? byId.value[idOrArt] : idOrArt
  if (!a) return []
  return translations.value[a.id]?.effects || a.effects || []
}

function compareByName(a, b) {
  return collator.value.compare(nameOf(a), nameOf(b))
}

function sortIds(ids) {
  return [...ids].sort((a, b) => compareByName(a, b))
}

/** Поиск по переведённому и английскому названию */
function matches(art, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return nameOf(art).toLowerCase().includes(q) || art.name.toLowerCase().includes(q)
}

export function useArtifacts() {
  if (!loadPromise && !list.value.length) loadPromise = loadData()
  return {
    list,
    byId,
    partsOf,
    combosOf,
    loading,
    error,
    reload: () => (loadPromise = loadData()),
    nameOf,
    effectsOf,
    compareByName,
    sortIds,
    matches,
  }
}
