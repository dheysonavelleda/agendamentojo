import { Suspense } from 'react';
import OtpContent from './content';

export default function OtpPage() {
  return (
    <Suspense fallback={
      <div className="w-full lg:grid lg:min-h-screen lg:place-items-center">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Verificação de Código</h1>
            <p className="text-balance text-muted-foreground">
              Carregando...
            </p>
          </div>
        </div>
      </div>
    }>
      <OtpContent />
    </Suspense>
  );
}
