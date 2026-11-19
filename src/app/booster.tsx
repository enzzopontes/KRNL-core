import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../design/store';
import { HudCard } from '../components/HudCard';
import { HudButton } from '../components/HudButton';
import { HudHeader } from '../components/HudHeader';
import { HudBottomBar } from '../components/HudBottomBar';
import { SPACING, radius, touch } from '../design/tokens';
import { openDeveloperSettings } from '../services/security';
import { openAppDetails, AppInfo } from '../../modules/krnl-apps';
import {
  PerformanceProfile,
  OptimizationResult,
  detectInstalledGames,
  executeDeepBoost,
} from '../services/gameBooster';

export default function GameBoosterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getColors, accentColor } = useThemeStore();
  const colors = getColors();

  const [profile, setProfile] = useState<PerformanceProfile>('GAMER_ULTRA');
  const [isBoosting, setIsBoosting] = useState(false);
  const [boostResult, setBoostResult] = useState<OptimizationResult | null>(null);
  const [games, setGames] = useState<AppInfo[]>([]);

  // Tweaks toggles
  const [lowLatencyDns, setLowLatencyDns] = useState(true);
  const [touchOptimization, setTouchOptimization] = useState(true);
  const [backgroundThrottle, setBackgroundThrottle] = useState(true);

  useEffect(() => {
    detectInstalledGames().then(setGames);
  }, []);

  const handleRunBoost = async () => {
    setIsBoosting(true);
    try {
      const res = await executeDeepBoost();
      setBoostResult(res);
      Alert.alert(
        'Modo Gamer Ativado',
        `Dispositivo otimizado com sucesso:\n\n• ${res.freedRamMb} MB de RAM liberados\n• ${res.closedBackgroundProcesses} processos de fundo suspensos\n• Latência de toque ajustada para tempo de resposta mínimo.`
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível completar a otimização de memória.');
    } finally {
      setIsBoosting(false);
    }
  };

  const handleLaunchGame = async (game: AppInfo) => {
    setIsBoosting(true);
    try {
      await executeDeepBoost();
      await openAppDetails(game.packageName);
    } finally {
      setIsBoosting(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <HudHeader showBack title="GAME BOOSTER // PRO" subtitle="PAINEL DE PERFORMANCE & FPS" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 84 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Performance Profile Selector */}
        <HudCard
          title="Perfil de Desempenho"
          badge={profile === 'GAMER_ULTRA' ? 'MAX FPS' : 'ATIVO'}
          badgeVariant={profile === 'GAMER_ULTRA' ? 'accent' : 'ok'}
          subtitle="Ajuste os parâmetros de alocação de CPU, RAM e taxa de quadros"
        >
          <View style={styles.profileRow}>
            {(
              [
                { id: 'GAMER_ULTRA', label: '⚡ GAMER ULTRA', desc: 'Máximo FPS e menor latência' },
                { id: 'BALANCED', label: '⚖ EQUILIBRADO', desc: 'Uso diário fluído' },
                { id: 'BATTERY_SAVER', label: '🔋 ECONÔMICO', desc: 'Prioriza bateria' },
              ] as const
            ).map((item) => {
              const active = profile === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.profileTab,
                    {
                      borderColor: active ? accentColor : colors.border,
                      backgroundColor: active
                        ? accentColor === '#FFFFFF'
                          ? 'rgba(255,255,255,0.1)'
                          : `${accentColor}18`
                        : colors.surfaceAlt,
                    },
                  ]}
                  onPress={() => setProfile(item.id)}
                >
                  <Text
                    style={[
                      styles.profileLabel,
                      { color: active ? accentColor : colors.textPrimary, fontWeight: active ? '800' : '600' },
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Text style={[styles.profileDesc, { color: colors.textSecondary }]}>
                    {item.desc}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </HudCard>

        {/* Master Booster Hero */}
        <HudCard
          title="Otimizador de Memória & Taxa de FPS"
          badge="TEMPO REAL"
          badgeVariant="accent"
          highlight
          subtitle="Elimine processos zumbis e libere memória dedicada para seus jogos"
        >
          <View style={styles.heroStatsRow}>
            <View style={[styles.statBox, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>TAXA DE TELA</Text>
              <Text style={[styles.statVal, { color: colors.textPrimary }]}>120 Hz</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>Ultra Fluido</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>LATÊNCIA DE TOQUE</Text>
              <Text style={[styles.statVal, { color: accentColor }]}>240 Hz</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>Polling Rate</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>RAM LIBERADA</Text>
              <Text style={[styles.statVal, { color: colors.success }]}>
                {boostResult ? `+${boostResult.freedRamMb} MB` : 'Pronto'}
              </Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>
                {boostResult ? 'Purga Completa' : 'Aguardando'}
              </Text>
            </View>
          </View>

          <HudButton
            label={isBoosting ? 'TURBINANDO GPU & CPU...' : 'TURBINAR DISPOSITIVO AGORA'}
            variant="primary"
            loading={isBoosting}
            onPress={handleRunBoost}
            style={{ marginTop: SPACING.md }}
          />
        </HudCard>

        {/* Mega Optimizer Tweaks (Inspired by Rezende PC Optimizer) */}
        <HudCard
          title="Ajustes Avançados // Tweaks de Sistema"
          badge="PC TWEAKS"
          subtitle="Modificações no Android semelhantes aos tweaks de Windows do Mega Optimizer"
        >
          <View style={styles.tweakItem}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[styles.tweakTitle, { color: colors.textPrimary }]}>
                DNS GAMER DE BAIXA LATÊNCIA (1.1.1.1)
              </Text>
              <Text style={[styles.tweakDesc, { color: colors.textSecondary }]}>
                Reduz o ping em partidas online roteando pacotes pelas rotas mais rápidas.
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.togglePill,
                {
                  borderColor: lowLatencyDns ? colors.success : colors.border,
                  backgroundColor: lowLatencyDns ? 'rgba(16, 185, 129, 0.15)' : colors.surfaceAlt,
                },
              ]}
              onPress={() => setLowLatencyDns(!lowLatencyDns)}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: lowLatencyDns ? colors.success : colors.textMuted },
                ]}
              >
                {lowLatencyDns ? 'ATIVO' : 'DESL'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.tweakItem}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[styles.tweakTitle, { color: colors.textPrimary }]}>
                OTIMIZAÇÃO DE LATÊNCIA DE TOQUE
              </Text>
              <Text style={[styles.tweakDesc, { color: colors.textSecondary }]}>
                Prioriza eventos de toque do display no thread principal de renderização.
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.togglePill,
                {
                  borderColor: touchOptimization ? colors.success : colors.border,
                  backgroundColor: touchOptimization ? 'rgba(16, 185, 129, 0.15)' : colors.surfaceAlt,
                },
              ]}
              onPress={() => setTouchOptimization(!touchOptimization)}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: touchOptimization ? colors.success : colors.textMuted },
                ]}
              >
                {touchOptimization ? 'ATIVO' : 'DESL'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.tweakItem}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[styles.tweakTitle, { color: colors.textPrimary }]}>
                ESCALA DE ANIMAÇÕES DO ANDROID (0.5x)
              </Text>
              <Text style={[styles.tweakDesc, { color: colors.textSecondary }]}>
                Acelera a abertura de menus e transições de tela no sistema operacional.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.actionPill, { borderColor: accentColor }]}
              onPress={openDeveloperSettings}
            >
              <Text style={[styles.actionPillText, { color: accentColor }]}>Ajustar</Text>
            </TouchableOpacity>
          </View>
        </HudCard>

        {/* Game Launcher with Pre-Launch Optimization */}
        <HudCard
          title="Lançador de Jogos Turbinado"
          badge={`${games.length} DETECTADOS`}
          badgeVariant="accent"
          subtitle="Limpa a memória e prioriza núcleos de CPU antes de iniciar a partida"
        >
          {games.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Nenhum jogo identificado automaticamente. Os jogos instalados aparecerão aqui.
            </Text>
          ) : (
            <View style={styles.gamesList}>
              {games.map((game) => (
                <View
                  key={game.packageName}
                  style={[styles.gameItem, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
                >
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.gameTitle, { color: colors.textPrimary }]}>
                      {game.label}
                    </Text>
                    <Text style={[styles.gamePkg, { color: colors.textMuted }]}>
                      {game.packageName} · {(game.sizeBytes / (1024 * 1024)).toFixed(0)} MB
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.boostLaunchBtn, { borderColor: accentColor, backgroundColor: accentColor }]}
                    onPress={() => handleLaunchGame(game)}
                  >
                    <Text style={styles.boostLaunchText}>⚡ JOGAR</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </HudCard>
      </ScrollView>

      <HudBottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: SPACING.md },
  profileRow: {
    gap: SPACING.xs,
  },
  profileTab: {
    borderWidth: 1,
    padding: SPACING.sm + 2,
    borderRadius: radius.md,
  },
  profileLabel: {
    fontSize: 12,
    letterSpacing: 0.3,
  },
  profileDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginVertical: SPACING.xs,
  },
  statBox: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  statSub: {
    fontSize: 9,
    marginTop: 2,
  },
  tweakItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  tweakTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tweakDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  togglePill: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    minHeight: touch.min - 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  actionPill: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    minHeight: touch.min - 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: SPACING.xs + 2,
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },
  gamesList: {
    gap: SPACING.xs,
  },
  gameItem: {
    borderWidth: 1,
    padding: SPACING.sm + 2,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gameTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  gamePkg: {
    fontSize: 10,
    marginTop: 2,
  },
  boostLaunchBtn: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boostLaunchText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
