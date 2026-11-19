import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../design/store';
import { HudCard } from '../components/HudCard';
import { HudButton } from '../components/HudButton';
import { HudHeader } from '../components/HudHeader';
import { HudBottomBar } from '../components/HudBottomBar';
import { SPACING } from '../design/tokens';
import Constants from 'expo-constants';

const isDirect = Constants.expoConfig?.extra?.isDirect ?? false;

export default function SubscriptionScreen() {
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

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancelar Assinatura PRO',
      'Deseja reverter para a versão gratuita? Seus dados e backups locais de lixeira permanecerão intactos.',
      [
        { text: 'Manter PRO', style: 'cancel' },
        {
          text: 'Confirmar Cancelamento',
          style: 'destructive',
          onPress: () => {
            setIsPro(false);
            Alert.alert('Plano Cancelado', 'Sua assinatura foi desativada com sucesso.');
          },
        },
      ]
    );
  };

  const handleRefundTerms = () => {
    Alert.alert(
      'Política de Reembolso & Arrependimento',
      'Artigo 49 do CDC: Direito de arrependimento em até 7 dias corridos após a contratação. Reembolsos PIX processados pelo Mercado Pago e Google Play Billing diretamente pela loja.',
      [{ text: 'Entendido' }]
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <HudHeader showBack title="KRNL PRO // LICENÇA" subtitle="ASSINATURA TRANSPARENTE" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 84 }]}
        showsVerticalScrollIndicator={false}
      >
        <HudCard
          title="Status da Licença"
          badge={isPro ? 'PRO ATIVO' : 'MODO GRATUITO'}
          badgeVariant={isPro ? 'ok' : 'default'}
          subtitle={isPro ? 'Acesso total a todas as ferramentas e temas' : 'Recursos essenciais liberados sem anúncios'}
        >
          <Text style={[styles.statusText, { color: isPro ? colors.success : colors.textPrimary }]}>
            {isPro ? 'LICENÇA ATIVA // KRNL PRO' : 'VERSÃO ESSENCIAL GRATUITA'}
          </Text>
          <Text style={[styles.subText, { color: colors.textSecondary }]}>
            • Gratuito: Painel, limpeza de caches, duplicadas exatas xxHash, debloat modo seguro e explorador.{'\n'}
            • PRO: Fotos similares dHash, limpeza profunda de mensagens, agendador WorkManager e todos os temas.
          </Text>

          {isPro && (
            <View style={{ marginTop: SPACING.md }}>
              <HudButton
                label="GERENCIAR / CANCELAR ASSINATURA"
                variant="danger"
                onPress={handleCancelSubscription}
              />
            </View>
          )}
        </HudCard>

        {/* Plan Selection */}
        {!isPro && (
          <>
            <HudCard
              title="Período de Assinatura"
              badge="ESCOLHA DIRETA"
              subtitle="Cancele a qualquer momento sem pegadinhas ou cobranças ocultas"
            >
              <View style={styles.plansRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.planBox,
                    {
                      borderColor: selectedPlan === 'monthly' ? accentColor : colors.border,
                      backgroundColor: selectedPlan === 'monthly' ? 'rgba(255,255,255,0.05)' : colors.surfaceAlt,
                    },
                  ]}
                  onPress={() => setSelectedPlan('monthly')}
                >
                  <Text style={[styles.planTitle, { color: colors.textPrimary }]}>MENSAL</Text>
                  <Text style={[styles.planPrice, { color: accentColor }]}>R$ 9,90</Text>
                  <Text style={[styles.planPeriod, { color: colors.textSecondary }]}>cobrança mensal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.planBox,
                    {
                      borderColor: selectedPlan === 'annual' ? accentColor : colors.border,
                      backgroundColor: selectedPlan === 'annual' ? 'rgba(255,255,255,0.05)' : colors.surfaceAlt,
                    },
                  ]}
                  onPress={() => setSelectedPlan('annual')}
                >
                  <View style={[styles.saveBadge, { backgroundColor: accentColor }]}>
                    <Text style={styles.saveText}>ECONOMIZE 58%</Text>
                  </View>
                  <Text style={[styles.planTitle, { color: colors.textPrimary }]}>ANUAL</Text>
                  <Text style={[styles.planPrice, { color: accentColor }]}>R$ 49,90</Text>
                  <Text style={[styles.planPeriod, { color: colors.textSecondary }]}>equivale a R$ 4,16/mês</Text>
                </TouchableOpacity>
              </View>
            </HudCard>

            {/* Payment Provider */}
            <HudCard
              title="Método de Faturamento"
              badge="COMPLIANCE"
              subtitle="Conforme diretrizes brasileiras de cobrança transparente"
            >
              <View style={styles.providerRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.providerOption,
                    {
                      borderColor: paymentProvider === 'pix' ? accentColor : colors.border,
                      backgroundColor: paymentProvider === 'pix' ? 'rgba(255,255,255,0.05)' : colors.surfaceAlt,
                    },
                  ]}
                  onPress={() => setPaymentProvider('pix')}
                >
                  <Text style={[styles.provName, { color: colors.textPrimary }]}>MERCADO PAGO (PIX)</Text>
                  <Text style={[styles.provSub, { color: colors.textSecondary }]}>
                    Pagamento avulso sem renovação automática forçada
                  </Text>
                </TouchableOpacity>

                {!isDirect && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                      styles.providerOption,
                      {
                        borderColor: paymentProvider === 'google' ? accentColor : colors.border,
                        backgroundColor: paymentProvider === 'google' ? 'rgba(255,255,255,0.05)' : colors.surfaceAlt,
                      },
                    ]}
                    onPress={() => setPaymentProvider('google')}
                  >
                    <Text style={[styles.provName, { color: colors.textPrimary }]}>GOOGLE PLAY BILLING</Text>
                    <Text style={[styles.provSub, { color: colors.textSecondary }]}>
                      Assinatura gerenciada diretamente via conta Google
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <HudButton
                label={loading ? 'PROCESSANDO...' : `ATIVAR PRO — ${selectedPlan === 'annual' ? 'R$ 49,90/ANO' : 'R$ 9,90/MÊS'}`}
                variant="primary"
                loading={loading}
                style={{ marginTop: SPACING.md }}
                onPress={handleCheckout}
              />
            </HudCard>
          </>
        )}

        <HudCard title="Segurança & Reembolso" badge="CDC 7 DIAS">
          <Text style={[styles.subText, { color: colors.textSecondary }]}>
            Transações protegidas por criptografia de ponta a ponta e direito legal de arrependimento em até 7 dias corridos.
          </Text>
          <TouchableOpacity onPress={handleRefundTerms} style={{ marginTop: SPACING.xs }}>
            <Text style={{ fontFamily: 'monospace', fontSize: 10, color: accentColor, fontWeight: '700' }}>
              [ LER POLÍTICA DE REEMBOLSO (CDC) ]
            </Text>
          </TouchableOpacity>
        </HudCard>
      </ScrollView>

      <HudBottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: SPACING.md },
  statusText: { fontFamily: 'monospace', fontSize: 13, fontWeight: '900', marginBottom: 4 },
  subText: { fontFamily: 'monospace', fontSize: 11, lineHeight: 16 },
  plansRow: { flexDirection: 'row', gap: SPACING.sm, marginVertical: SPACING.xs },
  planBox: { flex: 1, borderWidth: 1, padding: SPACING.md, alignItems: 'center', position: 'relative', borderRadius: 2 },
  saveBadge: { position: 'absolute', top: -10, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2 },
  saveText: { color: '#000000', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' },
  planTitle: { fontFamily: 'monospace', fontSize: 11, fontWeight: '800' },
  planPrice: { fontFamily: 'monospace', fontSize: 18, fontWeight: '900', marginVertical: 4 },
  planPeriod: { fontFamily: 'monospace', fontSize: 9 },
  providerRow: { gap: SPACING.xs, marginVertical: SPACING.sm },
  providerOption: { borderWidth: 1, padding: SPACING.sm, borderRadius: 2 },
  provName: { fontFamily: 'monospace', fontSize: 11, fontWeight: '800' },
  provSub: { fontFamily: 'monospace', fontSize: 9, marginTop: 2 },
});
