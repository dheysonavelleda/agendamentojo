import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        code: { label: "code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) {
          return null;
        }

        const { email, code } = credentials;

        const verificationToken = await prisma.verificationToken.findFirst({
          where: { identifier: email },
        });

        if (!verificationToken) {
          return null;
        }

        const hashedCode = createHash("sha256").update(code).digest("hex");

        if (verificationToken.token !== hashedCode) {
          return null;
        }

        if (new Date() > verificationToken.expires) {
          await prisma.verificationToken.delete({
            where: {
              identifier_token: {
                identifier: email,
                token: verificationToken.token,
              },
            },
          });
          return null;
        }

        // Delete the token so it can't be used again
        await prisma.verificationToken.delete({
          where: {
            identifier_token: {
              identifier: email,
              token: verificationToken.token,
            },
          },
        });

        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: email.split("@")[0],
            },
          });
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/booking`;
    },
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/login?verify=true",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
