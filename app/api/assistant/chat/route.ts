import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Groq from 'groq-sdk';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function getUserFromToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret123');
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    const user = getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }
    
    const { question } = await request.json();
    
    // Récupérer les données (uniquement celles de l'utilisateur si besoin)
    const observations = await prisma.observation.findMany({
      take: 200,
      orderBy: { createdAt: 'desc' }
    });
    
    // ... reste du traitement
    const products = [...new Set(observations.map(o => o.product))];
    const avgPrices = products.map(product => {
      const prices = observations.filter(o => o.product === product).map(o => o.price);
      const avg = prices.reduce((a,b) => a+b, 0) / prices.length;
      return `${product}: ${avg.toFixed(2)} DH/kg`;
    });
    
    const prompt = `
      Données actuelles de la base Souk Data Mining :
      ${avgPrices.join('\n')}
      
      L'utilisateur ${user.name} demande : "${question}"
      
      Réponds en français, de manière utile et précise.
      Si une question concerne le prix actuel, utilise les données disponibles.
    `;
    
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "Tu es un assistant expert des prix des souks au Maroc." },
        { role: "user", content: prompt }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
    });
    
    const answer = completion.choices[0]?.message?.content || "Je n'ai pas pu répondre.";
    
    return NextResponse.json({ answer });
    
  } catch (error) {
    console.error('Erreur IA:', error);
    return NextResponse.json({ 
      answer: "❌ Désolé, une erreur est survenue. Veuillez réessayer plus tard.",
      error: true 
    }, { status: 500 });
  }
}