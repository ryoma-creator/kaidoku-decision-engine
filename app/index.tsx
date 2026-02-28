import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Colors } from "../src/constants/colors";
import { SITUATIONS, USE_MOCK } from "../src/constants/options";
import { SituationCard } from "../src/components/SituationCard";
import { UsageBadge } from "../src/components/UsageBadge";
import { useUsage } from "../src/hooks/useUsage";
import { DEMO_PRESETS } from "../src/services/mockData";
import type { Situation } from "../src/types";

export default function HomeScreen() {
  const router = useRouter();
  const { usage, refresh } = useUsage();
  const [showDemoPicker, setShowDemoPicker] = useState(false);

  // Refresh usage on screen focus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleSituationPress = (situation: Situation) => {
    router.push({
      pathname: "/compose",
      params: { situation },
    });
  };

  const handleDemoSelect = (index: number) => {
    const preset = DEMO_PRESETS[index];
    setShowDemoPicker(false);
    router.push({
      pathname: "/compose",
      params: {
        situation: preset.situation,
        demo: "true",
        demoIndex: String(index),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>どんな状況？ 🤔</Text>
            <TouchableOpacity
              onPress={() => router.push("/settings")}
              style={styles.settingsButton}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            シチュエーションを選んで{"\n"}最適な返信を考えよう
          </Text>
          <View style={styles.badgeRow}>
            <UsageBadge
              usage={usage}
              onUpgrade={() => router.push("/settings")}
            />
          </View>
        </View>

        {/* 🎬 Demo button */}
        {USE_MOCK && (
          <TouchableOpacity
            style={styles.demoButton}
            onPress={() => setShowDemoPicker(true)}
            activeOpacity={0.8}
          >
            <View style={styles.demoContent}>
              <Text style={styles.demoEmoji}>🎬</Text>
              <View>
                <Text style={styles.demoTitle}>1分デモで体験する</Text>
                <Text style={styles.demoSubtitle}>
                  サンプル会話で即体験 → 成功返信が出る！
                </Text>
              </View>
            </View>
            <Text style={styles.demoArrow}>▶</Text>
          </TouchableOpacity>
        )}

        {/* Situation Cards */}
        <View style={styles.cards}>
          {SITUATIONS.map((option) => (
            <SituationCard
              key={option.id}
              option={option}
              onPress={() => handleSituationPress(option.id)}
            />
          ))}
        </View>

        {/* Footer hint */}
        <Text style={styles.footerHint}>
          💡 自然な返信で、気持ちをうまく伝えよう
        </Text>
      </ScrollView>

      {/* ── Demo picker modal ── */}
      <Modal
        visible={showDemoPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDemoPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDemoPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎬 デモシナリオを選ぶ</Text>
            <Text style={styles.modalSubtitle}>
              タップで会話が自動入力 → 分析ボタンを押すだけ！
            </Text>
            {DEMO_PRESETS.map((preset, i) => (
              <TouchableOpacity
                key={i}
                style={styles.presetCard}
                onPress={() => handleDemoSelect(i)}
                activeOpacity={0.7}
              >
                <Text style={styles.presetEmoji}>
                  {SITUATIONS.find((s) => s.id === preset.situation)?.emoji ?? "📱"}
                </Text>
                <View style={styles.presetText}>
                  <Text style={styles.presetLabel}>{preset.label}</Text>
                  <Text style={styles.presetHint} numberOfLines={1}>
                    {preset.conversation.split("\n")[0]}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowDemoPicker(false)}
            >
              <Text style={styles.modalCloseText}>閉じる</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 22,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 22,
  },
  badgeRow: {
    flexDirection: "row",
    marginTop: 14,
  },

  // ── Demo button ──
  demoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 165, 2, 0.12)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: Colors.warning,
  },
  demoContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  demoEmoji: {
    fontSize: 30,
  },
  demoTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  demoSubtitle: {
    color: Colors.warning,
    fontSize: 12,
    marginTop: 2,
  },
  demoArrow: {
    color: Colors.warning,
    fontSize: 18,
    fontWeight: "800",
  },

  cards: {
    marginBottom: 20,
  },
  footerHint: {
    textAlign: "center",
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 8,
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  modalSubtitle: {
    color: Colors.textMuted,
    fontSize: 13,
    marginBottom: 18,
  },
  presetCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgInput,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  presetEmoji: {
    fontSize: 26,
  },
  presetText: {
    flex: 1,
  },
  presetLabel: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  presetHint: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  modalClose: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 6,
  },
  modalCloseText: {
    color: Colors.textMuted,
    fontSize: 15,
  },
});
