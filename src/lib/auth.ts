import { type NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || "<your-client-id>",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "<your-client-secret>",
      tenantId: process.env.AZURE_AD_TENANT_ID || "<your-tenant-id>",
      profile(profile) {
        // Debug: log the raw profile
        // Remove/comment this in production
        // eslint-disable-next-line no-console
        console.log('AzureAD raw profile:', profile);
        return {
          id: profile.oid || profile.id || profile.sub,
          name: profile.name || profile.displayName || profile.given_name || profile.preferred_username || "User",
          email: profile.email || profile.mail || profile.preferred_username || "",
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "<your-nextauth-secret>",
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/api/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user, profile }: any) {
      // Debug: log the user and profile
      // Remove/comment this in production
      // eslint-disable-next-line no-console
      console.log('JWT callback user:', user);
      console.log('JWT callback profile:', profile);
      if (user) {
        token.id = user.id;
        token.name = user.name || profile?.name || profile?.displayName || null;
        token.email = user.email || profile?.email || profile?.mail || null;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      // Debug: log the token and session
      // Remove/comment this in production
      // eslint-disable-next-line no-console
      console.log('Session callback token:', token);
      console.log('Session callback session:', session);
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string || "User";
        session.user.email = token.email as string || "";
      }
      return session;
    },
  },
};
