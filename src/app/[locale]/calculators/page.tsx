'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/shared';

const calculators = [
  {
    id: 'conventional',
    icon: '🏠',
    color: 'bg-blue-500',
  },
  {
    id: 'fha',
    icon: '🏛️',
    color: 'bg-green-500',
  },
  {
    id: 'va',
    icon: '🎖️',
    color: 'bg-purple-500',
  },
  {
    id: 'seller-net',
    navKey: 'sellerNet',
    icon: '💰',
    color: 'bg-amber-500',
  },
  {
    id: 'comparison',
    navKey: 'compare',
    icon: '📊',
    color: 'bg-rose-500',
  },
];

export default function CalculatorsPage() {
  const t = useTranslations('nav');
  const locale = useLocale();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Mortgage Calculators
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Select a calculator to get started
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {calculators.map((calc) => (
          <Link key={calc.id} href={`/${locale}/calculators/${calc.id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${calc.color} rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                    {calc.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {t(calc.navKey ?? calc.id)}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
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
