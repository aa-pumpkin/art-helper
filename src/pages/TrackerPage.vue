<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5">Трекер артефактов</div>
      <div class="text-caption text-grey-7">данные сохраняются локально</div>
    </div>

    <!-- ЕДИНАЯ ЛИНИЯ "Мои артефакты" -->
    <div class="q-mb-sm text-subtitle1">Мои артефакты</div>
    <div class="grid">
      <!-- карточки добавленных -->
      <q-card
        v-for="art in trackedList"
        :key="art.id"
        flat
        bordered
        class="artifact-card"
        :class="cardStatusClass(art.id)"
      >
        <div class="thumb">
          <q-img :src="art.image" class="thumb-img" fit="cover" :alt="art.name">
            <template #error>
              <q-img src="/images/placeholder.png" class="thumb-img" fit="contain" />
            </template>
          </q-img>

          <div class="name-overlay">{{ displayName(art) }}</div>

          <!-- удалить -->
          <q-btn class="close-btn" dense flat round icon="close" @click="removeTracked(art.id)" />
        </div>

        <!-- переключатели статуса (взаимоисключающие) -->
        <div class="row items-center justify-between q-pa-sm">
          <div class="row items-center q-gutter-xs">
            <q-chip
              clickable
              :color="isSeen(art.id) && !isOwned(art.id) ? 'warning' : 'grey-4'"
              :text-color="isSeen(art.id) && !isOwned(art.id) ? 'black' : 'dark'"
              @click="onClickSeen(art.id)"
              dense
              class="pill"
            >
              Видел
            </q-chip>
            <q-chip
              clickable
              :color="isOwned(art.id) ? 'positive' : 'grey-4'"
              :text-color="isOwned(art.id) ? 'white' : 'dark'"
              @click="onClickOwned(art.id)"
              dense
              class="pill"
            >
              Собрал
            </q-chip>
          </div>
          <q-badge v-if="byId[art.id]?.rarity" outline>{{ byId[art.id].rarity }}</q-badge>
        </div>
      </q-card>

      <!-- одна карточка «плюс» -->
      <q-card flat bordered class="artifact-card add-card" @click="openPicker()">
        <div class="thumb flex flex-center">
          <q-icon name="add" size="40px" />
        </div>
      </q-card>
    </div>

    <q-separator spaced />

    <!-- ВОЗМОЖНЫЕ КОМБО (если есть прогресс: видел ИЛИ собрал хоть один компонент) -->
    <div class="q-mb-sm text-subtitle1">Возможные комбо</div>
    <div v-if="suggestions.length === 0" class="text-grey q-mt-sm">
      Пока нечего подсказать — добавь артефакты и пометь «Видел» или «Собрал».
    </div>

    <div v-for="row in suggestions" :key="row.name" class="q-mb-md">
      <q-card flat bordered class="q-pa-sm">
        <div class="row items-center">
          <div class="col-auto">
            <q-img
              :src="row.comboArt?.image || '/images/placeholder.png'"
              :ratio="1"
              style="width: 64px"
              fit="contain"
            >
              <template #error>
                <q-img src="/images/placeholder.png" :ratio="1" fit="contain" />
              </template>
            </q-img>
          </div>

          <div class="col q-pl-md">
            <div class="row items-center q-gutter-sm">
              <div class="text-subtitle2">{{ row.name }}</div>
              <q-badge v-if="row.missingCount === 0" color="positive" text-color="white"
                >готово к сборке</q-badge
              >
              <q-badge v-else color="primary" text-color="white">
                собрано: {{ row.ownedCount }}/{{ row.total }}
              </q-badge>
              <q-badge outline v-if="row.seenCount && row.missingCount">
                видел: {{ row.seenCount }}/{{ row.total }}
              </q-badge>
            </div>

            <!-- показываем ВСЕ компоненты (сортировка: собранные → виденные → не виденные) -->
            <div class="mini-grid q-mt-sm">
              <div
                v-for="c in row.componentsSorted"
                :key="c.id"
                class="mini-card"
                :class="miniStatusClass(c.id)"
                @click="markSeenIfNot(c.id)"
                :title="miniStatusTitle(c.id)"
              >
                <div class="mini-thumb">
                  <q-img
                    :src="byId[c.id]?.image || '/images/placeholder.png'"
                    :ratio="1"
                    class="mini-img"
                    fit="cover"
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
        </div>
      </q-card>
    </div>

    <!-- Диалог выбора артефакта -->
    <q-dialog v-model="picker.show" transition-show="scale" transition-hide="scale">
      <q-card
        class="q-pa-md"
        style="width: 80vw; max-width: 80vw; max-height: 80vh; overflow: auto"
      >
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-subtitle1">Добавить артефакт</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </div>

        <q-input
          v-model="picker.query"
          outlined
          dense
          clearable
          placeholder="Поиск…"
          class="q-mb-sm"
        >
          <template #append><q-icon name="search" /></template>
        </q-input>

        <div class="grid">
          <q-card
            v-for="art in pickerFiltered"
            :key="art.id"
            flat
            bordered
            class="artifact-card cursor-pointer"
            @click="pickArtifact(art)"
          >
            <div class="thumb">
              <q-img :src="art.image" loading="lazy" class="thumb-img" fit="cover">
                <template #error>
                  <q-img src="/images/placeholder.png" class="thumb-img" fit="contain" />
                </template>
              </q-img>
              <div class="name-overlay">{{ displayName(art) }}</div>
            </div>
          </q-card>
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

