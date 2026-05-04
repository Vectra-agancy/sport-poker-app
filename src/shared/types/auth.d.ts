declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nickname: string;
      tier: string;
      avatarUrl: string | null;
      isAdmin: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    nickname?: string;
    tier?: string;
    avatarUrl?: string | null;
    isAdmin?: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    userId?: number;
    nickname?: string;
    tier?: string;
    avatarUrl?: string | null;
    isAdmin?: boolean;
    userEmail?: string | null;
  }
}

export {};
