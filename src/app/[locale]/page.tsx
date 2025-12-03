'use client';

import { useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
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

  // Loan calculators in 3 rows x 2 columns (Sale | Refi)
  const loanCalculators = [
    { href: `/${locale}/calculators/conventional`, label: t('nav.conventional') },
    { href: `/${locale}/calculators/conventional-refi`, label: t('nav.conventionalRefi') },
    { href: `/${locale}/calculators/fha`, label: t('nav.fha') },
    { href: `/${locale}/calculators/fha-refi`, label: t('nav.fhaRefi') },
    { href: `/${locale}/calculators/va`, label: t('nav.va') },
    { href: `/${locale}/calculators/va-refi`, label: t('nav.vaRefi') },
  ];

  // Additional tools in 2x2 grid
  const additionalTools = [
    { href: `/${locale}/calculators/comparison`, label: t('home.sideBySide'), description: t('home.sideBySideDesc') },
    { href: `/${locale}/calculators/seller-net`, label: t('home.shoppingGuide'), description: t('home.shoppingGuideDesc') },
    { href: '#', label: t('home.showcaseHomes'), description: t('home.showcaseHomesDesc') },
    { href: '#', label: t('home.bulletinBoard'), description: t('home.bulletinBoardDesc') },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-600">
            {t('common.appName')}
          </h1>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold text-slate-800">
            {t('nav.home')}
          </h2>
          <p className="mt-2 text-slate-500">{t('home.selectCalculator')}</p>
        </div>

        {/* Loan Calculators - 3x2 Grid */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-slate-700 mb-4 text-center">
            {t('home.loanCalculators')}
          </h3>
          <div className="grid gap-4 grid-cols-2 max-w-2xl mx-auto">
            {loanCalculators.map((calc) => (
              <Link
                key={calc.href}
                href={calc.href}
                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-lg hover:border-blue-200 hover:-translate-y-1 text-center"
              >
                <span className="text-lg font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                  {calc.label}
                </span>
              </Link>
            ))}
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

      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center">
          {config?.blurbs && (config.blurbs.home1 || config.blurbs.home2 || config.blurbs.home3) && (
            <div className="mb-6 text-slate-600 space-y-1">
              {config.blurbs.home1 && <p>{config.blurbs.home1}</p>}
              {config.blurbs.home2 && <p>{config.blurbs.home2}</p>}
              {config.blurbs.home3 && <p>{config.blurbs.home3}</p>}
            </div>
          )}
          {config?.company?.name && (
            <div className="mb-4">
              <p className="text-2xl font-bold text-slate-800">
                {config.company.name}
              </p>
            </div>
          )}
          <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
            {config?.company?.loPhone && (
              <a href={`tel:${config.company.loPhone}`} className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {config.company.loPhone}
              </a>
            )}
            {config?.company?.loEmail && (
              <a href={`mailto:${config.company.loEmail}`} className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                {config.company.loEmail}
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
