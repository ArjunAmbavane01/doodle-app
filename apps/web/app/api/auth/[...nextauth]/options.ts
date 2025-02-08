import { Account, AuthOptions, ISODateString } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";
import { LOGIN_URL } from "@/lib/apiEndPoints";

export interface ICustomSession{
  user?:ICustomUser
  expires:ISODateString
}
export interface ICustomUser{
  id?:string|null
  name?:string|null
  email?:string|null
  image?:string|null
  provider?:string|null
  token?:string|null
}

export const authOptions: AuthOptions = {
  pages: {
    signIn: "/",
  },
  callbacks:{
    async signIn({user,account}:{user:ICustomUser,account:Account|null}){
    try{
      const payload = {
        email:user.email,
        name:user.name,
        photo:user?.image,
        provider:account?.provider,
        oauth_id:account?.providerAccountId,
      }

      const {data} = await axios.post(LOGIN_URL,payload);
      user.token = data?.user?.token;
      user.id = data?.user?.id?.toString();
      user.provider = data?.user?.provider;
      console.log(`\n\n user: ${user}`)
      return true
    } catch(e){
      return false
    }
    },
    async jwt({ token, user }) {
      if(user) token.user = user
      return token
    },
    async session({ session, user, token }:{session:ICustomSession,user:ICustomUser,token:JWT}) {
      session.user = token.user as ICustomUser
      return session
    }
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: { params: { prompt: "consent", access_type: "offline", response_type: "code"}, },
    }),
  ],
};
