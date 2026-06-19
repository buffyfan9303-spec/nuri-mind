import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import('tailwindcss').Config} */
export default {
  // cwd와 무관하게 동작하도록 절대경로로 고정
  content: [join(__dirname, 'index.html'), join(__dirname, 'src/**/*.{ts,tsx}')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mind: {
          50: '#F4F9F6',
          100: '#E4F1EA',
          200: '#C8E3D5',
          300: '#A3CFB9',
          400: '#6FB394',
          500: '#4FA882',
          600: '#3E8F6C',
          700: '#2F6B52',
          800: '#27543F',
          900: '#1F3F30',
        },
        sky2: {
          100: '#E7F0FB',
          300: '#A9C9EE',
          400: '#8FB8E8',
          500: '#6E9FDC',
          600: '#5784C2',
        },
        peach: { 300: '#F6C39F', 400: '#F4B08C', 500: '#E89D77' },
        // 다크모드 대응 시맨틱 토큰 (rgb(var/alpha) — 투명도 modifier 지원)
        ink: {
          DEFAULT: 'rgb(var(--text) / <alpha-value>)',
          sub: 'rgb(var(--text-sub) / <alpha-value>)',
          faint: 'rgb(var(--text-faint) / <alpha-value>)',
        },
        cream: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        surface2: 'rgb(var(--surface-2) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        adhd: { light: '#FFF4E0', DEFAULT: '#FFB020', deep: '#D98E00' },
        ego: { light: '#FFECEA', DEFAULT: '#FF6F61', deep: '#D94F42' },
        iq: { light: '#ECEFFE', DEFAULT: '#6E7BF2', deep: '#4F5CD4' },
        love: { light: '#FDE9F2', DEFAULT: '#F25C8E', deep: '#CC3F70' },
        burn: { light: '#F1EDFE', DEFAULT: '#8B7CF6', deep: '#6A58D8' },
        dopa: { light: '#E2F6FA', DEFAULT: '#12A5C2', deep: '#0E849B' },
        reso: { light: '#E6F7EF', DEFAULT: '#10B981', deep: '#0B8C63' },
        dk: { light: '#F4EAEF', DEFAULT: '#A23E63', deep: '#7C2D49' },
      },
      fontFamily: {
        sans: ['Nunito', 'Pretendard', 'Noto Sans JP', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        duo: '0 4px 0 0 rgba(0,0,0,0.12)',
        card: '0 2px 12px rgba(47,107,82,0.08)',
        pop: '0 8px 28px rgba(47,107,82,0.16)',
      },
      borderRadius: { duo: '1.25rem' },
    },
  },
  plugins: [],
}