/* ====== загрузка артефактов ====== */
const artifacts = ref([])
const byId = ref({})
const byName = ref({})
const comboIndex = ref({})

onMounted(async () => {
  const res = await fetch('/artifacts.json')
  artifacts.value = await res.json()

  const _byId = {},
    _byName = {}
  for (const a of artifacts.value) {
    _byId[a.id] = a
    _byName[a.name] = a
  }
  byId.value = _byId
  byName.value = _byName

  // индекс комбо: { name: { comboId, components:[{id,name}] } }
  const combos = {}
  for (const a of artifacts.value) {
    const list = Array.isArray(a.leadsTo) ? a.leadsTo : []
    for (const comboName of list) {
      if (!combos[comboName])
        combos[comboName] = { comboId: byName.value[comboName]?.id || null, components: [] }
      combos[comboName].components.push({ id: a.id, name: a.name })
    }
  }
  // уникализируем компоненты
  for (const name in combos) {
    const seen = new Set()
    combos[name].components = combos[name].components.filter(
      (c) => !seen.has(c.id) && seen.add(c.id),
    )
  }
  comboIndex.value = combos

  loadProgress()
})

/* ====== локальный прогресс ====== */
const LS_KEY = 'artifactProgress.v1'
const progress = ref({ tracked: {}, seen: {}, owned: {} })

function loadProgress() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    const p = raw ? JSON.parse(raw) : { tracked: {}, seen: {}, owned: {} }
    progress.value = {
      tracked: p.tracked || {},
      seen: p.seen || {},
      owned: p.owned || {},
    }
  } catch {
    progress.value = { tracked: {}, seen: {}, owned: {} }
  }
}
function saveProgress() {
  localStorage.setItem(LS_KEY, JSON.stringify(progress.value))
}

const isSeen = (id) => !!progress.value.seen[id]
const isOwned = (id) => !!progress.value.owned[id]

/* ВЗАИМНОИСКЛЮЧАЮЩИЕ клики */
function onClickSeen(id) {
  progress.value.tracked[id] = true
  if (isSeen(id) && !isOwned(id)) {
    // снять seen → остаться без статуса
    delete progress.value.seen[id]
  } else {
    // поставить seen и снять owned
    progress.value.seen[id] = true
    delete progress.value.owned[id]
  }
  saveProgress()
}
function onClickOwned(id) {
  progress.value.tracked[id] = true
  if (isOwned(id)) {
    // снять owned → остаться без статуса
    delete progress.value.owned[id]
  } else {
    // поставить owned и снять seen
    progress.value.owned[id] = true
    delete progress.value.seen[id]
  }
  saveProgress()
}

function removeTracked(id) {
  delete progress.value.tracked[id]
  delete progress.value.seen[id]
  delete progress.value.owned[id]
  saveProgress()
}

/* ====== единый список карточек ====== */
const coll = new Intl.Collator(['ru', 'en'], { sensitivity: 'base', numeric: true })
const trackedList = computed(() => {
  const idSet = new Set([
    ...Object.keys(progress.value.tracked),
    ...Object.keys(progress.value.seen),
    ...Object.keys(progress.value.owned),
  ])
  return [...idSet]
    .map((id) => byId.value[id])
    .filter(Boolean)
    .sort((a, b) => coll.compare(a.name, b.name))
})

