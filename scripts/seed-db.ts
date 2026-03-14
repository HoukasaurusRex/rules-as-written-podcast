import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { eq } from 'drizzle-orm'
import * as schema from '../src/db/schema.ts'
import { hashCode } from '../src/utils/party-codes.ts'

const SEED_CODE = 'ARCANE-OWLBEAR-42'

const url = process.env.NETLIFY_DATABASE_URL_UNPOOLED || process.env.NETLIFY_DATABASE_URL
if (!url) {
  console.error('No database URL set. Add NETLIFY_DATABASE_URL to .env')
  process.exit(1)
}

const client = postgres(url)
const db = drizzle(client, { schema })

async function seed() {
  // Check if seed party already exists
  const existing = await db
    .select()
    .from(schema.parties)
    .where(eq(schema.parties.code, SEED_CODE))
  if (existing.length > 0) {
    console.log(`Seed party already exists: ${SEED_CODE}`)
    console.log(`URL: http://localhost:8888/party/${existing[0].id}`)
    await client.end()
    return
  }

  const codeHash = await hashCode(SEED_CODE)

  // Create party
  const [party] = await db
    .insert(schema.parties)
    .values({
      name: "The Chaotic Neutrals",
      code: SEED_CODE,
      codeHash,
      showEp: true,
      showPp: true,
    })
    .returning()

  const p = party.id

  // Create characters
  const [fighter, wizard, rogue, cleric, poopy] = await db
    .insert(schema.characters)
    .values([
      { partyId: p, name: 'Thorin Ironforge', class: 'Fighter', level: 8, gp: 1450, sp: 230, cp: 85, ep: 12, pp: 5, sortOrder: 0 },
      { partyId: p, name: 'Elara Moonwhisper', class: 'Wizard', level: 8, gp: 985, sp: 110, ep: 25, pp: 3, sortOrder: 1 },
      { partyId: p, name: 'Shade Nightveil', class: 'Rogue', level: 7, gp: 2220, sp: 445, cp: 330, pp: 8, sortOrder: 2 },
      { partyId: p, name: 'Brother Aldric', class: 'Cleric', level: 8, gp: 660, sp: 120, pp: 12, sortOrder: 3 },
      { partyId: p, name: 'Mr. Poopy Butthole', class: 'Bard', level: 6, gp: 696, sp: 69, cp: 420, ep: 69, pp: 2, sortOrder: 4 },
    ])
    .returning()

  // ── Inventory Items (5+ per character + party pool) ──

  await db.insert(schema.inventoryItems).values([
    // Thorin
    { partyId: p, characterId: fighter.id, name: 'Greatsword', quantity: 1, weight: 6, srdIndex: 'greatsword' },
    { partyId: p, characterId: fighter.id, name: 'Plate Armor', quantity: 1, weight: 65, srdIndex: 'plate-armor' },
    { partyId: p, characterId: fighter.id, name: 'Javelin', quantity: 5, weight: 2, srdIndex: 'javelin' },
    { partyId: p, characterId: fighter.id, name: 'Rope, Hempen (50 feet)', quantity: 1, weight: 10, srdIndex: 'rope-hempen-50-feet' },
    { partyId: p, characterId: fighter.id, name: 'Crowbar', quantity: 1, weight: 5, srdIndex: 'crowbar' },
    { partyId: p, characterId: fighter.id, name: 'Barrel of "Courage"', quantity: 1, weight: 70 },
    { partyId: p, characterId: fighter.id, name: 'Trophy Goblin Ear Necklace', quantity: 1, weight: 0.5 },

    // Elara
    { partyId: p, characterId: wizard.id, name: 'Quarterstaff', quantity: 1, weight: 4, srdIndex: 'quarterstaff' },
    { partyId: p, characterId: wizard.id, name: 'Component Pouch', quantity: 1, weight: 2 },
    { partyId: p, characterId: wizard.id, name: 'Spellbook', quantity: 1, weight: 3 },
    { partyId: p, characterId: wizard.id, name: 'Crystal Ball (Decorative)', quantity: 1, weight: 3 },
    { partyId: p, characterId: wizard.id, name: 'Scroll of Identify', quantity: 3, weight: 0 },
    { partyId: p, characterId: wizard.id, name: 'Jar of Pickled Eyeballs', quantity: 1, weight: 2 },
    { partyId: p, characterId: wizard.id, name: 'Cat Familiar Treats', quantity: 12, weight: 0.1 },

    // Shade
    { partyId: p, characterId: rogue.id, name: 'Rapier', quantity: 1, weight: 2, srdIndex: 'rapier' },
    { partyId: p, characterId: rogue.id, name: 'Shortbow', quantity: 1, weight: 2, srdIndex: 'shortbow' },
    { partyId: p, characterId: rogue.id, name: "Thieves' Tools", quantity: 1, weight: 1, srdIndex: 'thieves-tools' },
    { partyId: p, characterId: rogue.id, name: 'Disguise Kit', quantity: 1, weight: 3, srdIndex: 'disguise-kit' },
    { partyId: p, characterId: rogue.id, name: 'Suspiciously Blank Documents', quantity: 5, weight: 0 },
    { partyId: p, characterId: rogue.id, name: 'Blackmail Letters (Assorted)', quantity: 3, weight: 0 },
    { partyId: p, characterId: rogue.id, name: "Someone Else's Wedding Ring", quantity: 1, weight: 0 },

    // Brother Aldric
    { partyId: p, characterId: cleric.id, name: 'Warhammer', quantity: 1, weight: 2, srdIndex: 'warhammer' },
    { partyId: p, characterId: cleric.id, name: 'Shield', quantity: 1, weight: 6, srdIndex: 'shield' },
    { partyId: p, characterId: cleric.id, name: 'Holy Symbol', quantity: 1, weight: 0 },
    { partyId: p, characterId: cleric.id, name: 'Prayer Beads (Extremely Long)', quantity: 1, weight: 1 },
    { partyId: p, characterId: cleric.id, name: 'Flask of Holy Water', quantity: 4, weight: 1, srdIndex: 'holy-water-flask' },
    { partyId: p, characterId: cleric.id, name: 'Pamphlets About His God', quantity: 50, weight: 0.1 },
    { partyId: p, characterId: cleric.id, name: '"Medicinal" Wine', quantity: 3, weight: 1.5 },

    // Mr. Poopy Butthole
    { partyId: p, characterId: poopy.id, name: 'Lute of Questionable Melodies', quantity: 1, weight: 2 },
    { partyId: p, characterId: poopy.id, name: 'Golden Toilet Seat', quantity: 1, weight: 15 },
    { partyId: p, characterId: poopy.id, name: 'Enchanted Plunger', quantity: 1, weight: 3 },
    { partyId: p, characterId: poopy.id, name: 'Roll of Infinite Toilet Paper', quantity: 1, weight: 0.5 },
    { partyId: p, characterId: poopy.id, name: 'Bidet of Refreshment', quantity: 1, weight: 20 },
    { partyId: p, characterId: poopy.id, name: 'Chamber Pot Helmet', quantity: 1, weight: 4 },
    { partyId: p, characterId: poopy.id, name: 'Soap on a Rope (Sentient)', quantity: 1, weight: 0.5 },
    { partyId: p, characterId: poopy.id, name: 'Bag of Holding (Full of Manure)', quantity: 1, weight: 15 },
    { partyId: p, characterId: poopy.id, name: 'Fancy Perfume (Desperately Needed)', quantity: 6, weight: 0.5 },
    { partyId: p, characterId: poopy.id, name: 'Toilet Brush Dagger', quantity: 2, weight: 1 },

    // Party pool
    { partyId: p, characterId: null, name: 'Potion of Healing', quantity: 8, weight: 0.5 },
    { partyId: p, characterId: null, name: 'Potion of Greater Healing', quantity: 2, weight: 0.5 },
    { partyId: p, characterId: null, name: 'Mysterious Ticking Bag', quantity: 1, weight: 5 },
    { partyId: p, characterId: null, name: 'Map to "Definitely Not a Trap"', quantity: 1, weight: 0 },
    { partyId: p, characterId: null, name: 'Rations (10 days)', quantity: 10, weight: 2, srdIndex: 'rations-1-day' },
  ])

  // ── Magic Items (1+ per character + party pool) ──

  await db.insert(schema.magicItems).values([
    // Thorin
    { partyId: p, characterId: fighter.id, name: 'Flame Tongue Greatsword', rarity: 'Rare', requiresAttunement: true, attuned: true, description: 'While attuned, you can use a bonus action to speak a command word, causing flames to erupt from the blade. Deals an extra 2d6 fire damage.' },
    { partyId: p, characterId: fighter.id, name: 'Gauntlets of Ogre Power', rarity: 'Uncommon', requiresAttunement: true, attuned: true, description: 'Your Strength score is 19 while you wear these gauntlets.' },

    // Elara
    { partyId: p, characterId: wizard.id, name: 'Cloak of Protection', rarity: 'Uncommon', requiresAttunement: true, attuned: true, description: '+1 bonus to AC and saving throws while wearing this cloak.' },
    { partyId: p, characterId: wizard.id, name: 'Pearl of Power', rarity: 'Uncommon', requiresAttunement: true, attuned: true, description: 'Once per day, recover one expended spell slot of 3rd level or lower.' },

    // Shade
    { partyId: p, characterId: rogue.id, name: 'Boots of Elvenkind', rarity: 'Uncommon', requiresAttunement: false, attuned: false, description: 'Your steps make no sound. Advantage on Stealth checks that rely on moving silently.' },
    { partyId: p, characterId: rogue.id, name: 'Cloak of Elvenkind', rarity: 'Uncommon', requiresAttunement: true, attuned: true, description: 'While wearing this cloak with its hood up, Wisdom (Perception) checks to see you have disadvantage, and you have advantage on Stealth checks to hide.' },

    // Brother Aldric
    { partyId: p, characterId: cleric.id, name: 'Amulet of Health', rarity: 'Rare', requiresAttunement: true, attuned: true, description: 'Your Constitution score is 19 while you wear this amulet.' },
    { partyId: p, characterId: cleric.id, name: '+1 Shield', rarity: 'Uncommon', requiresAttunement: false, attuned: false, description: 'A shield with a +1 bonus to AC beyond the normal shield bonus.' },

    // Mr. Poopy Butthole
    { partyId: p, characterId: poopy.id, name: 'The Porcelain Throne', rarity: 'Legendary', requiresAttunement: true, attuned: true, description: 'A miniature toilet that, when placed on the ground and sat upon, grants the user the effects of a Short Rest in 1 minute. Once per long rest. The user must make realistic sound effects or the magic fails.' },
    { partyId: p, characterId: poopy.id, name: 'Ring of Flatulence', rarity: 'Uncommon', requiresAttunement: true, attuned: true, description: 'Once per short rest, produce a Thunderwave (2nd level) centered on yourself, flavored as an enormous fart. All creatures in range must also succeed on a DC 13 CON save or be poisoned for 1 round.' },

    // Party pool
    { partyId: p, characterId: null, name: 'Bag of Holding', rarity: 'Uncommon', requiresAttunement: false, attuned: false, description: 'This bag has an interior space considerably larger than its outside dimensions. The party uses it mainly for snacks.' },
    { partyId: p, characterId: null, name: 'Decanter of Endless Water', rarity: 'Uncommon', requiresAttunement: false, attuned: false, description: 'Produces fresh or salt water on command. Mr. Poopy Butthole keeps trying to hook it up to the Bidet of Refreshment.' },
  ])

  // ── Transactions (20+ total, varied and chaotic) ──

  await db.insert(schema.transactions).values([
    // Session 1: Goblin Warren
    { partyId: p, characterId: fighter.id, type: 'loot', gp: 200, sp: 50, note: 'Goblin king hoard' },
    { partyId: p, characterId: wizard.id, type: 'loot', gp: 200, sp: 50, note: 'Goblin king hoard' },
    { partyId: p, characterId: rogue.id, type: 'loot', gp: 200, sp: 50, note: 'Goblin king hoard' },
    { partyId: p, characterId: cleric.id, type: 'loot', gp: 200, sp: 50, note: 'Goblin king hoard' },
    { partyId: p, characterId: poopy.id, type: 'loot', gp: 200, sp: 50, note: 'Goblin king hoard' },

    // Shopping spree
    { partyId: p, characterId: fighter.id, type: 'buy', gp: -75, itemName: 'Plate Armor (used, dented)' },
    { partyId: p, characterId: wizard.id, type: 'buy', gp: -50, itemName: 'Spell components (bulk)' },
    { partyId: p, characterId: rogue.id, type: 'buy', gp: -25, itemName: "Disguise kit + someone else's identity papers" },
    { partyId: p, characterId: cleric.id, type: 'buy', gp: -5, sp: -30, itemName: 'Pamphlets (500 copies)' },
    { partyId: p, characterId: poopy.id, type: 'buy', gp: -150, itemName: 'Golden Toilet Seat from a very confused merchant' },

    // Session 2: Dragon's Lair
    { partyId: p, characterId: fighter.id, type: 'loot', gp: 500, pp: 2, note: 'Dragon hoard (fair split)' },
    { partyId: p, characterId: wizard.id, type: 'loot', gp: 500, pp: 2, note: 'Dragon hoard (fair split)' },
    { partyId: p, characterId: rogue.id, type: 'loot', gp: 800, pp: 5, note: 'Dragon hoard ("fair" split, Shade counted)' },
    { partyId: p, characterId: cleric.id, type: 'loot', gp: 500, pp: 2, note: 'Dragon hoard (fair split)' },
    { partyId: p, characterId: poopy.id, type: 'loot', gp: 500, pp: 2, note: 'Dragon hoard (fair split)' },

    // Various shenanigans
    { partyId: p, characterId: rogue.id, type: 'sell', gp: 300, note: 'Fenced stolen painting from the duke\'s manor' },
    { partyId: p, characterId: poopy.id, type: 'buy', gp: -69, itemName: 'Enchanted Plunger ("it vibrates")' },
    { partyId: p, characterId: poopy.id, type: 'sell', gp: 420, note: 'Sold "artisanal fertilizer" to an unsuspecting noble' },
    { partyId: p, characterId: wizard.id, type: 'buy', gp: -100, itemName: 'Jar of Pickled Eyeballs (spell component, allegedly)' },
    { partyId: p, characterId: fighter.id, type: 'buy', gp: -30, itemName: 'Barrel of "Courage" (dwarven ale)' },

    // Session 3: Tavern incident
    { partyId: p, characterId: poopy.id, type: 'buy', gp: -200, itemName: 'Bidet of Refreshment from a traveling gnome inventor' },
    { partyId: p, characterId: cleric.id, type: 'buy', gp: -45, sp: -50, itemName: '"Medicinal" wine (3 cases)' },
    { partyId: p, characterId: rogue.id, type: 'sell', gp: 150, note: 'Won at Three-Dragon Ante (definitely not cheating)' },
    { partyId: p, characterId: poopy.id, type: 'buy', gp: -35, itemName: 'Chamber Pot Helmet (custom fitted)' },
    { partyId: p, characterId: fighter.id, type: 'buy', gp: -2, sp: -5, itemName: 'Trophy Goblin Ear Necklace materials' },

    // Session 4: Quest rewards
    { partyId: p, characterId: fighter.id, type: 'loot', gp: 100, note: 'Bounty for clearing out the sewer cultists' },
    { partyId: p, characterId: wizard.id, type: 'loot', gp: 100, note: 'Bounty for clearing out the sewer cultists' },
    { partyId: p, characterId: rogue.id, type: 'loot', gp: 100, note: 'Bounty for clearing out the sewer cultists' },
    { partyId: p, characterId: cleric.id, type: 'loot', gp: 100, note: 'Bounty for clearing out the sewer cultists' },
    { partyId: p, characterId: poopy.id, type: 'loot', gp: 100, note: 'Bounty for clearing out the sewer cultists (felt right at home)' },

    // More chaos
    { partyId: p, characterId: poopy.id, type: 'sell', gp: 69, sp: 69, note: 'Sold "slightly used" Roll of Infinite Toilet Paper samples at market' },
    { partyId: p, characterId: rogue.id, type: 'buy', gp: -15, itemName: 'Blank documents and sealing wax' },
    { partyId: p, characterId: wizard.id, type: 'buy', gp: -35, itemName: 'Crystal Ball (decorative, not actually magical)' },
    { partyId: p, characterId: poopy.id, type: 'buy', gp: -10, itemName: 'Fancy Perfume (6 bottles, desperately needed per party vote)' },
    { partyId: p, characterId: fighter.id, type: 'sell', gp: 45, itemName: 'Old chain mail' },
    { partyId: p, characterId: cleric.id, type: 'loot', pp: 5, note: 'Donation from grateful temple of Pelor' },
    { partyId: p, characterId: poopy.id, type: 'buy', gp: -25, itemName: 'Soap on a Rope (Sentient) from a witch' },
    { partyId: p, characterId: rogue.id, type: 'sell', gp: 500, note: 'Returned the duke\'s painting for the reward (stole it in the first place)' },
    { partyId: p, characterId: poopy.id, type: 'loot', gp: 69, note: 'Found in a toilet in the dungeon (of course he checked)' },
  ])

  console.log('Seed data inserted successfully!')
  console.log(`Party: ${party.name}`)
  console.log(`Code:  ${SEED_CODE}`)
  console.log(`URL:   http://localhost:8888/party/${party.id}`)

  await client.end()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
