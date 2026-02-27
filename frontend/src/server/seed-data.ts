import type { Db } from "./db";
import { applySchema } from "./db";

interface SeedSet {
  name: string;
  releaseDate: string;
}

interface SeedCard {
  name: string;
  setName: string;
  number: string;
  rarity: string;
  type: string;
  imageUrl: string;
  marketValue: number;
}

const seedSets: SeedSet[] = [
  { name: "Kanto Classics", releaseDate: "1999-01-09" },
  { name: "Johto Legends", releaseDate: "2001-06-16" },
  { name: "Hoenn Masters", releaseDate: "2003-11-21" },
];

// At least 50 cards across 3 sets, synthetic but plausible.
const seedCards: SeedCard[] = [
  // Kanto Classics
  { name: "Charizard", setName: "Kanto Classics", number: "4/102", rarity: "Rare Holo", type: "Fire", imageUrl: "https://images.pokemontcg.io/base2/4.png", marketValue: 320 },
  { name: "Blastoise", setName: "Kanto Classics", number: "2/102", rarity: "Rare Holo", type: "Water", imageUrl: "https://images.pokemontcg.io/base2/2.png", marketValue: 210 },
  { name: "Venusaur", setName: "Kanto Classics", number: "15/102", rarity: "Rare Holo", type: "Grass", imageUrl: "https://images.pokemontcg.io/base2/15.png", marketValue: 180 },
  { name: "Alakazam", setName: "Kanto Classics", number: "1/102", rarity: "Rare Holo", type: "Psychic", imageUrl: "https://images.pokemontcg.io/base2/1.png", marketValue: 95 },
  { name: "Gyarados", setName: "Kanto Classics", number: "6/102", rarity: "Rare Holo", type: "Water", imageUrl: "https://images.pokemontcg.io/base2/6.png", marketValue: 80 },
  { name: "Machamp", setName: "Kanto Classics", number: "8/102", rarity: "Rare Holo", type: "Fighting", imageUrl: "https://images.pokemontcg.io/base2/8.png", marketValue: 45 },
  { name: "Raichu", setName: "Kanto Classics", number: "14/102", rarity: "Rare Holo", type: "Lightning", imageUrl: "https://images.pokemontcg.io/base2/14.png", marketValue: 60 },
  { name: "Zapdos", setName: "Kanto Classics", number: "16/102", rarity: "Rare Holo", type: "Lightning", imageUrl: "https://images.pokemontcg.io/base2/16.png", marketValue: 75 },
  { name: "Hitmonchan", setName: "Kanto Classics", number: "7/102", rarity: "Rare Holo", type: "Fighting", imageUrl: "https://images.pokemontcg.io/base2/7.png", marketValue: 55 },
  { name: "Magneton", setName: "Kanto Classics", number: "9/102", rarity: "Rare Holo", type: "Metal", imageUrl: "https://images.pokemontcg.io/base2/9.png", marketValue: 35 },
  { name: "Mewtwo", setName: "Kanto Classics", number: "10/102", rarity: "Rare Holo", type: "Psychic", imageUrl: "https://images.pokemontcg.io/base2/10.png", marketValue: 150 },
  { name: "Nidoking", setName: "Kanto Classics", number: "11/102", rarity: "Rare Holo", type: "Grass", imageUrl: "https://images.pokemontcg.io/base2/11.png", marketValue: 70 },
  { name: "Ninetales", setName: "Kanto Classics", number: "12/102", rarity: "Rare Holo", type: "Fire", imageUrl: "https://images.pokemontcg.io/base2/12.png", marketValue: 65 },
  { name: "Poliwrath", setName: "Kanto Classics", number: "13/102", rarity: "Rare Holo", type: "Water", imageUrl: "https://images.pokemontcg.io/base2/13.png", marketValue: 40 },
  { name: "Chansey", setName: "Kanto Classics", number: "3/102", rarity: "Rare Holo", type: "Colorless", imageUrl: "https://images.pokemontcg.io/base2/3.png", marketValue: 90 },
  { name: "Pidgeotto", setName: "Kanto Classics", number: "22/102", rarity: "Rare", type: "Colorless", imageUrl: "https://images.pokemontcg.io/base2/22.png", marketValue: 18 },
  { name: "Arcanine", setName: "Kanto Classics", number: "23/102", rarity: "Uncommon", type: "Fire", imageUrl: "https://images.pokemontcg.io/base2/23.png", marketValue: 5 },
  { name: "Kadabra", setName: "Kanto Classics", number: "32/102", rarity: "Uncommon", type: "Psychic", imageUrl: "https://images.pokemontcg.io/base2/32.png", marketValue: 6 },
  { name: "Haunter", setName: "Kanto Classics", number: "29/102", rarity: "Uncommon", type: "Psychic", imageUrl: "https://images.pokemontcg.io/base2/29.png", marketValue: 7 },
  { name: "Pikachu", setName: "Kanto Classics", number: "58/102", rarity: "Common", type: "Lightning", imageUrl: "https://images.pokemontcg.io/base2/58.png", marketValue: 12 },

  // Johto Legends
  { name: "Ho-Oh", setName: "Johto Legends", number: "7/111", rarity: "Rare Holo", type: "Fire", imageUrl: "https://images.pokemontcg.io/n1/7.png", marketValue: 140 },
  { name: "Lugia", setName: "Johto Legends", number: "9/111", rarity: "Rare Holo", type: "Psychic", imageUrl: "https://images.pokemontcg.io/n1/9.png", marketValue: 155 },
  { name: "Typhlosion", setName: "Johto Legends", number: "17/111", rarity: "Rare Holo", type: "Fire", imageUrl: "https://images.pokemontcg.io/n1/17.png", marketValue: 80 },
  { name: "Feraligatr", setName: "Johto Legends", number: "5/111", rarity: "Rare Holo", type: "Water", imageUrl: "https://images.pokemontcg.io/n1/5.png", marketValue: 65 },
  { name: "Meganium", setName: "Johto Legends", number: "10/111", rarity: "Rare Holo", type: "Grass", imageUrl: "https://images.pokemontcg.io/n1/10.png", marketValue: 60 },
  { name: "Ampharos", setName: "Johto Legends", number: "1/111", rarity: "Rare Holo", type: "Lightning", imageUrl: "https://images.pokemontcg.io/n1/1.png", marketValue: 45 },
  { name: "Espeon", setName: "Johto Legends", number: "20/111", rarity: "Rare Holo", type: "Psychic", imageUrl: "https://images.pokemontcg.io/n1/20.png", marketValue: 110 },
  { name: "Umbreon", setName: "Johto Legends", number: "22/111", rarity: "Rare Holo", type: "Darkness", imageUrl: "https://images.pokemontcg.io/n1/22.png", marketValue: 125 },
  { name: "Scizor", setName: "Johto Legends", number: "18/111", rarity: "Rare Holo", type: "Metal", imageUrl: "https://images.pokemontcg.io/n1/18.png", marketValue: 55 },
  { name: "Skarmory", setName: "Johto Legends", number: "21/111", rarity: "Rare Holo", type: "Metal", imageUrl: "https://images.pokemontcg.io/n1/21.png", marketValue: 40 },
  { name: "Smeargle", setName: "Johto Legends", number: "...1", rarity: "Rare", type: "Colorless", imageUrl: "https://images.pokemontcg.io/n1/12.png", marketValue: 14 },
  { name: "Murkrow", setName: "Johto Legends", number: "24/111", rarity: "Rare", type: "Darkness", imageUrl: "https://images.pokemontcg.io/n1/24.png", marketValue: 10 },
  { name: "Slowking", setName: "Johto Legends", number: "14/111", rarity: "Rare Holo", type: "Psychic", imageUrl: "https://images.pokemontcg.io/n1/14.png", marketValue: 60 },
  { name: "Heracross", setName: "Johto Legends", number: "6/111", rarity: "Rare Holo", type: "Grass", imageUrl: "https://images.pokemontcg.io/n1/6.png", marketValue: 35 },
  { name: "Croconaw", setName: "Johto Legends", number: "30/111", rarity: "Uncommon", type: "Water", imageUrl: "https://images.pokemontcg.io/n1/30.png", marketValue: 6 },
  { name: "Quilava", setName: "Johto Legends", number: "40/111", rarity: "Uncommon", type: "Fire", imageUrl: "https://images.pokemontcg.io/n1/40.png", marketValue: 5 },
  { name: "Bayleef", setName: "Johto Legends", number: "28/111", rarity: "Uncommon", type: "Grass", imageUrl: "https://images.pokemontcg.io/n1/28.png", marketValue: 5 },

  // Hoenn Masters
  { name: "Blaziken ex", setName: "Hoenn Masters", number: "89/109", rarity: "Ultra Rare", type: "Fire", imageUrl: "https://images.pokemontcg.io/ex4/89.png", marketValue: 200 },
  { name: "Gardevoir ex", setName: "Hoenn Masters", number: "96/109", rarity: "Ultra Rare", type: "Psychic", imageUrl: "https://images.pokemontcg.io/ex7/96.png", marketValue: 130 },
  { name: "Rayquaza ex", setName: "Hoenn Masters", number: "97/109", rarity: "Ultra Rare", type: "Dragon", imageUrl: "https://images.pokemontcg.io/ex7/97.png", marketValue: 260 },
  { name: "Salamence", setName: "Hoenn Masters", number: "10/97", rarity: "Rare Holo", type: "Dragon", imageUrl: "https://images.pokemontcg.io/ex16/10.png", marketValue: 70 },
  { name: "Metagross", setName: "Hoenn Masters", number: "11/97", rarity: "Rare Holo", type: "Metal", imageUrl: "https://images.pokemontcg.io/ex16/11.png", marketValue: 55 },
  { name: "Swampert", setName: "Hoenn Masters", number: "13/109", rarity: "Rare Holo", type: "Water", imageUrl: "https://images.pokemontcg.io/ex3/13.png", marketValue: 40 },
  { name: "Sceptile", setName: "Hoenn Masters", number: "11/109", rarity: "Rare Holo", type: "Grass", imageUrl: "https://images.pokemontcg.io/ex3/11.png", marketValue: 38 },
  { name: "Manectric", setName: "Hoenn Masters", number: "14/97", rarity: "Rare Holo", type: "Lightning", imageUrl: "https://images.pokemontcg.io/ex7/14.png", marketValue: 20 },
  { name: "Flygon", setName: "Hoenn Masters", number: "15/97", rarity: "Rare Holo", type: "Dragon", imageUrl: "https://images.pokemontcg.io/ex16/15.png", marketValue: 45 },
  { name: "Altaria", setName: "Hoenn Masters", number: "1/97", rarity: "Rare Holo", type: "Dragon", imageUrl: "https://images.pokemontcg.io/ex16/1.png", marketValue: 30 },
  { name: "Milotic", setName: "Hoenn Masters", number: "12/97", rarity: "Rare Holo", type: "Water", imageUrl: "https://images.pokemontcg.io/ex4/12.png", marketValue: 28 },
  { name: "Ludicolo", setName: "Hoenn Masters", number: "8/101", rarity: "Rare Holo", type: "Water", imageUrl: "https://images.pokemontcg.io/ex3/8.png", marketValue: 18 },
  { name: "Hariyama", setName: "Hoenn Masters", number: "34/109", rarity: "Uncommon", type: "Fighting", imageUrl: "https://images.pokemontcg.io/ex3/34.png", marketValue: 5 },
  { name: "Mightyena", setName: "Hoenn Masters", number: "39/109", rarity: "Uncommon", type: "Darkness", imageUrl: "https://images.pokemontcg.io/ex4/39.png", marketValue: 4 },
  { name: "Exploud", setName: "Hoenn Masters", number: "16/109", rarity: "Rare", type: "Colorless", imageUrl: "https://images.pokemontcg.io/ex1/16.png", marketValue: 6 },
  { name: "Gardevoir", setName: "Hoenn Masters", number: "7/109", rarity: "Rare Holo", type: "Psychic", imageUrl: "https://images.pokemontcg.io/ex1/7.png", marketValue: 32 },
  { name: "Aggron", setName: "Hoenn Masters", number: "1/109", rarity: "Rare Holo", type: "Metal", imageUrl: "https://images.pokemontcg.io/ex1/1.png", marketValue: 30 },
];

