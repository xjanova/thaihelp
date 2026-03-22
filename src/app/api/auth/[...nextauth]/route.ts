import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import LineProvider from 'next-auth/providers/line';

const handler = NextAuth({
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    // LINE Login — ใส่ Channel ID/Secret จาก LINE Developers Console
    ...(process.env.LINE_CHANNEL_ID
      ? [
          LineProvider({
            clientId: process.env.LINE_CHANNEL_ID,
            clientSecret: process.env.LINE_CHANNEL_SECRET || '',
          }),
        ]
      : []),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.sub;
        (session.user as Record<string, unknown>).provider = token.provider;
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'thaihelp-nextauth-secret-2026',
});

export { handler as GET, handler as POST };
