import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const observations = await prisma.observation.findMany();
    return NextResponse.json(observations);
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product, price, quantity, unit, latitude, longitude } = body;

    if (!product || !price) {
      return NextResponse.json({ error: 'Champs requis' }, { status: 400 });
    }

    const observation = await prisma.observation.create({
      data: {
        product,
        price: parseFloat(price),
        quantity: parseFloat(quantity) || 1,
        unit: unit || 'kg',
        latitude: latitude || null,
        longitude: longitude || null,
      },
    });

    return NextResponse.json(observation, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}