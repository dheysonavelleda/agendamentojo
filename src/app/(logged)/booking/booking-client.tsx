"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DynamicPhoneInput } from "@/components/dynamic-phone-input";
import { AppointmentPicker } from "@/components/ui/appointment-picker";
import { Button } from "@/components/ui/button";
import { createAppointment } from "@/app/actions/create-appointment";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Background } from "@/components/ui/background-components";
import { Controller } from "react-hook-form";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Nome muito curto" }).refine(value => value.split(' ').length >= 2, { message: "Por favor, insira seu nome completo." }),
  email: z.string().email({ message: "Email inválido." }),
  phone: z.string().refine(value => !value || (value.length >= 10 && value.length <= 15), {
    message: "Número de telefone inválido.",
  }),
});

type Service = {
  id: string;
  name: string;
  price: number;
};

interface BookingClientProps {
  initialServices: Service[];
}

export function BookingClient({ initialServices }: BookingClientProps) {
  const router = useRouter();
  const { control, register, handleSubmit: handleFormSubmit, formState: { errors, isValid } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
  });

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>('10:00');
  const [service, setService] = useState<Service | null>(initialServices.length > 0 ? initialServices[0] : null);
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [modalStep, setModalStep] = useState('form'); // 'form' or 'terms'
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('pix');

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log('--- onSubmit triggered ---');
    console.log('Value of date state:', date);
    console.log('Value of selectedTime state:', selectedTime);
    console.log('Value of service state:', service);

    if (!date || !selectedTime || !service) {
      console.error("onSubmit called without date, time, or service.");
      setError("Ocorreu um erro inesperado. Por favor, tente novamente.");
      return { success: false };
    }

    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const dateTime = new Date(date);
      dateTime.setHours(hours, minutes);

      const result = await createAppointment({
        ...data,
        serviceId: service.id,
        dateTime,
      });

      if (result.success) {
        return { success: true, appointmentId: result.appointmentId };
      } else {
        setError(result.message || 'Ocorreu um erro ao criar o agendamento.');
        return { success: false };
      }
    } catch (error) {
      console.error('Erro no agendamento:', error);
      setError('Erro ao processar o agendamento. Tente novamente.');
      return { success: false };
    }
  };

  const handlePayment = async (data: z.infer<typeof formSchema>) => {
    const appointmentResult = await onSubmit(data);

    if (appointmentResult.success && service) {
      try {
        const response = await fetch('/api/create-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: service.name,
            unit_price: service.price,
            quantity: 1,
          }),
        });

        const payment = await response.json();

        if (payment.init_point) {
          router.push(payment.init_point);
        } else {
          setError('Não foi possível iniciar o pagamento. Tente novamente.');
        }
      } catch (error) {
        console.error('Erro ao criar preferência de pagamento:', error);
        setError('Erro ao comunicar com o sistema de pagamento.');
      }
    }
  };

  const availableTimes = [
    "09:00",
    "10:00",
    "11:00",
    "14:00",
    "15:00",
    "16:00",
  ];

  const renderContactForm = () => (
    <form>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nome Completo</Label>
          <Input id="fullName" {...register("fullName")} placeholder="Seu nome completo" />
          {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} placeholder="seu@email.com" />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <DynamicPhoneInput name="phone" control={control as any} />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
        </div>
      </div>
    </form>
  );

  return (
    <Background>
      <div className="container mx-auto p-4 py-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">Agendamento</h1>
          <p className="text-lg text-muted-foreground">
            {service ? `${service.name} - R$${service.price.toFixed(2)}` : 'Sessão - Radiestesia Terapêutica'}
          </p>
          <Tabs defaultValue="pix" className="mt-8 max-w-md mx-auto" onValueChange={(value) => setPaymentMethod(value)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pix">PIX</TabsTrigger>
              <TabsTrigger value="card">
                Cartão em até 4 vezes s/juros
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pix">
              <div className="border p-6 rounded-lg bg-card mt-4 text-left">
                <p className="font-semibold mb-4">Instruções para pagamento com PIX:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Selecione a data e o horário desejado para o seu atendimento.</li>
                  <li>Preencha seus dados de contato (nome, email, telefone).</li>
                  <li>Clique em "Pagar com PIX" para confirmar o pré-agendamento.</li>
                  <li>Você receberá um email com a chave PIX e as instruções para realizar o pagamento de 50% do valor total.</li>
                  <li>Após a confirmação do pagamento, seu horário será efetivamente agendado.</li>
                </ol>
              </div>
            </TabsContent>
            <TabsContent value="card">
              <div className="border p-6 rounded-lg bg-card mt-4 text-left">
                <p className="font-semibold mb-4">Instruções para pagamento com Cartão de Crédito:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Selecione a data e o horário para o seu atendimento.</li>
                  <li>Preencha seus dados de contato.</li>
                  <li>Clique em "Pagar Valor Total" para ser redirecionado ao ambiente de pagamento seguro.</li>
                  <li>Realize o pagamento e seu horário será confirmado automaticamente.</li>
                </ol>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">1. Escolha a Data e Hora</h2>
            <AppointmentPicker
              date={date}
              setDate={setDate}
              time={selectedTime}
              setTime={setSelectedTime}
            />
          </div>

          <div className="bg-card p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">2. Seus Dados</h2>
            {renderContactForm()}
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={!isValid || !date || !selectedTime}
                  >
                    Pagar 50% com PIX
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  {modalStep === 'form' && (
                    <>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Pré-Agendamento</AlertDialogTitle>
                        <AlertDialogDescription>
                          Você está pré-agendando para {date?.toLocaleDateString('pt-BR')} às {selectedTime}.
                          Um email será enviado com as instruções para o pagamento de 50% via PIX para confirmar.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => setModalStep('terms')}>Continuar</AlertDialogAction>
                      </AlertDialogFooter>
                    </>
                  )}
                  {modalStep === 'terms' && (
                    <>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Termos e Condições</AlertDialogTitle>
                        <AlertDialogDescription className="max-h-60 overflow-y-auto">
                          <p className="mb-4"><strong>Política de Agendamento e Cancelamento</strong></p>
                          <p>O agendamento da sua sessão será confirmado somente após o pagamento de 50% do valor total. Este pagamento inicial garante a reserva do seu horário.</p>
                          <p className="mt-2"><strong>Cancelamento:</strong> Você pode cancelar sua sessão com até 48 horas de antecedência para receber o reembolso total do valor pago. Cancelamentos feitos com menos de 48 horas de antecedência não são elegíveis para reembolso.</p>
                          <p className="mt-2"><strong>Reagendamento:</strong> Você pode reagendar sua sessão uma única vez, desde que a solicitação seja feita com no mínimo 48 horas de antecedência.</p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="flex items-center space-x-2 my-4">
                        <Checkbox id="terms" onCheckedChange={(checked) => setIsTermsChecked(!!checked)} />
                        <Label htmlFor="terms">Li e concordo com os termos e condições</Label>
                      </div>
                      {modalError && <p className="text-red-500 text-sm">{modalError}</p>}
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setModalStep('form')}>Voltar</AlertDialogCancel>
                        <AlertDialogAction
                          disabled={!isTermsChecked}
                          onClick={handleFormSubmit(onSubmit)}
                        >
                          Confirmar e Receber PIX
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </>
                  )}
                </AlertDialogContent>
              </AlertDialog>

              <Button
                className="w-full"
                disabled={!isValid || !date || !selectedTime}
                onClick={handleFormSubmit(handlePayment)}
              >
                Pagar Valor Total (Cartão)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
}
