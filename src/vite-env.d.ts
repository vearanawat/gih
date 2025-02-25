/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_OCR_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const apiUrl = import.meta.env.VITE_OCR_API_URL;
