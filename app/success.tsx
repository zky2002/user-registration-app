import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function SuccessScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const accentColor = useThemeColor({}, "tint");

  const phoneNumber = params.phoneNumber as string;
  const username = params.username as string;

  const handleReturn = () => {
    router.replace("/");
  };

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: Math.max(insets.bottom, 20),
          paddingLeft: Math.max(insets.left, 20),
          paddingRight: Math.max(insets.right, 20),
        },
      ]}
    >
      {/* 成功图标 */}
      <View style={styles.iconContainer}>
        <View style={[styles.successIcon, { borderColor: accentColor }]}>
          <ThemedText style={[styles.checkmark, { color: accentColor }]}>
            ✓
          </ThemedText>
        </View>
      </View>

      {/* 成功消息 */}
      <View style={styles.messageContainer}>
        <ThemedText type="title" style={styles.successTitle}>
          注册成功！
        </ThemedText>
        <ThemedText type="default" style={styles.successSubtitle}>
          欢迎加入我们
        </ThemedText>
      </View>

      {/* 用户信息 */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <ThemedText type="defaultSemiBold" style={styles.infoLabel}>
            手机号：
          </ThemedText>
          <ThemedText type="default" style={styles.infoValue}>
            {phoneNumber}
          </ThemedText>
        </View>
        <View style={styles.infoRow}>
          <ThemedText type="defaultSemiBold" style={styles.infoLabel}>
            用户名：
          </ThemedText>
          <ThemedText type="default" style={styles.infoValue}>
            {username}
          </ThemedText>
        </View>
      </View>

      {/* 返回按钮 */}
      <Pressable
        onPress={handleReturn}
        style={({ pressed }) => [
          styles.returnButton,
          { backgroundColor: accentColor },
          pressed && styles.returnButtonPressed,
        ]}
      >
        <ThemedText type="defaultSemiBold" style={styles.returnButtonText}>
          返回注册
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 32,
    alignItems: "center",
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    fontSize: 48,
    fontWeight: "bold",
  },
  messageContainer: {
    marginBottom: 32,
    alignItems: "center",
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  infoContainer: {
    marginBottom: 48,
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
    minWidth: 60,
  },
  infoValue: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  returnButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    width: "100%",
  },
  returnButtonPressed: {
    opacity: 0.8,
  },
  returnButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
