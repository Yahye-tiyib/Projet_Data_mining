'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { TrendingUp, TrendingDown, AlertCircle, Filter, MapPin } from 'lucide-react';

interface Observation {
  id: number;
  product: string;
  price: number;
  quantity: number;
  unit: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
}

interface ProductStats {
  name: string;
  currentPrice: number;
  previousPrice: number;
  variation: number;
  lastWeekPrice: number;
}

interface ComparisonResult {
  city1Price: number;
  city2Price: number;
  city1: string;
  city2: string;
  difference: number;
  savingsPerKg: number;
  savingsFor5kg: number;
  cheaperCity: string;
}

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('Tomates');
  const [products, setProducts] = useState<string[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity1, setSelectedCity1] = useState('');
  const [selectedCity2, setSelectedCity2] = useState('');
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);

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

  // Traduction des villes
  const cityTranslations: Record<string, Record<string, string>> = {
    fr: {
      'Tanger': 'Tanger',
      'Tétouan': 'Tétouan',
      'Chefchaouen': 'Chefchaouen',
      'Fès': 'Fès',
      'Meknès': 'Meknès',
      'Rabat': 'Rabat',
      'Casablanca': 'Casablanca',
      'Beni Mellal': 'Beni Mellal',
      'Marrakech': 'Marrakech',
      'Essaouira': 'Essaouira',
      'Agadir': 'Agadir',
      'Tiznit': 'Tiznit',
      'Laâyoune': 'Laâyoune',
      'Dakhla': 'Dakhla',
      'Autre': 'Autre'
    },
    ar: {
      'Tanger': 'طنجة',
      'Tétouan': 'تطوان',
      'Chefchaouen': 'شفشاون',
      'Fès': 'فاس',
      'Meknès': 'مكناس',
      'Rabat': 'الرباط',
      'Casablanca': 'الدار البيضاء',
      'Beni Mellal': 'بني ملال',
      'Marrakech': 'مراكش',
      'Essaouira': 'الصويرة',
      'Agadir': 'أكادير',
      'Tiznit': 'تزنيت',
      'Laâyoune': 'العيون',
      'Dakhla': 'الداخلة',
      'Autre': 'أخرى'
    }
  };

  const getProductLabel = (productName: string) => {
    return productTranslations[language]?.[productName] || productName;
  };

  const getCityLabel = (cityName: string) => {
    return cityTranslations[language]?.[cityName] || cityName;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/prices');
        const data = await response.json();
        setObservations(data);
        
        const uniqueProducts = [...new Set(data.map((obs: Observation) => obs.product))];
        setProducts(uniqueProducts);
        
        const uniqueCities = new Set<string>();
        data.forEach((obs: Observation) => {
          if (obs.latitude && obs.longitude) {
            const city = getCityFromCoordinates(obs.latitude, obs.longitude);
            if (city) uniqueCities.add(city);
          }
        });
        
        if (uniqueCities.size < 3) {
          const defaultCities = ['Tanger', 'Casablanca', 'Marrakech', 'Agadir', 'Fès', 'Rabat'];
          defaultCities.forEach(c => uniqueCities.add(c));
        }
        
        setCities(Array.from(uniqueCities).sort());
        setLoading(false);
      } catch (error) {
        console.error('Erreur:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCityFromCoordinates = (lat: number, lng: number): string => {
    if (lat > 35.5) return 'Tanger';
    if (lat > 35 && lat <= 35.5) return 'Tétouan';
    if (lat > 34.5 && lat <= 35) return 'Chefchaouen';
    if (lat > 34 && lat <= 34.5) return 'Fès';
    if (lat > 33.8 && lat <= 34) return 'Meknès';
    if (lat > 33.5 && lat <= 33.8) return 'Rabat';
    if (lat > 33.3 && lat <= 33.5) return 'Casablanca';
    if (lat > 32 && lat <= 33.3) return 'Beni Mellal';
    if (lat > 31.5 && lat <= 32) return 'Marrakech';
    if (lat > 30.5 && lat <= 31.5) return 'Essaouira';
    if (lat > 30 && lat <= 30.5) return 'Agadir';
    if (lat > 29 && lat <= 30) return 'Tiznit';
    if (lat > 28 && lat <= 29) return 'Laâyoune';
    if (lat > 27 && lat <= 28) return 'Dakhla';
    return 'Autre';
  };

  const getAveragePriceByCity = (product: string, city: string): number | null => {
    const cityObservations = observations.filter(obs => {
      if (obs.product !== product) return false;
      if (!obs.latitude || !obs.longitude) return false;
      const obsCity = getCityFromCoordinates(obs.latitude, obs.longitude);
      return obsCity === city;
    });
    
    if (cityObservations.length === 0) return null;
    const sum = cityObservations.reduce((acc, obs) => acc + obs.price, 0);
    return sum / cityObservations.length;
  };

  useEffect(() => {
    if (observations.length === 0) return;

    const productObs = observations.filter(obs => obs.product === selectedProduct);
    if (productObs.length === 0) return;

    const sorted = [...productObs].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const currentPrice = sorted[sorted.length - 1].price;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const lastWeekObs = sorted.filter(obs => new Date(obs.createdAt) <= oneWeekAgo);
    const lastWeekPrice = lastWeekObs.length > 0 ? lastWeekObs[lastWeekObs.length - 1].price : currentPrice;
    const previousPrice = sorted.length > 1 ? sorted[sorted.length - 2].price : currentPrice;
    const dailyVariation = ((currentPrice - previousPrice) / previousPrice) * 100;

    setStats({
      name: selectedProduct,
      currentPrice,
      previousPrice,
      variation: dailyVariation,
      lastWeekPrice,
    });
  }, [selectedProduct, observations]);

  const handleCompare = () => {
    if (!selectedCity1 || !selectedCity2) {
      alert(t('dashboard.select_cities'));
      return;
    }
    
    const price1 = getAveragePriceByCity(selectedProduct, selectedCity1);
    const price2 = getAveragePriceByCity(selectedProduct, selectedCity2);
    
    if (!price1 || !price2) {
      alert(`${t('dashboard.no_data_city')} ${getProductLabel(selectedProduct)} ${t('dashboard.between')} ${getCityLabel(selectedCity1)} ${t('dashboard.and')} ${getCityLabel(selectedCity2)}`);
      return;
    }
    
    const difference = Math.abs(price1 - price2);
    const cheaperCity = price1 < price2 ? selectedCity1 : selectedCity2;
    const savingsPerKg = difference;
    const savingsFor5kg = difference * 5;
    
    setComparison({
      city1Price: price1,
      city2Price: price2,
      city1: selectedCity1,
      city2: selectedCity2,
      difference,
      savingsPerKg,
      savingsFor5kg,
      cheaperCity,
    });
  };

  const getChartData = () => {
    const productObs = observations.filter(obs => obs.product === selectedProduct);
    return [...productObs].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    ).slice(-10);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  const chartData = getChartData();
  const isRTL = language === 'ar';

  return (
    <div className={`min-h-screen bg-gray-50 py-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4">
        
        <h1 className={`text-3xl font-bold text-green-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
          📊 {t('dashboard.title')}
        </h1>
        <p className={`text-gray-600 mb-8 ${isRTL ? 'text-right' : ''}`}>
          {t('dashboard.subtitle')}
        </p>

        {/* Filtres */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={20} className="text-gray-500" />
            <span className="font-semibold">{t('dashboard.filters')}</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.product')}</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="border rounded-lg p-2 w-48"
              >
                {products.map(p => (
                  <option key={p} value={p}>{getProductLabel(p)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Comparateur */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={24} className="text-green-600" />
            <h2 className="text-xl font-bold">🏙️ {t('dashboard.comparator')}</h2>
          </div>
          
          <p className="text-gray-600 text-sm mb-4">
            {t('dashboard.compare_text')} <strong>{getProductLabel(selectedProduct)}</strong> {t('dashboard.between_cities')}
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📍 {t('dashboard.city1')}</label>
              <select
                value={selectedCity1}
                onChange={(e) => setSelectedCity1(e.target.value)}
                className="w-full border rounded-lg p-2"
              >
                <option value="">{t('dashboard.select_city')}</option>
                {cities.map(city => (
                  <option key={city} value={city}>{getCityLabel(city)}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📍 {t('dashboard.city2')}</label>
              <select
                value={selectedCity2}
                onChange={(e) => setSelectedCity2(e.target.value)}
                className="w-full border rounded-lg p-2"
              >
                <option value="">{t('dashboard.select_city')}</option>
                {cities.map(city => (
                  <option key={city} value={city}>{getCityLabel(city)}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            onClick={handleCompare}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            {t('dashboard.compare')}
          </button>
          
          {comparison && (
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <div className="text-center flex-1">
                  <p className="font-bold text-lg text-gray-700">{getCityLabel(comparison.city1)}</p>
                  <div className="inline-block bg-red-100 rounded-lg px-4 py-2 mt-2">
                    <p className="text-2xl font-bold text-red-600">{comparison.city1Price.toFixed(2)} DH</p>
                    <p className="text-xs text-gray-500">{t('dashboard.avg_price')}</p>
                  </div>
                </div>
                
                <div className="text-center px-4">
                  <p className="text-gray-500 font-bold">VS</p>
                  <div className="w-12 h-0.5 bg-gray-300 my-2"></div>
                </div>
                
                <div className="text-center flex-1">
                  <p className="font-bold text-lg text-gray-700">{getCityLabel(comparison.city2)}</p>
                  <div className="inline-block bg-green-100 rounded-lg px-4 py-2 mt-2">
                    <p className="text-2xl font-bold text-green-600">{comparison.city2Price.toFixed(2)} DH</p>
                    <p className="text-xs text-gray-500">{t('dashboard.avg_price')}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                {comparison.city1Price > comparison.city2Price ? (
                  <>
                    <p className="text-green-700 font-semibold text-lg">
                      💰 {t('dashboard.savings')} : {comparison.difference.toFixed(2)} DH/kg
                    </p>
                    <p className="text-green-600">
                      {((comparison.difference / comparison.city1Price) * 100).toFixed(0)}% {t('dashboard.cheaper_at')} <strong>{getCityLabel(comparison.city2)}</strong>
                    </p>
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-green-700">
                        🛒 <strong>{t('dashboard.for_5kg')}</strong> : {t('dashboard.you_save')} <strong>{comparison.savingsFor5kg.toFixed(2)} DH</strong>
                      </p>
                      <p className="text-green-600 text-sm mt-1">
                        {t('dashboard.by_buying_at')} {getCityLabel(comparison.city2)} {t('dashboard.instead_of')} {getCityLabel(comparison.city1)}
                      </p>
                    </div>
                  </>
                ) : comparison.city2Price > comparison.city1Price ? (
                  <>
                    <p className="text-green-700 font-semibold text-lg">
                      💰 {t('dashboard.savings')} : {comparison.difference.toFixed(2)} DH/kg
                    </p>
                    <p className="text-green-600">
                      {((comparison.difference / comparison.city2Price) * 100).toFixed(0)}% {t('dashboard.cheaper_at')} <strong>{getCityLabel(comparison.city1)}</strong>
                    </p>
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-green-700">
                        🛒 <strong>{t('dashboard.for_5kg')}</strong> : {t('dashboard.you_save')} <strong>{comparison.savingsFor5kg.toFixed(2)} DH</strong>
                      </p>
                      <p className="text-green-600 text-sm mt-1">
                        {t('dashboard.by_buying_at')} {getCityLabel(comparison.city1)} {t('dashboard.instead_of')} {getCityLabel(comparison.city2)}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-blue-700 font-semibold">📊 {t('dashboard.same_price')}</p>
                    <p className="text-blue-600 text-sm mt-1">{t('dashboard.same_price_advice')}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500 text-sm">💰 {t('dashboard.current_price')}</p>
              <p className="text-2xl font-bold text-green-700">{stats.currentPrice.toFixed(2)} DH</p>
              <p className="text-xs text-gray-400">{t('dashboard.per_unit')}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500 text-sm">📅 {t('dashboard.last_week')}</p>
              <p className="text-2xl font-bold text-orange-600">{stats.lastWeekPrice.toFixed(2)} DH</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500 text-sm">📈 {t('dashboard.variation')}</p>
              <div className="flex items-center gap-1">
                {stats.variation > 0 ? (
                  <TrendingUp className="text-red-500" size={24} />
                ) : stats.variation < 0 ? (
                  <TrendingDown className="text-green-500" size={24} />
                ) : (
                  <span className="text-gray-500 text-xl">→</span>
                )}
                <p className={`text-2xl font-bold ${stats.variation > 0 ? 'text-red-600' : stats.variation < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                  {stats.variation > 0 ? '+' : ''}{stats.variation.toFixed(1)}%
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500 text-sm">📊 {t('dashboard.count')}</p>
              <p className="text-2xl font-bold text-blue-600">{observations.filter(o => o.product === selectedProduct).length}</p>
            </div>
          </div>
        )}

        {/* Graphique */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">📈 {t('dashboard.evolution')} - {getProductLabel(selectedProduct)}</h2>
          
          {chartData.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="min-w-[500px]">
                <div className="space-y-3">
                  {chartData.map((obs, index) => {
                    const maxPrice = Math.max(...chartData.map(o => o.price), 1);
                    const widthPercentage = (obs.price / maxPrice) * 100;
                    const date = new Date(obs.createdAt).toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR');
                    
                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{date}</span>
                          <span className="font-semibold text-gray-700">{obs.price.toFixed(2)} DH</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-8">
                          <div
                            className={`h-8 rounded-full flex items-center justify-end pr-3 text-xs text-white font-medium ${
                              obs.price > (stats?.lastWeekPrice || 0) ? 'bg-red-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${widthPercentage}%` }}
                          >
                            {widthPercentage > 15 && `${obs.price.toFixed(0)} DH`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">{t('dashboard.no_data')}</p>
          )}
        </div>

        {/* Analyse */}
        {stats && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-3">📊 {t('dashboard.analysis')}</h3>
              
              {stats.variation > 10 ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-700 font-semibold">⚠️ {t('dashboard.alert_high')}</p>
                  <p className="text-red-600 text-sm mt-1">
                    {t('dashboard.price_increased')} {stats.variation.toFixed(1)}% {t('dashboard.this_week')}.
                    {stats.variation > 20 && ` ${t('dashboard.exceptionnal_increase')}`}
                  </p>
                </div>
              ) : stats.variation < -5 ? (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-green-700 font-semibold">✅ {t('dashboard.good_news')}</p>
                  <p className="text-green-600 text-sm mt-1">
                    {t('dashboard.price_decreased')} {Math.abs(stats.variation).toFixed(1)}% {t('dashboard.this_week')}.
                    {t('dashboard.good_time_to_buy')}
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-blue-700 font-semibold">📊 {t('dashboard.stable')}</p>
                  <p className="text-blue-600 text-sm mt-1">
                    {t('dashboard.stable_this_week')}
                  </p>
                </div>
              )}
              
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>📅 {t('dashboard.last_observation')} : {new Date().toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR')}</p>
                <p>💡 {t('dashboard.compare_advice')}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-3">💡 {t('dashboard.recommendations')}</h3>
              <ul className="space-y-3">
                {stats.variation > 15 && (
                  <li className="flex items-start gap-2 text-orange-700">
                    <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('dashboard.avoid_buying')}</span>
                  </li>
                )}
                {stats.variation < -5 && (
                  <li className="flex items-start gap-2 text-green-700">
                    <TrendingDown size={18} className="mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('dashboard.buy_now')}</span>
                  </li>
                )}
                {comparison && comparison.city1Price !== comparison.city2Price && (
                  <li className="flex items-start gap-2 text-blue-700">
                    <MapPin size={18} className="mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      {t('dashboard.price_is')} {comparison.difference.toFixed(2)} DH {t('dashboard.cheaper_at')} {getCityLabel(comparison.cheaperCity)}. 
                      {comparison.savingsFor5kg > 20 && ` ${t('dashboard.save_on_5kg')} ${comparison.savingsFor5kg.toFixed(2)} DH !`}
                    </span>
                  </li>
                )}
                <li className="flex items-start gap-2 text-gray-600">
                  <span>🔄</span>
                  <span className="text-sm">{t('dashboard.participate')}</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {observations.length === 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg text-center">
            <p className="text-yellow-700">📭 {t('dashboard.no_data_available')}</p>
            <a href="/submit" className="inline-block mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              ✏️ {t('dashboard.add_price')}
            </a>
          </div>
        )}

      </div>
    </div>
  );
}