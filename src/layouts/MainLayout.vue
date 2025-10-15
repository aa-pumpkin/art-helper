<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="header">
      <!-- Верхняя полоса -->
      <q-toolbar class="q-px-md">
        <q-toolbar-title class="row items-center no-wrap">
          <div class="app-title">{{ $t('app.title') }}</div>
        </q-toolbar-title>

        <!-- Переключатель языка справа -->
        <q-btn-dropdown flat dense no-caps :label="labelFor(locale)" icon="language">
          <q-list style="min-width: 160px">
            <q-item clickable v-close-popup @click="setLocale('ru')">
              <q-item-section avatar>🇷🇺</q-item-section>
              <q-item-section>Русский</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="setLocale('en')">
              <q-item-section avatar>🇬🇧</q-item-section>
              <q-item-section>English</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <q-btn flat round dense icon="info" @click="showInfo = true" />
      </q-toolbar>

      <!-- Нижняя полоса: Табы (под хедером) -->
      <q-toolbar class="tabs-bar q-px-none">
        <q-tabs align="left" dense active-color="white" indicator-color="white" class="full-width">
          <q-route-tab to="/" exact label="Артефакты" />
          <q-route-tab to="/tracker" label="Трекер" />
        </q-tabs>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-dialog v-model="showInfo">
      <q-card style="min-width: 320px">
        <q-card-section>
          <div class="text-h6">{{ $t('app.about') }}</div>
        </q-card-section>
        <q-card-section>
          <div>
            PWA-просмотрщик артефактов HoTA. Данные: <code>public/artifacts.json</code>, картинки:
            <code>public/images/artifacts/</code>.
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('app.close')" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const showInfo = ref(false)
const { locale } = useI18n()

function setLocale(l) {
  locale.value = l
  localStorage.setItem('locale', l)
}
function labelFor(l) {
  return l === 'ru' ? 'RU' : 'EN'
}
watch(locale, (l) => localStorage.setItem('locale', l))
</script>

<style scoped>
.header {
  /* лёгкий градиент и тонкая нижняя тень */
  background: linear-gradient(180deg, #2f3b52, #2a3347);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  color: #fff;
  padding-top: env(safe-area-inset-top);
}
.app-title {
  font-weight: 700;
  letter-spacing: 0.2px;
}

/* нижняя полоса с табами */
.tabs-bar {
  background: transparent;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
  min-height: 44px;
}
.q-tabs .q-tab {
  text-transform: none;
  font-weight: 600;
}
.q-tabs .q-tab__label {
  font-size: 14px;
}
/* подчёркивание-индикатор потолще и с мягкими краями */
.q-tabs .q-tab--active .q-tab__indicator {
  height: 3px;
  border-radius: 2px;
}

/* на маленьких экранах помещаем всё по краям */
@media (max-width: 599px) {
  .app-title {
    font-size: 16px;
  }
}

.q-page-container {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
