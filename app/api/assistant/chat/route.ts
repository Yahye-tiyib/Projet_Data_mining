import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Groq from 'groq-sdk';

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const { question, userLocation } = await request.json();
    
    // 1. Récupérer les données réelles
    const observations = await prisma.observation.findMany({
      take: 200,
      orderBy: { createdAt: 'desc' }
    });
    
    // 2. Calculer les statistiques
    const products = [...new Set(observations.map(o => o.product))];
    
    const stats = products.map(product => {
      const productObs = observations.filter(o => o.product === product);
      const prices = productObs.map(o => o.price);
      const avg = prices.reduce((a,b) => a+b, 0) / prices.length;
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const lastPrice = productObs[0]?.price || 0;
      
      return {
        product,
        avg: avg.toFixed(2),
        min,
        max,
        lastPrice,
        count: productObs.length
      };
    });
    
    // 3. Détecter les tendances
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const trends = products.map(product => {
      const current = observations.filter(o => o.product === product && new Date(o.createdAt) >= lastWeek);
      const previous = observations.filter(o => o.product === product && new Date(o.createdAt) < lastWeek);
      
      const currentAvg = current.length ? current.reduce((a,b) => a+b.price, 0) / current.length : 0;
      const previousAvg = previous.length ? previous.reduce((a,b) => a+b.price, 0) / previous.length : 0;
      const variation = previousAvg ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0;
      
      return { product, variation: variation.toFixed(1), trend: variation > 5 ? 'hausse' : variation < -5 ? 'baisse' : 'stable' };
    });
    
    // 4. Construire le prompt
    const prompt = `
      Tu es un assistant IA pour "Souk Data Mining", une plateforme citoyenne qui suit les prix des souks au Maroc.
      
      📊 DONNÉES ACTUELLES:
      - ${observations.length} observations au total
      
      Prix moyens (DH/kg):
      ${stats.map(s => `- ${s.product}: ${s.avg} DH (min: ${s.min}, max: ${s.max}, dernières: ${s.lastPrice} DH)`).join('\n')}
      
      Tendances (7 derniers jours):
      ${trends.map(t => `- ${t.product}: ${t.trend} (${t.variation}%)`).join('\n')}
      
      ${userLocation ? `📍 Localisation utilisateur: ${userLocation}` : ''}
      
      📝 QUESTION DE L'UTILISATEUR: "${question}"
      
      Règles de réponse:
      - Sois utile, précis et concis
      - Utilise les données réelles ci-dessus
      - Donne des conseils pratiques pour acheter moins cher
      - Réponds en français
      - Si tu ne sais pas, dis-le honnêtement
    `;
    
    // 5. Appeler GROQ
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Tu es un assistant expert en prix des produits alimentaires au Maroc. Tu utilises les données de la plateforme Souk Data Mining."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
    });
    
    const answer = completion.choices[0]?.message?.content || "Désolé, je n'ai pas pu traiter votre demande.";
    
    return NextResponse.json({ answer });
    
  } catch (error) {
    console.error('Erreur IA:', error);
    return NextResponse.json({ 
      answer: "❌ L'assistant IA est temporairement indisponible. Consultez le dashboard pour les informations sur les prix.",
      error: true
    });
  }
}