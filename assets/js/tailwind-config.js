/* Tailwind (CDN) theme – Italissimo brand tokens */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        ink: '#0e0c0a',
        espresso: '#17120f',
        roast: '#221b16',
        cream: '#f6efe4',
        parchment: '#ede3d3',
        gold: { DEFAULT: '#c9a45c', light: '#e2c98f', dark: '#9c7a3a' },
        wine: { DEFAULT: '#7a1c2a', light: '#a3303f' },
        basil: '#4f6b3a',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        script: ['"Great Vibes"', 'cursive'],
      },
      letterSpacing: { widest2: '0.35em' },
      maxWidth: { site: '1280px' },
    },
  },
};
