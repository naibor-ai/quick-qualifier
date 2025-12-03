'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';

export default function Home() {
  const t = useTranslations();
  const locale = useLocale();

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
    </div>
  );
}
