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

    <!-- Сетка карточек (уже отсортирована по алфавиту) -->
    <div v-else class="grid">
      <q-card
        v-for="art in filtered"
        :key="art.id"
        flat
        bordered
        class="artifact-card cursor-pointer"
        @click="openRoot(art)"
        :aria-label="$t('common.open', { name: art.name })"
      >
        <div class="thumb">
          <q-img
            :src="art.image"
            loading="lazy"
            spinner-color="primary"
            :alt="art.name"
            decoding="async"
            fit="cover"
            class="thumb-img"
          >
            <template #error>
              <q-img src="/images/placeholder.png" fit="contain" class="thumb-img" />
            </template>
          </q-img>
          <div class="name-overlay">
            {{ art.name }}
          </div>
        </div>
      </q-card>
    </div>

    <div v-if="!loading && filtered.length === 0" class="q-pa-xl text-center">
      {{ $t('common.nothingFound') }}
    </div>

    <!-- Попап -->
    <q-dialog v-model="show" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="q-pa-md">
        <div class="row items-start q-col-gutter-md">
          <div class="col-12 col-sm-4">
            <q-img :src="selected?.image" :ratio="1" class="rounded-borders" decoding="async">
              <template #error>
                <q-img src="/images/placeholder.png" :ratio="1" fit="contain" />
              </template>
            </q-img>
          </div>

          <div class="col-12 col-sm-8">
            <!-- Верхняя панель попапа: навигация по истории и закрытие -->
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
                <div class="text-h5 q-ml-sm">{{ selected?.name }}</div>
              </div>
              <q-btn flat round dense icon="close" @click="closeDialog" />
            </div>

            <div class="q-mb-sm">
              <q-chip square color="primary" text-color="white" class="q-mr-xs">
                {{ $t('fields.slot') }}: {{ selected?.slot }}
              </q-chip>
              <q-chip square outline class="q-mr-xs">
                {{ $t('fields.rarity') }}: {{ selected?.rarity }}
              </q-chip>
              <q-chip v-if="selected?.cost != null" square outline>
                {{ $t('fields.cost') }}: {{ selected?.cost }}
              </q-chip>
            </div>

            <div v-if="selected?.effect" class="q-mb-md">
              <div class="text-subtitle2 q-mb-xs">{{ $t('fields.effect') }}</div>
              <div class="text-body2">{{ selected.effect }}</div>
            </div>

            <div v-if="(selected?.bonuses || []).length">
              <div class="text-subtitle2 q-mb-xs">{{ $t('fields.bonuses') }}</div>
              <div class="q-gutter-xs">
                <q-chip v-for="(b, i) in selected.bonuses" :key="i" dense outline :title="b.source">
                  {{ prettyBonus(b) }}
                </q-chip>
              </div>
            </div>

            <!-- Если это КОМБО — показать его компоненты мини-карточками (отсортированы по имени) -->
            <div v-if="isCombo(selected) && comboIndex[selected.name]" class="q-mt-md">
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
                      :alt="byId[c.id]?.name || c.name"
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
                    <div class="mini-name">{{ byId[c.id]?.name || c.name }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Если это КОМПОНЕНТ — показать мини-карточки комбо (отсортированы по имени) -->
            <div v-if="(selected?.leadsTo || []).length" class="q-mt-md">
              <div class="text-subtitle2 q-mb-xs">Входит в комбо</div>
              <div class="mini-grid">
                <div
                  v-for="comboName in sortedLeadsTo"
                  :key="comboName"
                  class="mini-card"
                  :class="{ 'is-disabled': !byName[comboName] }"
                  @click.stop="byName[comboName] && navigateToId(byName[comboName].id)"
                  :title="byName[comboName] ? '' : 'Нет записи артефакта-комбо в JSON'"
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
                    <div class="mini-name">{{ comboName }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="selected?.combinationRaw" class="q-mt-md">
              <div class="text-subtitle2 q-mb-xs">{{ $t('fields.combinationRaw') }}</div>
              <div class="text-body2">{{ selected.combinationRaw }}</div>
            </div>
          </div>
        </div>

        <q-separator class="q-my-md" />
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const loading = ref(true)
const search = ref('')
const artifacts = ref([])

const show = ref(false)

/* ===== История в попапе ===== */
const history = ref([]) // [{...artifact}]
const histIndex = ref(-1) // текущая позиция
const selected = computed(() => history.value[histIndex.value] || null)

function openRoot(art) {
  history.value = [art]
  histIndex.value = 0
  show.value = true
}
function navigateToId(id) {
  const a = byId.value[id]
  if (!a) return
  if (histIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, histIndex.value + 1)
  }
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
  if (!a) return false
  return a.rarity === 'combo' || !!comboIndex.value[a.name]
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

    window.addEventListener('keydown', onKey)
  } catch (e) {
    console.error('Не удалось загрузить artifacts.json', e)
    artifacts.value = []
  } finally {
    loading.value = false
  }
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
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
          a.name?.toLowerCase().includes(q) ||
          a.id?.toLowerCase().includes(q) ||
          a.slot?.toLowerCase().includes(q) ||
          a.rarity?.toLowerCase().includes(q),
      )
    : artifacts.value
  return [...list].sort((a, b) => coll.compare(a?.name || '', b?.name || ''))
})

const sortedLeadsTo = computed(() =>
  (selected.value?.leadsTo ? [...selected.value.leadsTo] : []).sort((a, b) => coll.compare(a, b)),
)

function getSortedComponents(comboName) {
  const comps = comboIndex.value[comboName]?.components || []
  return [...comps].sort((a, b) =>
    coll.compare(byId.value[a.id]?.name || a.name || '', byId.value[b.id]?.name || b.name || ''),
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
/* FULL-WIDTH поиск */
.full-width {
  width: 100%;
}
.pill-input.q-field--dense .q-field__control {
  min-height: 40px;
}
.pill-input .q-field__control {
  border-radius: 9999px;
}

/* Сетка карточек */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

/* Карточка и ховер */
.artifact-card {
  overflow: hidden;
  border-radius: 12px;
  transition:
    transform 120ms ease,
    box-shadow 120ms ease;
  will-change: transform;
  transform-origin: center center;
}
@media (hover: hover) and (pointer: fine) {
  .artifact-card:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  }
  .artifact-card:hover .name-overlay {
    background-image: linear-gradient(to top, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.3));
  }
}
@media (prefers-reduced-motion: reduce) {
  .artifact-card {
    transition: none;
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
  font-size: 13px;
  line-height: 1.2;
  background-image: linear-gradient(to top, rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.2));
}

/* Картинки и прочие скругления в попапе */
.rounded-borders {
  border-radius: 12px;
}

/* ---- Мини-карточки для компонентов/комбо ---- */
.mini-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
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
