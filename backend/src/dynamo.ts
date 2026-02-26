/**
 * DynamoDB single-table access for PokéBinder.
 * PK/SK patterns: USER#<id>, BINDER#<id>, PAGE#<id>, SLOT#<position>
 */

import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import type { BinderRecord, PageRecord, SlotRecord, CardPayload } from "./types";

const client = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME ?? "PokebinderTable-dev";

// --- Keys ---

function userPk(userId: string): string {
  return `USER#${userId}`;
}

function binderSk(binderId: string): string {
  return `BINDER#${binderId}`;
}

function pagePk(binderId: string): string {
  return `BINDER#${binderId}`;
}

function pageSk(pageIndex: number): string {
  return `PAGE#${pageIndex}`;
}

function pagePkFromId(pageId: string): string {
  return `PAGE#${pageId}`;
}

function slotSk(position: number): string {
  return `SLOT#${position}`;
}

// --- User profile (optional, for future use) ---

export async function getProfile(userId: string): Promise<Record<string, unknown> | null> {
  const res = await client.send(
    new GetItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ PK: userPk(userId), SK: "PROFILE" }),
    })
  );
  if (!res.Item) return null;
  return unmarshall(res.Item) as Record<string, unknown>;
}

// --- Binders ---

export async function createBinder(userId: string, name: string): Promise<BinderRecord> {
  const binderId = crypto.randomUUID();
  const now = new Date().toISOString();
  const record: BinderRecord = {
    binderId,
    userId,
    name,
    createdAt: now,
  };
  const item = {
    PK: userPk(userId),
    SK: binderSk(binderId),
    ...record,
  };
  await client.send(
    new PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall(item, { removeUndefinedValues: true }),
    })
  );
  return record;
}

export async function listBinders(userId: string): Promise<BinderRecord[]> {
  const res = await client.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: marshall({
        ":pk": userPk(userId),
        ":sk": "BINDER#",
      }),
    })
  );
  const items = (res.Items ?? []).map((i) => unmarshall(i) as BinderRecord & { PK?: string; SK?: string });
  return items.map(({ PK: _p, SK: _s, ...r }) => r as BinderRecord);
}

export async function getBinder(userId: string, binderId: string): Promise<BinderRecord | null> {
  const res = await client.send(
    new GetItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ PK: userPk(userId), SK: binderSk(binderId) }),
    })
  );
  if (!res.Item) return null;
  const raw = unmarshall(res.Item) as BinderRecord & { PK?: string; SK?: string };
  const { PK: _p, SK: _s, ...r } = raw;
  return r as BinderRecord;
}

export async function deleteBinder(userId: string, binderId: string): Promise<boolean> {
  const binder = await getBinder(userId, binderId);
  if (!binder) return false;
  const pages = await listPages(binderId);
  for (const p of pages) {
    await deletePage(binderId, p.pageId);
  }
  await client.send(
    new DeleteItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ PK: userPk(userId), SK: binderSk(binderId) }),
    })
  );
  return true;
}

// --- Pages ---

export async function createPage(binderId: string, pageIndex: number): Promise<PageRecord> {
  const pageId = crypto.randomUUID();
  const now = new Date().toISOString();
  const record: PageRecord = { pageId, binderId, pageIndex, createdAt: now };
  const item = {
    PK: pagePk(binderId),
    SK: pageSk(pageIndex),
    ...record,
  };
  await client.send(
    new PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall(item, { removeUndefinedValues: true }),
    })
  );
  const pageLookup = {
    PK: pagePkFromId(pageId),
    SK: "METADATA",
    binderId,
    pageIndex,
    pageId,
    createdAt: now,
  };
  await client.send(
    new PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall(pageLookup, { removeUndefinedValues: true }),
    })
  );
  return record;
}

export async function listPages(binderId: string): Promise<PageRecord[]> {
  const res = await client.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: marshall({
        ":pk": pagePk(binderId),
        ":sk": "PAGE#",
      }),
    })
  );
  const items = (res.Items ?? []).map((i) => unmarshall(i) as PageRecord & { PK?: string; SK?: string });
  return items.map(({ PK: _p, SK: _s, ...r }) => r as PageRecord);
}

export async function getPageByBinderAndIndex(
  binderId: string,
  pageIndex: number
): Promise<PageRecord | null> {
  const res = await client.send(
    new GetItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ PK: pagePk(binderId), SK: pageSk(pageIndex) }),
    })
  );
  if (!res.Item) return null;
  const raw = unmarshall(res.Item) as PageRecord & { PK?: string; SK?: string };
  const { PK: _p, SK: _s, ...r } = raw;
  return r as PageRecord;
}

export async function getPageById(pageId: string): Promise<PageRecord | null> {
  const res = await client.send(
    new GetItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ PK: pagePkFromId(pageId), SK: "METADATA" }),
    })
  );
  if (res.Item) {
    const raw = unmarshall(res.Item) as PageRecord & { PK?: string; SK?: string };
    const { PK: _p, SK: _s, ...r } = raw;
    return r as PageRecord;
  }
  return null;
}

export async function deletePage(binderId: string, pageId: string): Promise<boolean> {
  const pages = await listPages(binderId);
  const page = pages.find((p) => p.pageId === pageId);
  if (!page) return false;
  const slots = await listSlots(pageId);
  for (const s of slots) {
    await deleteSlot(pageId, s.position);
  }
  await client.send(
    new DeleteItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ PK: pagePk(binderId), SK: pageSk(page.pageIndex) }),
    })
  );
  await client.send(
    new DeleteItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ PK: pagePkFromId(pageId), SK: "METADATA" }),
    })
  );
  return true;
}

// --- Slots (PK = PAGE#<pageId>, SK = SLOT#<position>) ---

export async function listSlots(pageId: string): Promise<SlotRecord[]> {
  const res = await client.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: marshall({
        ":pk": pagePkFromId(pageId),
        ":sk": "SLOT#",
      }),
    })
  );
  const items = (res.Items ?? []).map((i) => unmarshall(i) as SlotRecord & { PK?: string; SK?: string });
  return items.map(({ PK: _p, SK: _s, ...r }) => r as SlotRecord);
}

export async function putSlot(
  pageId: string,
  position: number,
  card: CardPayload
): Promise<SlotRecord> {
  if (position < 0 || position > 8) throw new Error("Position must be 0-8");
  const now = new Date().toISOString();
  const record: SlotRecord = { pageId, position, card, updatedAt: now };
  const item = {
    PK: pagePkFromId(pageId),
    SK: slotSk(position),
    ...record,
  };
  await client.send(
    new PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall(item, { removeUndefinedValues: true }),
    })
  );
  return record;
}

export async function getSlot(pageId: string, position: number): Promise<SlotRecord | null> {
  const res = await client.send(
    new GetItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ PK: pagePkFromId(pageId), SK: slotSk(position) }),
    })
  );
  if (!res.Item) return null;
  const raw = unmarshall(res.Item) as SlotRecord & { PK?: string; SK?: string };
  const { PK: _p, SK: _s, ...r } = raw;
  return r as SlotRecord;
}

export async function deleteSlot(pageId: string, position: number): Promise<boolean> {
  await client.send(
    new DeleteItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ PK: pagePkFromId(pageId), SK: slotSk(position) }),
    })
  );
  return true;
}