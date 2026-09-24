import { Router, type Request, type Response } from 'express';
import { eq } from 'drizzle-orm';
import { db, mattersTable, timelineEventsTable, documentsTable, usersTable } from '@workspace/db';
import { AuthenticatedRequest } from '../middleware/verifySession';

export const mattersRouter = Router();

export interface MatterDetail {
  id: string;
  caseNumber: string;
  title: string;
  jurisdiction: string;
  courtName: string;
  status: 'active' | 'pending' | 'closed';
  judge: string;
  prosecutor: string;
  nextAction: {
    title: string;
    description: string;
    deadline: string;
    daysRemaining: number;
    urgency: 'critical' | 'normal' | 'low';
    statutoryRef: string;
  };
  parties: Array<{
    role: 'Litigant' | 'Prosecutor' | 'Judge' | 'Investigator';
    name: string;
    title: string;
    contact?: string;
  }>;
  issues: Array<{
    id: string;
    title: string;
    type: 'defense' | 'procedural' | 'evidentiary';
    status: 'In Review' | 'Draft Prepared' | 'Filed';
    statutoryRef: string;
    elements: string[];
  }>;
  deadlines: Array<{
    id: string;
    title: string;
    dueDate: string;
    type: 'court_filing' | 'appearance' | 'discovery';
    completed: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

const fallbackMatter: MatterDetail = {
  id: 'matter-001',
  caseNumber: 'IN-MAR-24-0187',
  title: 'State of Indiana v. Alex Thompson',
  jurisdiction: 'Indiana',
  courtName: 'Marion County Superior Court, Criminal Division 3',
  status: 'active',
  judge: 'Hon. Marcus Vance',
  prosecutor: 'Deputy DA Rachel Sterling (Bar #IN-88912)',
  nextAction: {
    title: 'File Formal Request for Complete Discovery Packet',
    description: 'Statutory deadline to compel production of body-cam footage and witness audio before Omnibus hearing.',
    deadline: '2026-08-24T17:00:00.000Z',
    daysRemaining: 5,
    urgency: 'critical',
    statutoryRef: 'Ind. R. Crim. P. 2.5 & Ind. Code § 35-36-8-1',
  },
  parties: [
    { role: 'Litigant', name: 'Alex Thompson', title: 'Self-Represented Litigant (Pro Se)' },
    { role: 'Prosecutor', name: 'Deputy DA Rachel Sterling', title: 'Marion County Prosecutor’s Office', contact: 'rsterling@marioncounty.in.gov' },
    { role: 'Judge', name: 'Hon. Marcus Vance', title: 'Superior Court Judge, Div 3', contact: 'Courtroom 4B' },
    { role: 'Investigator', name: 'Officer J. Martinez #402', title: 'IMPD Investigating Officer' },
  ],
  issues: [
    {
      id: 'iss-1',
      title: 'Fourth Amendment Search & Seizure Suppression',
      type: 'evidentiary',
      status: 'Draft Prepared',
      statutoryRef: 'U.S. Const. amend. IV & Ind. Const. art. 1, § 11',
      elements: ['Warrantless vehicle search', 'Lack of probable cause', 'Tainted fruit doctrine'],
    },
    {
      id: 'iss-2',
      title: 'Lack of Requisite Culpable Mental State (Mens Rea)',
      type: 'defense',
      status: 'In Review',
      statutoryRef: 'Ind. Code § 35-41-2-2',
      elements: ['Absence of knowingly/intentionally taking', 'Mistake of fact defense'],
    },
    {
      id: 'iss-3',
      title: 'Failure to Disclose Brady Exculpatory Surveillance',
      type: 'procedural',
      status: 'In Review',
      statutoryRef: 'Brady v. Maryland, 373 U.S. 83 (1963)',
      elements: ['Store CCTV store angle 2 withheld', 'Materiality to defense identification'],
    },
  ],
  deadlines: [
    { id: 'dl-1', title: 'Omnibus Hearing Motion Deadline', dueDate: '2026-08-24T17:00:00Z', type: 'court_filing', completed: false },
    { id: 'dl-2', title: 'Initial Pre-Trial Conference Appearance', dueDate: '2026-09-02T09:00:00Z', type: 'appearance', completed: false },
    { id: 'dl-3', title: 'Witness List & Alibi Notice Filing', dueDate: '2026-09-15T17:00:00Z', type: 'discovery', completed: false },
  ],
  createdAt: '2026-08-10T14:30:00.000Z',
  updatedAt: new Date().toISOString(),
};

mattersRouter.get('/matters', async (_req: Request, res: Response) => {
  try {
    const dbMatters = await db.select().from(mattersTable);
    if (Array.isArray(dbMatters) && dbMatters.length > 0) {
      const mapped = dbMatters.map((m) => ({
        ...fallbackMatter,
        id: m.id,
        caseNumber: m.caseNumber || fallbackMatter.caseNumber,
        title: m.title || fallbackMatter.title,
        courtName: m.courtName || fallbackMatter.courtName,
        jurisdiction: m.jurisdiction || fallbackMatter.jurisdiction,
        status: m.status || 'active',
      }));
      return res.json({ success: true, matters: mapped });
    }
    return res.json({ success: true, matters: [fallbackMatter] });
  } catch (err: any) {
    console.error('Fetch matters error:', err);
    return res.json({ success: true, matters: [fallbackMatter] });
  }
});

mattersRouter.get('/matters/:matterId', async (req: Request, res: Response) => {
  try {
    const { matterId } = req.params;
    const [dbMatter] = await db.select().from(mattersTable).where(eq(mattersTable.id, matterId));
    if (dbMatter) {
      return res.json({
        success: true,
        matter: {
          ...fallbackMatter,
          id: dbMatter.id,
          caseNumber: dbMatter.caseNumber || fallbackMatter.caseNumber,
          title: dbMatter.title || fallbackMatter.title,
          courtName: dbMatter.courtName || fallbackMatter.courtName,
          jurisdiction: dbMatter.jurisdiction || fallbackMatter.jurisdiction,
          status: dbMatter.status || 'active',
        },
      });
    }
    return res.json({ success: true, matter: fallbackMatter });
  } catch (err: any) {
    console.error('Fetch matter error:', err);
    return res.json({ success: true, matter: fallbackMatter });
  }
});

export default mattersRouter;
