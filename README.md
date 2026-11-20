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
npm run build:android
```

Скрипт `scripts/build-android.sh` использует JDK, Android SDK и Gradle из папки проекта (`.jdk`, `.android-sdk`, `.gradle-home`, вне git). Он кладёт debug-APK в `~/artificer.apk`, а если есть ключ `.signing/keystore.properties`, ещё и подписанный AAB для Google Play в `release/artificer-<версия>.aab`. Версия Android-приложения берётся из `version` в `package.json` (1.2.3 → versionCode 10203): перед каждой загрузкой в Play её нужно поднимать.

Ключ загрузки (`.signing/upload.jks` и пароль в `keystore.properties`) не коммитится. Храните резервную копию: без неё обновление в Play придётся подписывать новым ключом через сброс ключа загрузки в Play Console.

Тексты, скриншоты и баннер для Google Play лежат в `store/`, политика конфиденциальности — в `public/privacy.html` (публикуется вместе с веб-версией).

Конфигурация Quasar: [quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
