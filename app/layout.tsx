import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Souk Data Mining - Observatoire des prix en milieu rural',
  description: 'Plateforme citoyenne pour monitorer l\'inflation alimentaire dans les souks marocains',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {/* Navbar */}
        <nav className="bg-green-700 text-white shadow-lg">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🕌</span>
              <span className="font-bold text-xl">Souk Data Mining</span>
            </div>
            <div className="space-x-6">
              <a href="/" className="hover:text-green-200 transition">Accueil</a>
              <a href="/submit" className="hover:text-green-200 transition">Saisir un prix</a>
              <a href="/dashboard" className="hover:text-green-200 transition">Dashboard</a>
            </div>
          </div>
        </nav>

        {/* Contenu principal */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-6">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Souk Data Mining - Plateforme citoyenne open source
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Données collectées par et pour les citoyens des zones rurales
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}