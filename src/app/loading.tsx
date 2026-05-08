import { Logo, Skeleton } from "@/shared/ui";
import { BottomNav } from "@/widgets/bottom-nav";

export default function Loading() {
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
          <Skeleton className="h-8 w-40 rounded-md" />
        </div>
        <div className="px-4 space-y-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
