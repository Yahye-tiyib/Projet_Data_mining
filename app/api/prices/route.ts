import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Récupérer l'utilisateur à partir du token
function getUserFromToken(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret123');
  } catch {
    return null;
  }
}

// GET : Récupérer tous les prix (public)
export async function GET() {
  try {
    const observations = await prisma.observation.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(observations);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

// POST : Ajouter un prix (nécessite authentification)
export async function POST(request: Request) {
  try {
    const user = getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Vous devez être connecté' }, { status: 401 });
    }
    
    const body = await request.json();
    const { product, price, quantity, unit, latitude, longitude } = body;
    
    // Vérifier que les coordonnées sont fournies
    if (!latitude || !longitude) {
      return NextResponse.json({ error: 'Position GPS requise' }, { status: 400 });
    }
    
    // Arrondir les coordonnées pour identifier un même emplacement (précision ~100m)
    const roundedLat = Math.round(latitude * 1000) / 1000;
    const roundedLng = Math.round(longitude * 1000) / 1000;
    
    // Date du jour (début de journée)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 1. Vérifier si l'utilisateur a déjà saisi un prix pour ce produit aujourd'hui
    const userExisting = await prisma.observation.findFirst({
      where: {
        userId: user.id,
        product: product,
        createdAt: {
          gte: today
        }
      }
    });
    
    if (userExisting) {
      const nextAllowed = new Date();
      nextAllowed.setDate(nextAllowed.getDate() + 1);
      nextAllowed.setHours(0, 0, 0, 0);
      
      return NextResponse.json({
        error: `⚠️ Vous avez déjà saisi un prix pour ${product} aujourd'hui.`,
        nextAllowed: nextAllowed.toLocaleDateString('fr-FR'),
        message: `Vous pourrez à nouveau saisir un prix à partir du ${nextAllowed.toLocaleDateString('fr-FR')}`
      }, { status: 429 });
    }
    
    // 2. Vérifier si cet emplacement a déjà un prix aujourd'hui
    const marketExisting = await prisma.observation.findFirst({
      where: {
        product: product,
        latitude: {
          gte: roundedLat - 0.01,
          lte: roundedLat + 0.01
        },
        longitude: {
          gte: roundedLng - 0.01,
          lte: roundedLng + 0.01
        },
        createdAt: {
          gte: today
        }
      }
    });
    
    if (marketExisting) {
      return NextResponse.json({
        error: `⚠️ Un prix pour ${product} a déjà été saisi aujourd'hui à cet emplacement.`,
        message: "Un autre utilisateur a déjà contribué pour ce produit ici aujourd'hui.",
        existingPrice: marketExisting.price,
        existingUser: marketExisting.userId
      }, { status: 429 });
    }
    
    // 3. Tout est OK, on sauvegarde
    const observation = await prisma.observation.create({
      data: {
        product,
        price: parseFloat(price),
        quantity: parseFloat(quantity) || 1,
        unit: unit || 'kg',
        latitude: roundedLat,
        longitude: roundedLng,
        userId: user.id
      }
    });
    
    return NextResponse.json({
      success: true,
      message: `✅ ${product} à ${price} DH enregistré avec succès !`,
      observation
    }, { status: 201 });
    
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 });
  }
}