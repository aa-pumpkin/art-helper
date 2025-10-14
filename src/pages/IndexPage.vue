<template>
  <q-page padding>
    <!-- Поиск -->
    <div class="q-mb-md">
      <q-input
        v-model="search"
        debounce="200"
        outlined
        rounded
        dense
        clearable
        bg-color="grey-2"
        @clear="search = ''"
        :placeholder="$t('common.searchPlaceholder')"
        class="full-width pill-input"
      >
        <template #append>
          <q-icon name="search" />
        </template>
      </q-input>

      <div class="text-caption text-grey-7 q-mt-xs">
        {{ $t('common.foundCount', { n: filtered.length }) }}
      </div>
    </div>

    <!-- Лоадер -->
    <div v-if="loading" class="q-pa-xl flex flex-center">
      <q-spinner size="42px" />
      <div class="q-ml-md">{{ $t('common.loading') }}</div>
    </div>

    <!-- Сетка карточек (слегка больше) -->
    <div v-else class="grid">
      <q-card
        v-for="art in filtered"
        :key="art.id"
        flat
        bordered
        class="artifact-card cursor-pointer"
        @click="openRoot(art)"
        :aria-label="$t('common.open', { name: displayName(art) })"
      >
        <div class="thumb">
          <q-img
            :src="art.image"
            loading="lazy"
            spinner-color="primary"
            :alt="displayName(art)"
            decoding="async"
            fit="cover"
            class="thumb-img"
          >
            <template #error>
              <q-img src="/images/placeholder.png" fit="contain" class="thumb-img" />
            </template>
          </q-img>
          <div class="name-overlay">
            {{ displayName(art) }}
          </div>
        </div>
      </q-card>
    </div>

    <div v-if="!loading && filtered.length === 0" class="q-pa-xl text-center">
      {{ $t('common.nothingFound') }}
    </div>

    <!-- Попап: во весь экран, без sticky, контент компактный -->
    <q-dialog v-model="show" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="q-pa-md popup-full">
        <div class="row items-start q-col-gutter-md">
          <!-- Левая колонка: маленькая картинка -->
          <div class="col-12 col-sm-auto flex justify-center">
            <q-img
              :src="selected?.image"
              :ratio="1"
              class="rounded-borders popup-thumb"
              decoding="async"
            >
              <template #error>
                <q-img
                  src="/images/placeholder.png"
                  :ratio="1"
                  fit="contain"
                  class="rounded-borders popup-thumb"
                />
              </template>
            </q-img>
          </div>

          <!-- Правая колонка: весь текст, без внутренних скроллов -->
          <div class="col-12 col-sm">
            <!-- Верхняя панель: навигация и крестик -->
            <div class="row items-center justify-between q-mb-sm">
              <div class="row items-center q-gutter-xs">
                <q-btn flat round dense icon="chevron_left" :disable="!hasBack" @click="goBack" />
                <q-btn
                  flat
                  round
                  dense
                  icon="chevron_right"
                  :disable="!hasForward"
                  @click="goForward"
                />
                <div class="text-h5 q-ml-sm">{{ displayName(selected) }}</div>
              </div>
              <q-btn flat round dense icon="close" @click="closeDialog" />
            </div>

            <div class="row items-center q-col-gutter-sm q-mb-sm">
              <div>
                <q-chip square color="primary" text-color="white"
                  >{{ $t('fields.slot') }}: {{ selected?.slot }}</q-chip
                >
              </div>
              <div>
                <q-chip square outline>{{ $t('fields.rarity') }}: {{ selected?.rarity }}</q-chip>
              </div>
              <div v-if="selected?.cost != null">
                <q-chip square outline>{{ $t('fields.cost') }}: {{ selected?.cost }}</q-chip>
              </div>
            </div>

            <div v-if="displayEffect(selected)" class="q-mb-sm">
              <div class="text-subtitle2 q-mb-xs">{{ $t('fields.effect') }}</div>
              <div class="text-body2">{{ displayEffect(selected) }}</div>
            </div>

            <div v-if="(selected?.bonuses || []).length" class="q-mb-sm">
              <div class="text-subtitle2 q-mb-xs">{{ $t('fields.bonuses') }}</div>
              <div class="q-gutter-xs">
                <q-chip v-for="(b, i) in selected.bonuses" :key="i" dense outline :title="b.source">
                  {{ prettyBonus(b) }}
                </q-chip>
              </div>
            </div>

            <!-- Комбо → компоненты -->
            <div v-if="isCombo(selected) && comboIndex[selected.name]" class="q-mt-sm">
              <div class="text-subtitle2 q-mb-xs">Компоненты комбо</div>
              <div class="mini-grid">
                <div
                  v-for="c in getSortedComponents(selected.name)"
                  :key="c.id"
                  class="mini-card"
                  @click.stop="navigateToId(c.id)"
                >
                  <div class="mini-thumb">
                    <q-img
                      :src="byId[c.id]?.image || '/images/placeholder.png'"
                      fit="cover"
                      :ratio="1"
                      class="mini-img"
                      :alt="displayName(byId[c.id] || c)"
                    >
                      <template #error>
                        <q-img
                          src="/images/placeholder.png"
                          :ratio="1"
                          fit="contain"
                          class="mini-img"
                        />
                      </template>
                    </q-img>
                    <div class="mini-name">{{ displayName(byId[c.id] || c) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Компонент → список комбо -->
            <div v-if="(selected?.leadsTo || []).length" class="q-mt-sm">
              <div class="text-subtitle2 q-mb-xs">Входит в комбо</div>
              <div class="mini-grid">
                <div
                  v-for="comboName in sortedLeadsTo"
                  :key="comboName"
                  class="mini-card"
                  :class="{ 'is-disabled': !byName[comboName] }"
                  @click.stop="byName[comboName] && navigateToId(byName[comboName].id)"
                >
                  <div class="mini-thumb">
                    <q-img
                      :src="byName[comboName]?.image || '/images/placeholder.png'"
                      fit="cover"
                      :ratio="1"
                      class="mini-img"
                      :alt="comboName"
                    >
                      <template #error>
                        <q-img
                          src="/images/placeholder.png"
                          :ratio="1"
                          fit="contain"
                          class="mini-img"
                        />
                      </template>
                    </q-img>
                    <div class="mini-name">
                      {{ displayName(byName[comboName] || { id: comboName, name: comboName }) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="displayCombRaw(selected)" class="q-mt-sm">
              <div class="text-subtitle2 q-mb-xs">{{ $t('fields.combinationRaw') }}</div>
              <div class="text-body2">{{ displayCombRaw(selected) }}</div>
            </div>
          </div>
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const loading = ref(true)
const search = ref('')
const artifacts = ref([])
const show = ref(false)

/* ===== Переводы артефактов ===== */
const artTr = ref({})
async function loadArtifactTranslations(lang) {
  try {
    const res = await fetch(`/i18n/artifacts.${lang}.json`, { cache: 'no-store' })
    if (!res.ok) throw new Error('no file')
    artTr.value = await res.json()
  } catch {
    artTr.value = {}
  }
}
function tArt(art, key) {
  if (!art) return ''
  return artTr.value[art.id]?.[key] ?? art[key] ?? ''
}
const displayName = (art) => tArt(art, 'name')
const displayEffect = (art) => tArt(art, 'effect')
const displayCombRaw = (art) => tArt(art, 'combinationRaw')

/* ===== История ===== */
const history = ref([])
const histIndex = ref(-1)
const selected = computed(() => history.value[histIndex.value] || null)
function openRoot(art) {
  history.value = [art]
  histIndex.value = 0
  show.value = true
}
function navigateToId(id) {
  const a = byId.value[id]
  if (!a) return
  if (histIndex.value < history.value.length - 1)
    history.value = history.value.slice(0, histIndex.value + 1)
  history.value.push(a)
  histIndex.value++
}
function goBack() {
  if (histIndex.value > 0) histIndex.value--
}
function goForward() {
  if (histIndex.value < history.value.length - 1) histIndex.value++
}
function closeDialog() {
  show.value = false
  history.value = []
  histIndex.value = -1
}
const hasBack = computed(() => histIndex.value > 0)
const hasForward = computed(
  () => histIndex.value >= 0 && histIndex.value < history.value.length - 1,
)

/* ===== Индексы и комбо ===== */
const byId = ref({})
const byName = ref({})
const comboIndex = ref({})
function isCombo(a) {
  return !!a && (a.rarity === 'combo' || !!comboIndex.value[a.name])
}

onMounted(async () => {
  try {
    const res = await fetch('/artifacts.json')
    const data = await res.json()
    artifacts.value = data

    const idMap = {},
      nameMap = {}
    for (const a of data) {
      idMap[a.id] = a
      nameMap[a.name] = a
    }
    byId.value = idMap
    byName.value = nameMap

    const combos = {}
    for (const a of data) {
      const list = Array.isArray(a.leadsTo) ? a.leadsTo : []
      for (const comboName of list) {
        if (!combos[comboName]) combos[comboName] = { comboId: null, components: [] }
        combos[comboName].components.push({ id: a.id, name: a.name })
      }
    }
    for (const name in combos) {
      if (nameMap[name]) combos[name].comboId = nameMap[name].id
      const seen = new Set()
      combos[name].components = combos[name].components.filter(
        (c) => !seen.has(c.id) && seen.add(c.id),
      )
    }
    comboIndex.value = combos

    await loadArtifactTranslations(locale.value)
    window.addEventListener('keydown', onKey)
  } catch (e) {
    console.error('Не удалось загрузить artifacts.json', e)
    artifacts.value = []
  } finally {
    loading.value = false
  }
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
watch(locale, (l) => loadArtifactTranslations(l))
function onKey(e) {
  if (!show.value) return
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    goBack()
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    goForward()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    closeDialog()
  }
}

/* ===== Сортировка и поиск ===== */
const coll = new Intl.Collator(['ru', 'en'], { sensitivity: 'base', numeric: true })
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const list = q
    ? artifacts.value.filter(
        (a) =>
          displayName(a).toLowerCase().includes(q) ||
          a.id?.toLowerCase().includes(q) ||
          a.slot?.toLowerCase().includes(q) ||
          a.rarity?.toLowerCase().includes(q),
      )
    : artifacts.value
  return [...list].sort((a, b) => coll.compare(displayName(a), displayName(b)))
})
const sortedLeadsTo = computed(() =>
  (selected.value?.leadsTo ? [...selected.value.leadsTo] : []).sort((a, b) => coll.compare(a, b)),
)
function getSortedComponents(comboName) {
  const comps = comboIndex.value[comboName]?.components || []
  return [...comps].sort((a, b) =>
    coll.compare(displayName(byId.value[a.id] || a), displayName(byId.value[b.id] || b)),
  )
}

/* ===== Вспомогательное ===== */
function prettyBonus(b) {
  const val =
    b.value === 0 && b.kind === 'special'
      ? ''
      : b.scale === 'percent'
        ? `${b.value}%`
        : `+${b.value}`
  const stat = b.stat ? ` ${b.stat}` : ''
  return `${val}${stat}`.trim() || b.source || 'bonus'
}
</script>

<style scoped>
/* Поиск */
.full-width {
  width: 100%;
}
.pill-input.q-field--dense .q-field__control {
  min-height: 40px;
}
.pill-input .q-field__control {
  border-radius: 9999px;
}

/* Сетка карточек — немного крупнее */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); /* было 120px */
  gap: 10px;
}
.artifact-card {
  overflow: hidden;
  border-radius: 12px;
  transition:
    transform 110ms ease,
    box-shadow 110ms ease;
  will-change: transform;
}
@media (hover: hover) and (pointer: fine) {
  .artifact-card:hover {
    transform: translateY(-1px) scale(1.015); /* как у mini-card */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12); /* как у mini-card */
  }
}

