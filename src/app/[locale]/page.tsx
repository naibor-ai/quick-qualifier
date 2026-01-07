'use client';

import { useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { useCalculatorStore, useLoadConfig } from '@/lib/store';

export default function Home() {
  const t = useTranslations();
  const locale = useLocale();
  const { loadConfig } = useLoadConfig();
  const config = useCalculatorStore((state) => state.config);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Icon components for each calculator
  const HomeIcon = () => (
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#E8F0FE" />
      <path d="M30 45 L50 28 L70 45 V70 H30 Z" fill="#1A73E8" />
    </svg>
  );

  const RefreshIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#E8F0FE" />
      <path d="M70 50 A20 20 0 1 1 50 30" fill="none" stroke="#1A73E8" strokeWidth="8" strokeLinecap="round" />
      <path d="M50 20 L50 40 L65 30 Z" fill="#1A73E8" />
      <path d="M30 50 A20 20 0 1 1 50 70" fill="none" stroke="#1A73E8" strokeWidth="8" strokeLinecap="round" />
      <path d="M50 80 L50 60 L35 70 Z" fill="#1A73E8" />
    </svg>
  );

  const FhaSaleIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#E8F0FE" />
      <path d="M30 65 Q45 75 75 60 L72 55 Q45 65 30 55" fill="#1A73E8" />
      <text x="50" y="45" fontFamily="Arial" fontSize="22" fontWeight="bold" fill="#1A73E8" textAnchor="middle">$</text>
    </svg>
  );

  const FhaRefiIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#E8F0FE" />
      <path d="M40 30 V70 M30 40 L40 30 L50 40" fill="none" stroke="#1A73E8" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M60 70 V30 M50 60 L60 70 L70 60" fill="none" stroke="#1A73E8" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const VaSaleIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#E8F0FE" />
      <path d="M35 30 L42 55 L58 55 L65 30" fill="#1A73E8" />
      <circle cx="50" cy="65" r="12" fill="#1A73E8" />
      <path d="M50 60 L52 64 L56 64 L53 66 L54 70 L50 68 L46 70 L47 66 L44 64 L48 64 Z" fill="white" />
    </svg>
  );

  const VaRefiIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#E8F0FE" />
      <path d="M30 35 V55 Q30 75 50 82 Q70 75 70 55 V35 L50 28 Z" fill="#1A73E8" />
    </svg>
  );

  // Loan calculators in 3 rows x 2 columns (Sale | Refi)
  const loanCalculators = [
    { href: `/${locale}/calculators/conventional`, label: t('nav.conventional'), icon: HomeIcon, color: '#1A73E8' },
    { href: `/${locale}/calculators/conventional-refi`, label: t('nav.conventionalRefi'), icon: RefreshIcon, color: '#1A73E8' },
    { href: `/${locale}/calculators/fha`, label: t('nav.fha'), icon: FhaSaleIcon, color: '#1A73E8' },
    { href: `/${locale}/calculators/fha-refi`, label: t('nav.fhaRefi'), icon: FhaRefiIcon, color: '#1A73E8' },
    { href: `/${locale}/calculators/va`, label: t('nav.va'), icon: VaSaleIcon, color: '#1A73E8' },
    { href: `/${locale}/calculators/va-refi`, label: t('nav.vaRefi'), icon: VaRefiIcon, color: '#1A73E8' },
  ];

  // Additional tools in 2x2 grid
  const additionalTools = [
    { href: `/${locale}/calculators/comparison`, label: t('home.sideBySide'), description: t('home.sideBySideDesc') },
    { href: `/${locale}/calculations`, label: t('home.calculations'), description: t('home.calculationsDesc') },
  ];

  return (
    <div
      className="min-h-screen bg-fixed bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/bg-dashboard.jpeg")' }}
    >
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href={`/${locale}`} className="flex items-center h-10">
            <Image
              src="/Naibor_Logo_Black_High_Quality_No_BG.png"
              alt="Naibor"
              width={180}
              height={45}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold text-slate-800">
            Naibor Qualify
          </h2>
          <p className="mt-2 text-slate-500">{t('home.selectCalculator')}</p>
        </div>

        {/* Loan Calculators - 3x2 Grid */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-slate-700 mb-4 text-center">
            {t('home.loanCalculators')}
          </h3>
          <div className="grid gap-4 grid-cols-2 max-w-2xl mx-auto">
            {loanCalculators.map((calc) => {
              const IconComponent = calc.icon;
              return (
                <Link
                  key={calc.href}
                  href={calc.href}
                  className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-lg hover:border-blue-200 hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                      <IconComponent />
                    </div>
                    <span className="text-base font-semibold text-slate-800 group-hover:text-blue-600 transition-colors text-left leading-tight">
                      {calc.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Additional Tools - 2x2 Grid */}
        <div>
          <h3 className="text-xl font-semibold text-slate-700 mb-4 text-center">
            {t('home.additionalTools')}
          </h3>
          <div className="grid gap-4 grid-cols-2 max-w-2xl mx-auto">
            {additionalTools.map((tool) => (
              <Link
                key={tool.label}
                href={tool.href}
                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-lg hover:border-blue-200 hover:-translate-y-1 text-center"
              >
                <span className="text-lg font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                  {tool.label}
                </span>
                <p className="mt-1 text-sm text-slate-500">{tool.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-md mt-12">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center">
          {config?.blurbs && (config.blurbs.home1 || config.blurbs.home2 || config.blurbs.home3) && (
            <div className="mb-6 text-slate-600 space-y-1">
              {config.blurbs.home1 && <p>{config.blurbs.home1}</p>}
              {config.blurbs.home2 && <p>{config.blurbs.home2}</p>}
              {config.blurbs.home3 && <p>{config.blurbs.home3}</p>}
            </div>
          )}
          <div className="flex flex-col items-center justify-center gap-3 text-sm text-slate-600">
            <Image
              src="/Naibor_Logo_Black_High_Quality_No_BG.png"
              alt="Naibor"
              width={180}
              height={45}
              className="h-10 w-auto"
              priority
            />
            <a href="mailto:info@naibor.ai" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              info@naibor.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
