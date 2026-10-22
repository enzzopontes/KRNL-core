import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../design/store';
import { HudCard } from '../components/HudCard';
import { HudButton } from '../components/HudButton';
import { SPACING } from '../design/tokens';
import Constants from 'expo-constants';
const isDirect = Constants.expoConfig?.extra?.isDirect ?? false;

export default function SubscriptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getColors, accentColor, isPro, setIsPro } = useThemeStore();
  const colors = getColors();

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [paymentProvider, setPaymentProvider] = useState<'google' | 'pix'>('pix');
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsPro(true);
      Alert.alert(
        'Licença KRNL PRO Ativada',
        'Seu dispositivo agora possui acesso irrestrito a todos os temas HUD, automações e varreduras profundas.'
      );
    }, 1200);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.textPrimary }]}>&lt; VOLTAR</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: accentColor }]}>LICENCIAMENTO // KRNL PRO</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <HudCard title="Status do Usuário" badge={isPro ? 'PRO ATIVO' : 'FREE'}>
          <Text style={[styles.statusText, { color: isPro ? colors.success : colors.textPrimary }]}>
            {isPro ? 'LICENÇA VITALÍCIA / ASSINATURA ATIVA' : 'MODO GRATUITO'}
          </Text>
          <Text style={[styles.subText, { color: colors.textSecondary }]}>
            Gratuito: Painel, limpeza essencial, duplicadas exatas, debloat modo seguro.{'\n'}
            PRO: Limpeza profunda de mensageiros, fotos parecidas dHash, WorkManager semanal, widgets HUD e todas as cores accent.
          </Text>
        </HudCard>

        {/* Plan Selection */}
        <HudCard title="Selecione o Período">
          <View style={styles.plansRow}>
            <TouchableOpacity
              style={[
                styles.planBox,
                {
                  borderColor: selectedPlan === 'monthly' ? accentColor : colors.border,
                  backgroundColor: selectedPlan === 'monthly' ? colors.surfaceMuted : colors.surface,
                },
              ]}
              onPress={() => setSelectedPlan('monthly')}
            >
              <Text style={[styles.planTitle, { color: colors.textPrimary }]}>MENSAL</Text>
              <Text style={[styles.planPrice, { color: accentColor }]}>R$ 9,90</Text>
              <Text style={[styles.planPeriod, { color: colors.textSecondary }]}>por mês</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.planBox,
                {
                  borderColor: selectedPlan === 'annual' ? accentColor : colors.border,
                  backgroundColor: selectedPlan === 'annual' ? colors.surfaceMuted : colors.surface,
                },
              ]}
              onPress={() => setSelectedPlan('annual')}
            >
              <View style={[styles.saveBadge, { backgroundColor: accentColor }]}>
                <Text style={styles.saveText}>ECONOMIZE 58%</Text>
              </View>
              <Text style={[styles.planTitle, { color: colors.textPrimary }]}>ANUAL</Text>
              <Text style={[styles.planPrice, { color: accentColor }]}>R$ 49,90</Text>
              <Text style={[styles.planPeriod, { color: colors.textSecondary }]}>R$ 4,16/mês</Text>
            </TouchableOpacity>
          </View>
        </HudCard>

        {/* Payment Provider - Side-by-side compliance */}
        <HudCard title="Forma de Pagamento (Escolha Aberta)" badge="COMPLIANCE">
          <Text style={[styles.subText, { color: colors.textSecondary }]}>
            Conforme diretrizes brasileiras de cobrança alternativa, você pode optar pelo Google
            Play Billing ou faturamento direto via Mercado Pago (PIX / Cartão).
          </Text>

          <View style={styles.providerRow}>
            <TouchableOpacity
              style={[
                styles.providerOption,
                {
                  borderColor: paymentProvider === 'pix' ? accentColor : colors.border,
                  backgroundColor: paymentProvider === 'pix' ? colors.surfaceMuted : colors.surface,
                },
              ]}
              onPress={() => setPaymentProvider('pix')}
            >
              <Text style={[styles.provName, { color: colors.textPrimary }]}>MERCADO PAGO (PIX)</Text>
              <Text style={[styles.provSub, { color: colors.textSecondary }]}>Pagamento avulso sem renovação automática</Text>
            </TouchableOpacity>

            {!isDirect && (
              <TouchableOpacity
                style={[
                  styles.providerOption,
                  {
                    borderColor: paymentProvider === 'google' ? accentColor : colors.border,
                    backgroundColor: paymentProvider === 'google' ? colors.surfaceMuted : colors.surface,
                  },
                ]}
                onPress={() => setPaymentProvider('google')}
              >
                <Text style={[styles.provName, { color: colors.textPrimary }]}>GOOGLE PLAY BILLING</Text>
                <Text style={[styles.provSub, { color: colors.textSecondary }]}>Assinatura padrão integrada à sua conta Google</Text>
              </TouchableOpacity>
            )}
          </View>

          <HudButton
            label={loading ? 'PROCESSANDO...' : `ATIVAR PRO — ${selectedPlan === 'annual' ? 'R$ 49,90' : 'R$ 9,90'}`}
            variant="primary"
            loading={loading}
            style={{ marginTop: SPACING.md }}
            onPress={handleCheckout}
          />
        </HudCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  backText: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  content: {
    padding: SPACING.md,
  },
  statusText: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },
  subText: {
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 16,
  },
  plansRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  planBox: {
    flex: 1,
    borderWidth: 1,
    padding: SPACING.md,
    alignItems: 'center',
    position: 'relative',
  },
  saveBadge: {
    position: 'absolute',
    top: -8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  saveText: {
    color: '#000000',
    fontSize: 8,
    fontFamily: 'monospace',
    fontWeight: '900',
  },
  planTitle: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  planPrice: {
    fontFamily: 'monospace',
    fontSize: 20,
    fontWeight: '900',
    marginVertical: 4,
  },
  planPeriod: {
    fontFamily: 'monospace',
    fontSize: 10,
  },
  providerRow: {
    marginVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  providerOption: {
    borderWidth: 1,
    padding: SPACING.sm,
  },
  provName: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  provSub: {
    fontFamily: 'monospace',
    fontSize: 9,
    marginTop: 2,
  },
});
