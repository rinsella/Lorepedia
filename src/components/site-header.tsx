import Link from "next/link";
import { auth } from "@/lib/auth";
import { LogOut, User as UserIcon, Compass, LayoutDashboard, Shield, Search } from "lucide-react";
import { signOut } from "@/lib/auth";
import { Logo } from "@/components/brand/logo";

export async function SiteHeader() {
  const session = await auth();
  const role = session?.user?.role;
  const isStaff = role === "ADMIN" || role === "SUPERADMIN" || role === "MODERATOR";
  return (
    <header className="border-b border-border/70 bg-background/85 backdrop-blur-md sticky top-0 z-30">
      <div className="container flex h-14 sm:h-16 items-center justify-between gap-2">
        <Logo />
        <nav className="flex items-center gap-0.5 sm:gap-1 text-sm">
          <Link
            href="/explore"
            title="Explore"
            className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-md hover:bg-accent transition"
          >
            <Compass className="h-4 w-4" />
            <span className="hidden sm:inline">Explore</span>
          </Link>
          <Link
            href="/search"
            title="Search"
            className="inline-flex items-center gap-1.5 px-2 py-2 rounded-md hover:bg-accent transition sm:hidden"
          >
            <Search className="h-4 w-4" />
          </Link>
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                title="Dashboard"
                className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-md hover:bg-accent transition"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              {isStaff && (
                <Link
                  href="/admin"
                  title="Admin"
                  className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-md hover:bg-accent transition"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              <Link
                href="/dashboard/account"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-accent transition"
                title={session.user.email ?? ""}
              >
                <UserIcon className="h-4 w-4" />
                <span className="max-w-[8rem] lg:max-w-[10rem] truncate">{session.user.name ?? session.user.email}</span>
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-md hover:bg-accent transition"
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
              <Link href="/login" className="px-2.5 sm:px-3 py-2 rounded-md hover:bg-accent text-sm">Sign in</Link>
              <Link
                href="/register"
                className="ml-1 rounded-md bg-primary text-primary-foreground px-3 sm:px-3.5 py-1.5 sm:py-2 text-sm font-medium hover:opacity-90 shadow-sm whitespace-nowrap"
              >
                <span className="hidden sm:inline">Start free</span>
                <span className="sm:hidden">Sign up</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
