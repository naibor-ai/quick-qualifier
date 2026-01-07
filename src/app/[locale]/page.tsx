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
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );

  const RefreshIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2v6h-6" />
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M3 22v-6h6" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
  );

  const FhaSaleIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm2 13h-4v-2h4v2zm0-4h-4v-2h4v2z" opacity="0.1" />
      <path d="M21 12.22c0 .32-.07.64-.21.94l-2.53 5.41c-.24.53-.78.83-1.36.83H6.5c-.83 0-1.5-.67-1.5-1.5v-2.11c0-.52.27-1 .7-1.29L10 11.08V7h1V5.5c0-.28.22-.5.5-.5h1c.28 0 .5.22.5.5V7h1v4.08l4.3 2.92c.43.29.7.77.7 1.29v2.11c0 .32-.07.64-.21.94" opacity="0.3" />
      <path d="M12.5 7v-.5c0-.28-.22-.5-.5-.5s-.5.22-.5.5V7h1zm1-4h-2v1h2v-1zm-1 8h-1v4h1v-4zm5.5 2.5l-4.3-2.92V7h-1v-.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5V7h-1v4.08l-4.3 2.92c-.43.29-.7.77-.7 1.29v2.11c0 .83.67 1.5 1.5 1.5h10.4c.83 0 1.5-.67 1.5-1.5v-2.11c0-.52-.27-1-.7-1.29zM12 14.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
      <path d="M11.5 12.5h1v1h-1z" />
      <text x="10.8" y="10.2" fontSize="6" fontWeight="bold" fill="currentColor">$</text>
    </svg>
  );

  const FhaRefiIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z" />
    </svg>
  );

  const VaSaleIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 11c.34 0 .67.04 1 .09V6.27l-5-2.27-5 2.27v4.91c0 2.25 1.44 4.33 3.51 5.2 1.27.53 2.61.63 3.84.4A4.98 4.98 0 0 1 17 11z" opacity="0.2" />
      <path d="M12 17l-3.3 1.9.9-3.8-2.9-2.5 3.9-.3 1.4-3.7 1.4 3.7 3.9.3-2.9 2.5.9 3.8L12 17z" />
      <path d="M18 11.5c-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5 4.5-2.02 4.5-4.5-2.02-4.5-4.5-4.5zm2.43 5.4l-.86 1.46-1.57-.33-.71 1.56-.71-1.56-1.57.33.86-1.46-1-1.37h1.69l1-1.37 1 1.37h1.69l-1 1.37z" />
    </svg>
  );

  const VaRefiIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </svg>
  );

  // Loan calculators in 3 rows x 2 columns (Sale | Refi)
  const loanCalculators = [
    { href: `/${locale}/calculators/conventional`, label: t('nav.conventional'), icon: HomeIcon, color: '#3B82F6' },
    { href: `/${locale}/calculators/conventional-refi`, label: t('nav.conventionalRefi'), icon: RefreshIcon, color: '#3B82F6' },
    { href: `/${locale}/calculators/fha`, label: t('nav.fha'), icon: FhaSaleIcon, color: '#3B82F6' },
    { href: `/${locale}/calculators/fha-refi`, label: t('nav.fhaRefi'), icon: FhaRefiIcon, color: '#3B82F6' },
    { href: `/${locale}/calculators/va`, label: t('nav.va'), icon: VaSaleIcon, color: '#3B82F6' },
    { href: `/${locale}/calculators/va-refi`, label: t('nav.vaRefi'), icon: VaRefiIcon, color: '#3B82F6' },
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
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                      style={{ backgroundColor: `${calc.color}15`, color: calc.color }}
                    >
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
