/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ['./src/**/*.html', './src/js/**/*.js', './scripts/build.js', './scripts/lib/**/*.js'],
  theme: {
    extend: {
      colors: {
        navy: '#0B1F3A',
        charcoal: '#1E2530',
        steel: '#E6EAF0',
        orange: { DEFAULT: '#FF6B1A', 600: '#E85A0C' },
        isi: '#1F8A4C',
        // Semantic tokens: flip automatically in dark mode (see src/css/input.css)
        page: token('page'),
        surface: token('surface'),
        sunken: token('sunken'),
        ink: token('ink'),
        muted: token('muted'),
        line: token('line'),
        accent: token('accent-ink'),
        isiink: token('isi-ink'),
      },
      fontFamily: {
        heading: ['Montserrat', '"Montserrat Fallback"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', '"Inter Fallback"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgb(11 31 58 / .06), 0 8px 24px -8px rgb(11 31 58 / .14)',
        lift: '0 2px 4px rgb(11 31 58 / .08), 0 18px 40px -12px rgb(11 31 58 / .25)',
      },
      maxWidth: { site: '76rem' },
    },
  },
  plugins: [],
};
