import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Lorepedia — Build your fictional universe as a living wiki",
    template: "%s · Lorepedia",
  },
  description:
    "Lorepedia is a self-hostable worldbuilding wiki for writers, GMs, and creators. Organize lore, link characters, places, and events with [[wikilinks]], and publish a living encyclopedia of your universe.",
  applicationName: "Lorepedia",
  keywords: [
    "worldbuilding", "fictional universe", "wiki", "lore", "TTRPG", "GM tools",
    "fantasy wiki", "writing tools", "campaign manager", "self-hosted wiki",
  ],
  authors: [{ name: "Lorepedia" }],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/favicon.svg"],
    apple: [{ url: "/icon.svg" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "Lorepedia",
    title: "Lorepedia — Build your fictional universe as a living wiki",
    description:
      "Self-hostable worldbuilding wiki for writers, GMs, and creators. Link your lore with [[wikilinks]] and publish a living encyclopedia.",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Lorepedia" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lorepedia — Build your fictional universe as a living wiki",
    description: "Self-hostable worldbuilding wiki for writers, GMs, and creators.",
    images: ["/og-image.svg"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f1e3" },
    { media: "(prefers-color-scheme: dark)", color: "#16111f" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 animate-fade-in">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
