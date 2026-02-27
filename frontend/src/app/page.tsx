import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">
        <section className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            TCG Inventory Platform
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A clean, binder-style view of your trading card collection with
            instant search, filters, and a card detail page that shows what you
            actually own.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/cards">Open binder</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="https://mybinder.org" target="_blank">
                Open in Binder (placeholder)
              </Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Binder-style browsing</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                See your collection in a grid of cards with artwork, set, and
                rarity at a glance.
              </p>
              <p>
                Click any card to open a detail view with ownership information.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Search, filter, sort</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Search by name, filter by set, rarity, and type.</p>
              <p>
                Sort by market value, release date, or name to focus on what
                matters.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Inventory-aware</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                The binder view pulls from a normalized inventory schema so you
                can see owned quantity and condition per card.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Screenshots (coming soon)</h2>
          <p className="text-sm text-muted-foreground">
            This section is a placeholder for static screenshots or GIFs of the
            binder, filters, and card detail page.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-32 rounded-lg border border-dashed border-muted" />
            <div className="h-32 rounded-lg border border-dashed border-muted" />
            <div className="h-32 rounded-lg border border-dashed border-muted" />
          </div>
        </section>

        <section className="border-t pt-8 text-sm text-muted-foreground">
          <p>
            Already using the original PokéBinder AWS stack? Those backend
            handlers and infrastructure templates are still in this repository
            for reference.
          </p>
        </section>
      </div>
    </main>
  );
}
