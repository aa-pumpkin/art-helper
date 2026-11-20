const en = {
  app: {
    title: 'Artificer',
    about: 'About',
    aboutText:
      'A companion for Heroes of Might and Magic III: Horn of the Abyss. Mark the parts you pick up and see which combination artifacts you can assemble.',
    aboutData: 'Progress is stored on this device only.',
    support: 'Support',
    supportText: 'The app is free and ad-free. If it helps you, you can support the author.',
    dataVersion: 'Names and effects are checked against the game files, HotA {version}.',
    close: 'Close',
    language: 'Language',
  },
  nav: {
    combos: 'Combos',
    all: 'All artifacts',
  },
  common: {
    search: 'Name or effect…',
    loadError: 'Failed to load artifact data',
    retry: 'Retry',
    nothingFound: 'Nothing found',
    cancel: 'Cancel',
    back: 'Back',
  },
  filters: {
    all: 'All',
  },
  slot: {
    weapon: 'Weapon',
    shield: 'Shield',
    torso: 'Armor',
    head: 'Helmet',
    feet: 'Boots',
    cape: 'Cloak',
    neck: 'Necklace',
    ring: 'Ring',
    misc: 'Misc',
  },
  rarity: {
    treasure: 'Treasure',
    minor: 'Minor',
    major: 'Major',
    relic: 'Relic',
  },
  fields: {
    slot: 'Slot',
    rarity: 'Class',
    cost: 'Cost',
    effect: 'Effect',
    combo: 'Combination artifact',
    parts: 'Assembled from',
    partOf: 'Part of',
    comboTotal: 'Total with the parts',
    bonus: 'Assembly adds',
    occupies: 'Takes slots',
  },
  note: {
    notAssembled: 'Cannot be assembled by default — only on some templates and scenarios',
    banned: 'Banned by default on random maps',
    disabled: 'Disabled by default on random maps',
    notRandom: 'Does not appear on random maps unless the template enables it',
    noWater: 'Not generated on random maps without water',
  },
  all: {
    needed: 'needed',
    neededHint: 'Gold “needed” marks parts of combos you have started',
  },
  own: {
    mark: 'I have it',
    have: 'Owned',
  },
  combos: {
    hint: 'Tap a part when you pick it up — combos closest to completion move to the top.',
    ready: 'Ready',
    reset: 'New game',
    resetConfirm: 'Clear all marked artifacts?',
  },
}

const ru = {
  app: {
    title: 'Артефактор',
    about: 'О приложении',
    aboutText:
      'Помощник для Heroes of Might and Magic III: Horn of the Abyss. Отмечай подобранные части и смотри, какие сборные артефакты можно собрать.',
    aboutData: 'Прогресс хранится только на этом устройстве.',
    support: 'Поддержать',
    supportText:
      'Приложение бесплатное и без рекламы. Если оно тебе помогает, можешь поддержать автора.',
    dataVersion: 'Названия и эффекты сверены с файлами игры, HotA {version}.',
    close: 'Закрыть',
    language: 'Язык',
  },
  nav: {
    combos: 'Сборники',
    all: 'Все артефакты',
  },
  common: {
    search: 'Название или эффект…',
    loadError: 'Не удалось загрузить данные артефактов',
    retry: 'Повторить',
    nothingFound: 'Ничего не найдено',
    cancel: 'Отмена',
    back: 'Назад',
  },
  filters: {
    all: 'Все',
  },
  slot: {
    weapon: 'Оружие',
    shield: 'Щит',
    torso: 'Доспех',
    head: 'Шлем',
    feet: 'Обувь',
    cape: 'Плащ',
    neck: 'Шея',
    ring: 'Кольцо',
    misc: 'Разное',
  },
  rarity: {
    treasure: 'Сокровище',
    minor: 'Малый',
    major: 'Великий',
    relic: 'Реликт',
  },
  fields: {
    slot: 'Слот',
    rarity: 'Класс',
    cost: 'Цена',
    effect: 'Эффект',
    combo: 'Сборный артефакт',
    parts: 'Собирается из',
    partOf: 'Входит в',
    comboTotal: 'Итого вместе с частями',
    bonus: 'Сборка добавляет',
    occupies: 'Занимает слоты',
  },
  note: {
    notAssembled: 'По умолчанию не собирается — только на некоторых шаблонах и в сценариях',
    banned: 'По умолчанию запрещён на случайных картах',
    disabled: 'По умолчанию отключён на случайных картах',
    notRandom: 'Не появляется на случайных картах, если не включён в шаблоне',
    noWater: 'Не появляется на случайных картах без воды',
  },
  all: {
    needed: 'нужен',
    neededHint: 'Золотым «нужен» отмечены части начатых сборников',
  },
  own: {
    mark: 'У меня есть',
    have: 'Есть',
  },
  combos: {
    hint: 'Тапни часть, когда подберёшь её, — сборники, близкие к готовности, поднимутся наверх.',
    ready: 'Готово',
    reset: 'Новая партия',
    resetConfirm: 'Снять все отметки?',
  },
}

export default { en, ru }
