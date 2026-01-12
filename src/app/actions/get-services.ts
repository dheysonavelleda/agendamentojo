'use server';

import { prisma } from '@/lib/prisma';

export async function getServices() {
  try {
    const services = await prisma.service.findMany();
    return services;
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}
