import { Router, Response } from 'express';
import { pool } from '../db/connection';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// GET /api/plan — load the saved plan for the authenticated user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT plan_data FROM planner_plan WHERE user_id = $1',
      [req.userId]
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

// POST /api/plan — upsert the full plan for the authenticated user
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const planData = req.body;
    await pool.query(
      `INSERT INTO planner_plan (user_id, plan_data, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id) DO UPDATE
         SET plan_data = EXCLUDED.plan_data,
             updated_at = NOW()`,
      [req.userId, planData]
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('Error saving plan:', err);
    return res.status(500).json({ error: 'Failed to save plan' });
  }
});

export default router;
