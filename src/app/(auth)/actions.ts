"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { isRedirectError } from "next/dist/client/components/redirect";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validations";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { signIn } from "@/lib/auth";
import { audit } from "@/lib/audit";

export async function registerAction(_: unknown, formData: FormData) {
  const ip = clientIp(headers());
  const limit = await rateLimit({ key: `register:${ip}`, limit: 5, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) return { error: "Too many registrations from this IP. Try again later." };

  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name") || undefined,
    username: formData.get("username") || undefined,
    website: formData.get("website") || "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const settings = await prisma.siteSetting.findUnique({ where: { key: "general.registrationEnabled" } });
  if (settings && settings.value === false) {
    return { error: "Registration is currently disabled." };
  }

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return { error: "An account with that email already exists." };

  if (parsed.data.username) {
    const taken = await prisma.user.findUnique({ where: { username: parsed.data.username } });
    if (taken) return { error: "Username is taken." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      username: parsed.data.username,
      passwordHash,
    },
  });
  await audit({ actorId: user.id, action: "user.register", target: user.id });

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (e) {
    if (isRedirectError(e)) throw e;
    return { error: "Account created but auto sign-in failed. Please sign in manually." };
  }
  return { error: "" };
}

export async function loginAction(_: unknown, formData: FormData) {
  const ip = clientIp(headers());
  const limit = await rateLimit({ key: `login:${ip}`, limit: 10, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) return { error: "Too many attempts. Try again later." };

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const honeypot = String(formData.get("website") ?? "");
  if (honeypot) return { error: "Invalid submission." };

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (e) {
    if (isRedirectError(e)) throw e;
    return { error: "Invalid email or password." };
  }
  return { error: "" };
}
