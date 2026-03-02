import { Router, Request, Response } from 'express';
import { pool } from '../db/connection';

const router = Router();

// GET /api/plan — load the saved plan
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT plan_data FROM planner_plan ORDER BY updated_at DESC LIMIT 1'
    );
    if (result.rows.length === 0) {
      return res.json(null);
    }
    return res.json(result.rows[0].plan_data);
  } catch (err) {
    console.error('Error loading plan:', err);
    return res.status(500).json({ error: 'Failed to load plan' });
  }
});

// POST /api/plan — upsert the full plan
router.post('/', async (req: Request, res: Response) => {
  try {
    const planData = req.body;
    await pool.query(
      `INSERT INTO planner_plan (plan_data, updated_at)
       VALUES ($1, NOW())
       ON CONFLICT ((true)) DO UPDATE
         SET plan_data = EXCLUDED.plan_data,
             updated_at = NOW()`,
      [planData]
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('Error saving plan:', err);
    return res.status(500).json({ error: 'Failed to save plan' });
  }
});

export default router;
