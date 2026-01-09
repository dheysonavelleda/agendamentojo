import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import WelcomeEmail from '@/emails/Welcome'; // Criaremos este componente a seguir

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'AgendamentoJô <onboarding@resend.dev>', // IMPORTANTE: Domínio precisa ser verificado no Resend
      to: ['delivered@resend.dev'], // E-mail de teste do Resend
      subject: 'Bem-vindo ao AgendamentoJô!',
      react: WelcomeEmail(),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
