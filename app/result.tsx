import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "../src/constants/colors";
import { ChatBubble } from "../src/components/ChatBubble";
import { checkAISmell } from "../src/services/aiCheck";
import type { AIResponse, Situation } from "../src/types";

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
        </View>

        {/* Decision banner */}
        <View style={[styles.decisionBanner, isWait && styles.decisionWait]}>
          <Text style={styles.decisionEmoji}>{isWait ? "⏳" : "✉️"}</Text>
          <View>
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

        {/* Best reply */}
        <ChatBubble
          label="最適返信"
          icon="✅"
          text={result.best_reply}
          variant="good"
        />

        {/* Backup reply */}
        <ChatBubble
          label="保険案"
          icon="🛡"
          text={result.backup_reply}
          variant="neutral"
        />

        {/* NG reply */}
        <ChatBubble
          label="NG例"
          icon="❌"
          text={result.ng_reply}
          variant="bad"
          showCopy={false}
        />

        {/* Next step */}
        <ChatBubble
          label="次の一手"
          icon="⏭"
          text={result.next_step}
          variant="neutral"
          showCopy={false}
        />

        {/* Action buttons */}
        <View style={styles.actions}>
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
    paddingBottom: 40,
  },
  contextRow: {
    marginBottom: 16,
  },
  contextText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
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
  actions: {
    marginTop: 16,
    gap: 12,
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
