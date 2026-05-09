import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";

async function updateProfile(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/login");
  const name = String(formData.get("name") ?? "").slice(0, 80);
  const bio = String(formData.get("bio") ?? "").slice(0, 500);
  const website = String(formData.get("website") ?? "").slice(0, 200);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: name || null, bio: bio || null, website: website || null },
  });
  await audit({ actorId: session.user.id, action: "user.update_profile" });
  revalidatePath("/dashboard/account");
}

async function deleteAccount() {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/login");
  await prisma.user.update({
    where: { id: session.user.id },
    data: { status: "DELETED", email: `deleted+${session.user.id}@lorepedia.invalid`, passwordHash: null },
  });
  await audit({ actorId: session.user.id, action: "user.delete_self" });
  redirect("/");
}

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  return (
    <div className="space-y-8 max-w-xl">
      <h1 className="font-serif text-2xl font-semibold">Account</h1>
      <form action={updateProfile} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input value={user.email} readOnly className="mt-1 w-full rounded-md border bg-muted px-3 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium">Display name</label>
          <input name="name" defaultValue={user.name ?? ""} maxLength={80} className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium">Bio</label>
          <textarea name="bio" defaultValue={user.bio ?? ""} maxLength={500} rows={3} className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium">Website</label>
          <input name="website" defaultValue={user.website ?? ""} maxLength={200} className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
        </div>
        <button className="rounded-md bg-primary text-primary-foreground px-4 py-2">Save</button>
      </form>

      <section>
        <h2 className="font-serif text-lg">Export your data</h2>
        <p className="text-sm text-muted-foreground mb-2">Download all your worlds and pages as JSON.</p>
        <a className="text-sm text-primary hover:underline" href="/api/account/export">Download export</a>
      </section>

      <section className="border border-destructive/40 rounded-lg p-4 bg-destructive/5">
        <h2 className="font-serif text-lg text-destructive">Danger zone</h2>
        <p className="text-sm text-muted-foreground mb-3">Deleting your account marks it as deleted and removes your password. World data is preserved unless you delete each world first.</p>
        <form action={deleteAccount}>
          <button className="rounded-md border border-destructive text-destructive px-3 py-1.5 hover:bg-destructive hover:text-destructive-foreground">
            Delete my account
          </button>
        </form>
      </section>
    </div>
  );
}
