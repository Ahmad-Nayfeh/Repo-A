import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// Base path: GitHub Pages serves the site at /<repo>/ — override with BASE env for other hosts.
export default defineConfig({
  base: process.env.BASE ?? './',
  plugins: [preact()],
  build: { target: 'es2022', sourcemap: true },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
} as never);
