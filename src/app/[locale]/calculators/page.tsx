'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/shared';

const calculators = [
  {
    id: 'conventional',
    icon: '🏠',
    color: 'bg-gradient-to-b from-[#2A8BB3] to-[#31B2E8]',
  },
  {
    id: 'fha',
    icon: '🏛️',
    color: 'bg-gradient-to-b from-[#31B2E8] to-[#2A8BB3]',
  },
  {
    id: 'va',
    icon: '🎖️',
    color: 'bg-gradient-to-r from-[#2A8BB3] to-[#31B2E8]',
  },
  {
    id: 'seller-net',
    navKey: 'sellerNet',
    icon: '💰',
    color: 'bg-gradient-to-br from-[#2A8BB3] to-[#31B2E8]',
  },
  {
    id: 'comparison',
    navKey: 'compare',
    icon: '📊',
    color: 'bg-gradient-to-bl from-[#2A8BB3] to-[#31B2E8]',
  },
];

export default function CalculatorsPage() {
  const t = useTranslations('nav');
  const locale = useLocale();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Mortgage Calculators
        </h1>
        <p className="text-slate-500">
          Select a calculator to get started
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {calculators.map((calc) => (
          <Link key={calc.id} href={`/${locale}/calculators/${calc.id}`}>
            <Card className="h-full hover:shadow-lg hover:border-[#31B2E8] transition-all cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${calc.color} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-sm`}>
                    {calc.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 group-hover:bg-linear-to-b group-hover:from-[#2A8BB3] group-hover:to-[#31B2E8] group-hover:bg-clip-text group-hover:text-transparent transition-colors">
                      {t(calc.navKey ?? calc.id)}
                    </h2>
                    <p className="text-sm text-slate-500">
                      Click to open calculator
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
