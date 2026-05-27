import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'X-Dash Geometry Game',
                short_name: 'X-Dash',
                description: 'Geometry Dash Runner Game',
                theme_color: '#0f172a',
                background_color: '#0f172a',
                display: 'standalone',
                orientation: 'landscape',
                icons: [
                    {
                        src: '/icon.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: '/icon.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            }
        })
    ]
})
