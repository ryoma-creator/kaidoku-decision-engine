import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "../src/constants/colors";
import { RELATIONSHIPS, TONES } from "../src/constants/options";
import { useUsage } from "../src/hooks/useUsage";
import { generateReply } from "../src/services/openai";
import type { Relationship, Tone, Situation } from "../src/types";

export default function ComposeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ situation: Situation }>();
  const situation = params.situation ?? "既読スルー";
  const { canUse, increment, remaining, usage } = useUsage();

  // ── Form state ──
  const [conversation, setConversation] = useState("");
  const [relationship, setRelationship] = useState<Relationship>("マッチング相手");
  const [tone, setTone] = useState<Tone>("さりげなく");
  const [hours, setHours] = useState(12);
  const [loading, setLoading] = useState(false);

  const showHoursSlider = situation === "既読スルー";

  const handleGenerate = async () => {
    if (!conversation.trim()) {
      Alert.alert("入力エラー", "会話内容を入力してください");
      return;
    }

    if (!canUse) {
      Alert.alert(
        "利用上限",
        usage?.isPurchased
          ? "今月の利用上限に達しました。来月またご利用ください。"
          : "無料枠を使い切りました。設定からアップグレードしてください。",
        [
          { text: "閉じる" },
          ...(!usage?.isPurchased
            ? [
                {
                  text: "アップグレード",
                  onPress: () => router.push("/settings"),
                },
              ]
            : []),
        ]
      );
      return;
    }

    setLoading(true);
    try {
      const result = await generateReply({
        situation,
        conversation: conversation.trim(),
        relationship,
        tone,
        hoursSinceRead: showHoursSlider ? hours : 0,
      });

      await increment();

      router.push({
        pathname: "/result",
        params: {
          data: JSON.stringify(result),
          situation,
        },
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "エラーが発生しました";
      Alert.alert("エラー", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Situation badge */}
          <View style={styles.situationBadge}>
            <Text style={styles.situationText}>📌 {situation}</Text>
          </View>

          {/* Conversation input */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>💬 会話内容</Text>
            <Text style={styles.sectionHint}>直近のやりとり（最大5ターン）</Text>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={6}
              placeholder={"例:\n相手: 今日楽しかったね！\n自分: うん、また行こう！\n相手: (既読)"}
              placeholderTextColor={Colors.textMuted}
              value={conversation}
              onChangeText={setConversation}
              textAlignVertical="top"
            />
          </View>

          {/* Relationship selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>👫 関係性</Text>
            <View style={styles.chipRow}>
              {RELATIONSHIPS.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[
                    styles.chip,
                    relationship === r.id && styles.chipActive,
                  ]}
                  onPress={() => setRelationship(r.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      relationship === r.id && styles.chipTextActive,
                    ]}
                  >
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tone selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>🎨 トーン</Text>
            <View style={styles.chipRow}>
              {TONES.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.chip, tone === t.id && styles.chipActive]}
                  onPress={() => setTone(t.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      tone === t.id && styles.chipTextActive,
                    ]}
                  >
                    {t.emoji} {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Hours since read slider */}
          {showHoursSlider && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>⏰ 既読からの時間</Text>
              <View style={styles.hoursRow}>
                {[1, 3, 6, 12, 24, 48, 72].map((h) => (
                  <TouchableOpacity
                    key={h}
                    style={[
                      styles.hourChip,
                      hours === h && styles.hourChipActive,
                    ]}
                    onPress={() => setHours(h)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.hourText,
                        hours === h && styles.hourTextActive,
                      ]}
                    >
                      {h}h
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {hours < 6 && (
                <Text style={styles.hoursHint}>
                  💡 6時間未満は「待つ」判定になりやすいです
                </Text>
              )}
            </View>
          )}

          {/* Generate button */}
          <TouchableOpacity
            style={[styles.generateButton, loading && styles.generateDisabled]}
            onPress={handleGenerate}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={Colors.textOnGreen} size="small" />
                <Text style={styles.generateText}>  分析中...</Text>
              </View>
            ) : (
              <Text style={styles.generateText}>🔍 分析する</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.remainingText}>残り {remaining} 回</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  situationBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  situationText: {
    color: Colors.accent,
    fontSize: 15,
    fontWeight: "700",
  },
  section: {
    marginBottom: 22,
  },
  sectionLabel: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionHint: {
    color: Colors.textMuted,
    fontSize: 12,
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: Colors.bgInput,
    borderRadius: 14,
    padding: 14,
    color: Colors.textPrimary,
    fontSize: 15,
    minHeight: 140,
    borderWidth: 1,
    borderColor: Colors.border,
    lineHeight: 22,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  chip: {
    backgroundColor: Colors.bgInput,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  chipTextActive: {
    color: Colors.textOnGreen,
  },
  hoursRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  hourChip: {
    backgroundColor: Colors.bgInput,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hourChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  hourText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  hourTextActive: {
    color: Colors.textOnGreen,
  },
  hoursHint: {
    color: Colors.warning,
    fontSize: 12,
    marginTop: 8,
    fontStyle: "italic",
  },
  generateButton: {
    backgroundColor: Colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateDisabled: {
    opacity: 0.7,
  },
  generateText: {
    color: Colors.textOnGreen,
    fontSize: 17,
    fontWeight: "800",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  remainingText: {
    textAlign: "center",
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 12,
  },
});
