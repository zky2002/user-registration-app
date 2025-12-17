import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function VerifyOtherFaceScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const accentColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");

  const phoneNumber = params.phoneNumber as string;
  const username = params.username as string;

  const [targetUsername, setTargetUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [targetUserData, setTargetUserData] = useState<{
    found: boolean;
    faceRegistered: boolean;
    username?: string;
  } | null>(null);

  // 搜索用户
  const handleSearchUser = async () => {
    if (!targetUsername.trim()) {
      Alert.alert("提示", "请输入用户名");
      return;
    }

    try {
      setLoading(true);

      // 调用后端 API 搜索用户
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000"}/api/registration/search-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: targetUsername.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to search user");
      }

      const result = await response.json();
      console.log("[VerifyOtherFace] Search result:", result);

      if (!result.found) {
        Alert.alert("未找到", `用户 "${targetUsername}" 不存在`);
        setTargetUserData(null);
        return;
      }

      if (!result.faceRegistered) {
        Alert.alert(
          "未注册",
          `用户 "${targetUsername}" 还未注册人脸信息`,
          [
            {
              text: "返回",
              onPress: () => {
                setTargetUserData(null);
                setTargetUsername("");
              },
            },
          ]
        );
        return;
      }

      // 用户已注册人脸，进入验证页面
      setTargetUserData({
        found: true,
        faceRegistered: true,
        username: result.username,
      });

      // 自动进入相机验证页面
      router.push({
        pathname: "/verify-camera-face-detection" as any,
        params: {
          phoneNumber,
          username,
          mode: "verify_other",
          targetUsername: result.username,
        },
      });
    } catch (error) {
      console.error("[VerifyOtherFace] Error searching user:", error);
      Alert.alert("错误", "搜索用户失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
            验证其他用户
          </ThemedText>
          <ThemedText type="default" style={styles.subtitle}>
            输入用户名进行验证
          </ThemedText>
        </View>

        {/* 搜索表单 */}
        <View style={styles.formContainer}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            用户名
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                color: textColor,
                borderColor: accentColor,
              },
            ]}
            placeholder="请输入用户名"
            placeholderTextColor="rgba(0, 0, 0, 0.3)"
            value={targetUsername}
            onChangeText={setTargetUsername}
            editable={!loading}
            maxLength={20}
          />

          <Pressable
            onPress={handleSearchUser}
            disabled={loading || !targetUsername.trim()}
            style={({ pressed }) => [
              styles.searchButton,
              { backgroundColor: accentColor },
              pressed && styles.searchButtonPressed,
              (!targetUsername.trim() || loading) && styles.searchButtonDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText type="defaultSemiBold" style={styles.searchButtonText}>
                搜索
              </ThemedText>
            )}
          </Pressable>
        </View>

        {/* 返回按钮 */}
        <Pressable
          onPress={() => router.back()}
          disabled={loading}
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
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
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
  formContainer: {
    gap: 16,
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    lineHeight: 24,
  },
  searchButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    marginTop: 8,
  },
  searchButtonPressed: {
    opacity: 0.8,
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
