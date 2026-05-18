'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

export default function PriceMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [observations, setObservations] = useState<any[]>([]);

  // Récupération des données depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/prices');
      const data = await response.json();
      setObservations(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!mapRef.current || observations.length === 0) return;

    const initMap = async () => {
      const L = await import('leaflet');

      // Correction des icônes
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!).setView([31.7917, -7.0926], 6);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      }).addTo(map);

      // Grouper les observations par souk (simulation - à améliorer avec une vraie table de souks)
      const pricesByLocation = new Map();
      
      observations.forEach(obs => {
        if (obs.latitude && obs.longitude) {
          const key = `${obs.latitude},${obs.longitude}`;
          if (!pricesByLocation.has(key)) {
            pricesByLocation.set(key, {
              lat: obs.latitude,
              lng: obs.longitude,
              prices: [],
              count: 0
            });
          }
          const location = pricesByLocation.get(key);
          location.prices.push(obs.price);
          location.count++;
        }
      });

      // Ajout des marqueurs
      pricesByLocation.forEach((location) => {
        const avgPrice = location.prices.reduce((a: number, b: number) => a + b, 0) / location.prices.length;
        
        const getColor = () => {
          if (avgPrice <= 4) return '#22c55e';
          if (avgPrice <= 8) return '#f97316';
          return '#ef4444';
        };

        const customIcon = L.divIcon({
          html: `<div style="background-color: ${getColor()}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px black;"></div>`,
          iconSize: [12, 12],
          className: 'custom-marker',
        });

        L.marker([location.lat, location.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <b>Prix moyen</b><br/>
            ${avgPrice.toFixed(2)} DH/kg<br/>
            ${location.count} observation(s)
          `);
      });
    };

    initMap();
  }, [observations]);

  return <div ref={mapRef} className="w-full h-[500px] rounded-lg shadow-lg" />;
}