import { Router, type IRouter } from "express";
import { z } from "zod";

export const HealthCheckResponse = z.object({
  status: z.string()
});

const router: IRouter = Router();

router.get(["/health", "/healthz"], (_req, res) => {
  console.log("Health endpoint hit!");
  const data = HealthCheckResponse.parse({ status: "ok" });
  return res.json(data);
});

export default router;
