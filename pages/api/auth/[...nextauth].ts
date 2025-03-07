import { NextApiHandler } from 'next';
import NextAuth, { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GitHubProvider from 'next-auth/providers/github';
import EmailProvider from 'next-auth/providers/email';
import prisma from '../../../lib/prisma';
//import  OsuProvider  from "./osu-provider";
import OsuProvider from "next-auth/providers/osu";

const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, options);
export default authHandler;

export const options: NextAuthOptions = {
  providers: [

    OsuProvider({
      clientId: process.env.OSU_CLIENT_ID,
      clientSecret: process.env.OSU_CLIENT_SECRET,
    }),


  ],
  adapter: PrismaAdapter(prisma),
  secret: process.env.SECRET,
  callbacks: {


    async session({ session, user }) {
      if (session.user) {
        session.user.isAdmin = user.isAdmin || false;
        session.user.id = user.id;

      }
      return session;
    },







    
  },


  
};
