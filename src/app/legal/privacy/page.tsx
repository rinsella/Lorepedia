import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Lorepedia",
  description: "How Lorepedia handles your data.",
};

export default function PrivacyPage() {
  return (
    <main className="container py-12 max-w-3xl prose-wiki">
      <h1 className="font-serif text-4xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-6">Last updated: {new Date().toISOString().slice(0, 10)}</p>

      <h2>What we collect</h2>
      <p>To provide the service, Lorepedia stores your account email, hashed password, profile
        information you choose to provide, and the worlds and pages you create.</p>

      <h2>How we use it</h2>
      <p>Your data is used solely to operate Lorepedia: authentication, displaying your content,
        and platform safety.</p>

      <h2>Visibility</h2>
      <p>Private worlds and unpublished pages are never shown in public search, the explore page,
        or sitemaps.</p>

      <h2>Your rights</h2>
      <p>You can export all of your account data as JSON at any time from your account settings,
        and you can delete your account permanently.</p>

      <h2>Cookies</h2>
      <p>Lorepedia uses a single httpOnly session cookie to keep you signed in. No third-party
        tracking is included by default.</p>

      <h2>Contact</h2>
      <p>For privacy questions, contact the operator of this Lorepedia instance.</p>
    </main>
  );
}
