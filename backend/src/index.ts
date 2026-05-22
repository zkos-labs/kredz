import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { scoreRouter } from './api/routes';
import { errorHandler } from './api/middleware';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/v1', scoreRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`[kredz-backend] scoring engine running on :${config.PORT}`);
  console.log(`[kredz-backend] environment: ${config.NODE_ENV}`);
});

export default app;
