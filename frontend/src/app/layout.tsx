import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TCG Inventory Platform",
  description: "Searchable trading card inventory with binder-style views.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
