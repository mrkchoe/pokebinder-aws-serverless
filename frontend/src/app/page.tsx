import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold text-primary">PokéBinder</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Your digital Pokémon TCG binder. Sign in to manage binders and cards.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/login">Sign in</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/signup">Sign up</Link>
        </Button>
      </div>
    </main>
  );
}
