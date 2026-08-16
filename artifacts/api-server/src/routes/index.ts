import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiRouter from "./ai";
import directoryRouter from "./directory";
import courtlistenerRouter from "./courtlistener";
import { webhooksRouter } from "./webhooks";
import { documentsRouter } from "./documents";
import { mattersRouter } from "./matters";
import { geminiRouter } from "./gemini";
import { verifySession } from "../middleware/verifySession";

const router: IRouter = Router();

router.use(healthRouter);
router.use(webhooksRouter); // public via HMAC

router.use(verifySession as any);
router.use(aiRouter);
router.use(directoryRouter);
router.use(courtlistenerRouter);
router.use(documentsRouter);
router.use(mattersRouter);
router.use(geminiRouter);

export default router;
