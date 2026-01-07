'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useCalculatorStore, useLoadConfig } from '@/lib/store';
import Image from 'next/image';

interface CalculatorsLayoutProps {
  children: React.ReactNode;
}

export default function CalculatorsLayout({ children }: CalculatorsLayoutProps) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const { configLoading, configError } = useCalculatorStore();
  const { loadConfig } = useLoadConfig();

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const navItems = [
    { href: `/${locale}/calculators/conventional`, label: t('conventional') },
    { href: `/${locale}/calculators/conventional-refi`, label: t('conventionalRefi') },
    { href: `/${locale}/calculators/fha`, label: t('fha') },
    { href: `/${locale}/calculators/fha-refi`, label: t('fhaRefi') },
    { href: `/${locale}/calculators/va`, label: t('va') },
    { href: `/${locale}/calculators/va-refi`, label: t('vaRefi') },
    { href: `/${locale}/calculators/seller-net`, label: t('sellerNet') },
    { href: `/${locale}/calculators/comparison`, label: t('compare') },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div
      className="min-h-screen bg-fixed bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/bg-dashboard.jpeg")' }}
    >
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href={`/${locale}`}
              className="flex items-center h-10"
            >
              <Image
                src="/Naibor_Logo_Black_High_Quality_No_BG.png"
                alt="Naibor"
                width={160}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(item.href)
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile navigation */}
          <div className="md:hidden pb-3 flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isActive(item.href)
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Loading/Error states */}
      {configLoading && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <p className="text-sm text-blue-700">
              Loading configuration...
            </p>
          </div>
        </div>
      )}

      {configError && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <p className="text-sm text-red-700">
              Error loading configuration: {configError}
            </p>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
