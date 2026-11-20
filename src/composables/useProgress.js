import { ref, watch } from 'vue'

const LS_KEY = 'artifactProgress.v3'

function readStorage(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/** Отмеченные артефакты: id -> true. Старые форматы переносятся, «видел» отбрасывается. */
function load() {
  const v3 = readStorage(LS_KEY)
  if (v3) return v3.owned || {}

  const owned = {}
  const v2 = readStorage('artifactProgress.v2')
  for (const [id, s] of Object.entries(v2?.status || {})) if (s === 'owned') owned[id] = true
  const v1 = readStorage('artifactProgress.v1')
  for (const id of Object.keys(v1?.owned || {})) owned[id] = true
  return owned
}

const owned = ref(load())

watch(
  owned,
  () => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ owned: owned.value }))
    } catch {
      // хранилище недоступно — прогресс живёт до перезагрузки
    }
  },
  { deep: true },
)

function isOwned(id) {
  return !!owned.value[id]
}

function toggleOwned(id) {
  if (owned.value[id]) delete owned.value[id]
  else owned.value[id] = true
}

function resetAll() {
  owned.value = {}
}

export function useProgress() {
  return { owned, isOwned, toggleOwned, resetAll }
}
