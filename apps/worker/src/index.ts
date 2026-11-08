import { Client } from "pg";

export interface Env {
  HYPERDRIVE: Hyperdrive;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    // Health check without DB
    if (url.pathname === "/health") {
      return Response.json({ ok: true, service: "chain-of-command-worker" });
    }

    const client = new Client({
      connectionString: env.HYPERDRIVE.connectionString,
    });

    try {
      await client.connect();

      if (url.pathname === "/tables" || url.pathname === "/") {
        const result = await client.query(
          `SELECT schemaname, tablename
           FROM pg_tables
           WHERE schemaname = 'public'
           ORDER BY tablename`
        );
        return Response.json({
          ok: true,
          source: "hyperdrive",
          tables: result.rows,
        });
      }

      if (url.pathname === "/size") {
        const result = await client.query(`
          SELECT
            schemaname || '.' || relname AS table_name,
            pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
            n_live_tup AS approx_rows
          FROM pg_stat_user_tables
          ORDER BY pg_total_relation_size(relid) DESC
          LIMIT 20
        `);
        return Response.json({ ok: true, tables: result.rows });
      }

      return Response.json(
        { error: "Not found", paths: ["/", "/tables", "/size", "/health"] },
        { status: 404 }
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return Response.json({ ok: false, error: message }, { status: 500 });
    } finally {
      await client.end().catch(() => {});
    }
  },
} satisfies ExportedHandler<Env>;
