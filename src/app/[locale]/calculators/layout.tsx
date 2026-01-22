'use client';

import { useEffect, useMemo, useState } from 'react';
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
  const { configLoading, configError, dtiResults } = useCalculatorStore();
  const { loadConfig } = useLoadConfig();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const calculatorType = useMemo(() => {
    if (pathname.includes('/conventional-refi')) return 'conventionalRefi';
    if (pathname.includes('/fha-refi')) return 'fhaRefi';
    if (pathname.includes('/va-refi')) return 'vaRefi';
    if (pathname.includes('/conventional')) return 'conventional';
    if (pathname.includes('/fha')) return 'fha';
    if (pathname.includes('/va')) return 'va';
    return null;
  }, [pathname]);

  const dtiResult = calculatorType ? dtiResults[calculatorType] : null;

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);



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
                width={140}
                height={35}
                className="h-9 w-auto"
                priority
              />
            </Link>

            {/* Desktop Main Navigation - Centered */}
            <div className="hidden md:flex items-center justify-center space-x-2 flex-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'conventional', label: t('conventionalMain'), href: `/${locale}/calculators/conventional`, isActive: pathname.includes('/conventional') && !pathname.includes('/comparison') },
                { id: 'fha', label: t('fhaMain'), href: `/${locale}/calculators/fha`, isActive: pathname.includes('/fha') },
                { id: 'va', label: t('vaMain'), href: `/${locale}/calculators/va`, isActive: pathname.includes('/va') },
                { id: 'seller-net', label: t('sellerNet'), href: `/${locale}/calculators/seller-net`, isActive: pathname.includes('/seller-net') },
                { id: 'compare', label: t('compare'), href: `/${locale}/calculators/comparison`, isActive: pathname.includes('/comparison') },
              ].map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${item.isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="w-[140px] hidden md:block"></div> {/* Spacer to balance logo width */}

            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile dropdown menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200 py-3 space-y-1">
              {/* Conventional with sub-menu */}
              <div className="space-y-1">
                <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t('conventionalMain')}
                </div>
                <Link
                  href={`/${locale}/calculators/conventional`}
                  className={`block px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname.includes('/conventional') && !pathname.includes('-refi') && !pathname.includes('/comparison')
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t('purchase')}
                </Link>
                <Link
                  href={`/${locale}/calculators/conventional-refi`}
                  className={`block px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname.includes('/conventional-refi')
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t('refinance')}
                </Link>
              </div>

              {/* FHA with sub-menu */}
              <div className="space-y-1 pt-2">
                <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t('fhaMain')}
                </div>
                <Link
                  href={`/${locale}/calculators/fha`}
                  className={`block px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname.includes('/fha') && !pathname.includes('-refi')
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t('purchase')}
                </Link>
                <Link
                  href={`/${locale}/calculators/fha-refi`}
                  className={`block px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname.includes('/fha-refi')
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t('refinance')}
                </Link>
              </div>

              {/* VA with sub-menu */}
              <div className="space-y-1 pt-2">
                <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t('vaMain')}
                </div>
                <Link
                  href={`/${locale}/calculators/va`}
                  className={`block px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname.includes('/va') && !pathname.includes('-refi')
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t('purchase')}
                </Link>
                <Link
                  href={`/${locale}/calculators/va-refi`}
                  className={`block px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname.includes('/va-refi')
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t('refinance')}
                </Link>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-200 my-2"></div>

              {/* Other tools */}
              <Link
                href={`/${locale}/calculators/seller-net`}
                className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  pathname.includes('/seller-net')
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t('sellerNet')}
              </Link>
              <Link
                href={`/${locale}/calculators/comparison`}
                className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  pathname.includes('/comparison')
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t('compare')}
              </Link>
            </div>
          )}
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

      {/* Sub-Navigation (Purchase vs Refinance) - Desktop only */}
      {(pathname.includes('/conventional') || pathname.includes('/fha') || pathname.includes('/va')) && !pathname.includes('seller-net') && !pathname.includes('/comparison') && (
        <>
          <div className="hidden md:flex justify-center pt-6 pb-2">
            <div className="flex bg-white/80 backdrop-blur-md p-1 rounded-full shadow-sm border border-slate-200/60">
              {[
                { type: 'purchase', label: t('purchase'), href: pathname.includes('refi') ? pathname.replace('-refi', '') : pathname },
                { type: 'refinance', label: t('refinance'), href: pathname.includes('refi') ? pathname : `${pathname}-refi` },
              ].map((subItem) => {
                let href = subItem.href;
                const isRefi = pathname.includes('-refi');
                const basePath = pathname.replace('-refi', '');

                if (subItem.type === 'purchase') {
                  href = basePath;
                } else {
                  href = `${basePath}-refi`;
                }

                const isActive = subItem.type === 'purchase' ? !isRefi : isRefi;

                return (
                  <Link
                    key={subItem.type}
                    href={href}
                    className={`px-6 py-1.5 rounded-full text-sm font-semibold transition-all ${isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                      }`}
                  >
                    {subItem.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* DTI Ratios & Emojis */}
          {dtiResult && (
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-12 py-4 animate-in fade-in zoom-in-95 duration-500">
              {(() => {
                const isConventional = pathname.includes('/conventional');
                const isFha = pathname.includes('/fha');
                const isVa = pathname.includes('/va');

                let frontThreshold = 50;
                let backThreshold = 50;

                if (isConventional) {
                  frontThreshold = 49.99;
                  backThreshold = 49.99;
                } else if (isFha || isVa) {
                  frontThreshold = 46.99;
                  backThreshold = 56.99;
                }

                const frontHappy = dtiResult.frontendRatio <= frontThreshold;
                const backHappy = dtiResult.backendRatio <= backThreshold;

                return (
                  <>
                    <div className="relative flex items-center min-w-[180px] bg-white/40 backdrop-blur-sm pl-10 pr-6 py-3 rounded-2xl border border-white/20 shadow-sm mr-4 md:mr-0">
                      <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(250,204,21,0.7)] border-2 border-white z-10 scale-110 md:scale-100 transition-transform hover:scale-110">
                        {frontHappy ? '😊' : '🙁'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Front-End Ratio</span>
                        <span className="text-2xl font-black text-slate-800">
                          {dtiResult.frontendRatio}%
                        </span>
                      </div>
                    </div>

                    <div className="relative flex items-center min-w-[180px] bg-white/40 backdrop-blur-sm pl-6 pr-10 py-3 rounded-2xl border border-white/20 shadow-sm ml-4 md:ml-0">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Back-End Ratio</span>
                        <span className="text-2xl font-black text-slate-800">
                          {dtiResult.backendRatio}%
                        </span>
                      </div>
                      <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(250,204,21,0.7)] border-2 border-white z-10 scale-110 md:scale-100 transition-transform hover:scale-110">
                        {backHappy ? '😊' : '🙁'}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
