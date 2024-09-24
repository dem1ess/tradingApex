import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'

// Используйте fileURLToPath для получения пути из import.meta.url

export default defineConfig({
	plugins: [react()],
	server: {
		port: 3000, // Устанавливаем порт на 3000
	},
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `
          @import "@/assets/scss/abstracts/index";
        `,
			},
		},
	},
})
