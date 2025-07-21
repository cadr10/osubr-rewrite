import { NextApiHandler } from 'next';
import NextAuth, { type NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import OsuProvider from 'next-auth/providers/osu';
import prisma from '../../../lib/prisma';

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
        const account = await prisma.account.findFirst({
          where: { userId: user.id },
        });

        if (account) {
          session.user.id = account.providerAccountId;

          if (account.providerAccountId === process.env.SUPER_ADMIN_ID) {
            session.user.isAdmin = true;
          } else {
            session.user.isAdmin = user.isAdmin || false;
          }

          session.user.isBanned = user.isBanned || false;
        } else {
          session.user.id = user.id;
          session.user.isAdmin = user.isAdmin || false;
          session.user.isBanned = user.isBanned || false;
        }
      }
      return session;
    },
  },
};