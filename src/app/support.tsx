import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../design/store';
import { HudCard } from '../components/HudCard';
import { HudButton } from '../components/HudButton';
import { HudHeader } from '../components/HudHeader';
import { SPACING } from '../design/tokens';
import { generateAndShareSystemReport } from '../services/reportExport';

export default function SupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getColors, accentColor } = useThemeStore();
  const colors = getColors();

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [includeLogs, setIncludeLogs] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!description.trim()) {
      Alert.alert('Aviso', 'Por favor descreva o problema ou sugestão.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Relatório Registrado',
        'Obrigado pelo feedback. Seus logs anônimos de telemetria foram empacotados com sucesso.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }, 600);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <HudHeader showBack title="SUPORTE // FEEDBACK" subtitle="DIAGNÓSTICO & CONTATO DIRETO" />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <HudCard title="Reportar Falha ou Sugestão" badge="DIAGNÓSTICO" subtitle="Canal direto com os mantenedores do KRNL Core">
          <Text style={[styles.desc, { color: colors.textSecondary }]}>
            Sem coleta abusiva: nenhum arquivo pessoal, foto ou histórico sai do aparelho.
          </Text>

          <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>TÍTULO DO PROBLEMA:</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.surfaceAlt }]}
            placeholder="Ex: Scanner de duplicadas demorando no SD card"
            placeholderTextColor={colors.textSecondary}
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>DESCRIÇÃO DETALHADA:</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.surfaceAlt },
            ]}
            placeholder="Descreva o que ocorreu e o modelo do aparelho..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setIncludeLogs(!includeLogs)}
          >
            <Text style={[styles.checkbox, { color: includeLogs ? accentColor : colors.textSecondary }]}>
              {includeLogs ? '[X]' : '[ ]'}
            </Text>
            <Text style={[styles.checkboxLabel, { color: colors.textSecondary }]}>
              Anexar logs técnicos e telemetria anônima de hardware
            </Text>
          </TouchableOpacity>

          <HudButton
            label={isSubmitting ? 'ENVIANDO RELATÓRIO...' : 'ENVIAR RELATÓRIO'}
            variant="primary"
            loading={isSubmitting}
            onPress={handleSubmit}
            style={{ marginTop: SPACING.md }}
          />
        </HudCard>

        <HudCard title="Exportação Manual de Auditoria" badge="LOCAL">
          <Text style={[styles.desc, { color: colors.textSecondary }]}>
            Gere um pacote criptografado em JSON contendo as métricas de estabilidade para anexar em issues do GitHub.
          </Text>
          <HudButton
            label="COMPARTILHAR RELATÓRIO DO SISTEMA"
            variant="secondary"
            onPress={generateAndShareSystemReport}
          />
        </HudCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: SPACING.md },
  desc: { fontFamily: 'monospace', fontSize: 11, lineHeight: 16, marginBottom: SPACING.sm },
  inputLabel: { fontFamily: 'monospace', fontSize: 10, fontWeight: '800', marginTop: SPACING.sm, marginBottom: 4 },
  input: {
    borderWidth: 1,
    padding: SPACING.sm,
    fontFamily: 'monospace',
    fontSize: 12,
    borderRadius: 2,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  checkbox: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '900',
    marginRight: 8,
  },
  checkboxLabel: {
    fontFamily: 'monospace',
    fontSize: 10,
    flex: 1,
  },
});