/* Квадратные превью + подпись */
.thumb {
  position: relative;
  aspect-ratio: 1 / 1;
}
.thumb-img {
  width: 100%;
  height: 100%;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
}
.name-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 6px 8px;
  text-align: center;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
  font-size: 12px;
  line-height: 1.2;
}
.rounded-borders {
  border-radius: 12px;
}

/* ------ Fullscreen dialog content ------ */
.popup-full {
  /* убираем любые внутренние ограничения по высоте */
  height: auto;
  max-height: none;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.18);
}

/* Картинка в попапе — компактная */
.popup-thumb {
  width: clamp(120px, 22vw, 200px);
  max-width: 100%;
}

/* Мини-карточки */
.mini-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
  gap: 8px;
}
.mini-card {
  cursor: pointer;
  border-radius: 10px;
  overflow: hidden;
  transition:
    transform 110ms ease,
    box-shadow 110ms ease;
}
.mini-card:hover {
  transform: translateY(-1px) scale(1.015);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}
.mini-card.is-disabled {
  cursor: default;
  opacity: 0.7;
}
.mini-thumb {
  position: relative;
  aspect-ratio: 1 / 1;
}
.mini-img {
  width: 100%;
  height: 100%;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
}
.mini-name {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 4px 6px;
  text-align: center;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
  font-size: 11px;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
