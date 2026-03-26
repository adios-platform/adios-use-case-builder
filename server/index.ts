/**
 * AdiOS Use Case Builder — Offline Workshop Server
  *
   * Express server that serves the Vite-built frontend and provides a local
    * REST API backed by the file-system store (~/.adios-ucb/local-store.json).
     * Used for workshops and air-gapped environments.
      *
       * Usage: npm start (after npm run build)
        */

        import express from 'express';
        import path from 'path';
        import fs from 'fs';
        import os from 'os';
        import { fileURLToPath } from 'url';

        const __dirname = path.dirname(fileURLToPath(import.meta.url));

        const app = express();
        const PORT = process.env.UCB_SERVER_PORT ? parseInt(process.env.UCB_SERVER_PORT) : 3000;
        const STORE_PATH = process.env.UCB_LOCAL_STORE_PATH
          ? process.env.UCB_LOCAL_STORE_PATH.replace('~', os.homedir())
            : path.join(os.homedir(), '.adios-ucb', 'local-store.json');

            // ─── Ensure store directory exists ────────────────────────────────────────────
            const storeDir = path.dirname(STORE_PATH);
            if (!fs.existsSync(storeDir)) {
              fs.mkdirSync(storeDir, { recursive: true });
              }

              // ─── Load or initialise store ─────────────────────────────────────────────────
              function loadStore() {
                if (!fs.existsSync(STORE_PATH)) {
                    const seed = JSON.parse(
                          fs.readFileSync(path.join(__dirname, '../src/data/seed/use-cases.json'), 'utf-8')
                              );
                                  fs.writeFileSync(STORE_PATH, JSON.stringify({ useCases: seed, sessions: [] }, null, 2));
                                    }
                                      return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
                                      }

                                      function saveStore(data: unknown) {
                                        fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
                                        }

                                        // ─── Middleware ────────────────────────────────────────────────────────────────
                                        app.use(express.json());

                                        // Serve Vite build
                                        const distPath = path.join(__dirname, '../dist');
                                        if (fs.existsSync(distPath)) {
                                          app.use(express.static(distPath));
                                          }

                                          // ─── Local API routes (mirrors adios-gateway contract) ────────────────────────

                                          // Health / mode
                                          app.get('/api/health', (_req, res) => {
                                            res.json({ status: 'ok', mode: 'offline', version: '0.1.0' });
                                            });

                                            // List use cases
                                            app.get('/api/use-cases', (_req, res) => {
                                              const store = loadStore();
                                                res.json({ data: store.useCases, total: store.useCases.length });
                                                });

                                                // Get single use case
                                                app.get('/api/use-cases/:id', (req, res) => {
                                                  const store = loadStore();
                                                    const uc = store.useCases.find((u: { id: string }) => u.id === req.params.id);
                                                      if (!uc) return res.status(404).json({ error: 'Use case not found' });
                                                        res.json(uc);
                                                        });

                                                        // Create use case
                                                        app.post('/api/use-cases', (req, res) => {
                                                          const store = loadStore();
                                                            const newUC = {
                                                                ...req.body,
                                                                    id: `uc-${Date.now()}`,
                                                                        createdAt: new Date().toISOString(),
                                                                            updatedAt: new Date().toISOString(),
                                                                              };
                                                                                store.useCases.push(newUC);
                                                                                  saveStore(store);
                                                                                    res.status(201).json(newUC);
                                                                                    });

                                                                                    // Update use case
                                                                                    app.put('/api/use-cases/:id', (req, res) => {
                                                                                      const store = loadStore();
                                                                                        const idx = store.useCases.findIndex((u: { id: string }) => u.id === req.params.id);
                                                                                          if (idx === -1) return res.status(404).json({ error: 'Use case not found' });
                                                                                            store.useCases[idx] = { ...store.useCases[idx], ...req.body, updatedAt: new Date().toISOString() };
                                                                                              saveStore(store);
                                                                                                res.json(store.useCases[idx]);
                                                                                                });

                                                                                                // Delete use case
                                                                                                app.delete('/api/use-cases/:id', (req, res) => {
                                                                                                  const store = loadStore();
                                                                                                    store.useCases = store.useCases.filter((u: { id: string }) => u.id !== req.params.id);
                                                                                                      saveStore(store);
                                                                                                        res.status(204).send();
                                                                                                        });
                                                                                                        
                                                                                                        // Seed data endpoints (industry templates, data products)
                                                                                                        app.get('/api/templates', (_req, res) => {
                                                                                                          const templates = JSON.parse(
                                                                                                              fs.readFileSync(path.join(__dirname, '../src/data/seed/industry-templates.json'), 'utf-8')
                                                                                                                );
                                                                                                                  res.json({ data: templates });
                                                                                                                  });
                                                                                                                  
                                                                                                                  app.get('/api/data-products', (_req, res) => {
                                                                                                                    const products = JSON.parse(
                                                                                                                        fs.readFileSync(path.join(__dirname, '../src/data/seed/data-products.json'), 'utf-8')
                                                                                                                          );
                                                                                                                            res.json({ data: products });
                                                                                                                            });
                                                                                                                            
                                                                                                                            // Fallback: serve SPA for all non-API routes
                                                                                                                            app.get('*', (_req, res) => {
                                                                                                                              const indexPath = path.join(distPath, 'index.html');
                                                                                                                                if (fs.existsSync(indexPath)) {
                                                                                                                                    res.sendFile(indexPath);
                                                                                                                                      } else {
                                                                                                                                          res.status(503).send('Run "npm run build" first, then "npm start"');
                                                                                                                                            }
                                                                                                                                            });
                                                                                                                                            
                                                                                                                                            // ─── Start ────────────────────────────────────────────────────────────────────
                                                                                                                                            app.listen(PORT, () => {
                                                                                                                                              console.log(`\n🟢 AdiOS Use Case Builder — Offline Workshop Mode`);
                                                                                                                                                console.log(`   URL:   http://localhost:${PORT}`);
                                                                                                                                                  console.log(`   Store: ${STORE_PATH}`);
                                                                                                                                                    console.log(`   Mode:  offline (seed data + local persistence)\n`);
                                                                                                                                                    
                                                                                                                                                      // Auto-open browser if configured
                                                                                                                                                        if (process.env.UCB_AUTO_OPEN_BROWSER !== 'false') {
                                                                                                                                                            import('open').then(({ default: open }) => open(`http://localhost:${PORT}`));
                                                                                                                                                              }
                                                                                                                                                              });
