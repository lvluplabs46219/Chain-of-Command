import { Client } from "pg";

export function createDbClient(connectionString: string): Client {
  return new Client({ connectionString });
}

export async function withDb<T>(
  connectionString: string,
  fn: (client: Client) => Promise<T>
): Promise<T> {
  const client = createDbClient(connectionString);
  try {
    await client.connect();
    return await fn(client);
  } finally {
    await client.end().catch(() => {});
  }
}

const FREE_BASELINE_GEAR = new Set([
  "task-stamp",
  "yellow-pad",
  "case-file",
  "desk-calendar",
  "rolodex",
  "law-reporter",
  "sticky-tabs",
  "reading-glasses",
  "fountain-pen",
  "speakerphone",
  "envelope",
  "circuit-binder",
  "ledger-viewer",
  "wallet-checklist",
  "lockbox",
]);

export async function hasActiveEntitlement(
  client: Client,
  subjectType: string,
  subjectId: string,
  grantType: string,
  grantId: string
): Promise<boolean> {
  const { rows } = await client.query(
    `SELECT 1 FROM public.entitlements
     WHERE subject_type = $1
       AND subject_id = $2
       AND grant_type = $3
       AND grant_id = $4
       AND (expires_at IS NULL OR expires_at > now())
     LIMIT 1`,
    [subjectType, subjectId, grantType, grantId]
  );
  return rows.length > 0;
}

export async function canEquipGear(
  client: Client,
  subjectType: string,
  subjectId: string,
  gearId: string
): Promise<boolean> {
  if (FREE_BASELINE_GEAR.has(gearId)) return true;

  for (const grantType of ["gear", "kit", "sku", "default"] as const) {
    if (await hasActiveEntitlement(client, subjectType, subjectId, grantType, gearId)) {
      return true;
    }
  }
  return false;
}

export async function equipGear(
  client: Client,
  opts: {
    agentInstanceId: string;
    agentTitleId: string;
    slot: "primary" | "secondary" | "tools" | "knowledge";
    gearId: string;
    subjectType: string;
    subjectId: string;
    userId?: string;
  }
) {
  const allowed = await canEquipGear(
    client,
    opts.subjectType,
    opts.subjectId,
    opts.gearId
  );
  if (!allowed) {
    const err = new Error(`no entitlement for gear ${opts.gearId}`);
    (err as Error & { status: number }).status = 403;
    throw err;
  }

  const { rows } = await client.query(
    `INSERT INTO public.agent_loadouts AS al (
       agent_instance_id, agent_title_id, user_id,
       primary_gear_id, secondary_gear, tools_gear, knowledge_gear
     ) VALUES (
       $1, $2, $3,
       CASE WHEN $4 = 'primary' THEN $5 ELSE NULL END,
       CASE WHEN $4 = 'secondary' THEN ARRAY[$5]::text[] ELSE '{}'::text[] END,
       CASE WHEN $4 = 'tools' THEN ARRAY[$5]::text[] ELSE '{}'::text[] END,
       CASE WHEN $4 = 'knowledge' THEN ARRAY[$5]::text[] ELSE '{}'::text[] END
     )
     ON CONFLICT (agent_instance_id) DO UPDATE SET
       agent_title_id = EXCLUDED.agent_title_id,
       user_id = COALESCE(EXCLUDED.user_id, al.user_id),
       primary_gear_id = CASE WHEN $4 = 'primary' THEN $5 ELSE al.primary_gear_id END,
       secondary_gear = CASE
         WHEN $4 = 'secondary' THEN (
           SELECT ARRAY(SELECT DISTINCT g FROM unnest(al.secondary_gear || ARRAY[$5]::text[]) AS g)
         ) ELSE al.secondary_gear
       END,
       tools_gear = CASE
         WHEN $4 = 'tools' THEN (
           SELECT ARRAY(SELECT DISTINCT g FROM unnest(al.tools_gear || ARRAY[$5]::text[]) AS g)
         ) ELSE al.tools_gear
       END,
       knowledge_gear = CASE
         WHEN $4 = 'knowledge' THEN (
           SELECT ARRAY(SELECT DISTINCT g FROM unnest(al.knowledge_gear || ARRAY[$5]::text[]) AS g)
         ) ELSE al.knowledge_gear
       END,
       updated_at = now()
     RETURNING *`,
    [
      opts.agentInstanceId,
      opts.agentTitleId,
      opts.userId ?? opts.subjectId,
      opts.slot,
      opts.gearId,
    ]
  );
  return rows[0];
}

export async function recordPaymentAndGrant(
  client: Client,
  opts: {
    subjectType: string;
    subjectId: string;
    skuId: string;
    amountUsdc: number;
    txHash?: string | null;
    grantType?: string;
    grantId?: string;
    durationDays?: number;
  }
) {
  const status = opts.txHash ? "confirmed" : "pending";
  const grantType = opts.grantType ?? "sku";
  const grantId = opts.grantId ?? opts.skuId;
  const durationDays = opts.durationDays ?? 30;

  const grantPayload = {
    grant_type: grantType,
    grant_id: grantId,
    duration_days: durationDays,
  };

  // TODO production: verify Base USDC transfer to treasury before confirmed
  const payRes = await client.query(
    `INSERT INTO public.crypto_payments (
       subject_type, subject_id, chain, token, amount_usdc,
       tx_hash, status, sku_id, grant_payload, confirmed_at
     ) VALUES ($1, $2, 'base', 'USDC', $3, $4, $5, $6, $7::jsonb,
       CASE WHEN $5 = 'confirmed' THEN now() ELSE NULL END)
     RETURNING *`,
    [
      opts.subjectType,
      opts.subjectId.toLowerCase(),
      opts.amountUsdc,
      opts.txHash ?? null,
      status,
      opts.skuId,
      JSON.stringify(grantPayload),
    ]
  );
  const payment = payRes.rows[0];

  let entitlement = null;
  if (status === "confirmed") {
    const expiresAt =
      durationDays > 0
        ? new Date(Date.now() + durationDays * 86400000).toISOString()
        : null;

    const entRes = await client.query(
      `INSERT INTO public.entitlements (
         subject_type, subject_id, grant_type, grant_id,
         source, source_ref, quantity, expires_at, metadata
       ) VALUES ($1, $2, $3, $4, 'purchase', $5, 1, $6, $7::jsonb)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [
        opts.subjectType,
        opts.subjectId.toLowerCase(),
        grantType,
        grantId,
        opts.txHash ?? payment.id,
        expiresAt,
        JSON.stringify({ payment_id: payment.id, sku_id: opts.skuId }),
      ]
    );
    entitlement = entRes.rows[0] ?? null;

    if (!entitlement) {
      const existing = await client.query(
        `SELECT * FROM public.entitlements
         WHERE subject_type = $1 AND subject_id = $2
           AND grant_type = $3 AND grant_id = $4
         LIMIT 1`,
        [opts.subjectType, opts.subjectId.toLowerCase(), grantType, grantId]
      );
      entitlement = existing.rows[0] ?? null;
    }
  }

  return { payment, entitlement, status };
}

export async function listEntitlements(
  client: Client,
  subjectType: string,
  subjectId: string
) {
  const { rows } = await client.query(
    `SELECT * FROM public.entitlements
     WHERE subject_type = $1 AND subject_id = $2
       AND (expires_at IS NULL OR expires_at > now())
     ORDER BY created_at DESC`,
    [subjectType, subjectId.toLowerCase()]
  );
  return rows;
}
