"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "./ui/button";

export default function LoginButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Carregando...</p>;
  }

  if (session) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <p>Olá, {session.user?.name}</p>
        <Button onClick={() => signOut()}>Logout</Button>
      </div>
    );
  }

  return <Button onClick={() => signIn()}>Login</Button>;
}
