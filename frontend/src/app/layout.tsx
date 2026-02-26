import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PokéBinder (AWS Edition)",
  description: "Multi-user digital Pokémon TCG binder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
