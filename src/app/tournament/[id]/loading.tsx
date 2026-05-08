import { Logo, Skeleton } from "@/shared/ui";
import { BottomNav } from "@/widgets/bottom-nav";

export default function TournamentLoading() {
  return (
    <>
      <div className="pb-44">
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
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-14 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
      <div className="fixed bottom-24 left-0 right-0 px-4 z-30 max-w-md mx-auto">
        <Skeleton className="h-14 rounded-2xl" />
      </div>
      <BottomNav />
    </>
  );
}
