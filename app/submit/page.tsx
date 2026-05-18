'use client';

import { useState, useEffect } from 'react';
import { MapPin, Save, AlertCircle } from 'lucide-react';

export default function SubmitPage() {
  const [product, setProduct] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('kg');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [locationStatus, setLocationStatus] = useState('En attente du GPS...');

  const products = [
    'Tomates', 'Oignons', 'Pommes de terre', 'Pommes', 
    'Poulet', 'Œufs', 'Carottes', 'Courgettes', 'Orange'
  ];

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
        console.error('Erreur GPS:', err);
        setLocationStatus(`❌ Erreur: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Charger la position au démarrage
  useEffect(() => {
    getLocation();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(observation),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
        
        // Réinitialisation
        setProduct('');
        setPrice('');
        setQuantity('1');
        
        // Re-capturer la position
        getLocation();
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Fonctions de simulation GPS
  const simulateLocation = (lat: number, lng: number, cityName: string) => {
    setLocation({ lat, lng });
    setLocationStatus(`✅ Simulation: ${cityName} (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto max-w-md px-4">
        <h1 className="text-2xl font-bold text-green-700 mb-6">➕ Nouvelle observation</h1>

        {/* Carte GPS */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 border-l-4 border-green-500">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="text-green-600" size={20} />
            <span className="font-semibold">Position actuelle</span>
          </div>
          <p className="text-sm text-gray-600">{locationStatus}</p>
          
          {/* Boutons de simulation (pour les tests) */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => simulateLocation(30.4278, -9.5981, 'Agadir')}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition"
            >
              📍 Simuler Agadir
            </button>
            <button
              type="button"
              onClick={() => simulateLocation(33.5731, -7.5898, 'Casablanca')}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition"
            >
              📍 Simuler Casablanca
            </button>
            <button
              type="button"
              onClick={() => simulateLocation(31.6295, -7.9811, 'Marrakech')}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition"
            >
              📍 Simuler Marrakech
            </button>
            <button
              type="button"
              onClick={() => simulateLocation(35.7595, -5.8340, 'Tanger')}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition"
            >
              📍 Simuler Tanger
            </button>
            <button
              type="button"
              onClick={() => simulateLocation(34.0209, -6.8416, 'Rabat')}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition"
            >
              📍 Simuler Rabat
            </button>
            <button
              type="button"
              onClick={getLocation}
              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition"
            >
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
                className="flex-1 p-2 border rounded-lg"
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

          {/* Bouton submit */}
          <button
            type="submit"
            disabled={!product || !price || loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {loading ? 'Enregistrement...' : 'Enregistrer l\'observation'}
          </button>

          {/* Message de confirmation */}
          {submitted && (
            <div className="bg-green-100 text-green-700 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={18} />
              ✅ Observation enregistrée avec succès !
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
        </form>

        {/* Info test */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          💡 Pour tester la comparaison : ajoutez le même produit dans différentes villes
        </div>
      </div>
    </div>
  );
}