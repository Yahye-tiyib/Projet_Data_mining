'use client';

import dynamic from 'next/dynamic';
import { useLanguage } from '@/context/LanguageContext';

// Chargement dynamique de la carte
const PriceMap = dynamic(() => import('@/components/PriceMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
      Chargement de la carte...
    </div>
  ),
});

export default function HomePage() {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <div className={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Section Hero */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('home.hero_title')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            {t('home.hero_subtitle')}
          </p>
          <a
            href="/submit"
            className="inline-block bg-white text-green-700 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition shadow-lg"
          >
            {t('home.cta')}
          </a>
        </div>
      </section>

      {/* Section Comment ça fonctionne */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('home.how_it_works')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.step1_title')}</h3>
              <p className="text-gray-600">{t('home.step1_desc')}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.step2_title')}</h3>
              <p className="text-gray-600">{t('home.step2_desc')}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.step3_title')}</h3>
              <p className="text-gray-600">{t('home.step3_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Guide 3 étapes */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-green-700 mb-8">
            {t('home.guide_title')}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Étape 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.step_account')}</h3>
              <p className="text-gray-600">{t('home.step_account_desc')}</p>
            </div>

            {/* Étape 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.step_login')}</h3>
              <p className="text-gray-600">{t('home.step_login_desc')}</p>
            </div>

            {/* Étape 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.step_submit')}</h3>
              <p className="text-gray-600">{t('home.step_submit_desc')}</p>
            </div>
          </div>

          {/* Bouton */}
          <div className="text-center mt-10">
            <a href="/login" className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition shadow-lg">
              {t('home.start_now')}
            </a>
            <p className="text-sm text-gray-500 mt-3">{t('home.free')}</p>
          </div>
        </div>
      </section>

      {/* Section FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            {t('home.faq_title')}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold text-green-700">{t('home.faq1_q')}</h3>
              <p className="text-gray-600 text-sm mt-1">{t('home.faq1_a')}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold text-green-700">{t('home.faq2_q')}</h3>
              <p className="text-gray-600 text-sm mt-1">{t('home.faq2_a')}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold text-green-700">{t('home.faq3_q')}</h3>
              <p className="text-gray-600 text-sm mt-1">{t('home.faq3_a')}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold text-green-700">{t('home.faq4_q')}</h3>
              <p className="text-gray-600 text-sm mt-1">{t('home.faq4_a')}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold text-green-700">{t('home.faq5_q')}</h3>
              <p className="text-gray-600 text-sm mt-1">{t('home.faq5_a')}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold text-green-700">{t('home.faq6_q')}</h3>
              <p className="text-gray-600 text-sm mt-1">{t('home.faq6_a')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Carte */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-green-700 text-white p-4">
              <h3 className="text-xl font-semibold">🗺️ {t('home.map_title') || 'Carte des prix'}</h3>
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