import { generateUniqueId } from "@/utils";

const rogueQuests = [
  // Level 1 Quests
  {
    id: generateUniqueId(),
    name: "Pickpocket the Merchant",
    description: "Steal a valuable item from a local merchant without getting caught.",
    requiredCharacter: "Rogue",
    requiredLevel: 1,
  },
  {
    id: generateUniqueId(),
    name: "Sneak into the Tavern",
    description: "Infiltrate the tavern and gather information from the patrons without alerting anyone.",
    requiredCharacter: "Rogue",
    requiredLevel: 1,
  },
  {
    id: generateUniqueId(),
    name: "Steal the Noble's Ring",
    description: "Steal a ring from a nobleman while he's at a banquet.",
    requiredCharacter: "Rogue",
    requiredLevel: 1,
  },

  // Level 2 Quests
  {
    id: generateUniqueId(),
    name: "Assassinate the Spy",
    description: "Take down a foreign spy hiding within the city.",
    requiredCharacter: "Rogue",
    requiredLevel: 2,
  },
  {
    id: generateUniqueId(),
    name: "Break into the Warehouse",
    description: "Sneak into a well-guarded warehouse and steal valuable goods.",
    requiredCharacter: "Rogue",
    requiredLevel: 2,
  },
  {
    id: generateUniqueId(),
    name: "Infiltrate the Bandit Camp",
    description: "Disguise yourself and sneak into a bandit camp to gather intel.",
    requiredCharacter: "Rogue",
    requiredLevel: 2,
  },

  // Level 3 Quests
  {
    id: generateUniqueId(),
    name: "Steal the Royal Plans",
    description: "Steal secret royal documents from the palace.",
    requiredCharacter: "Rogue",
    requiredLevel: 3,
  },
  {
    id: generateUniqueId(),
    name: "Escape the Dungeon",
    description: "Break out of a dungeon after being captured during a failed heist.",
    requiredCharacter: "Rogue",
    requiredLevel: 3,
  },
  {
    id: generateUniqueId(),
    name: "Sabotage the Enemy Supplies",
    description: "Sneak into the enemy's camp and sabotage their supply line.",
    requiredCharacter: "Rogue",
    requiredLevel: 3,
  },

  // Level 4 Quests
  {
    id: generateUniqueId(),
    name: "Steal the King's Crown",
    description: "Sneak into the castle and steal the king's crown.",
    requiredCharacter: "Rogue",
    requiredLevel: 4,
  },
  {
    id: generateUniqueId(),
    name: "Rob the Treasury",
    description: "Break into the royal treasury and steal valuable artifacts.",
    requiredCharacter: "Rogue",
    requiredLevel: 4,
  },
  {
    id: generateUniqueId(),
    name: "Assassinate the Traitor",
    description: "Eliminate a high-ranking traitor within the kingdom.",
    requiredCharacter: "Rogue",
    requiredLevel: 4,
  },

  // Level 5 Quests
  {
    id: generateUniqueId(),
    name: "Steal the Dragon's Hoard",
    description: "Infiltrate the dragon's lair and steal its treasure.",
    requiredCharacter: "Rogue",
    requiredLevel: 5,
  },
  {
    id: generateUniqueId(),
    name: "Escape the King's Guards",
    description: "After being discovered during a heist, escape the royal guards.",
    requiredCharacter: "Rogue",
    requiredLevel: 5,
  },
  {
    id: generateUniqueId(),
    name: "Steal the Forbidden Artifact",
    description: "Steal a dangerous and forbidden magical artifact from a heavily guarded museum.",
    requiredCharacter: "Rogue",
    requiredLevel: 5,
  },
];

