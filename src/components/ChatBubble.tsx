import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Colors } from "../constants/colors";

interface Props {
  label: string;
  icon: string;
  text: string;
  variant?: "good" | "bad" | "neutral";
  showCopy?: boolean;
}

export function ChatBubble({
  label,
  icon,
  text,
  variant = "neutral",
  showCopy = true,
}: Props) {
  const handleCopy = async () => {
    await Clipboard.setStringAsync(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const bubbleStyle = [
    styles.bubble,
    variant === "good" && styles.bubbleGood,
    variant === "bad" && styles.bubbleBad,
  ];

  const borderStyle = [
    styles.borderAccent,
    variant === "good" && styles.borderGood,
    variant === "bad" && styles.borderBad,
  ];

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={bubbleStyle}>
        <View style={borderStyle} />
        <Text style={styles.text}>{text}</Text>
        {showCopy && (
          <TouchableOpacity
            style={styles.copyButton}
            onPress={handleCopy}
            activeOpacity={0.6}
          >
            <Text style={styles.copyText}>コピー</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  icon: {
    fontSize: 16,
    marginRight: 6,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bubble: {
    backgroundColor: Colors.bgCard,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  bubbleGood: {
    borderColor: Colors.accent,
    backgroundColor: "rgba(6, 199, 85, 0.08)",
  },
  bubbleBad: {
    borderColor: Colors.danger,
    backgroundColor: "rgba(255, 71, 87, 0.08)",
  },
  borderAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Colors.info,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  borderGood: {
    backgroundColor: Colors.accent,
  },
  borderBad: {
    backgroundColor: Colors.danger,
  },
  text: {
    color: Colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
    paddingLeft: 8,
  },
  copyButton: {
    backgroundColor: Colors.bgInput,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },
  copyText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: "600",
  },
});
