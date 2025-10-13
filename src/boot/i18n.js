import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'

export default boot(({ app }) => {
  // Автовыбор языка: localStorage > navigator > ru
  const stored = localStorage.getItem('locale')
  const nav = navigator.language?.toLowerCase() || 'ru'
  const initial =
    stored ||
    (nav.startsWith('ru') ? 'ru' : 'en')

  const i18n = createI18n({
    legacy: false,
    locale: initial,
    fallbackLocale: 'en',
    messages
  })

  app.use(i18n)
})
