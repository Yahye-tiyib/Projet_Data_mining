import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCount = await prisma.observation.count({
      where: {
        userId: user.id,
        createdAt: { gte: today }
      }
    });
    
    const nextAllowed = new Date();
    nextAllowed.setDate(nextAllowed.getDate() + 1);
    nextAllowed.setHours(0, 0, 0, 0);
    
    return NextResponse.json({
      todayCount,
      nextAllowed: nextAllowed.toISOString()
    });
  } catch {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }
}