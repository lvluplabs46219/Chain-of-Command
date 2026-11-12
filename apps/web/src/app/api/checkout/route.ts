import { checkBotId } from 'botid/server';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * POST /api/checkout
 * Base + USDC checkout → record payment → on confirm, grant entitlement.
 *
 * Body:
 * {
 *   subjectType: 'wallet' | 'account',
 *   subjectId: string,
 *   skuId: string,
 *   amountUsdc: number,
 *   txHash?: string,          // set when client already submitted tx
 *   grantType?: string,       // gear | kit | pack | sku
 *   grantId?: string,
 *   durationDays?: number,
 *   walletAddress?: string
 * }
 *
 * Flow:
 * 1. Client connects wallet, transfers USDC on Base to treasury.
 * 2. Client POSTs here with txHash (or initiates pending then confirms).
 * 3. Backend verifies tx (indexer / RPC) — stub accepts txHash in non-prod.
 * 4. Marks payment confirmed and calls grant_entitlement_from_payment.
 */
export async function POST(request: NextRequest) {
  const verification = await checkBotId();
  if (verification.isBot) {
    return NextResponse.json(
      { error: 'Access denied: bot detected', isBot: true },
      { status: 403 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const {
      subjectType = 'wallet',
      subjectId,
      skuId,
      amountUsdc,
      txHash,
      grantType = 'sku',
      grantId,
      durationDays = 30,
      walletAddress,
    } = body as Record<string, unknown>;

    if (!subjectId || !skuId || amountUsdc === undefined) {
      return NextResponse.json(
        { error: 'subjectId, skuId, and amountUsdc are required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'server misconfigured' }, { status: 500 });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    const grant_payload = {
      grant_type: grantType,
      grant_id: (grantId as string) || (skuId as string),
      duration_days: durationDays,
      wallet: walletAddress ?? subjectId,
    };

    // Insert pending (or confirmed if txHash present and verified)
    const status = txHash ? 'confirmed' : 'pending';

    // TODO: production — verify Base USDC transfer to treasury via RPC/indexer
    // before setting status = 'confirmed'. Never trust client-only confirmation.

    const { data: payment, error: payErr } = await admin
      .from('crypto_payments')
      .insert({
        subject_type: subjectType,
        subject_id: String(subjectId).toLowerCase(),
        chain: 'base',
        token: 'USDC',
        amount_usdc: amountUsdc,
        tx_hash: txHash ? String(txHash) : null,
        status,
        sku_id: skuId,
        grant_payload,
        confirmed_at: status === 'confirmed' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (payErr) {
      return NextResponse.json({ error: payErr.message }, { status: 400 });
    }

    let entitlement = null;
    if (status === 'confirmed' && payment?.id) {
      const { data: ent, error: entErr } = await admin.rpc(
        'grant_entitlement_from_payment',
        { p_payment_id: payment.id }
      );
      if (entErr) {
        return NextResponse.json(
          {
            success: false,
            payment,
            entitlementError: entErr.message,
          },
          { status: 500 }
        );
      }
      entitlement = ent;
    }

    return NextResponse.json({
      success: true,
      chain: 'base',
      token: 'USDC',
      payment,
      entitlement,
      message:
        status === 'confirmed'
          ? 'Payment confirmed; entitlement granted'
          : 'Payment pending — submit txHash to confirm',
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'checkout failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
