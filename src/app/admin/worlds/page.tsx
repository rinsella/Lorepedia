import { prisma } from "@/lib/db";

export default async function AdminWorldsPage() {
  const worlds = await prisma.world.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { owner: { select: { email: true } }, _count: { select: { pages: true } } },
  });
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Worlds</h1>
      <table className="w-full text-sm border rounded-lg overflow-hidden">
        <thead className="bg-muted">
          <tr className="text-left">
            <th className="p-2">Name</th>
            <th className="p-2">Owner</th>
            <th className="p-2">Visibility</th>
            <th className="p-2">Status</th>
            <th className="p-2">Pages</th>
          </tr>
        </thead>
        <tbody>
          {worlds.map((w) => (
            <tr key={w.id} className="border-t">
              <td className="p-2">/{w.slug}</td>
              <td className="p-2">{w.owner.email}</td>
              <td className="p-2">{w.visibility}</td>
              <td className="p-2">{w.status}</td>
              <td className="p-2">{w._count.pages}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
