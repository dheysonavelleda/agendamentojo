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
import { getServices } from "@/app/actions/get-services";
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

export default function BookingPage() {
  const router = useRouter();
  const { control, register, handleSubmit: handleFormSubmit, formState: { errors, isValid } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
  });

  const [date, setDate] = useState<Date | undefined>(new Date('2026-01-15T12:00:00'));
  const [selectedTime, setSelectedTime] = useState<string | null>('10:00');
  const [service, setService] = useState<Service | null>(null);
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [modalStep, setModalStep] = useState('form'); // 'form' or 'terms'
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const fetchService = async () => {
        const servicesData = await getServices();
        if (servicesData && servicesData.length > 0) {
          setService(servicesData[0]);
        }
      };

      fetchService();
    }
  }, [isClient]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
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
        // Não redireciona mais aqui, apenas retorna sucesso
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
            // Futuramente, podemos passar o appointmentId aqui para associar o pagamento
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
    // Se appointmentResult.success for falso, o erro já foi setado dentro de onSubmit
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
                <p className="text-muted-foreground mb-4">
                  Opção de pagamento total ou conforme abaixo:
                </p>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-semibold">1. Confirmação da Consulta</p>
                    <p className="text-muted-foreground">
                      Para garantir sua consulta, é necessário realizar um depósito de R$100. Somente após o depósito sua consulta será confirmada.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">2. Pagamento Restante</p>
                    <p className="text-muted-foreground">
                      O valor restante da consulta deve ser efetuado até o dia da consulta, antes do atendimento.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">3. Cancelamento</p>
                    <p className="text-muted-foreground">
                      Cancelamentos podem ser feitos até 12 horas antes da consulta. Caso contrário, o valor do depósito será retido, e para reagendar será necessário um novo depósito no mesmo valor.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="card">
              <div className="border p-6 rounded-lg bg-card mt-4 text-left">
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-semibold">Confirmação da Consulta</p>
                    <p className="text-muted-foreground">
                      Após o pagamento sua consulta irá ser confirmada.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 gap-8 max-w-md mx-auto">
          {isClient && (
            <AppointmentPicker
              date={date}
              setDate={setDate}
              time={selectedTime}
              setTime={setSelectedTime}
            />
          )}
        </div>

        <div className="mt-12 flex justify-center">
          <div className="w-full max-w-md text-center">
            <h3 className="text-lg font-semibold">Opções de Pagamento</h3>
            <div className="flex justify-center space-x-4 mt-4">
              {paymentMethod === 'pix' && (
                <AlertDialog onOpenChange={(open) => {
                  if (open) {
                    if (!date || !selectedTime) {
                      setModalError('Por favor, selecione data e horário.');
                    } else {
                      setModalError(null);
                      setModalStep('form');
                    }
                  }
                }}>
                  <AlertDialogTrigger asChild>
                    <Button>
                      Pagar Sinal (PIX)
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    {modalError ? (
                      <div className="text-red-500 text-center p-4">{modalError}</div>
                    ) : modalStep === 'form' ? (
                      <>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Informações de Contato</AlertDialogTitle>
                          <AlertDialogDescription>
                            Preencha seus dados para continuar com o agendamento.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        {renderContactForm()}
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <Button onClick={() => setModalStep('terms')} disabled={!isValid}>
                            Continuar
                          </Button>
                        </AlertDialogFooter>
                      </>
                    ) : (
                      <>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Termos de Agendamento</AlertDialogTitle>
                          <AlertDialogDescription>
                            Ao pagar o sinal, você reservará o direito de ser
                            atendido na data e horário selecionado.
                            <br />
                            <br />
                            <strong>Política de Cancelamento:</strong> Reagendamentos e cancelamentos devem ser feitos com mais de 12 horas de antecedência. Dentro do período de 12 horas antes da consulta, não será possível reagendar e o valor do sinal (R$ 100) será retido.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex items-center space-x-2 my-4">
                          <Checkbox
                            id="terms"
                            checked={isTermsChecked}
                            onCheckedChange={(checked) =>
                              setIsTermsChecked(checked as boolean)
                            }
                          />
                          <Label
                            htmlFor="terms"
                            className="text-sm font-medium leading-none text-muted-foreground"
                          >
                            Estou ciente e concordo com o termo acima.
                          </Label>
                        </div>
                        <AlertDialogFooter>
                          <Button variant="ghost" onClick={() => setModalStep('form')}>Voltar</Button>
                          <AlertDialogAction
                            disabled={!isTermsChecked}
                            onClick={handleFormSubmit(onSubmit)}
                          >
                            Continuar para Pagamento
                          </AlertDialogAction>
                        </AlertDialogFooter>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                      </>
                    )}
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <AlertDialog onOpenChange={(open) => {
                if (open) {
                  if (!date || !selectedTime) {
                    setModalError('Por favor, selecione data e horário.');
                  } else {
                    setModalError(null);
                    setModalStep('form');
                  }
                }
              }}>
                <AlertDialogTrigger asChild>
                  <Button>
                    {paymentMethod === 'card' ? 'Pagar' : 'Pagar Valor Total'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  {modalError ? (
                    <div className="text-red-500 text-center p-4">{modalError}</div>
                  ) : (
                    <>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Informações de Contato</AlertDialogTitle>
                        <AlertDialogDescription>
                          Preencha seus dados para continuar com o agendamento.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      {renderContactForm()}
                      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleFormSubmit(handlePayment)} disabled={!isValid}>
                          Continuar para Pagamento
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </>
                  )}
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
}