import { ref, shallowRef, computed, watch } from 'vue'
import { i18n } from 'boot/i18n'

export const SLOTS = ['weapon', 'shield', 'torso', 'head', 'feet', 'cape', 'neck', 'ring', 'misc']
export const RARITIES = ['treasure', 'minor', 'major', 'relic']

const BASE = import.meta.env.BASE_URL || '/'
/** Путь к файлу из public/ с учётом BASE_URL (сборка в подпапку, Capacitor) */
export const asset = (path) => BASE + String(path).replace(/^\//, '')

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
    const data = await res.json()
    // язык успели переключить, пока шёл запрос — этот ответ уже не нужен
    if (lang !== i18n.global.locale.value) return
    translations.value = data
  } catch {
    if (lang === i18n.global.locale.value) translations.value = {}
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

/** Что даёт сама сборка сверх суммы частей */
function bonusOf(idOrArt) {
  const a = typeof idOrArt === 'string' ? byId.value[idOrArt] : idOrArt
  if (!a) return []
  return translations.value[a.id]?.bonus || a.bonus || []
}

/** Слоты, которые занимает собранный артефакт: [{ slot, count }] в порядке SLOTS */
function slotsOf(comboId) {
  const counts = {}
  for (const id of partsOf.value[comboId] || []) {
    const s = byId.value[id]?.slot
    if (s) counts[s] = (counts[s] || 0) + 1
  }
  return SLOTS.filter((s) => counts[s]).map((s) => ({ slot: s, count: counts[s] }))
}

function compareByName(a, b) {
  return collator.value.compare(nameOf(a), nameOf(b))
}

function sortIds(ids) {
  return [...ids].sort((a, b) => compareByName(a, b))
}

/** Поиск по названию и эффектам — на текущем языке и по-английски */
function matches(art, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const texts = [nameOf(art), art.name, ...effectsOf(art), ...(art.effects || [])]
  return texts.some((t) => t.toLowerCase().includes(q))
}

/** Начатые сборники: часть, которой ещё нет, нужна, если что-то из её сборника уже отмечено */
function neededParts(isOwned) {
  const needed = new Set()
  for (const parts of Object.values(partsOf.value)) {
    if (!parts.some(isOwned)) continue
    for (const id of parts) if (!isOwned(id)) needed.add(id)
  }
  return needed
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
    bonusOf,
    slotsOf,
    compareByName,
    sortIds,
    matches,
    neededParts,
  }
}