/* ====== подсказки по комбо (если есть seen ИЛИ owned прогресс) ====== */
const suggestions = computed(() => {
  const rows = []
  for (const name in comboIndex.value) {
    const entry = comboIndex.value[name]
    const comps = entry.components || []
    const ownedCount = comps.filter((c) => isOwned(c.id)).length
    const seenCount = comps.filter((c) => isSeen(c.id)).length
    if (ownedCount === 0 && seenCount === 0) continue // показываем только если есть прогресс

    const missingCount = comps.filter((c) => !isOwned(c.id)).length
    // отсортированный список компонентов для вывода
    const componentsSorted = [...comps].sort((a, b) => {
      const sa = isOwned(a.id) ? 0 : isSeen(a.id) ? 1 : 2
      const sb = isOwned(b.id) ? 0 : isSeen(b.id) ? 1 : 2
      return (
        sa - sb ||
        coll.compare(displayName(byId.value[a.id] || a), displayName(byId.value[b.id] || b))
      )
    })

    rows.push({
      name,
      comboArt: byName.value[name] || null,
      total: comps.length,
      ownedCount,
      seenCount,
      missingCount,
      componentsSorted,
    })
  }
  // готовые к сборке сверху
  rows.sort((a, b) => a.missingCount - b.missingCount || coll.compare(a.name, b.name))
  return rows
})

/* ====== диалог выбора ====== */
const picker = ref({ show: false, query: '' })
function openPicker() {
  picker.value = { show: true, query: '' }
}
const pickerFiltered = computed(() => {
  const q = picker.value.query.trim().toLowerCase()
  const base = q
    ? artifacts.value.filter(
        (a) => a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q),
      )
    : artifacts.value
  return [...base].sort((a, b) => coll.compare(a.name, b.name))
})
function pickArtifact(art) {
  // добавляем в отслеживаемые и СРАЗУ помечаем "Видел"
  progress.value.tracked[art.id] = true
  progress.value.seen[art.id] = true
  delete progress.value.owned[art.id]
  saveProgress()
  picker.value.show = false
}

/* ====== статусы/хелперы ====== */
function cardStatusClass(id) {
  if (isOwned(id)) return 'card--owned' // зелёная
  if (isSeen(id)) return 'card--seen' // жёлтая
  return 'card--missing' // красная
}
function miniStatusClass(id) {
  return {
    'is-owned': isOwned(id), // зелёная
    'is-seen-only': isSeen(id) && !isOwned(id), // жёлтая (серит + прозрачность)
    'is-missing': !isSeen(id) && !isOwned(id), // красная
  }
}
function miniStatusTitle(id) {
  if (isOwned(id)) return 'Собрано'
  if (isSeen(id)) return 'Видел'
  return 'Не встречал'
}
function markSeenIfNot(id) {
  if (!isSeen(id)) {
    progress.value.seen[id] = true
    saveProgress()
  }
}

/* ====== отображение имени (под будущие переводы) ====== */
const artTr = ref({})
function displayName(a) {
  return artTr.value[a?.id]?.name ?? a?.name ?? ''
}
</script>

<style scoped>
/* Сетка маленьких квадратных карточек */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 10px;
}
.artifact-card {
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid transparent;
  transition:
    box-shadow 120ms ease,
    transform 120ms ease,
    border-color 120ms ease;
}
.artifact-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

/* статусы рамок для верхних карточек */
.card--owned {
  border-color: #43a047;
} /* зелёная */
.card--seen {
  border-color: #f6c945;
} /* жёлтая */
.card--missing {
  border-color: #e53935;
} /* красная */

.add-card {
  cursor: pointer;
  color: #777;
  display: block;
}
.thumb {
  position: relative;
  aspect-ratio: 1/1;
}
.thumb-img {
  width: 100%;
  height: 100%;
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
.close-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  z-index: 1;
}

/* мини-плитки снизу */
.mini-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
  gap: 8px;
}
.mini-card {
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 100ms,
    box-shadow 100ms,
    filter 100ms,
    opacity 100ms;
  border: 2px solid transparent;
}
.mini-card:hover {
  transform: translateY(-1px);
}
.mini-thumb {
  position: relative;
  aspect-ratio: 1/1;
}
.mini-img {
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
}
.mini-name {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 4px 6px;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
  font-size: 11px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* статусы для мини-карточек недостающих */
.mini-card.is-owned {
  border-color: #43a047;
} /* зелёная */
.mini-card.is-seen-only {
  border-color: #f6c945;
} /* жёлтая рамка, без полупрозрачности */ /* жёлтая полупрозрачная */
.mini-card.is-missing {
  border-color: #e53935;
} /* красная */
</style>
