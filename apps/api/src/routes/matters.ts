import { Router, type Request, type Response } from 'express';
import { eq } from 'drizzle-orm';
import { db, mattersTable, timelineEventsTable, documentsTable } from '@workspace/db';
import { AuthenticatedRequest } from '../middleware/verifySession';
import { verifySession } from '../middleware/verifySession';

export const mattersRouter = Router();

// Apply authentication middleware to all matter routes
mattersRouter.use(verifySession);

mattersRouter.get('/matters', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized: User not authenticated' });
    }

    // CRITICAL: Scope query to authenticated user's matters only
    const dbMatters = await db
      .select()
      .from(mattersTable)
      .where(eq(mattersTable.userId, user.id));
    
    if (Array.isArray(dbMatters) && dbMatters.length > 0) {
      const mapped = dbMatters.map((m) => ({
        id: m.id,
        caseNumber: m.caseNumber || '',
        title: m.title || '',
        courtName: m.courtName || '',
        jurisdiction: m.jurisdiction || '',
        status: m.status || 'active',
        createdAt: m.createdAt || new Date().toISOString(),
        updatedAt: m.updatedAt || new Date().toISOString(),
      }));
      return res.json({ success: true, matters: mapped });
    }
    
    // Return empty array for users with no matters - do NOT return shared fallback with PII
    return res.json({ success: true, matters: [] });
  } catch (err: any) {
    console.error('Fetch matters error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch matters' });
  }
});

mattersRouter.get('/matters/:matterId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized: User not authenticated' });
    }

    const { matterId } = req.params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(matterId)) {
      return res.status(400).json({ success: false, error: 'Invalid matter ID format' });
    }
    
    // CRITICAL: Verify the matter belongs to the authenticated user
    const [dbMatter] = await db
      .select()
      .from(mattersTable)
      .where(eq(mattersTable.id, matterId));
    
    if (!dbMatter) {
      return res.status(404).json({ success: false, error: 'Matter not found' });
    }
    
    // Verify ownership - matter's userId must match authenticated user's ID
    if (dbMatter.userId !== user.id) {
      console.warn(`User ${user.id} attempted to access matter ${matterId} owned by ${dbMatter.userId}`);
      return res.status(403).json({ success: false, error: 'Forbidden: Matter does not belong to authenticated user' });
    }
    
    return res.json({
      success: true,
      matter: {
        id: dbMatter.id,
        caseNumber: dbMatter.caseNumber || '',
        title: dbMatter.title || '',
        courtName: dbMatter.courtName || '',
        jurisdiction: dbMatter.jurisdiction || '',
        status: dbMatter.status || 'active',
        description: dbMatter.description || '',
        createdAt: dbMatter.createdAt || new Date().toISOString(),
        updatedAt: dbMatter.updatedAt || new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('Fetch matter error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch matter' });
  }
});

export default mattersRouter;
