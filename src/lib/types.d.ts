import NextAuth from 'next-auth';
import { User } from '@prisma/client';

interface IUser {
  id: string;
  email?: string;
  phone_number?: string;
  role: 'USER' | 'ADMIN';
}

declare module 'next-auth' {
  interface Session {
    jwt: string;
    user: IUser;
  }
}

declare module 'next-auth/jwt' {
  type JWT = {
    jwt: string;
    user: IUser;
  } & DefaultSession['user'];
}
