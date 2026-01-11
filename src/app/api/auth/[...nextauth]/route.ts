import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Resend as ResendClient } from "resend";

const resend = new ResendClient(process.env.RESEND_API_KEY);

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: "onboarding@resend.dev",
      async sendVerificationRequest({ identifier: email, url }) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos a partir de agora

        // Deleta tokens antigos para o mesmo email
        await db
          .delete(verificationTokens)
          .where(eq(verificationTokens.identifier, email));

        // Insere o novo token
        await db.insert(verificationTokens).values({
          identifier: email,
          token: otp,
          expires,
        });

        // Envia o e-mail com o OTP
        try {
          await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "Seu código de login",
            html: `<p>Seu código de verificação é: <strong>${otp}</strong></p>`,
          });
        } catch (error) {
          console.error("Erro ao enviar e-mail de verificação:", error);
          throw new Error("Não foi possível enviar o e-mail de verificação.");
        }
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
    verifyRequest: "/auth/verify-request", // Página para notificar o usuário para checar o e-mail
  },
});
