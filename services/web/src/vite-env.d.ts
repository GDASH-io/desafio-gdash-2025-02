interface ImportMetaEnv {
  // Defina aqui as suas variáveis do .env
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}