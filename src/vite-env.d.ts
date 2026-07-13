/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Lambda Function URL that emails lead submissions via SES. Set in
   * .env.production. When absent, the site falls back to FakeLeadsProvider.
   */
  readonly VITE_LEADS_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
