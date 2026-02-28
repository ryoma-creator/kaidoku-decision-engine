import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Colors } from "../src/constants/colors";
import { USE_MOCK } from "../src/constants/options";
import { saveApiKey, getApiKey, deleteApiKey } from "../src/services/storage";
import { useUsage } from "../src/hooks/useUsage";
import {
  initIAP,
  purchaseUnlock,
  restorePurchases,
  setupPurchaseListener,
  endIAP,
} from "../src/services/iap";
import { markPurchased } from "../src/services/storage";

export default function SettingsScreen() {
  const { usage, refresh, remaining } = useUsage();
  const [apiKey, setApiKey] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [iapLoading, setIapLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // Load API key status
  useEffect(() => {
    (async () => {
      const key = await getApiKey();
      setHasKey(!!key);
      if (key) setApiKey(key);
    })();
  }, []);

  // Setup IAP
  useEffect(() => {
    let cleanup: (() => void) | null = null;

    (async () => {
      await initIAP();
      cleanup = await setupPurchaseListener(
        () => {
          Alert.alert("🎉", "アンロックされました！");
          refresh();
          setIapLoading(false);
        },
        (msg) => {
          Alert.alert("エラー", msg);
          setIapLoading(false);
        }
      );
    })();

    return () => {
      cleanup?.();
      endIAP();
    };
  }, [refresh]);

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert("エラー", "APIキーを入力してください");
      return;
    }
    await saveApiKey(apiKey.trim());
    setHasKey(true);
    Alert.alert("✅", "APIキーを保存しました");
  };

  const handleDeleteKey = async () => {
    Alert.alert("確認", "APIキーを削除しますか？", [
      { text: "キャンセル" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          await deleteApiKey();
          setApiKey("");
          setHasKey(false);
        },
      },
    ]);
  };

  const handlePurchase = async () => {
    setIapLoading(true);
    const success = await purchaseUnlock();
    if (!success) {
      Alert.alert("エラー", "購入処理を開始できませんでした");
      setIapLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    const found = await restorePurchases();
    setRestoring(false);
    if (found) {
      Alert.alert("✅", "購入が復元されました！");
      refresh();
    } else {
      Alert.alert("結果", "復元可能な購入が見つかりませんでした");
    }
  };

  // For development: quick unlock without real IAP
  const handleDevUnlock = async () => {
    if (__DEV__) {
      await markPurchased();
      refresh();
      Alert.alert("🔧 DEV", "Unlocked for development");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Mock Mode Banner */}
        {USE_MOCK && (
          <View style={styles.mockBanner}>
            <Text style={styles.mockBannerIcon}>🧪</Text>
            <View style={styles.mockBannerContent}>
              <Text style={styles.mockBannerTitle}>Mock Mode: ON</Text>
              <Text style={styles.mockBannerDesc}>
                API課金なし — デモデータで動作中
              </Text>
            </View>
          </View>
        )}

        {/* Usage Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 利用状況</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>プラン</Text>
              <Text style={styles.statusValue}>
                {usage?.isPurchased ? "💎 プレミアム" : "🎫 無料"}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>残り回数</Text>
              <Text style={styles.statusValue}>
                {remaining} 回{usage?.isPurchased ? " / 月" : " / 生涯"}
              </Text>
            </View>
            {usage?.isPurchased && (
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>リセット</Text>
                <Text style={styles.statusValue}>毎月1日</Text>
              </View>
            )}
          </View>
        </View>

        {/* Upgrade */}
        {!usage?.isPurchased && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔓 アップグレード</Text>
            <View style={styles.upgradeCard}>
              <Text style={styles.upgradeTitle}>KaidokuAvoid プレミアム</Text>
              <Text style={styles.upgradePrice}>¥480（買い切り）</Text>
              <Text style={styles.upgradeDesc}>
                月200回まで利用可能に！{"\n"}
                一度の購入でずっと使えます。
              </Text>
              <TouchableOpacity
                style={styles.purchaseButton}
                onPress={handlePurchase}
                disabled={iapLoading}
                activeOpacity={0.8}
              >
                {iapLoading ? (
                  <ActivityIndicator color={Colors.textOnGreen} />
                ) : (
                  <Text style={styles.purchaseText}>購入する ¥480</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.restoreButton}
                onPress={handleRestore}
                disabled={restoring}
                activeOpacity={0.7}
              >
                <Text style={styles.restoreText}>
                  {restoring ? "復元中..." : "購入を復元"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* API Key (dev) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔑 API設定</Text>
          <Text style={styles.sectionHint}>
            開発用: OpenAI APIキーをセキュアに保存します
          </Text>
          <View style={styles.apiCard}>
            <TextInput
              style={styles.apiInput}
              value={showKey ? apiKey : hasKey ? "sk-••••••••" : ""}
              onChangeText={setApiKey}
              placeholder="sk-..."
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={!showKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.apiActions}>
              <TouchableOpacity
                style={styles.apiButton}
                onPress={() => setShowKey(!showKey)}
              >
                <Text style={styles.apiButtonText}>
                  {showKey ? "隠す" : "表示"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.apiButton, styles.apiSaveButton]}
                onPress={handleSaveKey}
              >
                <Text style={[styles.apiButtonText, styles.apiSaveText]}>
                  保存
                </Text>
              </TouchableOpacity>
              {hasKey && (
                <TouchableOpacity
                  style={[styles.apiButton, styles.apiDeleteButton]}
                  onPress={handleDeleteKey}
                >
                  <Text style={[styles.apiButtonText, styles.apiDeleteText]}>
                    削除
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Dev unlock (only in __DEV__) */}
        {__DEV__ && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔧 開発ツール</Text>
            <TouchableOpacity
              style={styles.devButton}
              onPress={handleDevUnlock}
              activeOpacity={0.7}
            >
              <Text style={styles.devButtonText}>
                DEV: プレミアムをアンロック
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ このアプリについて</Text>
          <Text style={styles.aboutText}>
            KaidokuAvoidは、メッセージの返信を自然に、AIっぽくならないように
            サポートするアプリです。{"\n\n"}
            ※ 生成されたメッセージはあくまで参考です。
            ご自身の判断でお使いください。
          </Text>
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
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  sectionHint: {
    color: Colors.textMuted,
    fontSize: 12,
    marginBottom: 10,
  },
  statusCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
    marginTop: 8,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  statusValue: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  upgradeCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.accent,
    alignItems: "center",
    marginTop: 8,
  },
  upgradeTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  upgradePrice: {
    color: Colors.accent,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
  },
  upgradeDesc: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 18,
  },
  purchaseButton: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: "100%",
    alignItems: "center",
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  purchaseText: {
    color: Colors.textOnGreen,
    fontSize: 17,
    fontWeight: "800",
  },
  restoreButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  restoreText: {
    color: Colors.textMuted,
    fontSize: 14,
    textDecorationLine: "underline",
  },
  apiCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  apiInput: {
    backgroundColor: Colors.bgInput,
    borderRadius: 10,
    padding: 12,
    color: Colors.textPrimary,
    fontSize: 14,
    fontFamily: "Courier",
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  apiActions: {
    flexDirection: "row",
    gap: 8,
  },
  apiButton: {
    backgroundColor: Colors.bgInput,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  apiButtonText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  apiSaveButton: {
    borderColor: Colors.accent,
  },
  apiSaveText: {
    color: Colors.accent,
  },
  apiDeleteButton: {
    borderColor: Colors.danger,
  },
  apiDeleteText: {
    color: Colors.danger,
  },
  devButton: {
    backgroundColor: "rgba(255, 165, 2, 0.15)",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  devButtonText: {
    color: Colors.warning,
    fontSize: 14,
    fontWeight: "600",
  },
  aboutText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },

  // ── Mock mode banner ──
  mockBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 165, 2, 0.12)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: Colors.warning,
    gap: 12,
  },
  mockBannerIcon: {
    fontSize: 28,
  },
  mockBannerContent: {
    flex: 1,
  },
  mockBannerTitle: {
    color: Colors.warning,
    fontSize: 16,
    fontWeight: "800",
  },
  mockBannerDesc: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
});
