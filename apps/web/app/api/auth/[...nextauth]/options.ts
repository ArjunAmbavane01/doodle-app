import axios from "axios";
import { Account, AuthOptions, ISODateString } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import { LOGIN_URL } from "@/lib/apiEndPoints";

export interface ICustomSession {
  user?: ICustomUser;
  expires: ISODateString;
}
export interface ICustomUser {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  provider?: string | null;
  token?: string | null;
}

export const authOptions: AuthOptions = {
  pages: {
    signIn: "/",
  },
  callbacks: {
    async signIn({ user, account }: { user: ICustomUser; account: Account | null; }) {
      try {
        const payload = {
          email: user.email,
          name: user.name,
          photo: user?.image,
          provider: account?.provider,
          oauth_id: account?.providerAccountId,
        };

        const { data } = await axios.post(LOGIN_URL, payload);
        if (data?.user?.token) {
          user.token = data.user.token;
          user.id = data.user.id?.toString();
          user.provider = data.user.provider;
          return true;
        }
        return false;
      } catch (err) {
        console.error(err);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) token.user = user;
      return token;
    },
    async session({ session, token, }: { session: ICustomSession; token: JWT; }) {
      session.user = token.user as ICustomUser;
      return session;
    },
    async redirect({ baseUrl }) {
      return baseUrl;
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: { prompt: "consent", access_type: "offline", response_type: "code" },
      },
    }),
  ],
};
