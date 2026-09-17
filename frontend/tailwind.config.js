/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F5F1E8',
        surface: '#FAF8F2',
        ink: '#171717',
        muted: '#6B675F',
        hairline: '#D8D2C6',
        terracotta: '#F4512A',
        'terracotta-dark': '#DE401B',
        // Semantic aliases
        editorial: {
          bg: '#F5F1E8',
          surface: '#FAF8F2',
          ink: '#171717',
          muted: '#6B675F',
          border: '#D8D2C6',
          accent: '#F4512A',
          accentHover: '#DE401B',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Syne', '"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        'tightest': '-0.04em',
        'tighter': '-0.03em',
        'tight': '-0.02em',
        'widest': '0.15em',
        'ultra-wide': '0.25em',
      },
      aspectRatio: {
        'portrait': '3/4',
        'editorial': '4/5',
        'cinema': '21/9',
      },
      borderWidth: {
        'hairline': '1px',
      }
    },
  },
  plugins: [],
}
