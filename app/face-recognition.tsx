import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function FaceRecognitionScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const accentColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");

  const phoneNumber = params.phoneNumber as string;
  const username = params.username as string;
  const isLogin = params.isLogin === "true";

  const handleRegisterFace = () => {
    router.push({
      pathname: "/blank-test" as any,
      params: {
        action: "register_face",
        phoneNumber,
        username,
      },
    });
  };

  const handleVerifyOwnFace = () => {
    router.push({
      pathname: "/blank-test" as any,
      params: {
        action: "verify_own_face",
        phoneNumber,
        username,
      },
    });
  };

  const handleVerifyOtherFace = () => {
    router.push({
      pathname: "/blank-test" as any,
      params: {
        action: "verify_other_face",
        phoneNumber,
        username,
      },
    });
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 欢迎信息 */}
        <View style={styles.headerContainer}>
          <ThemedText type="title" style={styles.title}>
            {isLogin ? "欢迎回来" : "注册成功"}
          </ThemedText>
          <ThemedText type="default" style={styles.subtitle}>
            {username}
          </ThemedText>
          <ThemedText type="default" style={styles.phoneText}>
            {phoneNumber}
          </ThemedText>
        </View>

        {/* 人脸识别模块 */}
        <View style={styles.modulesContainer}>
          {/* 上方：注册人脸 */}
          <Pressable
            onPress={handleRegisterFace}
            style={({ pressed }) => [
              styles.moduleCard,
              styles.registerFaceCard,
              pressed && styles.moduleCardPressed,
            ]}
          >
            <View style={styles.moduleIconContainer}>
              <ThemedText style={[styles.moduleIcon, { color: accentColor }]}>
                📸
              </ThemedText>
            </View>
            <ThemedText type="defaultSemiBold" style={styles.moduleTitle}>
              注册人脸
            </ThemedText>
            <ThemedText type="default" style={styles.moduleDescription}>
              拍摄并保存您的人脸信息
            </ThemedText>
          </Pressable>

          {/* 中间：验证自己的人脸 */}
          <Pressable
            onPress={handleVerifyOwnFace}
            style={({ pressed }) => [
              styles.moduleCard,
              styles.verifyOwnCard,
              pressed && styles.moduleCardPressed,
            ]}
          >
            <View style={styles.moduleIconContainer}>
              <ThemedText style={[styles.moduleIcon, { color: accentColor }]}>
                ✓
              </ThemedText>
            </View>
            <ThemedText type="defaultSemiBold" style={styles.moduleTitle}>
              验证自己的人脸
            </ThemedText>
            <ThemedText type="default" style={styles.moduleDescription}>
              验证您的身份信息
            </ThemedText>
          </Pressable>

          {/* 下方：验证其他用户的人脸 */}
          <Pressable
            onPress={handleVerifyOtherFace}
            style={({ pressed }) => [
              styles.moduleCard,
              styles.verifyOtherCard,
              pressed && styles.moduleCardPressed,
            ]}
          >
            <View style={styles.moduleIconContainer}>
              <ThemedText style={[styles.moduleIcon, { color: accentColor }]}>
                👥
              </ThemedText>
            </View>
            <ThemedText type="defaultSemiBold" style={styles.moduleTitle}>
              验证其他用户的人脸
            </ThemedText>
            <ThemedText type="default" style={styles.moduleDescription}>
              验证其他用户的身份信息
            </ThemedText>
          </Pressable>
        </View>

        {/* 返回按钮 */}
        <Pressable
          onPress={() => router.replace("/")}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <ThemedText type="default" style={[styles.backButtonText, { color: accentColor }]}>
            返回首页
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
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
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  phoneText: {
    fontSize: 14,
    lineHeight: 20,
  },
  modulesContainer: {
    gap: 16,
    marginBottom: 32,
  },
  moduleCard: {
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 140,
  },
  registerFaceCard: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(0, 122, 255, 0.3)",
  },
  verifyOwnCard: {
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(52, 199, 89, 0.3)",
  },
  verifyOtherCard: {
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 149, 0, 0.3)",
  },
  moduleCardPressed: {
    opacity: 0.7,
  },
  moduleIconContainer: {
    marginBottom: 12,
  },
  moduleIcon: {
    fontSize: 40,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  backButtonPressed: {
    opacity: 0.6,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
