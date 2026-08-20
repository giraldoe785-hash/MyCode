import { build } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

console.log("Starting programmatic Vite build...");
try {
  if (fs.existsSync('dist')) {
    try {
      fs.rmSync('dist', { recursive: true, force: true });
    } catch (e) {
      console.warn("Could not fully delete old dist, overwriting files...");
    }
  }

  await build({
    plugins: [react()],
    configFile: false,
    build: {
      emptyOutDir: false
    }
  });
  console.log("Programmatic Vite build completed successfully!");
} catch (err) {
  console.error("Build failed:", err);
  process.exit(1);
}