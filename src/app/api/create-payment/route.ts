
import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });

export async function POST(request: Request) {
  const { title, unit_price, quantity } = await request.json();

  if (!title || !unit_price || !quantity) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: title,
            title,
            unit_price,
            quantity,
          },
        ],
        payment_methods: {
            excluded_payment_methods: [
                {
                    id: "bolbradesco"
                },
                {
                    id: "pec"
                }
            ],
            excluded_payment_types: [
                {
                    id: "ticket"
                }
            ],
            installments: 4,
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-failure`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-pending`,
        },
        auto_return: 'approved',
      },
    });

    return NextResponse.json({ id: result.id, init_point: result.init_point });
  } catch (error) {
    console.error('Error creating payment preference:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Error creating payment preference: ${errorMessage}` }, { status: 500 });
  }
}
