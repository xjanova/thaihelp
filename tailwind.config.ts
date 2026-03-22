import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        metal: {
          dark: '#0a0e17',
          base: '#111827',
          mid: '#1e293b',
          light: '#334155',
          shine: '#94a3b8',
          chrome: '#cbd5e1',
        },
      },
      fontFamily: {
        thai: ['Noto Sans Thai', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
