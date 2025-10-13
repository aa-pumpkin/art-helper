<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>{{ $t('app.title') }}</q-toolbar-title>

        <!-- Переключатель языка справа -->
        <q-btn-dropdown
          flat
          dense
          no-caps
          :label="labelFor(locale)"
          icon="language"
        >
          <q-list style="min-width: 150px">
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
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-dialog v-model="showInfo">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ $t('app.about') }}</div>
        </q-card-section>
        <q-card-section>
          <div>
            PWA-просмотрщик артефактов HoTA. Данные: <code>public/artifacts.json</code>,
            картинки: <code>public/images/artifacts/</code>.
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

// следим за изменением языка и сохраняем (на случай внешних переключений)
watch(locale, (l) => localStorage.setItem('locale', l))
</script>
