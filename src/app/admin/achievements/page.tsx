import { prisma } from "@/shared/api/prisma";
import {
  AchievementsManager,
  type AchievementListItem,
} from "@/features/admin-achievement-crud";

export const dynamic = "force-dynamic";

export default async function AdminAchievementsPage() {
  const achievements = await prisma.achievement.findMany({
    orderBy: [{ category: "asc" }, { title: "asc" }],
    include: { _count: { select: { unlockedBy: true } } },
  });

  const items: AchievementListItem[] = achievements.map((a) => ({
    id: a.id,
    code: a.code,
    icon: a.icon,
    title: a.title,
    description: a.description,
    category: a.category,
    isManual: a.isManual,
    unlockedCount: a._count.unlockedBy,
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-white font-bold text-xl">Достижения</h1>
      <p className="text-amber-200/60 text-sm">
        Каталог достижений клуба. «Ручные» выдаются со страницы игрока,
        остальные разблокируются автоматически по результатам. Код
        автоматических достижений менять нельзя — по нему работает пересчёт.
      </p>
      <AchievementsManager achievements={items} />
    </div>
  );
}
