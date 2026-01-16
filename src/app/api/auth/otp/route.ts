import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const code = generateOTP();
    const hashedCode = hashToken(code);
    const expires = new Date(new Date().getTime() + 10 * 60 * 1000); // 10 minutes

    // Upsert verification token
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: hashedCode,
        expires,
      },
    });

    // Send email with Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
      },
      body: JSON.stringify({
        from: "nao-responda@agendamento.joanasavi.com",
        to: email,
        subject: "Entrar em: Agendamento",
        html: `<p>Olá! Esse é o código de acesso.</p><h1>${code}</h1>`,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Resend error:", errorData);
      return NextResponse.json({ message: "Failed to send email", error: errorData }, { status: 500 });
    }

    return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("OTP Error:", error);
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 });
  }
}
