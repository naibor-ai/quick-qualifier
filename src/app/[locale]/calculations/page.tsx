'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');";

export default function CalculationsPage() {
  const locale = useLocale();
  const t = useTranslations('home');
  const [styles, setStyles] = useState(FONT_IMPORT);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadHtml = async () => {
      try {
        const res = await fetch('/qq_final.html');
        const html = await res.text();

        const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

        const styleContent = styleMatch?.[1] ?? '';
        let bodyContent = bodyMatch?.[1] ?? html;

        // Strip scripts, legacy header/hero, hidden ASP.NET inputs, and change submits to buttons.
        bodyContent = bodyContent
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<header[^>]*>[\s\S]*?<\/header>/i, '')
          .replace(/<div class="page-title-section"[^>]*>[\s\S]*?<\/div>/i, '')
          .replace(/<div style="display:\s*none;">[\s\S]*?<\/div>/i, '')
          .replace(/<form[^>]*id="frmSetup"[^>]*>/i, '<div id="frmSetup">')
          .replace(/<\/form>/i, '</div>')
          .replace(/<div id="Panel12"[\s\S]*?<\/div>\s*/i, '')
          .replace(/<input[^>]*name="btnClose"[^>]*>/i, '')
          .replace(/type="submit"/gi, 'type="button"');

        // Add explicit button styling in case the regex misses nested selectors.
        const buttonStyle = `
          .nav-grid input[type="button"] {
            background-color: #fff !important;
            color: #0f172a !important;
            border: 1px solid var(--border) !important;
            border-radius: 12px;
            font-family: var(--font-family);
            font-weight: 600 !important;
            font-size: 15px !important;
            text-align: left;
            padding: 20px 25px;
            width: 100% !important;
            height: auto !important;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
            transition: all 0.2s ease;
            display: block;
          }
          .nav-grid input[type="button"]:hover {
            border-color: var(--primary) !important;
            box-shadow: 0 4px 12px rgba(42, 139, 179, 0.15);
            transform: translateY(-2px);
            color: var(--primary) !important;
          }
        `;

        setStyles(`${FONT_IMPORT}\n${styleContent}\n${buttonStyle}`);
        setContent(bodyContent);
        setError('');
      } catch (err) {
        console.error('Failed to load qq_final.html', err);
        setError('Unable to load lender settings right now. Please try again in a moment.');
      }
    };

    loadHtml();
  }, []);

  useEffect(() => {
    const container = contentRef.current;
    if (!container || !content) return;

    // Remove inline handlers that point to missing functions and trim save/close buttons.
    container.querySelectorAll('[onkeypress]').forEach((el) => el.removeAttribute('onkeypress'));
    container.querySelectorAll('[onchange]').forEach((el) => el.removeAttribute('onchange'));
    container.querySelectorAll('input[type="button"]').forEach((btn) => {
      const value = (btn as HTMLInputElement).value || '';
      if (/save|return to main menu/i.test(value)) {
        btn.remove();
      }
    });

    const scrollHandlers: Array<() => void> = [];

    container.querySelectorAll<HTMLInputElement>('input[id^="Button"]').forEach((button) => {
      const id = button.id;
      const match = id.match(/^Button(\d+)$/);
      const targetId = id === 'Button14' ? 'Container' : match ? `Panel${match[1]}` : undefined;
      if (!targetId) return;
      const target = container.querySelector<HTMLElement>(`#${targetId}`);
      if (button && target) {
        const handler = (event: Event) => {
          event.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        button.type = 'button';
        button.addEventListener('click', handler);
        scrollHandlers.push(() => button.removeEventListener('click', handler));
      }
    });

    const adjustByStep = (input: HTMLInputElement, delta: number) => {
      const current = parseFloat(input.value || '0') || 0;
      const next = Math.round((current + delta) * 1000) / 1000;
      input.value = next.toString();
    };

    const numericGuard = (event: KeyboardEvent) => {
      const key = event.key;
      const allowedControl = ['Backspace', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'];
      if (allowedControl.includes(key) || (event.ctrlKey || event.metaKey)) return;
      if (/^[0-9.]$/.test(key)) return;
      event.preventDefault();
    };

    const numericCleanups: Array<() => void> = [];
    container.querySelectorAll<HTMLInputElement>('input[type="text"]').forEach((input) => {
      const handler = (event: KeyboardEvent) => numericGuard(event);
      input.addEventListener('keydown', handler);
      numericCleanups.push(() => input.removeEventListener('keydown', handler));
    });

    const onClick = (event: Event) => {
      const target = event.target as HTMLElement;
      if (!(target instanceof HTMLInputElement)) return;

      if (target.id.startsWith('btnP') || target.id.startsWith('btnM')) {
        event.preventDefault();
        const td = target.closest('td');
        const textInput = td?.querySelector<HTMLInputElement>('input[type="text"]');
        if (textInput) {
          const delta = target.id.startsWith('btnP') ? 0.125 : -0.125;
          adjustByStep(textInput, delta);
        }
      }
    };

    container.addEventListener('click', onClick);

    return () => {
      container.removeEventListener('click', onClick);
      numericCleanups.forEach((cleanup) => cleanup());
      scrollHandlers.forEach((cleanup) => cleanup());
    };
  }, [content]);

  return (
    <div className="min-h-screen bg-[#cbe5f2]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-slate-800"
          >
            <Image
              src="/Naibor_Logo_Black_High_Quality_No_BG.png"
              alt="Naibor"
              width={120}
              height={30}
              className="h-8 w-auto"
              priority
            />
            <span>← {t('back')}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 space-y-6" style={{ background: '#F5F7FA' }}>
        <div className="text-center space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{t('calculations')}</p>
          <h1 className="text-3xl font-semibold text-slate-800">Lender Settings</h1>
          <p className="text-slate-500">
            Integrated Quick Qualifier settings with working navigation and adjusters.
          </p>
        </div>

        <style dangerouslySetInnerHTML={{ __html: styles }} />

        {error ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
            {error}
          </div>
        ) : (
          <div
            ref={contentRef}
            className="overflow-visible"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </main>
    </div>
  );
}
