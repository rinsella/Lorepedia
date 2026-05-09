import type { Page, User, World, WorldMember, Comment, UserRole, WorldMemberRole } from "@prisma/client";

export type SessionUser = { id: string; role: UserRole } | null | undefined;

const ROLE_RANK: Record<UserRole, number> = {
  USER: 1,
  VERIFIED_USER: 2,
  MODERATOR: 3,
  ADMIN: 4,
  SUPERADMIN: 5,
};

const MEMBER_RANK: Record<WorldMemberRole, number> = {
  COMMENTER: 1,
  VIEWER: 2,
  WRITER: 3,
  EDITOR: 4,
  CO_OWNER: 5,
  OWNER: 6,
};

export function isPlatformStaff(u: SessionUser) {
  return !!u && ROLE_RANK[u.role] >= ROLE_RANK.MODERATOR;
}
export function canAccessAdmin(u: SessionUser) {
  return !!u && ROLE_RANK[u.role] >= ROLE_RANK.ADMIN;
}
export function canAccessSuperadmin(u: SessionUser) {
  return !!u && u.role === "SUPERADMIN";
}

export function isWorldOwner(u: SessionUser, world: Pick<World, "ownerId">) {
  return !!u && u.id === world.ownerId;
}

export function memberRole(
  u: SessionUser,
  members: Array<Pick<WorldMember, "userId" | "role">>,
): WorldMemberRole | null {
  if (!u) return null;
  return members.find((m) => m.userId === u.id)?.role ?? null;
}

export function canViewWorld(
  u: SessionUser,
  world: Pick<World, "ownerId" | "visibility" | "status">,
  members: Array<Pick<WorldMember, "userId" | "role">> = [],
) {
  if (world.status === "DELETED") return canAccessAdmin(u);
  if (world.visibility === "PUBLIC" || world.visibility === "UNLISTED") return true;
  if (canAccessAdmin(u)) return true;
  if (isWorldOwner(u, world)) return true;
  return memberRole(u, members) !== null;
}

export function canEditWorld(
  u: SessionUser,
  world: Pick<World, "ownerId">,
  members: Array<Pick<WorldMember, "userId" | "role">> = [],
) {
  if (canAccessAdmin(u)) return true;
  if (isWorldOwner(u, world)) return true;
  const role = memberRole(u, members);
  return !!role && MEMBER_RANK[role] >= MEMBER_RANK.CO_OWNER;
}

export function canDeleteWorld(u: SessionUser, world: Pick<World, "ownerId">) {
  return isWorldOwner(u, world) || canAccessAdmin(u);
}

export function canCreatePage(
  u: SessionUser,
  world: Pick<World, "ownerId">,
  members: Array<Pick<WorldMember, "userId" | "role">> = [],
) {
  if (canAccessAdmin(u)) return true;
  if (isWorldOwner(u, world)) return true;
  const role = memberRole(u, members);
  return !!role && MEMBER_RANK[role] >= MEMBER_RANK.WRITER;
}

export function canEditPage(
  u: SessionUser,
  world: Pick<World, "ownerId">,
  page: Pick<Page, "createdById">,
  members: Array<Pick<WorldMember, "userId" | "role">> = [],
) {
  if (canAccessAdmin(u)) return true;
  if (isWorldOwner(u, world)) return true;
  const role = memberRole(u, members);
  if (role && MEMBER_RANK[role] >= MEMBER_RANK.EDITOR) return true;
  if (role === "WRITER" && u && page.createdById === u.id) return true;
  return false;
}

export function canPublishPage(
  u: SessionUser,
  world: Pick<World, "ownerId">,
  members: Array<Pick<WorldMember, "userId" | "role">> = [],
) {
  if (canAccessAdmin(u)) return true;
  if (isWorldOwner(u, world)) return true;
  const role = memberRole(u, members);
  return !!role && MEMBER_RANK[role] >= MEMBER_RANK.EDITOR;
}

export function canViewPage(
  u: SessionUser,
  world: Pick<World, "ownerId" | "visibility" | "status">,
  page: Pick<Page, "status" | "visibility" | "createdById" | "deletedAt">,
  members: Array<Pick<WorldMember, "userId" | "role">> = [],
) {
  if (page.deletedAt) return canAccessAdmin(u) || isWorldOwner(u, world);
  if (!canViewWorld(u, world, members)) return false;
  if (page.status === "PUBLISHED") {
    if (page.visibility === "PUBLIC" || page.visibility === "UNLISTED") return true;
    // PRIVATE published -> members only
    return isWorldOwner(u, world) || canAccessAdmin(u) || memberRole(u, members) !== null;
  }
  // Drafts/review/archived -> members only
  return isWorldOwner(u, world) || canAccessAdmin(u) || memberRole(u, members) !== null;
}

export function canModerateComment(u: SessionUser, _comment: Pick<Comment, "id">) {
  return isPlatformStaff(u);
}

export function canDemoteUser(actor: SessionUser, target: Pick<User, "role">) {
  if (!canAccessSuperadmin(actor)) return false;
  return target.role !== "SUPERADMIN" || (actor && actor.role === "SUPERADMIN");
}
