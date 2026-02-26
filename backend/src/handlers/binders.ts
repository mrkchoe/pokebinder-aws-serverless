import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { requireAuth } from "../auth";
import * as db from "../dynamo";
import {
  createBinderSchema,
  createPageSchema,
  putSlotSchema,
} from "../schemas";

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
};

function json(statusCode: number, body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

function error(statusCode: number, message: string): APIGatewayProxyResultV2 {
  return json(statusCode, { error: message });
}

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const method = event.requestContext.http.method;
  const path = event.rawPath ?? event.requestContext.http.path;

  try {
    const auth = requireAuth(event);
    const userId = auth.userId;

    if (method === "POST" && path === "/binders") {
      const parsed = createBinderSchema.safeParse(
        event.body ? JSON.parse(event.body) : {}
      );
      if (!parsed.success) {
        return error(400, parsed.error.message);
      }
      const binder = await db.createBinder(userId, parsed.data.name);
      return json(201, binder);
    }

    if (method === "GET" && path === "/binders") {
      const binders = await db.listBinders(userId);
      return json(200, { binders });
    }

    if (method === "GET" && path.match(/^\/binders\/[^/]+\/pages$/)) {
      const binderId = event.pathParameters?.id;
      if (!binderId) return error(400, "Missing binder id");
      const binder = await db.getBinder(userId, binderId);
      if (!binder) return error(404, "Binder not found");
      const pages = await db.listPages(binderId);
      return json(200, { pages });
    }

    if (method === "GET" && path.match(/^\/binders\/[^/]+$/) && !path.includes("/pages")) {
      const id = event.pathParameters?.id;
      if (!id) return error(400, "Missing binder id");
      const binder = await db.getBinder(userId, id);
      if (!binder) return error(404, "Binder not found");
      return json(200, binder);
    }

    if (method === "GET" && path === "/slots") {
      const pageId = event.queryStringParameters?.pageId;
      if (!pageId) return error(400, "Missing pageId");
      const page = await db.getPageById(pageId);
      if (!page) return error(404, "Page not found");
      const binder = await db.getBinder(userId, page.binderId);
      if (!binder) return error(404, "Page not found");
      const slots = await db.listSlots(pageId);
      return json(200, { slots });
    }

    if (method === "DELETE" && path.startsWith("/binders/")) {
      const id = event.pathParameters?.id;
      if (!id) return error(400, "Missing binder id");
      const ok = await db.deleteBinder(userId, id);
      if (!ok) return error(404, "Binder not found");
      return json(200, { deleted: true });
    }

    if (method === "POST" && path === "/pages") {
      const parsed = createPageSchema.safeParse(
        event.body ? JSON.parse(event.body) : {}
      );
      if (!parsed.success) {
        return error(400, parsed.error.message);
      }
      const { binderId, pageIndex } = parsed.data;
      const binder = await db.getBinder(userId, binderId);
      if (!binder) return error(404, "Binder not found");
      const page = await db.createPage(binderId, pageIndex);
      return json(201, page);
    }

    if (method === "DELETE" && path.startsWith("/pages/")) {
      const pageId = event.pathParameters?.id;
      if (!pageId) return error(400, "Missing page id");
      const page = await db.getPageById(pageId);
      if (!page) return error(404, "Page not found");
      const binder = await db.getBinder(userId, page.binderId);
      if (!binder) return error(404, "Page not found");
      await db.deletePage(page.binderId, pageId);
      return json(200, { deleted: true });
    }

    if (method === "PUT" && path === "/slots") {
      const parsed = putSlotSchema.safeParse(
        event.body ? JSON.parse(event.body) : {}
      );
      if (!parsed.success) {
        return error(400, parsed.error.message);
      }
      const { pageId, position, card } = parsed.data;
      const page = await db.getPageById(pageId);
      if (!page) return error(404, "Page not found");
      const binder = await db.getBinder(userId, page.binderId);
      if (!binder) return error(404, "Page not found");
      const slot = await db.putSlot(pageId, position, card);
      return json(200, slot);
    }

    if (method === "POST" && path === "/slots/undo") {
      const body = event.body ? JSON.parse(event.body) : {};
      const { pageId, position, previousCard } = body;
      if (typeof pageId !== "string" || typeof position !== "number") {
        return error(400, "pageId and position required for undo");
      }
      const page = await db.getPageById(pageId);
      if (!page) return error(404, "Page not found");
      const binder = await db.getBinder(userId, page.binderId);
      if (!binder) return error(404, "Page not found");
      if (previousCard === null || previousCard === undefined) {
        await db.deleteSlot(pageId, position);
        return json(200, { reverted: true, slot: null });
      }
      const parsed = putSlotSchema.shape.card.safeParse(previousCard);
      if (!parsed.success) return error(400, "Invalid previousCard for undo");
      await db.putSlot(pageId, position, parsed.data);
      return json(200, { reverted: true });
    }

    return error(404, "Not found");
  } catch (err) {
    const e = err as Error & { statusCode?: number };
    if (e.statusCode === 401) {
      return error(401, "Unauthorized");
    }
    return error(500, e.message ?? "Internal server error");
  }
}
