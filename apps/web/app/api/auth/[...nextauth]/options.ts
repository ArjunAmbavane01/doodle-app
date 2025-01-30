import { AuthOptions, ISODateString } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

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
    async signIn({user,account}){
      console.log("User data : " + user)
      console.log("User Account : " + account)
      return true
    },
    async session({ session, user, token }:{session:ICustomSession,user:ICustomUser,token:JWT}) {
      session.user = token.user as ICustomUser
      return session
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      if(user){
        token.user = user
      }
      return token
    }
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
};
