'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  return (
    <nav className="bg-gradient-to-r from-green-700 to-green-800 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center flex-wrap gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition">
            <span className="text-2xl">🕌</span>
            <span className="font-bold text-xl">{t('app.title')}</span>
          </Link>
          
          {/* Navigation */}
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/" className="hover:text-green-200 transition text-sm md:text-base">
              {t('nav.home')}
            </Link>
            <Link href="/dashboard" className="hover:text-green-200 transition text-sm md:text-base">
              {t('nav.dashboard')}
            </Link>
            <Link href="/assistant" className="hover:text-green-200 transition flex items-center gap-1 text-sm md:text-base">
              <MessageCircle size={18} />
              {t('nav.assistant')}
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link href="/submit" className="hover:text-green-200 transition font-semibold text-sm md:text-base">
                  {t('nav.submit')}
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link href="/admin" className="hover:text-green-200 transition text-sm md:text-base">
                    {t('nav.admin')}
                  </Link>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-sm bg-green-600 px-3 py-1 rounded-full">
                    {t('nav.welcome')} {user?.name}
                  </span>
                  <button
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition text-sm"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              </>
            ) : (
              <Link href="/login" className="bg-white text-green-700 px-4 py-1 rounded-lg hover:bg-gray-100 transition text-sm md:text-base">
                {t('nav.login')}
              </Link>
            )}
            
            {/* Sélecteur de langue */}
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-gray-400 text-sm">{t('footer.copyright')}</p>
            <p className="text-gray-500 text-xs mt-1">{t('footer.data')}</p>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition">{t('nav.home')}</Link>
            <Link href="/dashboard" className="hover:text-white transition">{t('nav.dashboard')}</Link>
            <Link href="/assistant" className="hover:text-white transition">{t('nav.assistant')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="theme-color" content="#2e7d32" />
        <meta name="description" content="Observatoire citoyen des prix dans les souks marocains" />
        <link rel="manifest" href="/manifest.json" />
        <title>Souk Data Mining - Observatoire des prix en milieu rural</title>
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <LanguageProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}