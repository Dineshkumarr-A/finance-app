import express from 'express';
import cors from 'cors';
import plannerRouter from './routes/planner';
import authRouter from './routes/auth';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRouter);
app.use('/api/plan', plannerRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

export default app;
