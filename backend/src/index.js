import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { connectDb, seedIfEmpty } from './db.js';
import authRoutes from './routes/auth.js';
import skillRoutes from './routes/skills.js';
import requestRoutes from './routes/requests.js';
import adminRoutes from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true, name: 'SkillSwap API' }));

app.use('/api/auth', authRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);

try {
  const swaggerDoc = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'swagger.json'), 'utf-8')
  );
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
} catch (e) {
  console.warn('Swagger doc not loaded:', e.message);
}

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await connectDb();
    await seedIfEmpty();
    app.listen(PORT, () => {
      console.log('SkillSwap API on http://localhost:' + PORT);
      console.log('Docs:           http://localhost:' + PORT + '/api/docs');
    });
  } catch (err) {
    console.error('Failed to start:', err.message);
    process.exit(1);
  }
})();
