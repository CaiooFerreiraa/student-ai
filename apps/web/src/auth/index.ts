import NextAuth, { type Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { authenticateUser } from "@/application/use-cases/authenticate-user";
import { getUserByEmail } from "@/application/use-cases/get-user-by-email";
import { syncOAuthUser } from "@/application/use-cases/sync-oauth-user";
import { signInSchema } from "@/application/validators/auth-schemas";
import { getServerEnv } from "@/infrastructure/config/env";

function getOAuthProviders() {
  const env = getServerEnv();
  const providers = [];

  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      Google({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      }),
    );
  }

  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    providers.push(
      GitHub({
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      }),
    );
  }

  return providers;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: getServerEnv().AUTH_SECRET,
  trustHost: getServerEnv().AUTH_TRUST_HOST,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = signInSchema.safeParse(rawCredentials);

        if (!parsed.success) {
          return null;
        }

        return authenticateUser(parsed.data);
      },
    }),
    ...getOAuthProviders(),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider === "credentials" || !user.email) {
        return true;
      }

      await syncOAuthUser({
        email: user.email,
        name: user.name ?? null,
        image: user.image ?? null,
      });

      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }

      if (!token.id && token.email) {
        const existingUser = await getUserByEmail(token.email);
        token.id = existingUser?.id;
      }

      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: typeof token.id === "string" ? token.id : "",
        },
      } satisfies Session;
    },
  },
});
