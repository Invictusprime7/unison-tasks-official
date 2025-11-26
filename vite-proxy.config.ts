import { defineConfig } from 'vite';

export const proxyConfig = {
  '/api/supabase': {
    target: 'https://nfrdomdvyrbwuokathtw.supabase.co',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/supabase/, ''),
    configure: (proxy: any, _options: any) => {
      proxy.on('error', (err: any, _req: any, _res: any) => {
        console.log('Proxy error:', err);
      });
      proxy.on('proxyReq', (proxyReq: any, req: any, _res: any) => {
        console.log('Proxying:', req.method, req.url);
      });
    },
  },
};
