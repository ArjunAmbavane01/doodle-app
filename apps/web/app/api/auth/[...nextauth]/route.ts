import { authOptions } from "./options";
import NextAuth from "next-auth";

const nextAuth = NextAuth(authOptions);
export { nextAuth as GET, nextAuth as POST };
