export default function SuperadminExport() {
  return (
    <div className="space-y-4 max-w-xl">
      <h1 className="font-serif text-2xl font-semibold">Export & migration</h1>
      <p className="text-sm text-muted-foreground">
        Download a full platform JSON export. The export deliberately excludes password hashes
        and session tokens.
      </p>
      <a className="inline-block rounded-md bg-primary text-primary-foreground px-4 py-2" href="/api/superadmin/export">
        Download platform export (JSON)
      </a>
    </div>
  );
}
