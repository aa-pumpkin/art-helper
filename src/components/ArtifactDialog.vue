<template>
  <q-dialog
    :model-value="modelValue"
    :maximized="$q.screen.lt.sm"
    transition-show="jump-up"
    transition-hide="jump-down"
    :transition-duration="350"
    @update:model-value="$emit('update:modelValue', $event)"
    @hide="history = []"
  >
    <q-card v-if="art" class="art-dialog column no-wrap">
      <!-- шапка -->
      <div class="dialog-bar row items-center no-wrap q-px-sm">
        <q-btn
          v-if="history.length > 1"
          flat
          round
          dense
          icon="arrow_back"
          :aria-label="$t('common.back')"
          @click="goBack"
        />
        <q-space />
        <q-btn flat round dense icon="close" :aria-label="$t('app.close')" v-close-popup />
      </div>

      <div class="dialog-body col scroll">
        <!-- герой-блок -->
        <div class="hero">
          <ArtifactIcon :art="art" :alt="nameOf(art)" size="xl" />
          <div class="hero-text">
            <h2 class="art-title">{{ nameOf(art) }}</h2>
            <div v-if="locale !== 'en'" class="art-subtitle">{{ art.name }}</div>
            <div class="meta">
              <span class="meta-chip">
                <q-icon :name="slotIcon(art.slot)" />{{ $t(`slot.${art.slot}`) }}
              </span>
              <span class="meta-chip" :class="`rarity-text-${art.rarity}`">
                <q-icon name="diamond" />{{ $t(`rarity.${art.rarity}`) }}
              </span>
              <span class="meta-chip">
                <q-icon name="paid" class="text-gold" />{{ formatCost(art.cost) }}
              </span>
              <span v-if="art.combo" class="meta-chip combo-chip">
                <q-icon name="auto_awesome" />{{ $t('fields.combo') }}
              </span>
            </div>
          </div>
        </div>

        <!-- правила HotA по умолчанию -->
        <div v-if="art.note" class="note">
          <q-icon name="info" size="18px" />{{ $t(`note.${art.note}`) }}
        </div>

        <!-- отметка «есть» — только для частей сборников -->
        <button
          v-if="partOf.length"
          type="button"
          class="own-btn"
          :class="{ active: isOwned(art.id) }"
          @click="toggleOwned(art.id)"
        >
          <q-icon :name="isOwned(art.id) ? 'check_circle' : 'radio_button_unchecked'" size="22px" />
          {{ isOwned(art.id) ? $t('own.have') : $t('own.mark') }}
        </button>

        <!-- что даёт сама сборка -->
        <section v-if="art.combo" class="section">
          <div class="section-title">{{ $t('fields.bonus') }}</div>
          <ul class="effects is-bonus">
            <li v-for="(e, i) in bonusOf(art)" :key="i">{{ e }}</li>
          </ul>
        </section>

        <!-- эффекты -->
        <section class="section">
          <div class="section-title">
            {{ art.combo ? $t('fields.comboTotal') : $t('fields.effect') }}
          </div>
          <ul class="effects">
            <li v-for="(e, i) in effectsOf(art)" :key="i" :class="effectClass(e)">{{ e }}</li>
          </ul>
        </section>

        <!-- какие слоты займёт собранный артефакт -->
        <section v-if="art.combo" class="section">
          <div class="section-title">{{ $t('fields.occupies') }}</div>
          <div class="slot-row">
            <span v-for="s in slotsOf(art.id)" :key="s.slot" class="meta-chip">
              <q-icon :name="slotIcon(s.slot)" />{{ $t(`slot.${s.slot}`) }}
              <b v-if="s.count > 1">×{{ s.count }}</b>
            </span>
          </div>
        </section>

        <!-- части комбо -->
        <section v-if="parts.length" class="section">
          <div class="section-title">
            {{ $t('fields.parts') }}
            <span class="section-count">{{ ownedParts }}/{{ parts.length }}</span>
          </div>
          <div class="mini-grid">
            <ArtifactTile
              v-for="id in parts"
              :key="id"
              :art="byId[id]"
              :owned="isOwned(id)"
              compact
              @select="navigate(id)"
            />
          </div>
        </section>

        <!-- в какие комбо входит -->
        <section v-if="partOf.length" class="section">
          <div class="section-title">{{ $t('fields.partOf') }}</div>
          <div class="mini-grid">
            <ArtifactTile
              v-for="id in partOf"
              :key="id"
              :art="byId[id]"
              compact
              @select="navigate(id)"
            />
          </div>
        </section>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ArtifactIcon from './ArtifactIcon.vue'
