# Artificer

Artifact reference and combination-artifact tracker for *Heroes of Might and Magic III: Horn of the Abyss*. Runs as a web app (PWA) and as an Android app, in English and Russian.

**Live:** <https://aa-pumpkin.github.io/art-helper/> · [Русская версия](README.ru.md)

## Features

- Tracker: mark the parts you have picked up and see which combination artifacts you can assemble
- Reference for 156 artifacts with search by name or effect and filters
- Shows what a combination adds on top of its parts, the total effect and the slots it takes
- Names and effects checked against the game texts of HotA 1.8.1
- Works offline; progress is stored on the device

## Stack

Vue 3, Quasar, JavaScript, PWA (Workbox), Capacitor (Android), GitHub Actions → GitHub Pages

## Development

```bash
npm install
npm run dev      # dev server
npm run lint
npm test         # data consistency check
npx quasar build -m pwa
npm run build:android
```

The project is unofficial and not affiliated with the rights holders of the game.
