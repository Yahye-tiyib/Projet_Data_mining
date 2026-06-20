'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { MapPin, Save, AlertCircle, Info } from 'lucide-react';

export default function SubmitPage() {
  const { isAuthenticated, token, user } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('kg');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [locationStatus, setLocationStatus] = useState('En attente du GPS...');
  const [dailyLimit, setDailyLimit] = useState({ todayCount: 0, nextAllowed: null });

  const products = [
    'Tomates', 'Oignons', 'Pommes de terre', 'Pommes', 
    'Poulet', 'Œufs', 'Carottes', 'Courgettes', 'Orange'
  ];

  // Rediriger si non authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Récupérer les statistiques de l'utilisateur
  useEffect(() => {
    if (token) {
      fetch('/api/user/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.todayCount !== undefined) {
            setDailyLimit(data);
          }
        })
        .catch(err => console.error('Erreur stats:', err));
    }
  }, [token]);

  // Fonction pour obtenir la position GPS
  const getLocation = () => {
    setLocationStatus('Récupération de la position...');
    
    if (!navigator.geolocation) {
      setLocationStatus('❌ Géolocalisation non supportée');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationStatus(`✅ Position capturée: ${position.coords.latitude.toFixed(4)}°, ${position.coords.longitude.toFixed(4)}°`);
      },
      (err) => {
        setLocationStatus(`❌ Erreur: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Vérifier que la position GPS est capturée
    if (!location.lat || !location.lng) {
      setError('📍 Veuillez activer votre GPS ou simuler une position');
      setLoading(false);
      return;
    }

    // Vérifier que le prix est valide
    if (!price || parseFloat(price) <= 0) {
      setError('💰 Veuillez entrer un prix valide');
      setLoading(false);
      return;
    }

    const observation = {
      product,
      price: parseFloat(price),
      quantity: parseFloat(quantity),
      unit,
      latitude: location.lat,
      longitude: location.lng,
    };

    try {
      const response = await fetch('/api/prices', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(observation),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || '✅ Observation enregistrée avec succès !');
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
        setProduct('');
        setPrice('');
        setQuantity('1');
        getLocation();
        
        // Mettre à jour les statistiques
        setDailyLimit(prev => ({ ...prev, todayCount: prev.todayCount + 1 }));
        
      } else if (response.status === 429) {
        // Limite atteinte (utilisateur ou emplacement)
        setError(data.error);
        if (data.nextAllowed) {
          const nextDate = new Date(data.nextAllowed).toLocaleDateString('fr-FR');
          setError(`${data.error}\n📅 Prochaine saisie possible : ${nextDate}`);
        }
        if (data.existingPrice) {
          setError(`${data.error}\n💰 Prix existant aujourd'hui : ${data.existingPrice} DH`);
        }
      } else {
        setError(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (err) {
      setError('❌ Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const simulateLocation = (lat: number, lng: number, cityName: string) => {
    setLocation({ lat, lng });
    setLocationStatus(`✅ Simulation: ${cityName} (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto max-w-md px-4">
        
        {/* En-tête */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-green-700">
            ➕ Nouvelle observation
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Bonjour {user?.name} ! Contribuez à la base de données citoyenne
          </p>
        </div>

        {/* Message de limite quotidienne */}
        {dailyLimit.todayCount > 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <Info size={18} className="text-blue-600" />
              <p className="text-blue-700 text-sm font-medium">
                📊 Vous avez déjà saisi {dailyLimit.todayCount} prix aujourd'hui.
              </p>
            </div>
            <p className="text-blue-600 text-xs mt-1">
              ⚠️ Un seul prix par produit et par jour est autorisé.
            </p>
          </div>
        )}

        {/* Message de succès */}
        {submitted && successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-lg mb-6">
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-lg mb-6 whitespace-pre-line">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Carte GPS */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 border-l-4 border-green-500">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="text-green-600" size={20} />
            <span className="font-semibold">📍 Position actuelle</span>
          </div>
          <p className="text-sm text-gray-600">{locationStatus}</p>
          <p className="text-xs text-gray-400 mt-1">
            ⚠️ La position est obligatoire pour valider le prix
          </p>
          
          {/* Boutons de simulation */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => simulateLocation(30.4278, -9.5981, 'Agadir')} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
              📍 Simuler Agadir
            </button>
            <button type="button" onClick={() => simulateLocation(33.5731, -7.5898, 'Casablanca')} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
              📍 Simuler Casablanca
            </button>
            <button type="button" onClick={() => simulateLocation(31.6295, -7.9811, 'Marrakech')} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
              📍 Simuler Marrakech
            </button>
            <button type="button" onClick={() => simulateLocation(35.7595, -5.8340, 'Tanger')} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
              📍 Simuler Tanger
            </button>
            <button type="button" onClick={() => simulateLocation(34.0209, -6.8416, 'Rabat')} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
              📍 Simuler Rabat
            </button>
            <button type="button" onClick={getLocation} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">
              🔄 GPS réel
            </button>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-5">
          
          {/* Produit */}
          <div>
            <label className="block font-semibold mb-2">🛒 Produit *</label>
            <div className="grid grid-cols-3 gap-2">
              {products.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProduct(p)}
                  className={`py-2 px-3 text-sm rounded-lg border transition ${
                    product === p
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Prix */}
          <div>
            <label className="block font-semibold mb-2">💰 Prix *</label>
            <div className="flex gap-3">
              <input
                type="number"
                step="0.5"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="0.00"
                required
              />
              <input
                type="number"
                step="0.5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-20 p-2 border rounded-lg"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-24 p-2 border rounded-lg bg-white"
              >
                <option>kg</option>
                <option>L</option>
                <option>pièce</option>
              </select>
            </div>
          </div>

          {/* Rappel des règles */}
          <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500">
            <p className="font-semibold mb-1">📋 Règles de contribution :</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Un seul prix par produit et par jour pour chaque utilisateur</li>
              <li>Un seul prix par emplacement et par jour pour chaque produit</li>
              <li>La position GPS est obligatoire</li>
            </ul>
          </div>

          {/* Bouton submit */}
          <button
            type="submit"
            disabled={!product || !price || loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {loading ? 'Enregistrement...' : 'Enregistrer l\'observation'}
          </button>

        </form>
      </div>
    </div>
  );
}