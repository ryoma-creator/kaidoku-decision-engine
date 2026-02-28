import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../src/constants/colors";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.bg,
          },
          headerTintColor: Colors.textPrimary,
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 17,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: Colors.bg,
          },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "KaidokuAvoid",
            headerLargeTitle: true,
          }}
        />
        <Stack.Screen
          name="compose"
          options={{
            title: "メッセージ作成",
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="result"
          options={{
            title: "分析結果",
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: "設定",
            presentation: "modal",
          }}
        />
      </Stack>
    </>
  );
}
