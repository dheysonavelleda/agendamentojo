
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentFailurePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/booking'); // Redireciona para a página de agendamento após 5 segundos
    }, 5000);

    return () => clearTimeout(timer); // Limpa o timer se o componente for desmontado
  }, [router]);

  return (
    <div className="container mx-auto p-4 py-8 text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Pagamento Recusado.</h1>
      <p className="text-lg text-muted-foreground">
        Houve um problema ao processar seu pagamento. Por favor, tente novamente.
      </p>
      <p className="text-md text-muted-foreground mt-2">
        Você será redirecionado em 5 segundos.
      </p>
    </div>
  );
}
