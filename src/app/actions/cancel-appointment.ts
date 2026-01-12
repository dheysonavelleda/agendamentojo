'use server'

import { prisma } from '@/lib/prisma'

export async function cancelAppointment(appointmentId: string) {
  try {
    await prisma.appointment.delete({
      where: { id: appointmentId },
    })
    return { success: true }
  } catch (error) {
    return { success: false, message: 'Ocorreu um erro ao cancelar o agendamento.' }
  }
}
