"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function OtpContent() {
  const [otp, setOtp] = useState("");
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleVerifyOtp = () => {
    if (!email) {
      console.error("E-mail não encontrado nos parâmetros da URL.");
      return;
    }
    signIn("resend", { email, otp, redirect: true, callbackUrl: "/booking" });
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:place-items-center">
      <div className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold">Verificação de Código</h1>
          <p className="text-balance text-muted-foreground">
            Enviamos um código de 6 dígitos para{" "}
            <strong>{isClient ? email : "..."}</strong>.
          </p>
        </div>
        <div className="grid gap-4">
          <div className="flex flex-col items-center gap-2">
            <Label htmlFor="otp">Código de Verificação</Label>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button type="submit" className="w-full" onClick={handleVerifyOtp}>
            Verificar Código
          </Button>
        </div>
      </div>
    </div>
  );
}
