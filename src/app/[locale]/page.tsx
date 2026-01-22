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

  // Loan calculators in 3 rows x 2 columns (Sale | Refi)
  const loanCalculators = [
    { href: `/${locale}/calculators/conventional`, label: t('nav.conventional'), iconPath: '/conventional-sale-icon.svg' },
    { href: `/${locale}/calculators/conventional-refi`, label: t('nav.conventionalRefi'), iconPath: '/conventional-refi-icon.svg' },
    { href: `/${locale}/calculators/fha`, label: t('nav.fha'), iconPath: '/fha-sale-icon.svg' },
    { href: `/${locale}/calculators/fha-refi`, label: t('nav.fhaRefi'), iconPath: '/fha-refi-icon.svg' },
    { href: `/${locale}/calculators/va`, label: t('nav.va'), iconPath: '/va-sale-icon.svg' },
    { href: `/${locale}/calculators/va-refi`, label: t('nav.vaRefi'), iconPath: '/va-refi-icon.svg' },
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
      <header className="sticky top-0 z-50">
        {/* Naibor blue accent bar */}
        <div className="h-1 bg-gradient-to-r from-[#2A8BB3] via-[#409ec1] to-[#2A8BB3]" />
        <div className="border-b border-slate-200/50 bg-white/95 backdrop-blur-lg shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-6 py-4">
            <Link href={`/${locale}`} className="flex items-center gap-3 group">
              <Image
                src="/Naibor_Logo_Black_High_Quality_No_BG.png"
                alt="Naibor"
                width={160}
                height={40}
                className="h-8 md:h-9 w-auto transition-transform group-hover:scale-105"
                priority
              />
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-10 text-center">
          <div className="inline-block mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2A8BB3]/10 text-[#2A8BB3] text-sm font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Mortgage Calculators
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">
            Naibor <span className="text-[#2A8BB3]">Qualify</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-md mx-auto">
            {t('home.selectCalculator')}
          </p>
        </div>

        {/* Loan Calculators - 3x2 Grid */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-slate-700 mb-4 text-center">
            {t('home.loanCalculators')}
          </h3>
          <div className="grid gap-4 grid-cols-2 max-w-2xl mx-auto">
            {loanCalculators.map((calc) => {
              return (
                <Link
                  key={calc.href}
                  href={calc.href}
                  className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-lg hover:border-blue-200 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                      <Image
                        src={calc.iconPath}
                        alt={calc.label}
                        width={30}
                        height={30}
                        className="w-full h-full"
                      />
                    </div>
                    <span className="text-base font-semibold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">
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
