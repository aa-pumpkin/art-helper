import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'

// Русская плюрализация: 0 | 1 артефакт | 2 артефакта | 5 артефактов
function ruPlural(choice, choicesLength) {
  if (choice === 0) return 0
  const n10 = choice % 10
  const n100 = choice % 100
  const form =
    n10 === 1 && n100 !== 11 ? 1 : n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14) ? 2 : 3
  return Math.min(form, choicesLength - 1)
}

function initialLocale() {
  let stored = null
  try {
    stored = localStorage.getItem('locale')
  } catch {
    // нет доступа к localStorage
  }
  if (stored === 'ru' || stored === 'en') return stored
  return navigator.language?.toLowerCase().startsWith('ru') ? 'ru' : 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale(),
  fallbackLocale: 'en',
  pluralRules: { ru: ruPlural },
  messages,
})

export default boot(({ app }) => {
  app.use(i18n)
})
