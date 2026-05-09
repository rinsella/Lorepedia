import Link from "next/link";
import { BookOpen, Compass, Layers, Link2, Map, Shield, Sparkles, Tag } from "lucide-react";

const features = [
  { icon: Link2, title: "Wiki Links", body: "Connect every person, place, faction, and event with [[wikilinks]]." },
  { icon: BookOpen, title: "Infoboxes", body: "Turn messy notes into clean encyclopedia-style lore pages." },
  { icon: Compass, title: "Backlinks", body: "See every page that references the current article." },
  { icon: Layers, title: "Timelines", body: "Track ancient wars, dynasties, campaigns, and story arcs.", soon: true },
  { icon: Map, title: "Maps", body: "Upload maps and pin locations directly to wiki pages.", soon: true },
  { icon: Sparkles, title: "Templates", body: "Start faster with character, location, item, faction, and event templates." },
  { icon: Shield, title: "Private or Public", body: "Draft privately, publish when ready, or keep your entire world secret." },
  { icon: Tag, title: "Export Friendly", body: "Your worlds should never be trapped. Export to Markdown and JSON." },
];

export default function HomePage() {
  return (
    <div>
      <section className="container pt-16 pb-20 text-center">
        <h1 className="font-serif text-4xl md:text-6xl font-semibold tracking-tight">
          Build your fictional universe<br /> as a living wiki.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Lorepedia gives writers, game masters, and creators a beautiful online workspace
          for characters, locations, factions, timelines, maps, and interconnected lore.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/register"
            className="px-5 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90"
          >
            Start Building Free
          </Link>
          <Link
            href="/w/eldoria-archive"
            className="px-5 py-3 rounded-md border font-medium hover:bg-accent"
          >
            Explore Demo World
          </Link>
        </div>
      </section>

      <section className="container py-12">
        <h2 className="font-serif text-3xl text-center mb-10">
          A world bible that feels like a real encyclopedia.
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-lg border bg-card p-5">
              <f.icon className="h-5 w-5 text-primary mb-3" />
              <div className="font-medium flex items-center gap-2">
                {f.title}
                {f.soon && <span className="text-[10px] uppercase tracking-wide rounded bg-muted px-1.5 py-0.5 text-muted-foreground">Coming soon</span>}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-12 text-center">
        <h2 className="font-serif text-2xl md:text-3xl">
          Stop fighting spreadsheets, scattered docs, and generic notes apps.
        </h2>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
          For novelists, GMs, game creators, comic writers, and anyone building a universe.
        </p>
      </section>
    </div>
  );
}
