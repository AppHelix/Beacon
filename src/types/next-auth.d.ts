import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role?: string;
      lastSignIn?: string | null;
      accountCreated?: string | null;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
  }

  interface Profile {
    sub?: string;
    oid?: string;
    id?: string;
    name?: string;
    displayName?: string;
    given_name?: string;
    preferred_username?: string;
    email?: string;
    mail?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
  }
}
