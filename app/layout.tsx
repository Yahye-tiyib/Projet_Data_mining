'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-green-700 to-green-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center flex-wrap gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition">
            <span className="text-2xl">🕌</span>
            <span className="font-bold text-xl">Souk Data Mining</span>
          </Link>
          
          {/* Navigation */}
          <div className="flex items-center gap-6 flex-wrap">
            <Link href="/" className="hover:text-green-200 transition">
              Accueil
            </Link>
            <Link href="/dashboard" className="hover:text-green-200 transition">
              Dashboard
            </Link>
            <Link href="/assistant" className="hover:text-green-200 transition flex items-center gap-1">
  <MessageCircle size={18} />
  Assistant IA
</Link>
            
            {isAuthenticated ? (
              <>
                <Link href="/submit" className="hover:text-green-200 transition font-semibold flex items-center gap-1">
                  ✏️ Saisir un prix
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link href="/admin" className="hover:text-green-200 transition flex items-center gap-1">
                    👑 Admin
                  </Link>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-sm bg-green-600 px-3 py-1 rounded-full">
                    👤 {user?.name}
                  </span>
                  <button
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition text-sm"
                  >
                    Déconnexion
                  </button>
                </div>
              </>
            ) : (
              <Link href="/login" className="bg-white text-green-700 px-4 py-1 rounded-lg hover:bg-gray-100 transition">
                🔑 Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  const { isAuthenticated } = useAuth();
  
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-gray-400 text-sm">© 2025 Souk Data Mining - Plateforme citoyenne open source</p>
            <p className="text-gray-500 text-xs mt-1">Données collectées par et pour les citoyens des zones rurales</p>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition">Accueil</Link>
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <Link href="/ai" className="hover:text-white transition">Assistant IA</Link>
            {!isAuthenticated && (
              <Link href="/login" className="hover:text-white transition">Connexion</Link>
            )}
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
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}