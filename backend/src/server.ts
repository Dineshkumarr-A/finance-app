import app from './app';
import { initDb } from './db/connection';

const PORT = parseInt(process.env.PORT || '3000', 10);

async function start() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`Finance Planner API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
