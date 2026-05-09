import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canAccessAdmin } from "@/lib/permissions";
import { audit } from "@/lib/audit";

const EDITABLE = [
  { key: "general.siteName", label: "Site name", type: "text" },
  { key: "general.tagline", label: "Tagline", type: "text" },
  { key: "general.registrationEnabled", label: "Registration enabled", type: "boolean" },
  { key: "general.maintenanceMode", label: "Maintenance mode", type: "boolean" },
  { key: "limits.maxWorldsPerUser", label: "Max worlds per user", type: "number" },
  { key: "limits.maxUploadSizeMb", label: "Max upload size (MB)", type: "number" },
  { key: "moderation.commentsEnabled", label: "Comments enabled", type: "boolean" },
  { key: "security.captchaProvider", label: "Captcha provider", type: "text" },
  { key: "security.rateLimitEnabled", label: "Rate limit enabled", type: "boolean" },
  { key: "seo.defaultTitle", label: "Default SEO title", type: "text" },
  { key: "seo.defaultDescription", label: "Default SEO description", type: "text" },
  { key: "features.publicExplore", label: "Public explore enabled", type: "boolean" },
] as const;

async function saveSettings(formData: FormData) {
  "use server";
  const session = await auth();
  if (!canAccessAdmin(session?.user)) redirect("/dashboard");
  for (const s of EDITABLE) {
    const raw = formData.get(s.key);
    let value: any = raw;
    if (s.type === "boolean") value = raw === "on";
    else if (s.type === "number") value = Number(raw);
    else value = String(raw ?? "");
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value },
      create: { key: s.key, value },
    });
  }
  await audit({ actorId: session!.user.id, action: "settings.update" });
  revalidatePath("/admin/settings");
}

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSetting.findMany();
  const map = new Map(settings.map((s) => [s.key, s.value as any]));
  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="font-serif text-2xl font-semibold">Settings</h1>
      <form action={saveSettings} className="space-y-3">
        {EDITABLE.map((s) => {
          const v = map.get(s.key);
          if (s.type === "boolean") {
            return (
              <label key={s.key} className="flex items-center gap-2">
                <input type="checkbox" name={s.key} defaultChecked={!!v} />
                <span>{s.label}</span>
              </label>
            );
          }
          return (
            <div key={s.key}>
              <label className="text-sm font-medium">{s.label}</label>
              <input
                name={s.key}
                type={s.type}
                defaultValue={v ?? ""}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2"
              />
            </div>
          );
        })}
        <button className="rounded-md bg-primary text-primary-foreground px-4 py-2">Save</button>
      </form>
    </div>
  );
}
