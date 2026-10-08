import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// 输出归属固定为 3D 模块专用目录，不能清空上层 dist。
const outDir = fileURLToPath(new URL('../dist/assets/three/', import.meta.url));
if (!outDir.replaceAll('\\', '/').endsWith('/web/dist/assets/three/')) {
  throw new Error('拒绝不属于 3D 模块的构建输出目录');
}

export default defineConfig({
  base: './',
  build: {
    outDir,
    emptyOutDir: true,
    cssCodeSplit: false,
    modulePreload: false,
    target: ['chrome111', 'edge111', 'firefox114', 'safari16.4'],
    license: { fileName: 'THIRD_PARTY_LICENSES.md' },
    rolldownOptions: {
      input: fileURLToPath(new URL('./src/bootstrap.ts', import.meta.url)),
      output: {
        entryFileNames: 'viewer.js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (asset) => asset.names.some(name => name.endsWith('.css')) ? 'viewer.css' : 'assets/[name]-[hash][extname]',
      },
    },
  },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
