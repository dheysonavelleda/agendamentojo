"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Background } from "@/components/ui/background-components";
import { Calendar } from "@/components/ui/calendar";
import { cancelAppointment } from "@/app/actions/cancel-appointment";
import { getAppointmentDetails } from "@/app/actions/get-appointment-details";
import type { Prisma } from "@prisma/client";

type AppointmentDetails = Prisma.AppointmentGetPayload<{
  include: {
    client: true;
    service: true;
  };
}>;

const availableTimes = [
  "09:00", "10:00", "11:00", "14:00", "15:00", "16:00",
];

export default function AppointmentDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRescheduleWarning, setShowRescheduleWarning] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newDate, setNewDate] = useState<Date | undefined>();
  const [newSelectedTime, setNewSelectedTime] = useState<string | undefined>();

  useEffect(() => {
    const appointmentId = searchParams.get('id');
    if (appointmentId) {
      getAppointmentDetails(appointmentId).then(details => {
        if (details) {
          setAppointmentDetails(details);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const handleCancelAppointment = async () => {
    if (appointmentDetails) {
      const result = await cancelAppointment(appointmentDetails.id);
      if (result.success) {
        router.push('/'); // Redireciona para a home
      } else {
        // Tratar erro
        alert(result.message);
      }
    }
  };

  const isRescheduleAllowed = () => {
    if (!appointmentDetails) return false;
    const now = new Date();
    const appointmentTime = new Date(appointmentDetails.dateTime);
    const hoursDifference =
      (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDifference > 12;
  };

  const handleRescheduleClick = () => {
    if (isRescheduleAllowed()) {
      setShowRescheduleModal(true);
    } else {
      setShowRescheduleWarning(true);
    }
  };
  
  const handleConfirmReschedule = () => {
    // Aqui você adicionaria a lógica para salvar o novo agendamento
    console.log("Novo agendamento:", newDate, newSelectedTime);
    setShowRescheduleModal(false);
    // Opcional: mostrar uma mensagem de sucesso
  };

  if (loading) {
    return (
      <Background>
        <div className="container mx-auto p-4 py-8 text-center">
          <p>Carregando...</p>
        </div>
      </Background>
    );
  }

  if (!appointmentDetails) {
    return (
      <Background>
        <div className="container mx-auto p-4 py-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Agendamento não encontrado</h1>
          <p className="text-muted-foreground">O link que você acessou pode estar incorreto ou o agendamento foi cancelado.</p>
        </div>
      </Background>
    );
  }

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long'
  }).format(appointmentDetails.dateTime);

  const formattedTime = new Intl.DateTimeFormat('pt-BR', {
    timeStyle: 'short'
  }).format(appointmentDetails.dateTime);

  return (
    <Background>
      <div className="container mx-auto p-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Olá, {appointmentDetails.client.fullName}</h1>
        <p className="text-muted-foreground mb-8">Aqui estão os detalhes do seu próximo agendamento.</p>

        <div className="max-w-md mx-auto bg-card p-6 rounded-lg shadow-lg text-left">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Detalhes do Agendamento</h2>
          <div className="space-y-4">
            <div>
              <p className="font-semibold">Data:</p>
              <p className="text-muted-foreground">{formattedDate}</p>
            </div>
            <div>
              <p className="font-semibold">Horário:</p>
              <p className="text-muted-foreground">{formattedTime}</p>
            </div>
            <div>
              <p className="font-semibold">Serviço:</p>
              <p className="text-muted-foreground">{appointmentDetails.service.name}</p>
            </div>
            <div>
              <p className="font-semibold">Profissional:</p>
              <p className="text-muted-foreground">Joana Stecanella Savi</p>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto mt-4">
          <p className="text-sm text-muted-foreground">
            <strong>Lembrete:</strong> Caso tenha optado pelo pagamento do sinal, o valor restante deve ser quitado via PIX até 1 hora antes do seu atendimento.
          </p>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={handleRescheduleClick}>Reagendar</Button>
          
          {/* Modal de Aviso de Reagendamento Não Permitido */}
          <AlertDialog open={showRescheduleWarning} onOpenChange={setShowRescheduleWarning}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reagendamento não permitido</AlertDialogTitle>
                <AlertDialogDescription>
                  Conforme os termos de agendamento, não é possível reagendar dentro de 12 horas antes da consulta. O valor do sinal será retido.
                  <br/><br/>
                  Caso queira fazer um novo agendamento, por favor, aguarde o horário do seu agendamento atual passar e realize um novo processo de agendamento.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setShowRescheduleWarning(false)}>Entendi</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Modal de Reagendamento */}
          <AlertDialog open={showRescheduleModal} onOpenChange={setShowRescheduleModal}>
            <AlertDialogContent className="max-w-4xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Escolha uma nova data e horário</AlertDialogTitle>
              </AlertDialogHeader>
              <div className="grid md:grid-cols-2 gap-4 items-start py-4">
                <div className="flex flex-col items-center">
                  <Calendar
                    mode="single"
                    selected={newDate}
                    onSelect={setNewDate}
                    className="rounded-md border"
                  />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold mb-2 text-center">Horários disponíveis</h3>
                  {newDate ? (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {availableTimes.map((time) => (
                        <Button
                          key={time}
                          variant={newSelectedTime === time ? "default" : "outline"}
                          onClick={() => setNewSelectedTime(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-center text-muted-foreground">Selecione uma data para ver os horários.</p>
                  )}
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmReschedule} disabled={!newDate || !newSelectedTime}>
                  Confirmar Reagendamento
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Modal de Cancelamento */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Cancelar Agendamento</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Ao cancelar, seu horário será disponibilizado para outros clientes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Voltar</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancelAppointment}>Confirmar Cancelamento</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Background>
  );
}
