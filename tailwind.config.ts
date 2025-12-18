import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
        poppins: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--primary-hover)',
          light: 'var(--primary-light)',
        },
        accent: 'var(--accent)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        'gradient-primary': {
          from: '#2A8BB3',
          to: '#31B2E8',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to bottom, #2A8BB3, #31B2E8)',
      },
    },
  },
  plugins: [],
};

export default config;