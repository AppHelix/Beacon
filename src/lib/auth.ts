import { type NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || "<your-client-id>",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "<your-client-secret>",
      tenantId: process.env.AZURE_AD_TENANT_ID || "<your-tenant-id>",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "<your-nextauth-secret>",
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/api/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