const warriorQuests = [
  // Level 1 Quests
  {
    id: generateUniqueId(),
    name: "Defend the Village",
    description: "Protect the village from an incoming bandit raid.",
    requiredCharacter: "Warrior",
    requiredLevel: 1,
  },
  {
    id: generateUniqueId(),
    name: "Escort the Merchant",
    description: "Escort a merchant safely through dangerous lands.",
    requiredCharacter: "Warrior",
    requiredLevel: 1,
  },
  {
    id: generateUniqueId(),
    name: "Clear the Goblin Nest",
    description: "Clear out a goblin nest near the village.",
    requiredCharacter: "Warrior",
    requiredLevel: 1,
  },

  // Level 2 Quests
  {
    id: generateUniqueId(),
    name: "Protect the Caravan",
    description: "Defend the merchant caravan from raiders.",
    requiredCharacter: "Warrior",
    requiredLevel: 2,
  },
  {
    id: generateUniqueId(),
    name: "Slay the Giant Spider",
    description: "Slay the giant spider terrorizing the woods.",
    requiredCharacter: "Warrior",
    requiredLevel: 2,
  },
  {
    id: generateUniqueId(),
    name: "Rescue the Lost Soldier",
    description: "Find and rescue a soldier lost in the battlefield.",
    requiredCharacter: "Warrior",
    requiredLevel: 2,
  },

  // Level 3 Quests
  {
    id: generateUniqueId(),
    name: "Defeat the Bandit Leader",
    description: "Take down the bandit leader threatening the town.",
    requiredCharacter: "Warrior",
    requiredLevel: 3,
  },
  {
    id: generateUniqueId(),
    name: "Protect the Town from Wolves",
    description: "Defend the town from a pack of vicious wolves.",
    requiredCharacter: "Warrior",
    requiredLevel: 3,
  },
  {
    id: generateUniqueId(),
    name: "Slay the Minotaur",
    description: "Enter the labyrinth and defeat the Minotaur.",
    requiredCharacter: "Warrior",
    requiredLevel: 3,
  },

  // Level 4 Quests
  {
    id: generateUniqueId(),
    name: "Rescue the Princess",
    description: "Rescue the princess from the bandit stronghold.",
    requiredCharacter: "Warrior",
    requiredLevel: 4,
  },
  {
    id: generateUniqueId(),
    name: "Clear the Undead Tomb",
    description: "Defeat the undead in an ancient tomb.",
    requiredCharacter: "Warrior",
    requiredLevel: 4,
  },
  {
    id: generateUniqueId(),
    name: "Destroy the Troll King's Army",
    description: "Defeat the troll king and his army in the mountain pass.",
    requiredCharacter: "Warrior",
    requiredLevel: 4,
  },

  // Level 5 Quests
  {
    id: generateUniqueId(),
    name: "Defeat the Dragon",
    description: "Defeat the dragon terrorizing the kingdom.",
    requiredCharacter: "Warrior",
    requiredLevel: 5,
  },
  {
    id: generateUniqueId(),
    name: "Battle the Demon Lord",
    description: "Face off against the Demon Lord in the fiery pits.",
    requiredCharacter: "Warrior",
    requiredLevel: 5,
  },
  {
    id: generateUniqueId(),
    name: "Slay the Ancient Beast",
    description: "Defeat the ancient beast that roams the cursed forest.",
    requiredCharacter: "Warrior",
    requiredLevel: 5,
  },
];

const mageQuests = [
  // Level 1 Quests
  {
    id: generateUniqueId(),
    name: "Master the Fireball Spell",
    description: "Learn and master the fireball spell in the mage's tower.",
    requiredCharacter: "Mage",
    requiredLevel: 1,
  },
  {
    id: generateUniqueId(),
    name: "Gather Magical Herbs",
    description: "Collect rare herbs needed for potion-making.",
    requiredCharacter: "Mage",
    requiredLevel: 1,
  },
  {
    id: generateUniqueId(),
    name: "Assist the Local Wizard",
    description: "Help a local wizard with a minor magical task.",
    requiredCharacter: "Mage",
    requiredLevel: 1,
  },

  // Level 2 Quests
  {
    id: generateUniqueId(),
    name: "Learn the Levitation Spell",
    description: "Learn the basics of the levitation spell from a renowned mage.",
    requiredCharacter: "Mage",
    requiredLevel: 2,
  },
  {
    id: generateUniqueId(),
    name: "Unlock the Magic Portal",
    description: "Help unlock a dormant magic portal in the wizard's tower.",
    requiredCharacter: "Mage",
    requiredLevel: 2,
  },
  {
    id: generateUniqueId(),
    name: "Defeat the Lesser Elementals",
    description: "Defeat a group of lesser elementals that have escaped from the magical labs.",
    requiredCharacter: "Mage",
    requiredLevel: 2,
  },

  // Level 3 Quests
  {
    id: generateUniqueId(),
    name: "Retrieve the Ancient Tome",
    description: "Find the ancient magical tome hidden deep in the library.",
    requiredCharacter: "Mage",
    requiredLevel: 3,
  },
  {
    id: generateUniqueId(),
    name: "Control the Fire Elemental",
    description: "Summon and control a fire elemental to prove your magical prowess.",
    requiredCharacter: "Mage",
    requiredLevel: 3,
  },
  {
    id: generateUniqueId(),
    name: "Protect the Magic Academy",
    description: "Defend the magic academy from a band of marauding beasts.",
    requiredCharacter: "Mage",
    requiredLevel: 3,
  },

  // Level 4 Quests
  {
    id: generateUniqueId(),
    name: "Defeat the Dark Sorcerer",
    description: "Defeat the dark sorcerer who has been corrupting magic across the land.",
    requiredCharacter: "Mage",
    requiredLevel: 4,
  },
  {
    id: generateUniqueId(),
    name: "Find the Crystal of Eternity",
    description: "Find the legendary Crystal of Eternity to enhance your magical power.",
    requiredCharacter: "Mage",
    requiredLevel: 4,
  },
  {
    id: generateUniqueId(),
    name: "Contain the Unstable Rift",
    description: "Close an unstable magical rift that is spewing dangerous magical creatures.",
    requiredCharacter: "Mage",
    requiredLevel: 4,
  },

  // Level 5 Quests
  {
    id: generateUniqueId(),
    name: "Defeat the Demon Lord",
    description: "Use your most powerful spells to defeat the Demon Lord and save the kingdom.",
    requiredCharacter: "Mage",
    requiredLevel: 5,
  },
  {
    id: generateUniqueId(),
    name: "Create the Elixir of Immortality",
    description: "Combine rare ingredients to create the Elixir of Immortality.",
    requiredCharacter: "Mage",
    requiredLevel: 5,
  },
  {
    id: generateUniqueId(),
    name: "Battle the Shadow Mage",
    description: "Confront and defeat the shadow mage who has been corrupting magic itself.",
    requiredCharacter: "Mage",
    requiredLevel: 5,
  },
];

