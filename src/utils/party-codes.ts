import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

const ADJECTIVES = [
  'ARCANE', 'SNEAKY', 'CURSED', 'DIVINE', 'WILD', 'SHADOW', 'FROST',
  'BLAZING', 'ANCIENT', 'MYSTIC', 'CUNNING', 'NOBLE', 'FERAL', 'GOLDEN',
  'GHOSTLY', 'SAVAGE', 'SILENT', 'STORMY', 'WICKED', 'RADIANT', 'RUNIC',
  'TWISTED', 'CRIMSON', 'ELDRITCH', 'HOLLOW', 'IRON', 'LUCKY', 'PRIMAL',
  'SILVER', 'THORNY', 'VEILED', 'ZEALOUS', 'DIRE', 'ENCHANTED', 'FABLED',
  'GILDED', 'HAUNTED', 'JADE', 'KEEN', 'LUNAR', 'MITHRAL', 'OBSIDIAN',
  'PALE', 'QUICK', 'ROGUE', 'SOLAR', 'UMBRAL', 'VERDANT', 'WYLD',
] as const

const CREATURES = [
  'OWLBEAR', 'MIMIC', 'BEHOLDER', 'KOBOLD', 'DRAGON', 'GELATINOUS',
  'GOBLIN', 'LICH', 'MINDFLAYER', 'PHOENIX', 'BASILISK', 'CHIMERA',
  'DISPLACER', 'ELEMENTAL', 'GRIFFON', 'HYDRA', 'KRAKEN', 'MANTICORE',
  'NAGA', 'OGRE', 'PEGASUS', 'ROPER', 'SPHINX', 'TARRASQUE', 'UNICORN',
  'WYVERN', 'ABOLETH', 'BULETTE', 'COCKATRICE', 'DARKMANTLE', 'ETTERCAP',
  'FLAMESKULL', 'GRICK', 'HARPY', 'INTELLECT', 'JACKALWERE', 'KENKU',
  'LAMIA', 'MERROW', 'NIGHTMARE', 'OTYUGH', 'PERYTON', 'QUAGGOTH',
  'REVENANT', 'SHAMBLER', 'TREANT', 'UMBER', 'VROCK', 'WRAITH',
  'XORN', 'YETI', 'ZOMBIE', 'ANKHEG', 'BANSHEE', 'CENTAUR',
  'DOPPELGANGER', 'GARGOYLE', 'HOBGOBLIN', 'IMP', 'JACKAL',
  'LIZARDFOLK', 'MEDUSA', 'NOTHIC', 'PIXIE', 'REMORHAZ',
  'SAHUAGIN', 'THRI', 'URCHIN', 'WORG', 'GNOLL', 'TROLL',
  'STIRGE', 'SATYR', 'DRYAD', 'BUGBEAR', 'GHOUL', 'SKELETON',
  'WEREWOLF', 'VAMPIRE', 'SPECTER',
] as const

function randomElement<T>(arr: readonly T[]): T {
  const index = randomBytes(4).readUInt32BE(0) % arr.length
  return arr[index]
}

function randomNumber(max: number): number {
  return (randomBytes(4).readUInt32BE(0) % max) + 1
}

export function generateCode(): string {
  const adjective = randomElement(ADJECTIVES)
  const creature = randomElement(CREATURES)
  const number = randomNumber(1000)
  return `${adjective}-${creature}-${number}`
}

export async function hashCode(code: string): Promise<string> {
  const salt = randomBytes(16)
  const derived = (await scryptAsync(code.toUpperCase(), salt, 64)) as Buffer
  return `${salt.toString('hex')}:${derived.toString('hex')}`
}

export async function verifyCode(
  code: string,
  storedHash: string,
): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(':')
  const salt = Buffer.from(saltHex, 'hex')
  const storedDerived = Buffer.from(hashHex, 'hex')
  const derived = (await scryptAsync(code.toUpperCase(), salt, 64)) as Buffer
  return timingSafeEqual(derived, storedDerived)
}
