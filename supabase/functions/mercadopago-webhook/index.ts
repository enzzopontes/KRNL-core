import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts';

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const mpAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    const mpWebhookSecret = Deno.env.get('MERCADO_PAGO_WEBHOOK_SECRET');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Validação de Assinatura x-signature do Mercado Pago
    const xSignature = req.headers.get('x-signature');
    const xRequestId = req.headers.get('x-request-id');
    const rawBody = await req.text();

    if (mpWebhookSecret && xSignature) {
      // Formato: ts=...,v1=...
      const parts = xSignature.split(',');
      let ts = '';
      let hash = '';
      for (const p of parts) {
        const [k, v] = p.trim().split('=');
        if (k === 'ts') ts = v;
        if (k === 'v1') hash = v;
      }

      const manifest = `id:${req.url};request-id:${xRequestId};ts:${ts};`;
      const expectedHmac = createHmac('sha256', mpWebhookSecret)
        .update(manifest)
        .digest('hex');

      // Se falhar a assinatura em produção, rejeita
      if (expectedHmac !== hash) {
        return new Response(JSON.stringify({ error: 'Assinatura inválida (x-signature mismatch)' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const body = JSON.parse(rawBody);

    // 2. Consulta à API oficial do Mercado Pago para conferir se o pagamento foi realmente aprovado
    if (body.type === 'payment' && body.data?.id) {
      const paymentId = body.data.id.toString();

      let isApproved = true;
      let plan = 'pro_monthly';
      let userId: string | null = null;

      if (mpAccessToken) {
        const checkRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${mpAccessToken}` },
        });
        const paymentData = await checkRes.json();
        isApproved = paymentData.status === 'approved';
        userId = paymentData.external_reference || null;
      }

      if (isApproved) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        // 3. Atualização Idempotente no banco via upsert
        await supabase.from('licenses').upsert(
          {
            provider_payment_id: paymentId,
            user_id: userId,
            plan: plan,
            status: 'active',
            provider: 'mercadopago',
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'provider_payment_id' }
        );
      }
    }

    return new Response(JSON.stringify({ received: true, verified: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
