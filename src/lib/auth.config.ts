import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config (no Prisma, no bcrypt).
 * The full config in `src/lib/auth.ts` extends this with the database adapter
 * and credentials authorize().
 */
export const authConfig = {
  pages: { signIn: "/login" },
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isAuthed = !!auth?.user;
      const path = nextUrl.pathname;
      const role = (auth?.user as any)?.role as string | undefined;

      const protectedPath = /^\/(dashboard|admin|superadmin)(\/.*)?$/.test(path);
      if (protectedPath && !isAuthed) return false;
      if (path.startsWith("/admin") && !["ADMIN", "SUPERADMIN", "MODERATOR"].includes(role ?? "")) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      if (path.startsWith("/superadmin") && role !== "SUPERADMIN") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).username = token.username;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
