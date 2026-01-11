'use server'

import prisma from '@/lib/prisma'

export async function getAppointmentDetails(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      client: true,
      service: true,
    },
  })

  return appointment
}
