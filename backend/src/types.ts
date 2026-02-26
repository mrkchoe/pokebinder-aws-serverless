/**
 * Domain and API types for PokéBinder backend.
 */

export interface CardPayload {
  id: string;
  name: string;
  imageSmall: string;
  imageLarge: string;
  setName: string;
  number: string;
  rarity?: string;
}

export interface SlotItem {
  pageId: string;
  position: number;
  card: CardPayload;
}

export interface BinderRecord {
  binderId: string;
  userId: string;
  name: string;
  createdAt: string;
}

export interface PageRecord {
  pageId: string;
  binderId: string;
  pageIndex: number;
  createdAt: string;
}

export interface SlotRecord {
  pageId: string;
  position: number;
  card: CardPayload;
  updatedAt: string;
}

export interface CognitoJwtPayload {
  sub: string;
  "cognito:username"?: string;
  email?: string;
  token_use: string;
  auth_time: number;
  iss: string;
  exp: number;
  iat: number;
  client_id: string;
  origin_jti?: string;
  event_id?: string;
  jti?: string;
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; statusCode: number };
