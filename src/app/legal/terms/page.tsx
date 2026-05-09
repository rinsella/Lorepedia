import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Lorepedia",
  description: "Terms for using Lorepedia.",
};

export default function TermsPage() {
  return (
    <main className="container py-12 max-w-3xl prose-wiki">
      <h1 className="font-serif text-4xl font-bold mb-4">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-6">Last updated: {new Date().toISOString().slice(0, 10)}</p>

      <h2>Acceptable use</h2>
      <p>You agree not to upload illegal content, infringe other people&apos;s copyrights, harass
        other users, or attempt to compromise the platform.</p>

      <h2>Your content</h2>
      <p>You retain ownership of all worlds, pages, and media you create. By making content
        public, you grant other Lorepedia visitors the right to view it. We do not claim
        ownership of your work.</p>

      <h2>Account suspension</h2>
      <p>We may suspend accounts that violate these terms. Suspended users can request data
        export.</p>

      <h2>No warranty</h2>
      <p>Lorepedia is provided &quot;as is&quot;. Always keep your own backups of important worlds
        — exports are available from the dashboard.</p>

      <h2>Changes</h2>
      <p>These terms may be updated. Continued use after changes means you accept the new terms.</p>
    </main>
  );
}
