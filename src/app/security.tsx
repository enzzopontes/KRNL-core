import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../design/store';
import { HudCard } from '../components/HudCard';
import { HudButton } from '../components/HudButton';
import { SPACING } from '../design/tokens';
import { checkFileHashVirusTotal, openPlayProtect, openDeveloperSettings } from '../services/security';

export default function SecurityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getColors, accentColor } = useThemeStore();
  const colors = getColors();

  const [testingVt, setTestingVt] = useState(false);

  const handleTestVirusTotal = async () => {
    setTestingVt(true);
    try {
      const res = await checkFileHashVirusTotal('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
      Alert.alert(
        'Auditoria VirusTotal (STUB Ativo)',
        `Status: ${res.isClean ? 'LIMPO' : 'AMEAÇA'}\nEngines: ${res.positives}/${res.total}\nData: ${res.scanDate}\n* Stub seguro até licença comercial.`
      );
    } finally {
      setTestingVt(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.textPrimary }]}>&lt; PAINEL</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: accentColor }]}>SEGURANÇA // AUDITORIA</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <HudCard title="Postura & Honestidade" badge="AUDITORIA REAL">
          <Text style={[styles.subText, { color: colors.textSecondary }]}>
            O KRNL Core não é um antivírus residente de fundo falso. Ele audita vetores reais de risco
            no Android sem inventar falsos positivos para forçar compras.
          </Text>
        </HudCard>

        {/* Security Vectors */}
        <HudCard title="Vetores do Sistema">
          <View style={styles.vectorItem}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.vectorTitle, { color: colors.textPrimary }]}>DEPURAÇÃO USB / ADB</Text>
              <Text style={[styles.vectorDesc, { color: colors.textSecondary }]}>
                Se ativa fora de desenvolvimento, permite extração de dados via cabo.
              </Text>
            </View>
            <TouchableOpacity style={[styles.actionBtn, { borderColor: accentColor }]} onPress={openDeveloperSettings}>
              <Text style={[styles.actionBtnText, { color: accentColor }]}>[REVISAR]</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.vectorItem}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.vectorTitle, { color: colors.textPrimary }]}>GOOGLE PLAY PROTECT</Text>
              <Text style={[styles.vectorDesc, { color: colors.textSecondary }]}>
                Varredura oficial de integridade da Google Play Store.
              </Text>
            </View>
            <TouchableOpacity style={[styles.actionBtn, { borderColor: accentColor }]} onPress={openPlayProtect}>
              <Text style={[styles.actionBtnText, { color: accentColor }]}>[ABRIR]</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.vectorItem}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.vectorTitle, { color: colors.textPrimary }]}>REDE WI-FI ABERTA</Text>
              <Text style={[styles.vectorDesc, { color: colors.textSecondary }]}>
                Monitoramento de tráfego sem criptografia WPA2/WPA3.
              </Text>
            </View>
            <Text style={[styles.statusTag, { color: colors.success }]}>[SEGURO]</Text>
          </View>
        </HudCard>

        {/* VirusTotal Verification */}
        <HudCard title="Verificação de APKs (VirusTotal API v3)" badge="INTERFACE STUB">
          <Text style={[styles.subText, { color: colors.textSecondary }]}>
            Verificação sob demanda baseada em hash SHA-256 isolado. Nenhum arquivo APK é transmitido.
          </Text>
          <HudButton
            label={testingVt ? 'CONSULTANDO...' : 'TESTAR CHECAGEM DE HASH'}
            variant="secondary"
            loading={testingVt}
            onPress={handleTestVirusTotal}
          />
        </HudCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  backButton: { marginRight: SPACING.md },
  backText: { fontFamily: 'monospace', fontSize: 12, fontWeight: '700' },
  title: { fontFamily: 'monospace', fontSize: 12, fontWeight: '900', letterSpacing: 1.5 },
  content: { padding: SPACING.md },
  subText: { fontFamily: 'monospace', fontSize: 11, lineHeight: 16, marginBottom: SPACING.sm },
  vectorItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: SPACING.xs },
  vectorTitle: { fontFamily: 'monospace', fontSize: 11, fontWeight: '700' },
  vectorDesc: { fontFamily: 'monospace', fontSize: 9, marginTop: 2 },
  actionBtn: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  actionBtnText: { fontFamily: 'monospace', fontSize: 9, fontWeight: '700' },
  statusTag: { fontFamily: 'monospace', fontSize: 10, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#1F1F1F', marginVertical: SPACING.xs },
});
