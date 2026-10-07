import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiRouter from "./ai";
import directoryRouter from "./directory";
import courtlistenerRouter from "./courtlistener";
import { webhooksRouter } from "./webhooks";
import { documentsRouter } from "./documents";
import mattersRouter from "./matters";
import { geminiRouter } from "./gemini";
import { filingRouter } from "./filing";
import { workflowRouter } from "./workflow";
import auditRouter from "./audit";
import chainOfCommandRouter from "./chain-of-command";
import { verifySession } from "../middleware/verifySession";

const router: IRouter = Router();

// Public (no session)
router.use(healthRouter);
router.use(webhooksRouter); // authenticated via HMAC secrets, not session

// Everything below requires a verified session
router.use(verifySession as any);

// Workflow DAG / signup / execution lookup — previously public; must be authenticated
router.use(workflowRouter);

router.use(aiRouter);
router.use(directoryRouter);
router.use(courtlistenerRouter);
router.use(documentsRouter);
router.use(mattersRouter);
router.use(geminiRouter);
router.use(filingRouter);
router.use("/audit", auditRouter as any);
router.use("/chain-of-command", chainOfCommandRouter as any);

export default router;
