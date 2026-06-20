'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { MapPin, Save, AlertCircle } from 'lucide-react';

export default function SubmitPage() {
  const { isAuthenticated, token, user } = useAuth();
  const { t, language } = useLanguage();
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

  // Liste des produits (en français, utilisés pour la base de données)
  const products = [
    'Tomates', 'Oignons', 'Pommes de terre', 'Pommes', 
    'Poulet', 'Œufs', 'Carottes', 'Courgettes', 'Orange'
  ];

  // Traduction des produits
  const productTranslations: Record<string, Record<string, string>> = {
    fr: {
      'Tomates': 'Tomates',
      'Oignons': 'Oignons',
      'Pommes de terre': 'Pommes de terre',
      'Pommes': 'Pommes',
      'Poulet': 'Poulet',
      'Œufs': 'Œufs',
      'Carottes': 'Carottes',
      'Courgettes': 'Courgettes',
      'Orange': 'Orange'
    },
    ar: {
      'Tomates': 'طماطم',
      'Oignons': 'بصل',
      'Pommes de terre': 'بطاطس',
      'Pommes': 'تفاح',
      'Poulet': 'دجاج',
      'Œufs': 'بيض',
      'Carottes': 'جزر',
      'Courgettes': 'كوسا',
      'Orange': 'برتقال'
    }
  };

  // Fonction pour obtenir le nom du produit en fonction de la langue
  const getProductLabel = (productName: string) => {
    return productTranslations[language]?.[productName] || productName;
  };

  // Rediriger si non connecté
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

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

    if (!location.lat || !location.lng) {
      setError(t('submit.gps_required'));
      setLoading(false);
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      setError(t('submit.valid_price'));
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
        setSuccessMessage(data.message || t('submit.saved'));
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
        setProduct('');
        setPrice('');
        setQuantity('1');
        getLocation();
      } else if (response.status === 429) {
        setError(data.error);
        if (data.nextAllowed) {
          const nextDate = new Date(data.nextAllowed).toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR');
          setError(`${data.error}\n📅 ${t('submit.next_allowed')} : ${nextDate}`);
        }
        if (data.existingPrice) {
          setError(`${data.error}\n💰 ${t('submit.existing_price')} : ${data.existingPrice} DH`);
        }
      } else {
        setError(data.error || t('submit.save_error'));
      }
    } catch (err) {
      setError(t('submit.server_error'));
    } finally {
      setLoading(false);
    }
  };

  const simulateLocation = (lat: number, lng: number, cityName: string) => {
    setLocation({ lat, lng });
    setLocationStatus(`✅ ${t('submit.simulate')}: ${cityName} (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`);
  };

  if (!isAuthenticated) {
    return null;
  }

  const isRTL = language === 'ar';

  return (
    <div className={`bg-gray-50 min-h-screen py-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto max-w-md px-4">
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-green-700">
            ➕ {t('submit.title')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('submit.greeting')} {user?.name} !
          </p>
        </div>

        {submitted && successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-lg mb-6">
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-lg mb-6 whitespace-pre-line">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white p-4 rounded-lg shadow mb-6 border-l-4 border-green-500">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="text-green-600" size={20} />
            <span className="font-semibold">{t('submit.gps_status')}</span>
          </div>
          <p className="text-sm text-gray-600">{locationStatus}</p>
          <p className="text-xs text-gray-400 mt-1">{t('submit.gps_required_msg')}</p>
          
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => simulateLocation(30.4278, -9.5981, 'Agadir')} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
              📍 {t('submit.simulate')} Agadir
            </button>
            <button type="button" onClick={() => simulateLocation(33.5731, -7.5898, 'Casablanca')} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
              📍 {t('submit.simulate')} Casablanca
            </button>
            <button type="button" onClick={() => simulateLocation(31.6295, -7.9811, 'Marrakech')} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
              📍 {t('submit.simulate')} Marrakech
            </button>
            <button type="button" onClick={() => simulateLocation(35.7595, -5.8340, 'Tanger')} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
              📍 {t('submit.simulate')} Tanger
            </button>
            <button type="button" onClick={() => simulateLocation(34.0209, -6.8416, 'Rabat')} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
              📍 {t('submit.simulate')} Rabat
            </button>
            <button type="button" onClick={getLocation} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">
              🔄 {t('submit.gps_real')}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-5">
          <div>
            <label className="block font-semibold mb-2">{t('submit.product')} *</label>
            <div className="grid grid-cols-3 gap-2">
              {products.map((p) => {
                const displayName = getProductLabel(p);
                return (
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
                    {displayName}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-2">{t('submit.price')} *</label>
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

          <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500">
            <p className="font-semibold mb-1">{t('submit.rules_title')}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t('submit.rule1')}</li>
              <li>{t('submit.rule2')}</li>
              <li>{t('submit.rule3')}</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={!product || !price || loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {loading ? t('submit.saving') : t('submit.save')}
          </button>
        </form>
      </div>
    </div>
  );
}