import { Logo, Skeleton } from "@/shared/ui";
import { BottomNav } from "@/widgets/bottom-nav";

export default function RatingLoading() {
  return (
    <>
      <div className="pb-28">
        <div
          className="px-4 pt-6 pb-4 sticky top-0 z-20"
          style={{
            background:
              "linear-gradient(180deg, #1a0a0c 70%, transparent 100%)",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Logo size="sm" />
            <span className="font-serif text-amber-200/90 text-lg tracking-widest">
              RERAISE CLUB
            </span>
          </div>
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>

        <div className="px-4 space-y-4">
          {/* Scope tabs */}
          <Skeleton className="h-11 rounded-2xl" />
          {/* Search input */}
          <Skeleton className="h-12 rounded-2xl" />

          {/* Podium */}
          <div className="rounded-2xl bg-burgundy-800/60 border border-amber-900/20 p-4">
            <div className="grid grid-cols-3 gap-2 items-end">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
          </div>

          {/* My position card */}
          <Skeleton className="h-20 rounded-2xl" />

          {/* Rating table rows */}
          <div className="rounded-2xl bg-burgundy-800/60 border border-amber-900/20 overflow-hidden">
            <Skeleton className="h-10 rounded-none" />
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-none border-t border-amber-900/10" />
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
