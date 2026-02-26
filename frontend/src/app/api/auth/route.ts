import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, idToken, accessToken, refreshToken } = body;
    if (action === "set" && idToken) {
      const cookieStore = await cookies();
      cookieStore.set("idToken", idToken, { ...COOKIE_OPTIONS, maxAge: 60 * 60 });
      if (refreshToken) {
        cookieStore.set("refreshToken", refreshToken, COOKIE_OPTIONS);
      }
      return NextResponse.json({ ok: true });
    }
    if (action === "clear") {
      const cookieStore = await cookies();
      cookieStore.delete("idToken");
      cookieStore.delete("refreshToken");
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
