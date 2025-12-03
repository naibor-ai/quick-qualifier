import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';

export default function Home() {
  const t = useTranslations();

  const calculators = [
    { href: '/calculators/conventional', label: t('nav.conventional') },
    { href: '/calculators/conventional-refi', label: t('nav.conventionalRefi') },
    { href: '/calculators/fha', label: t('nav.fha') },
    { href: '/calculators/fha-refi', label: t('nav.fhaRefi') },
    { href: '/calculators/va', label: t('nav.va') },
    { href: '/calculators/va-refi', label: t('nav.vaRefi') },
    { href: '/calculators/seller-net', label: t('nav.sellerNet') },
    { href: '/calculators/compare', label: t('nav.compare') },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {t('common.appName')}
          </h1>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            {t('nav.home')}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {calculators.map((calc) => (
            <Link
              key={calc.href}
              href={calc.href}
              className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
            >
              <span className="text-lg font-medium text-zinc-900 dark:text-white">
                {calc.label}
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
