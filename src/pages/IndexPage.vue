<template>
  <div class="page">
    <Teleport defer to="#page-toolbar">
      <div class="toolbar">
        <div class="page-container">
          <q-input
            v-model="search"
            :placeholder="$t('common.search')"
            dense
            outlined
            clearable
            @clear="search = ''"
          >
            <template #prepend><q-icon name="search" /></template>
          </q-input>

          <div class="chip-row q-mt-sm">
            <button
              type="button"
              class="filter-chip"
              :class="{ active: !slot }"
              @click="slot = null"
            >
              {{ $t('filters.all') }}
            </button>
            <button
              v-for="s in SLOTS"
              :key="s"
              type="button"
              class="filter-chip"
              :class="{ active: slot === s }"
              @click="slot = slot === s ? null : s"
            >
              <q-icon :name="slotIcon(s)" />{{ $t(`slot.${s}`) }}
            </button>
          </div>
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

      <div v-else-if="!groups.length" class="state">
        <q-icon name="search_off" size="40px" />
        <div>{{ $t('common.nothingFound') }}</div>
      </div>

      <template v-else>
        <section v-for="group in groups" :key="group.slot" class="group">
          <div class="group-title">
            <q-icon :name="slotIcon(group.slot)" />{{ $t(`slot.${group.slot}`) }}
            <span class="group-count">{{ group.items.length }}</span>
          </div>
          <div class="tile-grid">
            <ArtifactTile
              v-for="art in group.items"
              :key="art.id"
              :art="art"
              :owned="isOwned(art.id)"
              @select="open(art.id)"
            />
          </div>
        </section>
      </template>
    </div>

    <ArtifactDialog v-model="dialogOpen" :artifact-id="dialogId" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ArtifactTile from 'components/ArtifactTile.vue'
import ArtifactDialog from 'components/ArtifactDialog.vue'
import { useArtifacts, SLOTS } from 'src/composables/useArtifacts'
import { useProgress } from 'src/composables/useProgress'
import { slotIcon } from 'src/composables/format'

const { list, loading, error, reload, matches, compareByName } = useArtifacts()
const { isOwned } = useProgress()

const search = ref('')
const slot = ref(null)

/* всегда группами по слотам, внутри — сборные первыми, затем по названию */
const groups = computed(() => {
  const q = search.value || ''
  const items = list.value
    .filter((a) => (!slot.value || a.slot === slot.value) && matches(a, q))
    .sort((a, b) => b.combo - a.combo || compareByName(a, b))
  return SLOTS.map((s) => ({ slot: s, items: items.filter((a) => a.slot === s) })).filter(
    (g) => g.items.length,
  )
})

const dialogOpen = ref(false)
const dialogId = ref(null)
function open(id) {
  dialogId.value = id
  dialogOpen.value = true
}
</script>

<style scoped>
.toolbar {
  padding: 0 0 10px;
}

.group {
  margin-top: 18px;
}
.group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--c-gold);
  padding: 0 4px 6px;
  border-bottom: 1px solid var(--c-border);
  margin-bottom: 6px;
}
.group-count {
  color: var(--c-muted);
  font-weight: 500;
}
</style>
