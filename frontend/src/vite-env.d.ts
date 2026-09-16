/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  Telegram?: {
    WebApp?: {
      initData: string
      initDataUnsafe?: {
        user?: {
          id: number
          first_name: string
          last_name?: string
          username?: string
          language_code?: string
        }
      }
      ready: () => void
      expand: () => void
      close: () => void
    }
  }
}