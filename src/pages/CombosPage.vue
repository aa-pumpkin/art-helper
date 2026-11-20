<template>
  <div class="page">
    <Teleport defer to="#page-toolbar">
      <div class="toolbar">
        <div class="page-container row items-center no-wrap toolbar-row">
          <q-input
            v-model="search"
            :placeholder="$t('common.search')"
            dense
            outlined
            clearable
            class="col"
            @clear="search = ''"
          >
            <template #prepend><q-icon name="search" /></template>
          </q-input>
          <q-btn
            v-if="ownedCount"
            flat
            round
            icon="restart_alt"
            class="text-muted"
            :aria-label="$t('combos.reset')"
            @click="confirmReset"
          />
        </div>
      </div>
    </Teleport>

    <div class="page-container q-pb-xl">
      <div v-if="loading && !list.length" class="state">
        <q-spinner-dots size="40px" color="primary" />
      </div>

      <div v-else-if="error" class="state">
        <q-icon name="cloud_off" size="40px" />
        <div>{{ $t('common.loadError') }}</div>
        <q-btn outline color="primary" :label="$t('common.retry')" @click="reload" />
      </div>

      <template v-else>
        <div v-if="!ownedCount && !query" class="hint">
          <q-icon name="touch_app" size="20px" class="text-gold" />
          {{ $t('combos.hint') }}
        </div>

        <div v-if="!rows.length" class="state">
          <q-icon name="search_off" size="40px" />
          <div>{{ $t('common.nothingFound') }}</div>
        </div>

        <TransitionGroup tag="div" name="combo" class="combo-list">
          <article
            v-for="row in rows"
            :key="row.id"
            class="combo-card"
            :class="{ ready: row.ready }"
          >
            <button type="button" class="combo-head" @click="openDialog(row.id)">
              <ArtifactIcon :art="byId[row.id]" :alt="nameOf(row.id)" size="sm" />
              <span class="combo-name">{{ nameOf(row.id) }}</span>
              <span v-if="row.ready" class="ready-badge">
                <q-icon name="auto_awesome" />{{ $t('combos.ready') }}
              </span>
              <span v-else class="combo-count">{{ row.owned }}/{{ row.total }}</span>
              <q-icon name="chevron_right" class="text-muted" />
            </button>

            <div v-if="byId[row.id].note" class="combo-note">
              <q-icon name="info" />{{ $t(`note.${byId[row.id].note}`) }}
            </div>

            <div class="progress">
              <span class="bar" :style="{ width: `${(row.owned / row.total) * 100}%` }" />
            </div>

            <div class="parts">
              <ArtifactTile
                v-for="id in row.parts"
                :key="id"
                :art="byId[id]"
                :owned="isOwned(id)"
                :dim="!isOwned(id)"
                :class="{ 'is-match': row.matches.has(id) }"
                compact
                @select="toggleOwned(id)"
              />
            </div>
          </article>
        </TransitionGroup>
      </template>
    </div>

    <ArtifactDialog v-model="dialogOpen" :artifact-id="dialogId" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import ArtifactIcon from 'components/ArtifactIcon.vue'
import ArtifactTile from 'components/ArtifactTile.vue'
import ArtifactDialog from 'components/ArtifactDialog.vue'
import { useArtifacts } from 'src/composables/useArtifacts'
import { useProgress } from 'src/composables/useProgress'

const $q = useQuasar()
const { t } = useI18n()
const { list, byId, partsOf, loading, error, reload, nameOf, sortIds, matches, compareByName } =
  useArtifacts()
const { owned, isOwned, toggleOwned, resetAll } = useProgress()

const search = ref('')
const query = computed(() => (search.value || '').trim())
const ownedCount = computed(() => Object.keys(owned.value).length)

/*
 * Порядок сборников (ближе к готовности — выше). После отметки пересчитывается
 * с паузой: можно отметить подряд несколько частей, а затем карточка плавно
 * переезжает на своё место, а не прыгает под пальцем после каждого тапа.
 */
