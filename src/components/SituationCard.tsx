import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from "react-native";
import { Colors } from "../constants/colors";
import type { SituationOption } from "../constants/options";

interface Props {
  option: SituationOption;
  onPress: () => void;
}

export function SituationCard({ option, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.emoji}>{option.emoji}</Text>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{option.label}</Text>
        <Text style={styles.description}>{option.description}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emoji: {
    fontSize: 32,
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 3,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  arrow: {
    color: Colors.textMuted,
    fontSize: 28,
    fontWeight: "300",
    marginLeft: 8,
  },
});
