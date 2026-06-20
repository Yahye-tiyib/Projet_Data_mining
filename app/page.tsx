'use client';

import dynamic from 'next/dynamic';
import { MapPin, TrendingUp, Users } from 'lucide-react';

// Chargement dynamique de la carte (évite les erreurs SSR)
const PriceMap = dynamic(() => import('@/components/PriceMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
      Chargement de la carte...
    </div>
  ),
});

export default function HomePage() {
  return (
    <div>
      {/* Section Hero */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Observatoire des prix en milieu rural
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Suivez l'inflation à la source dans les souks marocains
          </p>
          <a
            href="/submit"
            className="inline-block bg-white text-green-700 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition shadow-lg"
          >
            ✏️ Contribuer maintenant
          </a>
        </div>
      </section>
      {/* Guide étape par étape pour l'utilisateur */}
<section className="py-16 bg-white">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-bold text-center text-green-700 mb-8">
      📋 Comment saisir un prix en 3 étapes ?
    </h2>
    
    <div className="grid md:grid-cols-3 gap-8">
      
      {/* Étape 1 */}
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold text-blue-600">1</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">Créez un compte</h3>
        <p className="text-gray-600">
          Cliquez sur <strong>"Connexion"</strong> en haut à droite, puis{" "}
          <strong>"S'inscrire"</strong>. Remplissez votre email et mot de passe.
        </p>
        <div className="mt-3 text-sm text-gray-500">
          ⏱️ 1 minute
        </div>
      </div>

      {/* Étape 2 */}
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold text-blue-600">2</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">Connectez-vous</h3>
        <p className="text-gray-600">
          Utilisez votre email et mot de passe pour vous connecter. 
          Vous verrez alors le menu <strong>"Saisir un prix"</strong> apparaître.
        </p>
        <div className="mt-3 text-sm text-gray-500">
          🔐 Sécurisé
        </div>
      </div>

      {/* Étape 3 */}
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold text-blue-600">3</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">Saisissez un prix</h3>
        <p className="text-gray-600">
          Cliquez sur <strong>"Saisir un prix"</strong>, sélectionnez le produit, 
          entrez le prix observé et validez. Votre position GPS sera automatiquement capturée.
        </p>
        <div className="mt-3 text-sm text-gray-500">
          📍 10 secondes
        </div>
      </div>
    </div>

    {/* Bouton d'appel à l'action */}
    <div className="text-center mt-10">
      <a 
        href="/login" 
        className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition shadow-lg"
      >
        🚀 Commencer maintenant
      </a>
      <p className="text-sm text-gray-500 mt-3">
        Gratuit et ouvert à tous les citoyens
      </p>
    </div>
  </div>
</section>

{/* Section aide - Foire Aux Questions */}


      {/* Section Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Comment ça fonctionne ?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Collecte géolocalisée</h3>
              <p className="text-gray-600">
                Saisissez les prix que vous observez au souk. Votre position est automatiquement capturée.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Analyse automatique</h3>
              <p className="text-gray-600">
                Notre algorithme détecte les anomalies de prix et calcule l'inflation par région.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Impact citoyen</h3>
              <p className="text-gray-600">
                Les données sont accessibles à tous pour mieux comprendre et négocier les prix.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Carte interactive */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-green-700 text-white p-4">
              <h3 className="text-xl font-semibold">🗺️ Carte des prix - Tomates</h3>
              <p className="text-green-100 text-sm">🟢 Prix bas  🟡 Prix moyen  🔴 Prix élevé</p>
            </div>
            <div className="p-4">
              <PriceMap />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}