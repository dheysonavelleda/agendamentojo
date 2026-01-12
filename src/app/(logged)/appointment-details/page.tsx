import { Suspense } from 'react';
import AppointmentDetailsContent from './content';
import { Background } from '@/components/ui/background-components';

export default function AppointmentDetailsPage() {
  return (
    <Suspense fallback={
      <Background>
        <div className="container mx-auto p-4 py-8 text-center">
          <p>Carregando...</p>
        </div>
      </Background>
    }>
      <AppointmentDetailsContent />
    </Suspense>
  );
}
