"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { Button } from "@/components/ui/button";
import { bindersApi, type Binder } from "@/lib/api";
import { signOut } from "@/lib/cognito";

export function BinderSidebar() {
  const router = useRouter();
  const segment = useSelectedLayoutSegment();
  const [binders, setBinders] = useState<Binder[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    bindersApi
      .list()
      .then((r) => setBinders(r.binders))
      .catch(() => setBinders([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "clear" }),
    });
    signOut();
    router.push("/login");
    router.refresh();
  }

  async function createBinder() {
    setCreating(true);
    try {
      const binder = await bindersApi.create("New Binder");
      setBinders((prev) => [...prev, binder]);
      router.push(`/binder/${binder.binderId}`);
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  }

  return (
    <aside className="w-64 border-r bg-card flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <Link href="/binder" className="font-semibold text-primary">
          PokéBinder
        </Link>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      <div className="p-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={createBinder}
          disabled={creating}
        >
          + New Binder
        </Button>
      </div>
      {loading ? (
        <p className="p-4 text-muted-foreground text-sm">Loading…</p>
      ) : (
        <ul className="flex-1 overflow-auto p-2 space-y-1">
          {binders.map((b) => (
            <li key={b.binderId}>
              <Link
                href={`/binder/${b.binderId}`}
                className={`block px-3 py-2 rounded-md text-sm truncate ${
                  segment === b.binderId
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {b.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
