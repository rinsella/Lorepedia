import { z } from "zod";

export const emailSchema = z.string().email().toLowerCase();

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(200);

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1).max(80).optional(),
  username: z
    .string()
    .min(3)
    .max(40)
    .regex(/^[a-z0-9_-]+$/i, "Letters, numbers, _ and - only")
    .optional(),
  // honeypot — must be empty
  website: z.string().max(0).optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
  website: z.string().max(0).optional().or(z.literal("")),
});

export const worldCreateSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
  description: z.string().max(2000).optional(),
  visibility: z.enum(["PRIVATE", "UNLISTED", "PUBLIC"]).default("PRIVATE"),
});

export const worldUpdateSchema = worldCreateSchema.partial().extend({
  id: z.string(),
});

export const pageCreateSchema = z.object({
  worldId: z.string(),
  title: z.string().min(1).max(200),
  type: z
    .enum([
      "ARTICLE","CHARACTER","LOCATION","FACTION","ITEM","EVENT","TIMELINE","MAP","NOTE","BLOG_POST","TEMPLATE",
    ])
    .default("ARTICLE"),
  summary: z.string().max(500).optional(),
  contentMarkdown: z.string().max(200_000).optional().default(""),
  visibility: z.enum(["PRIVATE", "UNLISTED", "PUBLIC"]).default("PRIVATE"),
});

export const pageUpdateSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200).optional(),
  summary: z.string().max(500).optional(),
  contentMarkdown: z.string().max(200_000).optional(),
  status: z.enum(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"]).optional(),
  visibility: z.enum(["PRIVATE", "UNLISTED", "PUBLIC"]).optional(),
});
