'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Filter, MapPin } from 'lucide-react';

// Types pour les données
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
  const [observations, setObservations] = useState<Observation[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('Tomates');
  const [products, setProducts] = useState<string[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // États pour le comparateur
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity1, setSelectedCity1] = useState('');
  const [selectedCity2, setSelectedCity2] = useState('');
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);

  // Récupérer les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/prices');
        const data = await response.json();
        setObservations(data);
        
        // Extraire la liste des produits uniques
        const uniqueProducts = [...new Set(data.map((obs: Observation) => obs.product))];
        setProducts(uniqueProducts);
        
        // Extraire les villes à partir des coordonnées GPS
        const uniqueCities = new Set<string>();
        data.forEach((obs: Observation) => {
          if (obs.latitude && obs.longitude) {
            const city = getCityFromCoordinates(obs.latitude, obs.longitude);
            if (city) uniqueCities.add(city);
          }
        });
        
        // Ajouter des villes par défaut si pas assez de données
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

  // Fonction pour déterminer la ville à partir des coordonnées
  const getCityFromCoordinates = (lat: number, lng: number): string => {
    // Approximation des villes marocaines (à améliorer avec une vraie géolocalisation)
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

  // Fonction pour obtenir le prix moyen par ville
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

  // Calculer les statistiques quand le produit change
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

  // Fonction pour comparer les villes
  const handleCompare = () => {
    if (!selectedCity1 || !selectedCity2) {
      alert('Veuillez sélectionner deux villes');
      return;
    }
    
    const price1 = getAveragePriceByCity(selectedProduct, selectedCity1);
    const price2 = getAveragePriceByCity(selectedProduct, selectedCity2);
    
    if (!price1 || !price2) {
      alert(`Données insuffisantes pour comparer ${selectedProduct} entre ${selectedCity1} et ${selectedCity2}`);
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

  // Données pour le graphique
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
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  const chartData = getChartData();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        
        {/* Titre */}
        <h1 className="text-3xl font-bold text-green-700 mb-2">📊 Tableau de bord</h1>
        <p className="text-gray-600 mb-8">Analysez l'évolution des prix en milieu rural</p>

        {/* Filtres */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={20} className="text-gray-500" />
            <span className="font-semibold">Filtres</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="border rounded-lg p-2 w-48"
              >
                {products.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* COMPARATEUR DE PRIX ENTRE VILLES */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={24} className="text-green-600" />
            <h2 className="text-xl font-bold">🏙️ Comparateur de prix par ville</h2>
          </div>
          
          <p className="text-gray-600 text-sm mb-4">
            Comparez les prix de <strong>{selectedProduct}</strong> entre deux villes pour faire le meilleur choix d'achat.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📍 Ville 1</label>
              <select
                value={selectedCity1}
                onChange={(e) => setSelectedCity1(e.target.value)}
                className="w-full border rounded-lg p-2"
              >
                <option value="">Sélectionner une ville</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📍 Ville 2</label>
              <select
                value={selectedCity2}
                onChange={(e) => setSelectedCity2(e.target.value)}
                className="w-full border rounded-lg p-2"
              >
                <option value="">Sélectionner une ville</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            onClick={handleCompare}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Comparer les prix
          </button>
          
          {/* Résultats de la comparaison */}
          {comparison && (
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <div className="text-center flex-1">
                  <p className="font-bold text-lg text-gray-700">{comparison.city1}</p>
                  <div className="inline-block bg-red-100 rounded-lg px-4 py-2 mt-2">
                    <p className="text-2xl font-bold text-red-600">{comparison.city1Price.toFixed(2)} DH</p>
                    <p className="text-xs text-gray-500">prix moyen</p>
                  </div>
                </div>
                
                <div className="text-center px-4">
                  <p className="text-gray-500 font-bold">VS</p>
                  <div className="w-12 h-0.5 bg-gray-300 my-2"></div>
                </div>
                
                <div className="text-center flex-1">
                  <p className="font-bold text-lg text-gray-700">{comparison.city2}</p>
                  <div className="inline-block bg-green-100 rounded-lg px-4 py-2 mt-2">
                    <p className="text-2xl font-bold text-green-600">{comparison.city2Price.toFixed(2)} DH</p>
                    <p className="text-xs text-gray-500">prix moyen</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                {comparison.city1Price > comparison.city2Price ? (
                  <>
                    <p className="text-green-700 font-semibold text-lg">
                      💰 Économie : {comparison.difference.toFixed(2)} DH/kg
                    </p>
                    <p className="text-green-600">
                      {((comparison.difference / comparison.city1Price) * 100).toFixed(0)}% moins cher à <strong>{comparison.city2}</strong>
                    </p>
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-green-700">
                        🛒 <strong>Pour 5 kg</strong> : vous économisez <strong>{comparison.savingsFor5kg.toFixed(2)} DH</strong>
                      </p>
                      <p className="text-green-600 text-sm mt-1">
                        En achetant à {comparison.city2} plutôt qu'à {comparison.city1}
                      </p>
                    </div>
                  </>
                ) : comparison.city2Price > comparison.city1Price ? (
                  <>
                    <p className="text-green-700 font-semibold text-lg">
                      💰 Économie : {comparison.difference.toFixed(2)} DH/kg
                    </p>
                    <p className="text-green-600">
                      {((comparison.difference / comparison.city2Price) * 100).toFixed(0)}% moins cher à <strong>{comparison.city1}</strong>
                    </p>
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-green-700">
                        🛒 <strong>Pour 5 kg</strong> : vous économisez <strong>{comparison.savingsFor5kg.toFixed(2)} DH</strong>
                      </p>
                      <p className="text-green-600 text-sm mt-1">
                        En achetant à {comparison.city1} plutôt qu'à {comparison.city2}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-blue-700 font-semibold">📊 Prix identiques dans les deux villes</p>
                    <p className="text-blue-600 text-sm mt-1">Achetez dans celle qui vous est la plus proche</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-xs text-gray-400 text-center">
                Basé sur les observations disponibles dans la base de données
              </div>
            </div>
          )}
        </div>

        {/* Cartes statistiques */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500 text-sm">💰 Prix actuel</p>
              <p className="text-2xl font-bold text-green-700">{stats.currentPrice.toFixed(2)} DH</p>
              <p className="text-xs text-gray-400">par unité</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500 text-sm">📅 Prix (semaine dernière)</p>
              <p className="text-2xl font-bold text-orange-600">{stats.lastWeekPrice.toFixed(2)} DH</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500 text-sm">📈 Variation (semaine)</p>
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
              <p className="text-gray-500 text-sm">📊 Nombre d'observations</p>
              <p className="text-2xl font-bold text-blue-600">{observations.filter(o => o.product === selectedProduct).length}</p>
            </div>
          </div>
        )}

        {/* Graphique d'évolution */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">📈 Évolution des prix - {selectedProduct}</h2>
          
          {chartData.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="min-w-[500px]">
                <div className="space-y-3">
                  {chartData.map((obs, index) => {
                    const maxPrice = Math.max(...chartData.map(o => o.price), 1);
                    const widthPercentage = (obs.price / maxPrice) * 100;
                    const date = new Date(obs.createdAt).toLocaleDateString('fr-FR');
                    
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
            <p className="text-gray-500 text-center py-8">Aucune donnée pour ce produit</p>
          )}
        </div>

        {/* Analyse et recommandations */}
        {stats && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-3">📊 Analyse</h3>
              
              {stats.variation > 10 ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-700 font-semibold">⚠️ Alerte hausse significative</p>
                  <p className="text-red-600 text-sm mt-1">
                    Le prix a augmenté de {stats.variation.toFixed(1)}% cette semaine.
                    {stats.variation > 20 && " Une augmentation exceptionnelle !"}
                  </p>
                </div>
              ) : stats.variation < -5 ? (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-green-700 font-semibold">✅ Bonne nouvelle</p>
                  <p className="text-green-600 text-sm mt-1">
                    Le prix a baissé de {Math.abs(stats.variation).toFixed(1)}% cette semaine.
                    C'est le moment d'acheter !
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-blue-700 font-semibold">📊 Prix stable</p>
                  <p className="text-blue-600 text-sm mt-1">
                    Le prix est stable cette semaine.
                  </p>
                </div>
              )}
              
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>📅 Dernière observation : {new Date().toLocaleDateString('fr-FR')}</p>
                <p>💡 Conseil : Utilisez le comparateur ci-dessus pour trouver la ville la moins chère.</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-3">💡 Recommandations</h3>
              <ul className="space-y-3">
                {stats.variation > 15 && (
                  <li className="flex items-start gap-2 text-orange-700">
                    <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Évitez d'acheter ce produit cette semaine, le prix est anormalement élevé.</span>
                  </li>
                )}
                {stats.variation < -5 && (
                  <li className="flex items-start gap-2 text-green-700">
                    <TrendingDown size={18} className="mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Profitez de la baisse des prix pour faire des réserves.</span>
                  </li>
                )}
                {comparison && comparison.city1Price !== comparison.city2Price && (
                  <li className="flex items-start gap-2 text-blue-700">
                    <MapPin size={18} className="mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      Le prix est {comparison.difference.toFixed(2)} DH moins cher à {comparison.cheaperCity}. 
                      {comparison.savingsFor5kg > 20 && ` Une économie de ${comparison.savingsFor5kg.toFixed(2)} DH pour 5 kg !`}
                    </span>
                  </li>
                )}
                <li className="flex items-start gap-2 text-gray-600">
                  <span>🔄</span>
                  <span className="text-sm">Participez en saisissant des prix pour améliorer les prévisions.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Message si pas de données */}
        {observations.length === 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg text-center">
            <p className="text-yellow-700">📭 Aucune donnée disponible pour le moment</p>
            <a href="/submit" className="inline-block mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              ✏️ Saisir un prix
            </a>
          </div>
        )}

      </div>
    </div>
  );
}