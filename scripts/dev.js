import { createServer } from 'vite';
import react from '@vitejs/plugin-react';

async function start() {
  const server = await createServer({
    plugins: [react()],
    configFile: false,
    server: {
      port: 3000,
      open: true
    }
  });
  await server.listen();
  server.printUrls();
}
start();