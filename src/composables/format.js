const SLOT_ICONS = {
  weapon: 'gavel',
  shield: 'shield',
  torso: 'checkroom',
  head: 'face',
  feet: 'hiking',
  cape: 'dry_cleaning',
  neck: 'all_inclusive',
  ring: 'radio_button_unchecked',
  misc: 'category',
}

export function slotIcon(slot) {
  return SLOT_ICONS[slot] || 'category'
}

const numberFormat = new Intl.NumberFormat('ru-RU')

export function formatCost(cost) {
  return typeof cost === 'number' ? numberFormat.format(cost) : '—'
}