const order = ref([])
function computeOrder() {
  const progress = (id) => {
    const parts = partsOf.value[id]
    return parts.filter(isOwned).length / parts.length
  }
  order.value = Object.keys(partsOf.value).sort(
    (a, b) => progress(b) - progress(a) || compareByName(a, b),
  )
}
watch([partsOf, query], computeOrder, { immediate: true })

const RESORT_DELAY = 1000
let resortTimer = null
watch(
  owned,
  () => {
    clearTimeout(resortTimer)
    resortTimer = setTimeout(computeOrder, RESORT_DELAY)
  },
  { deep: true },
)
onBeforeUnmount(() => clearTimeout(resortTimer))

const rows = computed(() => {
  const q = query.value
  const result = []
  for (const id of order.value) {
    const partIds = partsOf.value[id] || []
    const matched = q ? partIds.filter((p) => matches(byId.value[p], q)) : []
    if (q && !matches(byId.value[id], q) && !matched.length) continue
    const ownedParts = partIds.filter(isOwned).length
    result.push({
      id,
      parts: sortIds(partIds),
      matches: new Set(matched),
      owned: ownedParts,
      total: partIds.length,
      ready: ownedParts === partIds.length,
    })
  }
  return result
})

const dialogOpen = ref(false)
const dialogId = ref(null)
function openDialog(id) {
  dialogId.value = id
  dialogOpen.value = true
}

function confirmReset() {
  $q.dialog({
    title: t('combos.reset'),
    message: t('combos.resetConfirm'),
    dark: true,
    cancel: { label: t('common.cancel'), flat: true, noCaps: true, color: 'grey-5' },
    ok: { label: t('combos.reset'), unelevated: true, noCaps: true, color: 'negative' },
  }).onOk(() => {
    resetAll()
    computeOrder()
  })
}
</script>

<style scoped>
.toolbar {
  padding: 0 0 10px;
}
.toolbar-row {
  gap: 4px;
}

.hint {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  font-size: 14px;
  color: var(--c-muted);
}

.combo-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 420px), 1fr));
  gap: 12px;
  margin-top: 14px;
}
.combo-card {
  transition: border-color var(--dur) var(--ease);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 14px;
  padding: 10px 10px 6px;
}
/*
 * Карточка, поменявшая место, плавно переезжает; новые при поиске проявляются.
 * Селекторы с .combo-card, чтобы не перебивались его собственным transition.
 */
.combo-card.combo-move {
  transition:
    transform var(--dur-slow) cubic-bezier(0.65, 0, 0.35, 1),
    border-color var(--dur) var(--ease);
}
.combo-card.combo-enter-active {
  transition:
    opacity var(--dur) var(--ease),
    border-color var(--dur) var(--ease);
}
.combo-card.combo-enter-from {
  opacity: 0;
}
.combo-card.ready {
  border-color: var(--s-owned);
  box-shadow: 0 0 0 1px var(--s-owned) inset;
}

.combo-head {
  all: unset;
  box-sizing: border-box;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  border-radius: 8px;
  padding: 2px;
}
.combo-head:focus-visible {
  outline: 2px solid var(--c-gold);
}
.combo-name {
  flex: 1;
  min-width: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
  color: var(--c-gold-light);
}
.combo-count {
  font-size: 15px;
  font-weight: 700;
  color: var(--c-muted);
}
.ready-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 700;
  color: var(--s-owned);
  white-space: nowrap;
}

.combo-note {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 6px 2px 0;
  font-size: 12.5px;
  color: var(--c-gold-light);
}
.progress {
  height: 4px;
  margin: 8px 2px 4px;
  border-radius: 2px;
  overflow: hidden;
  background: var(--c-bg);
}
.bar {
  display: block;
  height: 100%;
  background: var(--s-owned);
  transition: width var(--dur) var(--ease);
}

.parts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 2px;
}
.parts .is-match {
  background: rgba(217, 173, 85, 0.16);
}
</style>
