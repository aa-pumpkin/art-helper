# Артефактор (art-helper)

Справочник артефактов Heroes of Might and Magic III: Horn of the Abyss и трекер сборных артефактов.
Quasar (Vue 3), собирается как веб-приложение (PWA) и как Android-приложение через Capacitor.

## Структура

- `public/artifacts.json` — данные артефактов (англ.): слот, класс, цена, эффекты (у сборных — итог вместе с частями), `bonus` — что даёт сама сборка сверх частей, `leadsTo` — в какие сборники входит, `note` — правило HotA по умолчанию (запрещён, не на случайных картах и т. п.; тексты в `src/i18n`). Русские названия и эффекты сверены с текстами игры HotA 1.8.1 (`artraits.txt` из `HotA_lng.lod` и `HotA.dat`), правила по умолчанию — с h3hota.com/documentation и changelog
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

Веб-версия (PWA — ставится на экран «Домой», в том числе на iPhone через Safari, и работает без сети):

```bash
npx quasar build -m pwa                              # результат в dist/pwa
PUBLIC_PATH=/art-helper/ npx quasar build -m pwa     # для GitHub Pages (подпапка)
```

Публикуется автоматически на GitHub Pages при пуше в `master` (`.github/workflows/pages.yml`).

Android:

```bash
quasar build -m capacitor -T android
cd src-capacitor
npx cap sync android
npx cap open android   # открыть в Android Studio
```

Конфигурация Quasar: [quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
