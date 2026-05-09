import { prisma } from "@/lib/db";

export default async function AdminCommentsPage() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { author: { select: { email: true } }, page: { select: { title: true, slug: true } } },
  });
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Comments</h1>
      {comments.length === 0 ? (
        <p className="text-muted-foreground">No comments yet.</p>
      ) : (
        <ul className="divide-y rounded-lg border bg-card">
          {comments.map((c) => (
            <li key={c.id} className="p-3 text-sm">
              <p className="font-medium">{c.author.email} on {c.page.title}</p>
              <p>{c.body}</p>
              <p className="text-xs text-muted-foreground">{c.status} · {c.createdAt.toISOString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
