<template>
  <q-page padding>
    <!-- Поиск: full width + низкий -->
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

    <!-- Сетка карточек (квадрат + оверлей) -->
    <div v-else class="grid">
      <q-card
        v-for="art in filtered"
        :key="art.id"
        flat
        bordered
        class="artifact-card cursor-pointer"
        @click="open(art)"
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
            <div class="row items-center justify-between">
              <div class="text-h5 q-mb-xs">{{ selected?.name }}</div>
              <q-btn flat round icon="close" @click="show = false" />
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
                <q-chip
                  v-for="(b, i) in selected.bonuses"
                  :key="i"
                  dense
                  outline
                  :title="b.source"
                >
                  {{ prettyBonus(b) }}
                </q-chip>
              </div>
            </div>

            <div v-if="(selected?.leadsTo || []).length" class="q-mt-md">
              <div class="text-subtitle2 q-mb-xs">{{ $t('fields.leadsTo') }}</div>
              <ul class="q-pl-md q-my-none">
                <li v-for="(c, i) in selected.leadsTo" :key="i">{{ c }}</li>
              </ul>
            </div>

            <div v-if="selected?.combinationRaw" class="q-mt-md">
              <div class="text-subtitle2 q-mb-xs">{{ $t('fields.combinationRaw') }}</div>
              <div class="text-body2">{{ selected.combinationRaw }}</div>
            </div>
          </div>
        </div>

        <q-separator class="q-my-md" />
        <!-- нижнюю кнопку "Закрыть" убрали — есть крестик сверху -->
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const loading = ref(true)
const search = ref('')
const artifacts = ref([])

const show = ref(false)
const selected = ref(null)

function open(art) {
  selected.value = art
  show.value = true
}

onMounted(async () => {
  try {
    const res = await fetch('/artifacts.json')
    artifacts.value = await res.json()
  } catch (e) {
    console.error('Не удалось загрузить artifacts.json', e)
    artifacts.value = []
  } finally {
    loading.value = false
  }
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return artifacts.value
  return artifacts.value.filter(a =>
    a.name?.toLowerCase().includes(q) ||
    a.id?.toLowerCase().includes(q) ||
    a.slot?.toLowerCase().includes(q) ||
    a.rarity?.toLowerCase().includes(q)
  )
})

function prettyBonus(b) {
  const val = (b.value === 0 && b.kind === 'special')
    ? '' : (b.scale === 'percent' ? `${b.value}%` : `+${b.value}`)
  const stat = b.stat ? ` ${b.stat}` : ''
  return `${val}${stat}`.trim() || b.source || 'bonus'
}
</script>

<style scoped>
/* FULL-WIDTH поиск */
.full-width { width: 100%; }

/* Слегка «приплюснутая» высота в dense-режиме */
.pill-input.q-field--dense .q-field__control {
  min-height: 40px; /* по умолчанию dense ~ 44px, можно ещё уменьшить */
}

/* Пилюля */
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
  transition: transform 120ms ease, box-shadow 120ms ease;
  will-change: transform;
  transform-origin: center center;
}
@media (hover: hover) and (pointer: fine) {
  .artifact-card:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  }
  .artifact-card:hover .name-overlay {
    background-image: linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.3));
  }
}
@media (prefers-reduced-motion: reduce) {
  .artifact-card { transition: none; }
}

/* Квадратные превью + подпись */
.thumb { position: relative; aspect-ratio: 1 / 1; }
.thumb-img { width: 100%; height: 100%; }
.name-overlay {
  position: absolute; left: 0; right: 0; bottom: 0;
  padding: 6px 8px; text-align: center; color: #fff;
  background: rgba(0,0,0,0.6);
  font-size: 13px; line-height: 1.2;
  background-image: linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0.2));
}

/* Картинки и прочие скругления в попапе */
.rounded-borders { border-radius: 12px; }
</style>
