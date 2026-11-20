<template>
  <div
    class="art-icon"
    :class="[
      `rarity-${art?.rarity}`,
      `size-${size}`,
      { 'is-combo': art?.combo, 'is-dim': dim, 'is-owned': owned },
    ]"
  >
    <img
      v-if="art && !broken"
      :src="art.image"
      :alt="alt"
      loading="lazy"
      decoding="async"
      draggable="false"
      @error="broken = true"
    />
    <q-icon v-else name="help_outline" class="fallback" />
    <span v-if="owned" class="status-dot"><q-icon name="check" /></span>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  art: { type: Object, default: null },
  alt: { type: String, default: '' },
  /** sm = 44px (1×), md = 66px (1.5×), lg = 88px (2×), xl = 132px (3×) */
  size: { type: String, default: 'lg' },
  owned: { type: Boolean, default: false },
  dim: { type: Boolean, default: false },
})

const broken = ref(false)
watch(
  () => props.art?.id,
  () => (broken.value = false),
)
</script>

<style scoped>
.art-icon {
  --px: 88px;
  position: relative;
  width: calc(var(--px) + 8px);
  height: calc(var(--px) + 8px);
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: radial-gradient(circle at 50% 35%, #2a3140, #10131a 75%);
  border: 2px solid var(--rarity, var(--c-border));
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.6);
  transition:
    opacity 120ms ease,
    filter 120ms ease;
}
.size-sm {
  --px: 44px;
  border-radius: 7px;
}
.size-md {
  --px: 66px;
}
.size-xl {
  --px: 132px;
  border-radius: 14px;
}

.art-icon img {
  width: var(--px);
  height: var(--px);
  image-rendering: pixelated;
  user-select: none;
}
.fallback {
  font-size: calc(var(--px) * 0.5);
  color: var(--c-muted);
}

.rarity-treasure {
  --rarity: var(--r-treasure);
}
.rarity-minor {
  --rarity: var(--r-minor);
}
.rarity-major {
  --rarity: var(--r-major);
}
.rarity-relic {
  --rarity: var(--r-relic);
}
.is-combo {
  --rarity: var(--c-gold);
  box-shadow:
    inset 0 0 0 1px rgba(0, 0, 0, 0.6),
    0 0 10px rgba(217, 173, 85, 0.35);
}
.is-dim {
  opacity: 0.45;
  filter: grayscale(0.7);
}

.status-dot {
  position: absolute;
  right: -6px;
  top: -6px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 14px;
  color: #10131a;
  border: 2px solid var(--c-bg);
}
.size-sm .status-dot {
  width: 18px;
  height: 18px;
  font-size: 11px;
  right: -5px;
  top: -5px;
}
.status-dot {
  background: var(--s-owned);
}
.is-owned {
  border-color: var(--s-owned);
  box-shadow:
    inset 0 0 0 1px rgba(0, 0, 0, 0.6),
    0 0 10px rgba(87, 196, 106, 0.35);
}
</style>
