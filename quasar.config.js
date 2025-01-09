import { defineConfig } from '#q-app/wrappers'
import path from 'path'

export default defineConfig((ctx) => {
  const POCKETBASE_URL = 'http://192.168.178.144:8090';

  return {
    preFetch: true,
    boot: [
      'i18n',
      'axios',
    ],
    css: [
      'app.scss'
    ],
    extras: [
      'mdi-v7',
      'roboto-font',
      'material-icons',
    ],
    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node20'
      },
      vueRouterMode: 'history',
      vitePlugins: [
        ['@intlify/vite-plugin-vue-i18n', {
          include: path.resolve(__dirname, './src/i18n/**')
        }],
        ['vite-plugin-checker', {
          vueTsc: {
            tsconfigPath: 'tsconfig.vue-tsc.json'
          },
          eslint: {
            lintCommand: 'eslint "./**/*.{js,ts,mjs,cjs,vue}"'
          }
        }, { server: false }]
      ]
    },
    devServer: {
      // https: true
      open: true,
      proxy: {
        '/pb': {
          target: POCKETBASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/pb/, '')
        },
      }
    },
    framework: {
      config: {
        dark: "auto"
      },
      plugins: [
        'Dialog',
      ]
    },
    animations: [],
    ssr: {
      pwa: false,
      prodPort: 3000,
      middlewares: [
        'render'
      ]
    },
    pwa: {
      workboxMode: 'generateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,
    },
    bex: {
      contentScripts: [
        'my-content-script'
      ],
    }
  }
});
