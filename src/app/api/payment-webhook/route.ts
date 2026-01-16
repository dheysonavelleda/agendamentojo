
import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });

export async function POST(request: Request) {
  const body = await request.json();

  if (body.type === 'payment') {
    const paymentId = body.data.id;

    try {
      const payment = new Payment(client);
      const paymentDetails = await payment.get({ id: paymentId });

      console.log('Payment Webhook Received:', paymentDetails);

      // TODO: Implement your business logic here
      // 1. Find the appointment in your database associated with this payment.
      //    You might need to store the paymentId on the appointment when it's created.
      // 2. Check the payment status.
      // 3. Update the appointment status in your database (e.g., to 'CONFIRMED').
      // 4. Handle other statuses if necessary (e.g., 'rejected').

      if (paymentDetails.status === 'approved') {
        console.log(`Payment ${paymentId} approved. Update appointment in DB.`);
        // Example: await db.appointment.update({ where: { paymentId }, data: { status: 'CONFIRMED' } });
      } else {
        console.log(`Payment ${paymentId} has status: ${paymentDetails.status}.`);
      }

    } catch (error) {
      console.error('Error processing webhook:', error);
      return NextResponse.json({ error: 'Error processing webhook' }, { status: 500 });
    }
  }

  return NextResponse.json({ status: 'ok' });
}
