import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
  plugins: {
    // cwd와 무관하게 이 프로젝트의 tailwind 설정을 사용
    tailwindcss: { config: join(__dirname, 'tailwind.config.js') },
    autoprefixer: {},
  },
}
