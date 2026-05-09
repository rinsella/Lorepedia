import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: {
    default: "Lorepedia — Build your fictional universe as a living wiki",
    template: "%s · Lorepedia",
  },
  description:
    "Lorepedia gives writers, game masters, and creators a beautiful online workspace for characters, locations, factions, timelines, maps, and interconnected lore.",
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Lorepedia",
    description: "Build your fictional universe as a living wiki.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lorepedia",
    description: "Build your fictional universe as a living wiki.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
