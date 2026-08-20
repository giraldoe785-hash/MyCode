import { preview } from 'vite';

async function start() {
  const previewServer = await preview({
    configFile: false,
    preview: {
      port: 4173,
      open: true
    }
  });
  previewServer.printUrls();
}
start();