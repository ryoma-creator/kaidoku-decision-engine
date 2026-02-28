import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Colors } from "../src/constants/colors";
import { SITUATIONS } from "../src/constants/options";
import { SituationCard } from "../src/components/SituationCard";
import { UsageBadge } from "../src/components/UsageBadge";
import { useUsage } from "../src/hooks/useUsage";
import type { Situation } from "../src/types";

export default function HomeScreen() {
  const router = useRouter();
  const { usage, refresh, remaining } = useUsage();

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
    marginBottom: 24,
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
  cards: {
    marginBottom: 20,
  },
  footerHint: {
    textAlign: "center",
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 8,
  },
});
