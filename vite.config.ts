import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const DEFAULT_DEV_PORT = 4317;
const DEFAULT_PREVIEW_PORT = 4318;

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: Number(process.env.HOOKSMITH_PORT) || DEFAULT_DEV_PORT
  },
  preview: {
    host: '127.0.0.1',
    port: Number(process.env.HOOKSMITH_PREVIEW_PORT) || DEFAULT_PREVIEW_PORT
  }
});
