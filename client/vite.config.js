// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   optimizeDeps: {
//     exclude: ['lucide-react'],
//   },
//   server: {
//     hmr: {
//       overlay: false
//     },
//     watch: {
//       usePolling: true
//     },
//     port: 3000,
//     host: true
//   },
//   build: {
//     rollupOptions: {
//       output: {
//         manualChunks: undefined
//       }
//     }
//   }
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 3000,
    host: true,
    hmr: {
      overlay: false
    },
    watch: {
      usePolling: true
    },
    proxy: {
      '/api': {
        target: 'https://garilagbe-com.onrender.com/api',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})

