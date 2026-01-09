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



  return (
    <div
      className="min-h-screen bg-fixed bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/bg-dashboard.jpeg")' }}
    >
      {/* Navigation */}
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col">
            <div className="flex items-center justify-between h-16">
              <Link
                href={`/${locale}`}
                className="flex items-center h-10 mr-8"
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

              {/* Desktop Main Navigation */}
              <div className="hidden md:flex items-center space-x-2 flex-1 overflow-x-auto no-scrollbar">
                {[
                  { id: 'conventional', label: t('conventionalMain'), href: `/${locale}/calculators/conventional`, isActive: pathname.includes('/conventional') },
                  { id: 'fha', label: t('fhaMain'), href: `/${locale}/calculators/fha`, isActive: pathname.includes('/fha') },
                  { id: 'va', label: t('vaMain'), href: `/${locale}/calculators/va`, isActive: pathname.includes('/va') },
                  { id: 'seller-net', label: t('sellerNet'), href: `/${locale}/calculators/seller-net`, isActive: pathname.includes('/seller-net') },
                  { id: 'compare', label: t('compare'), href: `/${locale}/calculators/comparison`, isActive: pathname.includes('/comparison') },
                ].map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${item.isActive
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Sub-Navigation (Purchase vs Refinance) */}
            {(pathname.includes('/conventional') || pathname.includes('/fha') || pathname.includes('/va')) && !pathname.includes('seller-net') && (
              <div className="flex pb-3 md:pl-[172px]">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {[
                    { type: 'purchase', label: t('purchase'), href: pathname.includes('refi') ? pathname.replace('-refi', '') : pathname },
                    { type: 'refinance', label: t('refinance'), href: pathname.includes('refi') ? pathname : `${pathname}-refi` },
                  ].map((subItem) => {
                    // Logic to determine correct HREF based on current main tab
                    let href = subItem.href;
                    const isRefi = pathname.includes('-refi');

                    // If we are currently on standard purchase URL and want refi: append -refi
                    // If we are currently on refi URL and want purchase: remove -refi

                    // Simplifying the href logic:
                    // Determine base path (purchase path)
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
                        className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${isActive
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                          }`}
                      >
                        {subItem.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mobile Main Navigation */}
            <div className="md:hidden pb-3 flex overflow-x-auto gap-2 no-scrollbar">
              {[
                { id: 'conventional', label: t('conventionalMain'), href: `/${locale}/calculators/conventional`, isActive: pathname.includes('/conventional') },
                { id: 'fha', label: t('fhaMain'), href: `/${locale}/calculators/fha`, isActive: pathname.includes('/fha') },
                { id: 'va', label: t('vaMain'), href: `/${locale}/calculators/va`, isActive: pathname.includes('/va') },
                { id: 'seller-net', label: t('sellerNet'), href: `/${locale}/calculators/seller-net`, isActive: pathname.includes('/seller-net') },
                { id: 'compare', label: t('compare'), href: `/${locale}/calculators/comparison`, isActive: pathname.includes('/comparison') },
              ].map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${item.isActive
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
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
