/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IS_DEVELOPER_COPY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
