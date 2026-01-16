
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentPendingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/booking'); // Redireciona para a página de agendamento após 8 segundos
    }, 8000);

    return () => clearTimeout(timer); // Limpa o timer se o componente for desmontado
  }, [router]);

  return (
    <div className="container mx-auto p-4 py-8 text-center">
      <h1 className="text-4xl font-bold text-yellow-500 mb-4">Pagamento Pendente.</h1>
      <p className="text-lg text-muted-foreground">
        Seu pagamento está sendo processado. Avisaremos assim que for aprovado.
      </p>
      <p className="text-md text-muted-foreground mt-2">
        Você será redirecionado em 8 segundos.
      </p>
    </div>
  );
}
