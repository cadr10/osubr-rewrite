import NextAuth from 'next-auth';
import { User as NextAuthUser, Session as NextAuthSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      isAdmin?: boolean;
      isBanned: boolean; 
      osu_id?: float;
      name: string;
      image?: string;
    };
  }

  interface User {
    id: string;
    isAdmin?: boolean;
    isBanned: boolean; 
    name: string;
  }
}