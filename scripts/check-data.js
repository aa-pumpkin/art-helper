/**
 * Проверка согласованности данных артефактов: npm test
 * Ловит опечатки в leadsTo, пропущенные переводы и картинки, дубли id.
 */
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')
const readJson = (p) => JSON.parse(readFileSync(join(publicDir, p), 'utf8'))

const SLOTS = ['weapon', 'shield', 'torso', 'head', 'feet', 'cape', 'neck', 'ring', 'misc']
const RARITIES = ['treasure', 'minor', 'major', 'relic']
const TRANSLATIONS = ['i18n/artifacts.ru.json']
const NOTES = ['notAssembled', 'banned', 'disabled', 'notRandom', 'noWater']

const artifacts = readJson('artifacts.json')
const errors = []
const err = (id, msg) => errors.push(`${id}: ${msg}`)

const ids = new Set()
const names = new Set()
for (const a of artifacts) {
  if (!a.id) err(a.name, 'нет id')
  if (ids.has(a.id)) err(a.id, 'повторяющийся id')
  if (names.has(a.name)) err(a.id, `повторяющееся название «${a.name}»`)
  ids.add(a.id)
  names.add(a.name)

  if (!SLOTS.includes(a.slot)) err(a.id, `неизвестный слот «${a.slot}»`)
  if (!RARITIES.includes(a.rarity)) err(a.id, `неизвестный класс «${a.rarity}»`)
  if (typeof a.combo !== 'boolean') err(a.id, 'combo должен быть true/false')
  if (!Array.isArray(a.effects) || !a.effects.length) err(a.id, 'нет эффектов')
  if (a.combo && !a.bonus?.length) err(a.id, 'у сборного нет bonus — что даёт сама сборка')
  if (!a.combo && a.bonus) err(a.id, 'bonus бывает только у сборных')
  if (a.note !== undefined && !NOTES.includes(a.note)) err(a.id, `неизвестная пометка «${a.note}»`)
  if (!a.image || !existsSync(join(publicDir, a.image))) err(a.id, `нет картинки ${a.image}`)
}

const byName = new Map(artifacts.map((a) => [a.name, a]))
const usedAsCombo = new Set()
for (const a of artifacts) {
  for (const comboName of a.leadsTo || []) {
    const combo = byName.get(comboName)
    if (!combo) err(a.id, `leadsTo ссылается на несуществующий «${comboName}»`)
    else if (!combo.combo) err(a.id, `leadsTo ссылается на несборный «${comboName}»`)
    else usedAsCombo.add(comboName)
  }
}
for (const a of artifacts) {
  if (a.combo && !usedAsCombo.has(a.name)) err(a.id, 'сборный артефакт без частей')
}

for (const file of TRANSLATIONS) {
  const tr = readJson(file)
  for (const a of artifacts) {
    const t = tr[a.id]
    if (!t?.name) err(a.id, `${file}: нет перевода названия`)
    else if (!Array.isArray(t.effects) || t.effects.length !== a.effects.length)
      err(a.id, `${file}: число эффектов не совпадает с оригиналом`)
    if ((t?.bonus?.length || 0) !== (a.bonus?.length || 0))
      err(a.id, `${file}: bonus не совпадает с оригиналом`)
  }
  for (const id of Object.keys(tr))
    if (!ids.has(id)) err(id, `${file}: перевод для неизвестного id`)
}

if (errors.length) {
  console.error(`Найдено проблем: ${errors.length}\n` + errors.map((e) => `  - ${e}`).join('\n'))
  process.exit(1)
}
console.log(`Данные в порядке: ${artifacts.length} артефактов, ${usedAsCombo.size} сборных`)
