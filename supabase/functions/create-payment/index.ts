import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { plan, paymentMethod, email, userId } = await req.json();

    const mpAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    if (!mpAccessToken) {
      // Stub para ambiente sem chave configurada (conforme regra de execução)
      return new Response(
        JSON.stringify({
          success: true,
          isStub: true,
          qrCode: '00020126580014br.gov.bcb.pix0136krnl-core-pix-stub520400005303986540509.905802BR5913KRNL CORE APP6009SAO PAULO62070503***6304ABCD',
          qrCodeBase64: '',
          paymentId: `stub_${Date.now()}`,
          amount: plan === 'pro_annual' ? 49.90 : 9.90,
          status: 'pending',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Chamada oficial à API do Mercado Pago
    const amount = plan === 'pro_annual' ? 49.90 : 9.90;
    const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `${userId}_${plan}_${Date.now()}`,
      },
      body: JSON.stringify({
        transaction_amount: amount,
        description: `KRNL Core PRO (${plan})`,
        payment_method_id: paymentMethod === 'pix' ? 'pix' : 'bolbradesco',
        payer: {
          email: email || 'user@krnl.app',
        },
      }),
    });

    const mpData = await mpRes.json();

    return new Response(JSON.stringify(mpData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
