'use server'

import prisma from '@/lib/prisma'

export async function createAppointment(data: {
  fullName: string
  email: string
  phone: string
  serviceId: string
  dateTime: Date
}) {
  const existingAppointment = await prisma.appointment.findFirst({
    where: {
      dateTime: data.dateTime,
      serviceId: data.serviceId,
    },
  })

  if (existingAppointment) {
    return {
      success: false,
      message: 'Este horário já está agendado. Por favor, escolha outro.',
    }
  }

  let client = await prisma.client.findUnique({
    where: { email: data.email },
  })

  if (!client) {
    client = await prisma.client.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
      },
    })
  }

  const appointment = await prisma.appointment.create({
    data: {
      dateTime: data.dateTime,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      clientId: client.id,
      serviceId: data.serviceId,
    },
  })

  return { success: true, appointmentId: appointment.id }
}
