import { Logo, Skeleton } from "@/shared/ui";
import { BottomNav } from "@/widgets/bottom-nav";

export default function PublicProfileLoading() {
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
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-8 w-32 rounded-md" />
          </div>
        </div>

        <div className="px-4 space-y-4">
          {/* User header card with avatar, stats */}
          <div className="rounded-2xl bg-burgundy-800/60 border border-amber-900/20 p-5 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32 rounded-md" />
                <Skeleton className="h-4 w-40 rounded-md" />
              </div>
            </div>
            {/* Follow button */}
            <Skeleton className="h-9 rounded-md" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-9 rounded-xl" />
              <Skeleton className="h-9 rounded-xl" />
              <Skeleton className="h-9 rounded-xl" />
              <Skeleton className="h-9 rounded-xl" />
            </div>
          </div>

          {/* Achievements grid */}
          <Skeleton className="h-56 rounded-2xl" />
        </div>
      </div>
      <BottomNav />
    </>
  );
}
