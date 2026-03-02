import express from 'express';
import cors from 'cors';
import plannerRouter from './routes/planner';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/plan', plannerRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

export default app;
