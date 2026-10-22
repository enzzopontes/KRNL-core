import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://stub.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'stub-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface LicenseStatus {
  isPro: boolean;
  plan?: 'pro_monthly' | 'pro_annual';
  expiresAt?: string;
  provider?: 'google_play' | 'mercadopago';
}

export async function fetchUserLicense(userId: string): Promise<LicenseStatus> {
  try {
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (error || !data) {
      return { isPro: false };
    }

    const isExpired = new Date(data.expires_at).getTime() < Date.now();
    return {
      isPro: !isExpired,
      plan: data.plan,
      expiresAt: data.expires_at,
      provider: data.provider,
    };
  } catch {
    return { isPro: false };
  }
}
