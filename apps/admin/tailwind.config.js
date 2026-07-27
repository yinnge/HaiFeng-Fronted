import { setupInspiraUI } from '@inspira-ui/plugins'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // 海枫品牌色彩系统
      colors: {
        brand: {
          orange: '#e8722a',
          'orange-light': '#f5a54a',
          'orange-dark': '#c45a1f',
          gold: '#bf8a30',
          'gold-light': '#d4a85a',
          blue: '#1e88e5',
          'blue-dark': '#0d47a1',
          cream: '#faf9f5',
          'cream-dark': '#f5f0e8',
        },
      },
      // Border Beam 动画
      animation: {
        'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
        'meteor': 'meteor 5s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'border-beam': {
          '100%': {
            'offset-distance': '100%',
          },
        },
        meteor: {
          '0%': { transform: 'rotate(215deg) translateX(0)', opacity: 1 },
          '70%': { opacity: 1 },
          '100%': {
            transform: 'rotate(215deg) translateX(-500px)',
            opacity: 0,
          },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 0.6 },
          '50%': { opacity: 1 },
        },
        shimmer: {
          from: { backgroundPosition: '0 0' },
          to: { backgroundPosition: '-200% 0' },
        },
      },
    },
  },
  plugins: [
    setupInspiraUI,
  ],
  // 避免与 Element Plus 冲突
  corePlugins: {
    preflight: false,
  },
}
