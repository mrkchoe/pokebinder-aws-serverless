"use client";

import { apiConfig } from "./auth-config";

export async function api<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string> } = {}
): Promise<T> {
  const { params, ...rest } = options;
  const isBrowser = typeof window !== "undefined";
  const base = isBrowser ? "" : apiConfig.baseUrl;
  const pathWithBase = isBrowser ? `/api/backend${path}` : `${apiConfig.baseUrl}${path}`;
  const url = new URL(pathWithBase, isBrowser ? window.location.origin : undefined);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const res = await fetch(url.toString(), {
    ...rest,
    headers,
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? res.statusText);
  }
  return data as T;
}

// Types matching backend
export interface Binder {
  binderId: string;
  userId: string;
  name: string;
  createdAt: string;
}

export interface Page {
  pageId: string;
  binderId: string;
  pageIndex: number;
  createdAt: string;
}

export interface CardPayload {
  id: string;
  name: string;
  imageSmall: string;
  imageLarge: string;
  setName: string;
  number: string;
  rarity?: string;
}

export interface Slot {
  pageId: string;
  position: number;
  card: CardPayload;
  updatedAt: string;
}

export const bindersApi = {
  list: () => api<{ binders: Binder[] }>("/binders"),
  get: (id: string) => api<Binder>(`/binders/${id}`),
  create: (name: string) =>
    api<Binder>("/binders", { method: "POST", body: JSON.stringify({ name }) }),
  delete: (id: string) =>
    api<{ deleted: boolean }>(`/binders/${id}`, { method: "DELETE" }),
  listPages: (binderId: string) =>
    api<{ pages: Page[] }>(`/binders/${binderId}/pages`),
};

export const pagesApi = {
  create: (binderId: string, pageIndex: number) =>
    api<Page>("/pages", {
      method: "POST",
      body: JSON.stringify({ binderId, pageIndex }),
    }),
  delete: (id: string) =>
    api<{ deleted: boolean }>(`/pages/${id}`, { method: "DELETE" }),
};

export const slotsApi = {
  list: (pageId: string) =>
    api<{ slots: Slot[] }>(`/slots?pageId=${encodeURIComponent(pageId)}`),
  put: (pageId: string, position: number, card: CardPayload) =>
    api<Slot>("/slots", {
      method: "PUT",
      body: JSON.stringify({ pageId, position, card }),
    }),
  undo: (pageId: string, position: number, previousCard: CardPayload | null) =>
    api<{ reverted: boolean }>("/slots/undo", {
      method: "POST",
      body: JSON.stringify({ pageId, position, previousCard }),
    }),
};