const archerQuests = [
  // Level 1 Quests
  {
    id: generateUniqueId(),
    name: "Hunt the Wild Deer",
    description: "Hunt wild deer in the forest to provide food for the village.",
    requiredCharacter: "Archer",
    requiredLevel: 1,
  },
  {
    id: generateUniqueId(),
    name: "Test Your Accuracy",
    description: "Test your accuracy by hitting stationary targets at the archery range.",
    requiredCharacter: "Archer",
    requiredLevel: 1,
  },
  {
    id: generateUniqueId(),
    name: "Retrieve Lost Arrows",
    description: "Search the forest for lost arrows that were shot by other hunters.",
    requiredCharacter: "Archer",
    requiredLevel: 1,
  },

  // Level 2 Quests
  {
    id: generateUniqueId(),
    name: "Track the Wolf Pack",
    description: "Track a dangerous pack of wolves that have been spotted near the village.",
    requiredCharacter: "Archer",
    requiredLevel: 2,
  },
  {
    id: generateUniqueId(),
    name: "Hunt the Wild Boar",
    description: "Hunt and kill a wild boar that has been damaging crops.",
    requiredCharacter: "Archer",
    requiredLevel: 2,
  },
  {
    id: generateUniqueId(),
    name: "Assassinate the Spy",
    description: "Eliminate a spy who has been sneaking through the forest.",
    requiredCharacter: "Archer",
    requiredLevel: 2,
  },

  // Level 3 Quests
  {
    id: generateUniqueId(),
    name: "Defend the Watchtower",
    description: "Defend the watchtower from incoming goblins using your bow.",
    requiredCharacter: "Archer",
    requiredLevel: 3,
  },
  {
    id: generateUniqueId(),
    name: "Find the Sacred Arrow",
    description: "Find and retrieve the Sacred Arrow hidden in the ancient ruins.",
    requiredCharacter: "Archer",
    requiredLevel: 3,
  },
  {
    id: generateUniqueId(),
    name: "Rescue the Ranger",
    description: "Rescue a fellow ranger captured by a group of orcs in the forest.",
    requiredCharacter: "Archer",
    requiredLevel: 3,
  },

  // Level 4 Quests
  {
    id: generateUniqueId(),
    name: "Assault the Bandit Camp",
    description: "Infiltrate a bandit camp and take down the bandit leader from a distance.",
    requiredCharacter: "Archer",
    requiredLevel: 4,
  },
  {
    id: generateUniqueId(),
    name: "Clear the Cursed Forest",
    description: "Clear out the monsters that have been roaming the cursed forest.",
    requiredCharacter: "Archer",
    requiredLevel: 4,
  },
  {
    id: generateUniqueId(),
    name: "Defend the Town Gates",
    description: "Defend the town gates from an incoming siege with your archery skills.",
    requiredCharacter: "Archer",
    requiredLevel: 4,
  },

  // Level 5 Quests
  {
    id: generateUniqueId(),
    name: "Hunt the Giant Elk",
    description: "Track and hunt a giant elk in the distant mountain forests.",
    requiredCharacter: "Archer",
    requiredLevel: 5,
  },
  {
    id: generateUniqueId(),
    name: "Destroy the Enemy Supply Line",
    description: "Use your long-range arrows to destroy the enemy's supply line.",
    requiredCharacter: "Archer",
    requiredLevel: 5,
  },
  {
    id: generateUniqueId(),
    name: "Slay the Wyvern",
    description: "Take down a terrifying wyvern that has been spotted in the skies.",
    requiredCharacter: "Archer",
    requiredLevel: 5,
  },
];

export const quests = [
  ...rogueQuests,
  ...warriorQuests,
  ...mageQuests,
  ...archerQuests,
  ];