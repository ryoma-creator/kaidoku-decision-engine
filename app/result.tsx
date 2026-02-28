import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Share,
  Platform,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "../src/constants/colors";
import { ChatBubble } from "../src/components/ChatBubble";
import { checkAISmell } from "../src/services/aiCheck";
import { USE_MOCK } from "../src/constants/options";
import type { AIResponse } from "../src/types";

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ data: string; situation: string }>();

  const result: AIResponse | null = useMemo(() => {
    try {
      return params.data ? JSON.parse(params.data) : null;
    } catch {
      return null;
    }
  }, [params.data]);

  const warnings = useMemo(() => {
    if (!result) return [];
    return checkAISmell(result);
  }, [result]);

  // ── Share text builder ──
  const buildShareText = () => {
    if (!result) return "";
    return [
      `📱 KaidokuAvoid｜${params.situation}`,
      ``,
      `結論: ${result.decision}`,
      ``,
      `✅ 最適返信:`,
      `「${result.best_reply}」`,
      ``,
      result.why_it_works ? `💡 ${result.why_it_works}` : "",
      result.expected_reaction
        ? `\n📩 相手の反応:\n「${result.expected_reaction}」`
        : "",
      ``,
      `#KaidokuAvoid #既読スルー対策`,
    ]
      .filter(Boolean)
      .join("\n");
  };

  const handleShare = async () => {
    const text = buildShareText();
    if (Platform.OS === "web") {
      await Clipboard.setStringAsync(text);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      alert("シェア用テキストをコピーしました！");
    } else {
      await Share.share({ message: text });
    }
  };

  const handleCopyAll = async () => {
    const text = buildShareText();
    await Clipboard.setStringAsync(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (!result) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>データの読み込みに失敗しました</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryText}>戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isWait = result.decision === "待つ";
  const hasSuccessStory =
    result.why_it_works || result.expected_reaction || result.reaction_followup;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Situation context */}
        <View style={styles.contextRow}>
          <Text style={styles.contextText}>📌 {params.situation}</Text>
          {USE_MOCK && (
            <View style={styles.mockBadge}>
              <Text style={styles.mockBadgeText}>DEMO</Text>
            </View>
          )}
        </View>

        {/* ━━━━━━ Decision banner ━━━━━━ */}
        <View style={[styles.decisionBanner, isWait && styles.decisionWait]}>
          <Text style={styles.decisionEmoji}>{isWait ? "⏳" : "✉️"}</Text>
          <View style={styles.decisionContent}>
            <Text style={styles.decisionLabel}>結論</Text>
            <Text style={styles.decisionText}>{result.decision}</Text>
          </View>
        </View>

        {/* AI Smell Warnings */}
        {warnings.length > 0 && (
          <View style={styles.warningsContainer}>
            {warnings.map((w, i) => (
              <View key={i} style={styles.warningBadge}>
                <Text style={styles.warningText}>{w.message}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ━━━━━━ Best reply ━━━━━━ */}
        <ChatBubble
          label="最適返信"
          icon="✅"
          text={result.best_reply}
          variant="good"
        />

        {/* ━━━━━━ Why it works ━━━━━━ */}
        {result.why_it_works && (
          <View style={styles.whyCard}>
            <View style={styles.whyHeader}>
              <Text style={styles.whyIcon}>🧠</Text>
              <Text style={styles.whyLabel}>この一手の狙い</Text>
            </View>
            <Text style={styles.whyText}>{result.why_it_works}</Text>
          </View>
        )}

        {/* ━━━━━━ Backup reply ━━━━━━ */}
        <ChatBubble
          label="保険案"
          icon="🛡"
          text={result.backup_reply}
          variant="neutral"
        />

        {/* ━━━━━━ NG reply ━━━━━━ */}
        <ChatBubble
          label="NG例"
          icon="❌"
          text={result.ng_reply}
          variant="bad"
          showCopy={false}
        />

        {/* ━━━━━━ Success story section ━━━━━━ */}
        {hasSuccessStory && (
          <View style={styles.successSection}>
            <View style={styles.successDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>📩 送ったらこうなる</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Expected reaction — chat bubble from "相手" */}
            {result.expected_reaction && (
              <View style={styles.reactionContainer}>
                <View style={styles.reactionAvatar}>
                  <Text style={styles.reactionAvatarText}>👤</Text>
                </View>
                <View style={styles.reactionBubble}>
                  <Text style={styles.reactionName}>相手の返信</Text>
                  <Text style={styles.reactionText}>
                    {result.expected_reaction}
                  </Text>
                </View>
              </View>
            )}

            {/* Reaction followup */}
            {result.reaction_followup && (
              <View style={styles.followupCard}>
                <Text style={styles.followupIcon}>🔥</Text>
                <View style={styles.followupContent}>
                  <Text style={styles.followupLabel}>その後の展開</Text>
                  <Text style={styles.followupText}>
                    {result.reaction_followup}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ━━━━━━ Next step ━━━━━━ */}
        <ChatBubble
          label="次の一手"
          icon="⏭"
          text={result.next_step}
          variant="neutral"
          showCopy={false}
        />

        {/* ━━━━━━ Action buttons ━━━━━━ */}
        <View style={styles.actions}>
          {/* Share / Copy all */}
          <View style={styles.shareRow}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Text style={styles.shareButtonText}>📤 シェア</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.copyAllButton}
              onPress={handleCopyAll}
              activeOpacity={0.7}
            >
              <Text style={styles.copyAllText}>📋 全文コピー</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.newButton}
            onPress={() => router.replace("/")}
            activeOpacity={0.8}
          >
            <Text style={styles.newButtonText}>🏠 ホームに戻る</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.retryActionButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.retryActionText}>🔄 もう一度試す</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingBottom: 50,
  },
  contextRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  contextText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  mockBadge: {
    backgroundColor: "rgba(255, 165, 2, 0.2)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  mockBadgeText: {
    color: Colors.warning,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  // ── Decision ──
  decisionBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(6, 199, 85, 0.15)",
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.accent,
    gap: 14,
  },
  decisionWait: {
    backgroundColor: "rgba(255, 165, 2, 0.15)",
    borderColor: Colors.warning,
  },
  decisionEmoji: {
    fontSize: 36,
  },
  decisionContent: {
    flex: 1,
  },
  decisionLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  decisionText: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: "800",
  },

  // ── Warnings ──
  warningsContainer: {
    marginBottom: 16,
    gap: 6,
  },
  warningBadge: {
    backgroundColor: "rgba(255, 165, 2, 0.12)",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 165, 2, 0.3)",
  },
  warningText: {
    color: Colors.warning,
    fontSize: 13,
    fontWeight: "500",
  },

  // ── Why it works card ──
  whyCard: {
    backgroundColor: "rgba(52, 152, 219, 0.1)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(52, 152, 219, 0.3)",
  },
  whyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  whyIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  whyLabel: {
    color: Colors.info,
    fontSize: 14,
    fontWeight: "700",
  },
  whyText: {
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
  },

  // ── Success story section ──
  successSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  successDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },

  // ── Reaction bubble (LINE-style incoming) ──
  reactionContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 14,
    gap: 8,
  },
  reactionAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bgCard,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reactionAvatarText: {
    fontSize: 18,
  },
  reactionBubble: {
    backgroundColor: Colors.bgBubbleOther,
    borderRadius: 18,
    borderTopLeftRadius: 4,
    padding: 14,
    maxWidth: "78%",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reactionName: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  reactionText: {
    color: Colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
  },

  // ── Followup card ──
  followupCard: {
    flexDirection: "row",
    backgroundColor: "rgba(6, 199, 85, 0.08)",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(6, 199, 85, 0.25)",
    gap: 10,
    alignItems: "flex-start",
  },
  followupIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  followupContent: {
    flex: 1,
  },
  followupLabel: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  followupText: {
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
  },

  // ── Actions ──
  actions: {
    marginTop: 16,
    gap: 12,
  },
  shareRow: {
    flexDirection: "row",
    gap: 10,
  },
  shareButton: {
    flex: 1,
    backgroundColor: Colors.info,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  shareButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  copyAllButton: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  copyAllText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: "700",
  },
  newButton: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  newButtonText: {
    color: Colors.textOnGreen,
    fontSize: 16,
    fontWeight: "700",
  },
  retryActionButton: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  retryActionText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },

  // ── Error ──
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  retryText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
});
