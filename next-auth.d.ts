import NextAuth from 'next-auth';
import { User as NextAuthUser, Session as NextAuthSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      isAdmin?: boolean;
      osu_id?: float;
      name: string; // Adiciona a propriedade isAdmin à interface User
    };
  }

  interface User {
    id: string;
    isAdmin?: boolean; 
    name: string;
  }
}