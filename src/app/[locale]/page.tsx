'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';

export default function Home() {
  const t = useTranslations();
  const locale = useLocale();

  const calculators = [
    { href: `/${locale}/calculators/conventional`, label: t('nav.conventional') },
    { href: `/${locale}/calculators/fha`, label: t('nav.fha') },
    { href: `/${locale}/calculators/va`, label: t('nav.va') },
    { href: `/${locale}/calculators/seller-net`, label: t('nav.sellerNet') },
    { href: `/${locale}/calculators/comparison`, label: t('nav.compare') },
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
          <p className="mt-2 text-slate-500">Select a calculator to get started</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {calculators.map((calc) => (
            <Link
              key={calc.href}
              href={calc.href}
              className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-blue-200 hover:-translate-y-1"
            >
              <span className="text-lg font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                {calc.label}
              </span>
              <p className="mt-2 text-sm text-slate-500">Calculate mortgage details</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
