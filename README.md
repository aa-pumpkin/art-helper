# HotA Артефакты (art-helper)

Справочник артефактов Heroes of Might and Magic III: Horn of the Abyss и трекер сборных артефактов.
Quasar (Vue 3), собирается как веб-приложение и как Android-приложение через Capacitor.

## Структура

- `public/artifacts.json` — данные артефактов (англ.): слот, класс, цена, эффекты (у сборных — итог вместе с частями), `leadsTo` — в какие сборники входит, `note` — правило HotA по умолчанию (запрещён, не на случайных картах и т. п.; тексты в `src/i18n`). Сверено с HotA 1.8.1: h3hota.com/en/documentation, changelog, heroes.thelazy.net
- `public/i18n/artifacts.ru.json` — русские названия и эффекты по `id`
- `public/images/artifacts/` — иконки артефактов
- `src/i18n/index.js` — строки интерфейса (ru/en)
- `src/composables/useArtifacts.js` — загрузка данных, индексы сборников, переводы
- `src/composables/useProgress.js` — отмеченные артефакты (localStorage)
- `scripts/check-data.js` — проверка согласованности данных

## Разработка

```bash
npm install
npm run dev      # dev-сервер с hot reload
npm run lint     # ESLint
npm run format   # Prettier
npm test         # проверка данных: leadsTo, переводы, картинки
```

После правки `artifacts.json` или переводов запускайте `npm test`.

## Сборка

Веб:

```bash
npm run build    # результат в dist/spa
```

Android:

```bash
quasar build -m capacitor -T android
cd src-capacitor
npx cap sync android
npx cap open android   # открыть в Android Studio
```

Конфигурация Quasar: [quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
