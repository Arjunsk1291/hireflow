import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.profile.findUnique({
          where: { email: parsed.data.email, isActive: true },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.password);
        if (!valid) return null;

        const roles: string[] = (() => { try { return JSON.parse(user.roles); } catch { return []; } })();

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          roles,
          department: user.department ?? null,
          title: user.title ?? null,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = (user as unknown as { roles: string[] }).roles ?? [];
        token.department = (user as unknown as { department: string | null }).department ?? null;
        token.title = (user as unknown as { title: string | null }).title ?? null;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      (session.user as unknown as { roles: string[] }).roles = (token.roles as string[]) ?? [];
      (session.user as unknown as { department: string | null }).department = (token.department as string | null) ?? null;
      (session.user as unknown as { title: string | null }).title = (token.title as string | null) ?? null;
      return session;
    },
  },
  pages: { signIn: '/auth' },
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
});
