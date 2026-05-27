/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
      },
      colors: {
        kah: {
          purple:      '#46178F',
          'purple-mid':'#5B2BA6',
          'purple-lt': '#8B60C8',
          'purple-bg': '#3B1378',
          red:         '#E21B3C',
          'red-dk':    '#B8102D',
          blue:        '#1368CE',
          'blue-dk':   '#0F50A8',
          green:       '#26890C',
          'green-dk':  '#1B6309',
          yellow:      '#FFA602',
          'yellow-dk': '#D98700',
        },
      },
      keyframes: {
        fadeUp:      { from:{ opacity:0, transform:'translateY(24px)' }, to:{ opacity:1, transform:'translateY(0)' } },
        popIn:       { from:{ transform:'scale(0.4)', opacity:0 }, to:{ transform:'scale(1)', opacity:1 } },
        bounceIn:    { '0%':{ transform:'scale(0)' }, '60%':{ transform:'scale(1.1)' }, '100%':{ transform:'scale(1)' } },
        blink:       { '0%,100%':{ opacity:1 }, '50%':{ opacity:0.25 } },
        pulseGlow:   { '0%,100%':{ boxShadow:'0 0 0 0 rgba(255,166,2,0.4)' }, '50%':{ boxShadow:'0 0 0 14px rgba(255,166,2,0)' } },
        correctFlash:{ '0%':{ boxShadow:'0 0 0 0 rgba(38,137,12,0.9)' }, '100%':{ boxShadow:'0 0 0 22px rgba(38,137,12,0)' } },
        slideInLeft: { from:{ opacity:0, transform:'translateX(-20px)' }, to:{ opacity:1, transform:'translateX(0)' } },
        timerWarn:   { '0%,100%':{ transform:'scale(1)' }, '50%':{ transform:'scale(1.1)' } },
      },
      animation: {
        fadeUp:       'fadeUp 0.5s ease both',
        popIn:        'popIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        bounceIn:     'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        blink:        'blink 1.1s ease-in-out infinite',
        pulseGlow:    'pulseGlow 2.5s ease-in-out infinite',
        correctFlash: 'correctFlash 0.5s ease',
        slideInLeft:  'slideInLeft 0.3s ease both',
        timerWarn:    'timerWarn 0.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
