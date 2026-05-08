"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserMinus, UserPlus } from "lucide-react";
import { Button } from "@/shared/ui";
import { followUser, unfollowUser } from "../api/actions";

export interface FollowButtonProps {
  targetUserId: number;
  initialIsFollowing: boolean;
}

export function FollowButton({
  targetUserId,
  initialIsFollowing,
}: FollowButtonProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onClick = () => {
    setError(null);
    startTransition(async () => {
      const result = isFollowing
        ? await unfollowUser(targetUserId)
        : await followUser(targetUserId);
      if (!result.ok) {
        setError(result.error ?? "Что-то пошло не так");
        return;
      }
      setIsFollowing(Boolean(result.isFollowing));
      router.refresh();
    });
  };

  return (
    <div className="space-y-1">
      <Button
        type="button"
        variant={isFollowing ? "outline" : "default"}
        size="sm"
        onClick={onClick}
        disabled={pending}
        className="w-full"
      >
        {isFollowing ? (
          <UserMinus className="w-4 h-4" />
        ) : (
          <UserPlus className="w-4 h-4" />
        )}
        {pending
          ? "Подождите…"
          : isFollowing
          ? "Вы подписаны"
          : "Подписаться"}
      </Button>
      {error && (
        <div className="text-rose-300 text-xs text-center">{error}</div>
      )}
    </div>
  );
}
