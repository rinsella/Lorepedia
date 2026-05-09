import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Lorepedia",
  description: "Lorepedia is a living wiki for fictional universes.",
};

export default function AboutPage() {
  return (
    <main className="container py-12 max-w-3xl">
      <h1 className="font-serif text-4xl font-bold mb-4">About Lorepedia</h1>
      <p className="text-muted-foreground mb-6">
        Lorepedia is an online workspace where novelists, game masters, and creators build their
        fictional universes as a living wiki — characters, locations, factions, timelines, maps,
        and interconnected lore.
      </p>
      <h2 className="font-serif text-2xl font-semibold mt-8 mb-2">Why Lorepedia</h2>
      <p className="text-muted-foreground mb-6">
        Spreadsheets and scattered docs make worldbuilding painful. Lorepedia gives every person,
        place, faction, and event a real page, with <code>[[wikilinks]]</code>, backlinks, and
        encyclopedia-style infoboxes.
      </p>
      <h2 className="font-serif text-2xl font-semibold mt-8 mb-2">Open & portable</h2>
      <p className="text-muted-foreground">
        Your worlds should never be trapped. Export to Markdown and JSON anytime. You own your
        lore.
      </p>
    </main>
  );
}
