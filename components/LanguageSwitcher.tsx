'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'ar' : 'fr');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition text-sm border border-white/20"
      aria-label="Changer de langue / تغيير اللغة"
    >
      <Globe size={16} className="text-white" />
      <span className="font-medium text-white">
        {language === 'fr' ? '🇫🇷 FR' : '🇲🇦 عربى'}
      </span>
    </button>
  );
}