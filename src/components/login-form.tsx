"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [step, setStep] = useState<"email" | "code">("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStep("code")
      } else {
        console.error("Failed to send OTP")
      }
    } catch (error) {
      console.error("An error occurred:", error)
    }
  }

  const handleCodeSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    await signIn("credentials", {
      email,
      code,
      callbackUrl: "/",
    })
  }

  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-sm", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">
            {step === "email"
              ? "Bem-vindo ao agendamento Joana Savi"
              : "Verifique seu e-mail"}
          </h1>
          <p className="text-muted-foreground text-balance">
            {step === "email"
              ? "Entre na sua conta para continuar"
              : "Enviamos um código de 6 dígitos para o seu e-mail."}
          </p>
        </div>
        {step === "email" ? (
          <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Button type="submit">Entrar com Email</Button>
          </form>
        ) : (
          <form onSubmit={handleCodeSignIn} className="flex flex-col items-center gap-4">
            <div className="space-y-2 text-center">
              <FieldLabel htmlFor="code">Código de Acesso</FieldLabel>
              <InputOTP
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                value={code}
                onChange={(value) => setCode(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button type="submit">Verificar Código</Button>
          </form>
        )}
      </FieldGroup>
    </div>
  )
}
