import Link from "next/link";
import { auth } from "@/lib/auth";
import { LogOut, User as UserIcon, Compass, LayoutDashboard, Shield } from "lucide-react";
import { signOut } from "@/lib/auth";
import { Logo } from "@/components/brand/logo";

export async function SiteHeader() {
  const session = await auth();
  const role = session?.user?.role;
  const isStaff = role === "ADMIN" || role === "SUPERADMIN" || role === "MODERATOR";
  return (
    <header className="border-b border-border/70 bg-background/85 backdrop-blur-md sticky top-0 z-30">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/explore"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-accent transition"
          >
            <Compass className="h-4 w-4" /> Explore
          </Link>
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-accent transition"
              >
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              {isStaff && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-accent transition"
                >
                  <Shield className="h-4 w-4" /> Admin
                </Link>
              )}
              <Link
                href="/dashboard/account"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-accent transition"
                title={session.user.email ?? ""}
              >
                <UserIcon className="h-4 w-4" />
                <span className="max-w-[10rem] truncate">{session.user.name ?? session.user.email}</span>
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-accent transition"
                  type="submit"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only md:not-sr-only">Sign out</span>
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="px-3 py-2 rounded-md hover:bg-accent">Sign in</Link>
              <Link
                href="/register"
                className="ml-1 rounded-md bg-primary text-primary-foreground px-3.5 py-2 font-medium hover:opacity-90 shadow-sm"
              >
                Start free
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
