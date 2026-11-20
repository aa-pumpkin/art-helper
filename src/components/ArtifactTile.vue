<template>
  <button type="button" class="art-tile" :class="{ compact }" @click="$emit('select', art)">
    <ArtifactIcon :art="art" :alt="name" :size="compact ? 'md' : 'lg'" :owned="owned" :dim="dim" />
    <div class="tile-name">{{ name }}</div>
    <div v-if="caption" class="tile-caption" :class="{ 'is-accent': accent }">{{ caption }}</div>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import ArtifactIcon from './ArtifactIcon.vue'
import { useArtifacts } from 'src/composables/useArtifacts'

const props = defineProps({
  art: { type: Object, required: true },
  owned: { type: Boolean, default: false },
  caption: { type: String, default: '' },
  compact: { type: Boolean, default: false },
  /** подсветить подпись (часть начатого сборника) */
  accent: { type: Boolean, default: false },
  dim: { type: Boolean, default: false },
})
defineEmits(['select'])

const { nameOf } = useArtifacts()
const name = computed(() => nameOf(props.art))
</script>

<style scoped>
.art-tile {
  all: unset;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 4px 8px;
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
  min-width: 0;
  -webkit-tap-highlight-color: transparent;
  transition:
    background 120ms ease,
    transform 120ms ease;
}
.art-tile:focus-visible {
  outline: 2px solid var(--c-gold);
  outline-offset: 2px;
}
.art-tile:active {
  transform: scale(0.97);
}
@media (hover: hover) {
  .art-tile:hover {
    background: var(--c-surface-2);
  }
}
.compact {
  padding: 6px 2px;
  gap: 4px;
}

.tile-name {
  font-size: 12.5px;
  line-height: 1.25;
  color: var(--c-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  width: 100%;
}
.compact .tile-name {
  font-size: 11.5px;
}
.tile-caption {
  font-size: 11px;
  color: var(--c-muted);
}
.tile-caption.is-accent {
  margin-top: -2px;
  padding: 1px 7px;
  border-radius: 999px;
  font-weight: 700;
  color: #1a1408;
  background: var(--c-gold);
}
</style>
