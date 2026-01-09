"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Background } from "@/components/ui/background-components";

export default function BookingPage() {
  const [date, setDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [existingAppointment, setExistingAppointment] = useState<Date | null>(
    null
  );
  const [isClient, setIsClient] = useState(false);
  const [newDate, setNewDate] = useState<Date | undefined>();
  const [newSelectedTime, setNewSelectedTime] = useState<string | undefined>();

  useEffect(() => {
    // Simula um agendamento existente para teste (dentro do prazo), executado apenas no cliente
    const appointment = new Date();
    appointment.setDate(appointment.getDate() + 1); // Amanhã
    appointment.setHours(10, 0, 0, 0); // às 10:00
    setExistingAppointment(appointment);
    setIsClient(true);
  }, []);

  const availableTimes = [
    "09:00",
    "10:00",
    "11:00",
    "14:00",
    "15:00",
    "16:00",
  ];

  const isRescheduleAllowed = () => {
    if (!existingAppointment) {
      return false; // Não permite reagendamento até o estado ser inicializado no cliente
    }
    const now = new Date();
    const appointmentTime = new Date(existingAppointment);
    const hoursDifference =
      (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDifference > 12;
  };

  return (
    <Background>
      <div className="container mx-auto p-4 py-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">
            Radiestesia Terapêutica - R$470,00
          </h2>
          <Tabs defaultValue="pix" className="mt-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pix">PIX</TabsTrigger>
              <TabsTrigger value="card">
                Cartão em até 4 vezes s/juros
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pix">
              <div className="border p-6 rounded-lg bg-card mt-4 text-left">
                <p className="text-muted-foreground mb-4">
                  Opção para pagar o valor total ou conforme abaixo.
                </p>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-semibold">1. Confirmação da Consulta</p>
                    <p className="text-muted-foreground">
                      Para garantir sua consulta, é necessário realizar um
                      depósito de R$100. Somente após o depósito sua consulta
                      será confirmada.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">2. Pagamento Restante</p>
                    <p className="text-muted-foreground">
                      O valor restante da consulta deve ser efetuado até o dia
                      da consulta, antes do atendimento.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">3. Reagendamento</p>
                    <p className="text-muted-foreground">
                      Reagendamentos podem ser feitos até 12 horas antes da
                      consulta. Caso contrário, o valor do depósito será
                      retido, e para reagendar será necessário um novo depósito
                      no mesmo valor.
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
        <div className="grid md:grid-cols-2 gap-4 items-start">
          {/* Coluna Esquerda */}
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-2">Selecione uma data</h2>
            {isClient ? (
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            ) : (
              <p>Carregando...</p>
            )}
          </div>

          {/* Coluna Direita */}
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold mb-2">Horários disponíveis</h2>
            {date ? (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {availableTimes.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => setSelectedTime(time)}
                    className="px-2 py-1 text-xs"
                    size="sm"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="mt-4">Selecione uma data para ver os horários.</p>
            )}

            <div className="mt-8">
              <h3 className="text-lg font-semibold">Opções de Pagamento</h3>
              <div className="flex space-x-4 mt-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button disabled={!date || !selectedTime}>
                      Pagar Sinal (PIX)
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Termos de Agendamento</AlertDialogTitle>
                      <AlertDialogDescription>
                        Ao pagar o sinal, você reservará o direito de ser
                        atendido na data e horário selecionado.
                        <br />
                        <br />
                        Lembrando que você tem 12 horas para reagendamento e
                        cancelamento, caso contrário, seu valor de R$ 100 será
                        retido.
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
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction disabled={!isTermsChecked}>
                        Continuar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button disabled={!date || !selectedTime}>
                      Pagar Valor Total
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Forma de Pagamento</AlertDialogTitle>
                      <AlertDialogDescription>
                        Selecione a forma de pagamento para o valor total.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-around py-4">
                      <Button variant="outline">PIX</Button>
                      <Button variant="outline">Cartão de Crédito</Button>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold">Reagendamento</h3>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="mt-4"
                    disabled={!existingAppointment}
                  >
                    Reagendar Consulta
                  </Button>
                </AlertDialogTrigger>
                {existingAppointment &&
                  (isRescheduleAllowed() ? (
                    <AlertDialogContent className="max-w-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reagendar Consulta</AlertDialogTitle>
                        <AlertDialogDescription>
                          Selecione uma nova data e horário para sua consulta.
                          Esta ação irá cancelar seu agendamento atual.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="flex flex-col space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Nova Data
                          </h3>
                          <Calendar
                            mode="single"
                            selected={newDate}
                            onSelect={setNewDate}
                            className="rounded-md border"
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Novos Horários
                          </h3>
                          {newDate ? (
                            <div className="grid grid-cols-3 gap-2">
                              {availableTimes.map((time) => (
                                <Button
                                  key={time}
                                  variant={
                                    newSelectedTime === time
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() => setNewSelectedTime(time)}
                                >
                                  {time}
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Selecione uma data para ver os horários.
                            </p>
                          )}
                        </div>
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          disabled={!newDate || !newSelectedTime}
                        >
                          Confirmar Reagendamento
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  ) : (
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Prazo de Reagendamento Expirado
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Infelizmente, seu prazo de reagendamento foi expirado.
                          O valor do sinal foi retido (de acordo com o termo de
                          agendamento assinado), mas caso você queira reagendar
                          novamente, terá que fazer um novo sinal.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogAction>Ok</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  ))}
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
}