export function seedDatabase(db: Db) {
  applySchema(db);

  const existing = db.prepare("SELECT COUNT(*) as count FROM sets").get() as { count?: number };
  if (existing && existing.count && existing.count > 0) {
    return;
  }

  const insertSet = db.prepare(
    "INSERT INTO sets (name, release_date) VALUES (?, ?)"
  );
  const insertCard = db.prepare(
    "INSERT INTO cards (name, set_id, number, rarity, type, image_url, market_value) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  const insertInventory = db.prepare(
    "INSERT INTO inventory (card_id, quantity, condition, acquired_at) VALUES (?, ?, ?, ?)"
  );

  const setIdByName = new Map<string, number>();

  db.transaction(() => {
    for (const set of seedSets) {
      const result = insertSet.run(set.name, set.releaseDate);
      const id = Number(result.lastInsertRowid);
      setIdByName.set(set.name, id);
    }

    const insertedCardIds: number[] = [];

    for (const card of seedCards) {
      const setId = setIdByName.get(card.setName);
      if (!setId) continue;
      const result = insertCard.run(
        card.name,
        setId,
        card.number,
        card.rarity,
        card.type,
        card.imageUrl,
        card.marketValue
      );
      insertedCardIds.push(Number(result.lastInsertRowid));
    }

    const now = new Date().toISOString();
    const favoriteIds = insertedCardIds.slice(0, 12);
    favoriteIds.forEach((cardId, index) => {
      const quantity = (index % 4) + 1;
      const condition =
        index % 3 === 0 ? "Near Mint" : index % 3 === 1 ? "Lightly Played" : "Moderately Played";
      insertInventory.run(cardId, quantity, condition, now);
    });
  })();
}

