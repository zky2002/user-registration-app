import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { trpc } from "@/lib/trpc";

export default function RegisterFaceScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const accentColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");

  const phoneNumber = params.phoneNumber as string;
  const username = params.username as string;

  const [faceData, setFaceData] = useState<{
    registered: boolean;
    boundingBox?: { x: number; y: number; width: number; height: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // 获取人脸数据
  useEffect(() => {
    const fetchFaceData = async () => {
      try {
        // 这里应该调用后端 API 获取用户的人脸数据
        // 暂时使用模拟数据
        setFaceData({
          registered: false,
          boundingBox: undefined,
        });
      } catch (error) {
        console.error("[RegisterFace] Error fetching face data:", error);
        Alert.alert("错误", "获取人脸数据失败");
      } finally {
        setLoading(false);
      }
    };

    fetchFaceData();
  }, [phoneNumber]);

  const handleRegisterFace = () => {
    router.push({
      pathname: "/camera-face-detection" as any,
      params: {
        phoneNumber,
        username,
        mode: "register", // register 或 verify
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
          注册人脸
        </ThemedText>
        <ThemedText type="default" style={styles.subtitle}>
          {username}
        </ThemedText>
      </View>

      {/* 人脸信息卡片 */}
      <Pressable
        onPress={handleRegisterFace}
        style={({ pressed }) => [
          styles.faceInfoCard,
          pressed && styles.faceInfoCardPressed,
        ]}
      >
        <View style={styles.faceStatusContainer}>
          {faceData?.registered ? (
            <>
              <ThemedText style={[styles.statusIcon, { color: "#34C759" }]}>
                ✓
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.statusTitle}>
                人脸已录入
              </ThemedText>
              <ThemedText type="default" style={styles.statusDescription}>
                点击重新录入
              </ThemedText>
            </>
          ) : (
            <>
              <ThemedText style={[styles.statusIcon, { color: accentColor }]}>
                📸
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.statusTitle}>
                人脸未录入
              </ThemedText>
              <ThemedText type="default" style={styles.statusDescription}>
                点击开始录入人脸信息
              </ThemedText>
            </>
          )}
        </View>

        {/* 边界框信息 */}
        {faceData?.registered && faceData?.boundingBox && (
          <View style={styles.boundingBoxInfo}>
            <ThemedText type="default" style={styles.infoText}>
              位置: ({Math.round(faceData.boundingBox.x)}, {Math.round(faceData.boundingBox.y)})
            </ThemedText>
            <ThemedText type="default" style={styles.infoText}>
              大小: {Math.round(faceData.boundingBox.width)} × {Math.round(faceData.boundingBox.height)}
            </ThemedText>
          </View>
        )}
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
  faceInfoCard: {
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 32,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(0, 122, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 280,
  },
  faceInfoCardPressed: {
    opacity: 0.7,
  },
  faceStatusContainer: {
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
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
  boundingBoxInfo: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
    width: "100%",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 16,
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
