import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111a20',
        steel: '#26353d',
        muted: '#68777e',
        canvas: '#f4f5f2',
        signal: '#ed6a2c',
        'signal-dark': '#c94e1d'
      },
      fontFamily: {
        sans: ['var(--font-body)', 'sans-serif'],
        display: ['var(--font-display)', 'sans-serif']
      },
      boxShadow: {
        soft: '0 12px 40px rgba(17, 26, 32, .08)'
      }
    }
  },
  plugins: []
};

export default config;