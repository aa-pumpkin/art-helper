<template>
  <!-- шапка и вкладки неподвижны, прокручивается только середина -->
  <div class="app-shell">
    <header class="app-header">
      <q-toolbar class="page-container header-bar">
        <router-link to="/" class="brand">
          <img :src="brandIcon" alt="" class="brand-icon" />
          <span class="brand-title">{{ $t('app.title') }}</span>
        </router-link>

        <q-tabs
          v-if="$q.screen.gt.xs"
          dense
          no-caps
          inline-label
          class="header-tabs"
          indicator-color="primary"
          active-color="primary"
        >
          <q-route-tab to="/" exact icon="auto_awesome" :label="$t('nav.combos')" />
          <q-route-tab to="/all" icon="auto_stories" :label="$t('nav.all')" />
        </q-tabs>

        <q-space />

        <q-btn
          flat
          dense
          no-caps
          class="lang-btn"
          :label="locale === 'ru' ? 'RU' : 'EN'"
          icon="translate"
          :aria-label="$t('app.language')"
          @click="toggleLocale"
        />
        <q-btn
          v-if="showDonate"
          flat
          round
          dense
          icon="favorite_border"
          class="donate-btn"
          :href="DONATE_URL"
          target="_blank"
          rel="noopener"
          :aria-label="$t('app.support')"
        />
        <q-btn
          flat
          round
          dense
          icon="info_outline"
          :aria-label="$t('app.about')"
          @click="showInfo = true"
        />
      </q-toolbar>
      <!-- сюда страницы телепортируют свою панель поиска: она часть закреплённой шапки -->
      <div id="page-toolbar" />
    </header>

    <main ref="mainEl" class="app-main">
      <router-view />
    </main>

    <nav v-if="$q.screen.xs" class="app-footer">
      <q-tabs
        dense
        no-caps
        class="footer-tabs"
        indicator-color="transparent"
        active-color="primary"
      >
        <q-route-tab to="/" exact icon="auto_awesome" :label="$t('nav.combos')" />
        <q-route-tab to="/all" icon="auto_stories" :label="$t('nav.all')" />
      </q-tabs>
    </nav>

    <q-dialog v-model="showInfo">
      <q-card class="about-card">
        <q-card-section class="row items-center no-wrap q-gutter-md">
          <img :src="brandIcon" alt="" class="about-icon" />
          <div class="about-title">{{ $t('app.title') }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none about-text">
          <p>{{ $t('app.aboutText') }}</p>
          <p class="text-muted">{{ $t('app.aboutData') }}</p>
          <p class="text-muted">{{ $t('app.dataVersion', { version: '1.8.1' }) }}</p>
          <p v-if="showDonate">{{ $t('app.supportText') }}</p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            v-if="showDonate"
            unelevated
            no-caps
            color="primary"
            text-color="dark"
            icon="favorite"
            :label="$t('app.support')"
            :href="DONATE_URL"
            target="_blank"
            rel="noopener"
          />
          <q-btn flat no-caps color="primary" :label="$t('app.close')" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { asset } from 'src/composables/useArtifacts'

const brandIcon = asset('icon.svg')

const showInfo = ref(false)

/*
 * Донаты — только в веб-версии: правила Google Play запрещают в приложении
 * ссылки на оплату мимо Play Billing, в том числе чаевые разработчику.
 */
const DONATE_URL = 'https://www.donationalerts.com/r/pumpkin_aa'
const showDonate = process.env.MODE !== 'capacitor'
const { locale } = useI18n()

/* при переключении вкладок начинать сверху */
const mainEl = ref(null)
const route = useRoute()
watch(
  () => route.path,
  () => mainEl.value?.scrollTo(0, 0),
)

function toggleLocale() {
  locale.value = locale.value === 'ru' ? 'en' : 'ru'
}

watch(
  locale,
  (l) => {
    document.documentElement.lang = l
    try {
      localStorage.setItem('locale', l)
    } catch {
      // нет доступа к localStorage
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.app-shell {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.app-main {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: none;
}
.app-header {
  flex: none;
  background: linear-gradient(180deg, #1d222c, #171b23);
  border-bottom: 1px solid var(--c-border);
  color: var(--c-text);
  padding-top: env(safe-area-inset-top);
}
.header-bar {
  min-height: 56px;
  gap: 8px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: inherit;
  text-decoration: none;
  margin-right: 12px;
}
.brand-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
}
.brand-title {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: var(--c-gold-light);
  white-space: nowrap;
}
.header-tabs {
  color: var(--c-muted);
}
.lang-btn {
  color: var(--c-muted);
  font-weight: 600;
}

.app-footer {
  flex: none;
  background: #171b23;
  border-top: 1px solid var(--c-border);
  padding-bottom: env(safe-area-inset-bottom);
}
.footer-tabs {
  color: var(--c-muted);
}
.footer-tabs :deep(.q-tab) {
  flex: 1;
  min-height: 58px;
}
.footer-tabs :deep(.q-tab__label) {
  font-size: 12px;
}

.about-card {
  width: 420px;
  max-width: 92vw;
  background: var(--c-surface);
  color: var(--c-text);
  border: 1px solid var(--c-border);
  border-radius: 16px;
}
.about-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
}
.about-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--c-gold-light);
}
.donate-btn {
  color: var(--c-gold);
}
.about-text p {
  margin: 0 0 10px;
  line-height: 1.5;
}
</style>
