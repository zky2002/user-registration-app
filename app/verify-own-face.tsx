import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { trpc } from "@/lib/trpc";

export default function VerifyOwnFaceScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const accentColor = useThemeColor({}, "tint");

  const phoneNumber = params.phoneNumber as string;
  const username = params.username as string;

  const [loading, setLoading] = useState(true);
  const [faceRegistered, setFaceRegistered] = useState(false);

  // 获取人脸注册状态
  useEffect(() => {
    const checkFaceRegistration = async () => {
      try {
        setLoading(true);

        // 调用后端 API 获取人脸数据
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000"}/api/registration/get-face`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              phoneNumber,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to get face data");
        }

        const result = await response.json();
        console.log("[VerifyOwnFace] Face data:", result);

        setFaceRegistered(result.registered || false);
      } catch (error) {
        console.error("[VerifyOwnFace] Error checking face registration:", error);
        // 如果 API 调用失败，使用模拟数据（测试状态）
        setFaceRegistered(false);
      } finally {
        setLoading(false);
      }
    };

    checkFaceRegistration();
  }, [phoneNumber]);

  const handleVerifyFace = () => {
    if (!faceRegistered) {
      Alert.alert(
        "未注册",
        "您还未注册人脸信息，请先在注册人脸页面进行注册。",
        [
          {
            text: "返回",
            onPress: () => router.back(),
          },
        ]
      );
      return;
    }

    // 进入相机验证页面
    router.push({
      pathname: "/verify-camera-face-detection" as any,
      params: {
        phoneNumber,
        username,
        mode: "verify_own",
      },
    });
  };

  if (loading) {
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
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={accentColor} />
        </View>
      </ThemedView>
    );
  }

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
      {/* 标题 */}
      <View style={styles.headerContainer}>
        <ThemedText type="title" style={styles.title}>
          验证自己的人脸
        </ThemedText>
        <ThemedText type="default" style={styles.subtitle}>
          {username}
        </ThemedText>
      </View>

      {/* 状态卡片 */}
      <Pressable
        onPress={handleVerifyFace}
        style={({ pressed }) => [
          styles.statusCard,
          pressed && styles.statusCardPressed,
        ]}
      >
        <View style={styles.statusContainer}>
          {faceRegistered ? (
            <>
              <ThemedText style={[styles.statusIcon, { color: "#34C759" }]}>
                ✓
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.statusTitle}>
                人脸已注册
              </ThemedText>
              <ThemedText type="default" style={styles.statusDescription}>
                点击开始验证
              </ThemedText>
            </>
          ) : (
            <>
              <ThemedText style={[styles.statusIcon, { color: "#FF3B30" }]}>
                ✕
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.statusTitle}>
                人脸未注册
              </ThemedText>
              <ThemedText type="default" style={styles.statusDescription}>
                请先注册人脸信息
              </ThemedText>
            </>
          )}
        </View>
      </Pressable>

      {/* 返回按钮 */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.backButtonPressed,
        ]}
      >
        <ThemedText type="default" style={[styles.backButtonText, { color: accentColor }]}>
          返回
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  statusCard: {
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 32,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(0, 122, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 240,
  },
  statusCardPressed: {
    opacity: 0.7,
  },
  statusContainer: {
    alignItems: "center",
    gap: 12,
  },
  statusIcon: {
    fontSize: 60,
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  statusDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonPressed: {
    opacity: 0.6,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
