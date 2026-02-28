import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../constants/colors";
import type { UsageData } from "../types";
import { remainingCount } from "../services/storage";

interface Props {
  usage: UsageData | null;
  onUpgrade?: () => void;
}

export function UsageBadge({ usage, onUpgrade }: Props) {
  if (!usage) return null;

  const remaining = remainingCount(usage);
  const isLow = remaining <= 2;
  const isPaid = usage.isPurchased;

  return (
    <TouchableOpacity
      style={[styles.badge, isLow && !isPaid && styles.badgeWarning]}
      onPress={!isPaid && remaining === 0 ? onUpgrade : undefined}
      activeOpacity={isPaid ? 1 : 0.7}
    >
      <Text style={styles.icon}>{isPaid ? "💎" : "🎫"}</Text>
      <Text style={[styles.text, isLow && !isPaid && styles.textWarning]}>
        残り {remaining} 回{isPaid ? " / 月" : ""}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeWarning: {
    borderColor: Colors.warning,
    backgroundColor: "rgba(255, 165, 2, 0.1)",
  },
  icon: {
    fontSize: 14,
    marginRight: 6,
  },
  text: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  textWarning: {
    color: Colors.warning,
  },
});
