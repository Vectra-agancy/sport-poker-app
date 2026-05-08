import Link from "next/link";
import { type FriendFeedItem } from "@/entities/rating";
import { UserAvatar } from "@/entities/user";

export interface FriendsFeedProps {
  items: FriendFeedItem[];
}

export function FriendsFeed({ items }: FriendsFeedProps) {
  return (
    <div className="space-y-2">
      {items.map((f, i) => (
        <Link
          key={i}
          href={`/u/${encodeURIComponent(f.user)}`}
          className="rounded-xl bg-burgundy-800/80 border border-amber-900/20 p-3 flex items-center gap-3 hover:border-amber-600/40 active:scale-[0.99] transition"
        >
          <UserAvatar name={f.avatar} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm">
              <span className="font-bold">{f.user}</span>{" "}
              <span className="text-amber-100/70">{f.action}</span>{" "}
              <span className="text-amber-300">
                {f.tournament || f.achievement}
              </span>
            </div>
            <div className="text-xs text-amber-200/40 mt-0.5">{f.time}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