import ArtifactTile from './ArtifactTile.vue'
import { useArtifacts } from 'src/composables/useArtifacts'
import { useProgress } from 'src/composables/useProgress'
import { slotIcon, formatCost } from 'src/composables/format'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  artifactId: { type: String, default: null },
})
defineEmits(['update:modelValue'])

const { locale } = useI18n()
const { byId, partsOf, combosOf, nameOf, effectsOf, bonusOf, slotsOf, sortIds } = useArtifacts()
const { isOwned, toggleOwned } = useProgress()

/* история переходов внутри диалога (комбо ⇄ части) */
const history = ref([])
watch(
  () => [props.modelValue, props.artifactId],
  ([open, id]) => {
    if (open && id) history.value = [id]
  },
  { immediate: true },
)
const art = computed(() => byId.value[history.value.at(-1)] || null)

function navigate(id) {
  if (id !== history.value.at(-1)) history.value.push(id)
}
function goBack() {
  history.value.pop()
}

const parts = computed(() => (art.value ? sortIds(partsOf.value[art.value.id] || []) : []))
const partOf = computed(() => (art.value ? sortIds(combosOf.value[art.value.id] || []) : []))
const ownedParts = computed(() => parts.value.filter(isOwned).length)

function effectClass(e) {
  if (/^[+]/.test(e)) return 'is-plus'
  if (/^[-−]/.test(e)) return 'is-minus'
  return ''
}
</script>

<style scoped>
.art-dialog {
  width: 560px;
  max-width: 94vw;
  max-height: 88vh;
  background: var(--c-surface);
  color: var(--c-text);
  border: 1px solid var(--c-border);
  border-radius: 16px;
}
.q-dialog__inner--maximized .art-dialog {
  max-width: 100vw;
  max-height: 100vh;
  border-radius: 0;
  border: 0;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
.dialog-bar {
  min-height: 48px;
}
.dialog-body {
  padding: 0 20px 24px;
}

.hero {
  display: flex;
  gap: 18px;
  align-items: center;
}
@media (max-width: 420px) {
  .hero {
    flex-direction: column;
    text-align: center;
  }
  .meta {
    justify-content: center;
  }
}
.hero-text {
  min-width: 0;
}
.art-title {
  margin: 0;
  font-size: 22px;
  line-height: 1.2;
  font-weight: 700;
  color: var(--c-gold-light);
  letter-spacing: 0.2px;
}
.art-subtitle {
  margin-top: 2px;
  font-size: 13px;
  color: var(--c-muted);
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}
.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12.5px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--c-surface-2);
  border: 1px solid var(--c-border);
  white-space: nowrap;
}
.combo-chip {
  color: var(--c-gold-light);
  border-color: rgba(217, 173, 85, 0.5);
}

.own-btn {
  all: unset;
  box-sizing: border-box;
  width: 100%;
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  color: var(--c-text);
  background: var(--c-surface-2);
  border: 1px solid var(--c-border);
  transition:
    background var(--dur-fast) var(--ease),
    color var(--dur-fast) var(--ease);
}
.own-btn:focus-visible {
  outline: 2px solid var(--c-gold);
}
.own-btn.active {
  background: var(--s-owned);
  border-color: var(--s-owned);
  color: #08170c;
}
.section {
  margin-top: 22px;
}
.section-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--c-muted);
  margin-bottom: 8px;
}
.slot-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.effects.is-bonus li {
  color: var(--c-gold-light);
  background: rgba(217, 173, 85, 0.1);
}
.effects.is-bonus li::before {
  background: var(--c-gold);
}
.note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 16px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13.5px;
  line-height: 1.4;
  color: var(--c-gold-light);
  background: rgba(217, 173, 85, 0.1);
  border: 1px solid rgba(217, 173, 85, 0.35);
}
.note .q-icon {
  flex: none;
  margin-top: 1px;
}
.section-count {
  margin-left: 6px;
  color: var(--c-gold);
}

.effects {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.effects li {
  position: relative;
  padding: 8px 12px 8px 14px;
  border-radius: 8px;
  background: var(--c-surface-2);
  font-size: 14.5px;
  line-height: 1.35;
}
.effects li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 2px;
  background: var(--c-gold);
}
.effects li.is-plus::before {
  background: var(--s-owned);
}
.effects li.is-minus::before {
  background: var(--c-negative);
}

.mini-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
  gap: 4px;
}
</style>
