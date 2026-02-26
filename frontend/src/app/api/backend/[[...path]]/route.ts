import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return proxy(request, params, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return proxy(request, params, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return proxy(request, params, "PUT");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return proxy(request, params, "DELETE");
}

async function proxy(
  request: NextRequest,
  params: Promise<{ path?: string[] }>,
  method: string
) {
  if (!API_BASE) {
    return NextResponse.json({ error: "API URL not configured" }, { status: 502 });
  }
  const { path } = await params;
  const pathSegments = path ?? [];
  const pathStr = "/" + pathSegments.join("/");
  const url = new URL(pathStr + request.nextUrl.search, API_BASE);
  const cookieStore = await cookies();
  const token = cookieStore.get("idToken")?.value;
  const headers = new Headers(request.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.delete("host");
  let body: string | undefined;
  try {
    body = await request.text();
  } catch {
    // no body
  }
  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body || undefined,
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
