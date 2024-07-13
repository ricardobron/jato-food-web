// import prisma from '@/lib/prisma';

import { AuthOptions } from 'next-auth';
// import { PrismaAdapter } from '@next-auth/prisma-adapter';

import CredentialsProvider from 'next-auth/providers/credentials';
import { api } from './api';

export const authOptions: AuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {},
      async authorize(credentials) {
        const { phone_number, pin_table, type, email, password, table } =
          credentials as any;

        try {
          let response;

          if (type === 'client') {
            response = await api.post('/auth/client', {
              phone_number,
              pin_table,
              table: Number(table),
            });
          }

          if (type === 'admin') {
            response = await api.post('/auth/admin', {
              email,
              password,
            });
          }

          if (!response?.data) {
            return null;
          }

          const data = response.data;

          return {
            ...data.user,
            id: data.user.id,
            jwt: data.token,
          };
        } catch (e) {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        const _user = user as any;

        return {
          ...token,
          user,
          jwt: _user.jwt as any,
        };
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user = token.user;
        session.jwt = token.jwt;
      }
      return session;
    },
  },
  pages: {},
};
