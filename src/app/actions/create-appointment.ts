'use server'

import { prisma } from '@/lib/prisma'

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

  let user = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: data.fullName,
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
      userId: user.id,
      serviceId: data.serviceId,
    },
  })

  return { success: true, appointmentId: appointment.id }
}
