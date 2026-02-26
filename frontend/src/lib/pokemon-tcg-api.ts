/**
 * Pokémon TCG API v2 - called directly from frontend.
 * Optional API key via NEXT_PUBLIC_POKEMON_TCG_API_KEY.
 */

export interface PokemonTcgCard {
  id: string;
  name: string;
  images: { small: string; large: string };
  set: { name: string };
  number: string;
  rarity?: string;
  supertype?: string;
}

export interface PokemonTcgResponse {
  data: PokemonTcgCard[];
  page?: number;
  pageSize?: number;
  count?: number;
  totalCount?: number;
}

const BASE = "https://api.pokemontcg.io/v2";
const API_KEY = process.env.NEXT_PUBLIC_POKEMON_TCG_API_KEY;

export async function searchCards(params: {
  q?: string;
  page?: number;
  pageSize?: number;
  orderBy?: string;
}): Promise<PokemonTcgCard[]> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.page != null) search.set("page", String(params.page));
  if (params.pageSize != null) search.set("pageSize", String(params.pageSize));
  if (params.orderBy) search.set("orderBy", params.orderBy);
  const url = `${BASE}/cards?${search.toString()}`;
  const headers: HeadersInit = {};
  if (API_KEY) headers["X-Api-Key"] = API_KEY;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Failed to search cards");
  const data: PokemonTcgResponse = await res.json();
  return data.data ?? [];
}

export function toCardPayload(c: PokemonTcgCard): {
  id: string;
  name: string;
  imageSmall: string;
  imageLarge: string;
  setName: string;
  number: string;
  rarity?: string;
} {
  return {
    id: c.id,
    name: c.name,
    imageSmall: c.images.small,
    imageLarge: c.images.large,
    setName: c.set.name,
    number: c.number,
    rarity: c.rarity,
  };
}
