import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * POST /api/equip
 * Server-side equip only. Validates entitlement via RPC equip_gear.
 * Body: { agentInstanceId, agentTitleId, slot, gearId, subjectType?, subjectId? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      agentInstanceId,
      agentTitleId,
      slot,
      gearId,
      subjectType = 'account',
      subjectId,
    } = body as {
      agentInstanceId?: string;
      agentTitleId?: string;
      slot?: string;
      gearId?: string;
      subjectType?: string;
      subjectId?: string;
    };

    if (!agentInstanceId || !agentTitleId || !slot || !gearId) {
      return NextResponse.json(
        { error: 'agentInstanceId, agentTitleId, slot, and gearId are required' },
        { status: 400 }
      );
    }

    if (!['primary', 'secondary', 'tools', 'knowledge'].includes(slot)) {
      return NextResponse.json({ error: 'invalid slot' }, { status: 400 });
    }

    const authHeader = request.headers.get('authorization');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnon) {
      return NextResponse.json({ error: 'server misconfigured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnon, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });

    const { data, error } = await supabase.rpc('equip_gear', {
      p_agent_instance_id: agentInstanceId,
      p_agent_title_id: agentTitleId,
      p_slot: slot,
      p_gear_id: gearId,
      p_subject_type: subjectType,
      p_subject_id: subjectId ?? null,
    });

    if (error) {
      const status = error.code === '42501' ? 403 : 400;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status }
      );
    }

    return NextResponse.json({ ok: true, loadout: data });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'equip failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
