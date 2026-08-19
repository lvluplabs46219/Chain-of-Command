import { z } from 'zod';

export const LegalCitationSchema = z.object({
  statuteOrRule: z.string().min(1, 'Statute or rule reference is required'),
  sourceUrl: z.string().url().optional(),
  summary: z.string().min(1, 'Summary of rule/statute is required'),
});

export const LegalInfoResponseSchema = z.object({
  disclaimer: z.literal(
    'This information is for educational purposes only and does not constitute legal advice.'
  ),
  jurisdiction: z.object({
    state: z.string().min(2).max(2), // e.g., 'AZ', 'CA', 'TX'
    county: z.string().optional(),
  }),
  citations: z.array(LegalCitationSchema).min(1, 'At least one verified authority citation is required'),
  proceduralSteps: z.array(z.string()).min(1, 'Procedural steps must be listed sequentially'),
  requiresHumanReview: z.literal(true),
  // Strict prohibition against predictive metrics
  outcomePredictionAllowed: z.literal(false),
});

export type LegalInfoResponse = z.infer<typeof LegalInfoResponseSchema>;
