import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function BlankTestScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const accentColor = useThemeColor({}, "tint");

  const action = params.action as string;
  const phoneNumber = params.phoneNumber as string;
  const username = params.username as string;

  const getActionTitle = () => {
    switch (action) {
      case "register_face":
        return "注册人脸";
      case "verify_own_face":
        return "验证自己的人脸";
      case "verify_other_face":
        return "验证其他用户的人脸";
      default:
        return "测试页面";
    }
  };

  const getActionDescription = () => {
    switch (action) {
      case "register_face":
        return "此功能将用于拍摄并保存您的人脸信息";
      case "verify_own_face":
        return "此功能将用于验证您的身份信息";
      case "verify_other_face":
        return "此功能将用于验证其他用户的身份信息";
      default:
        return "测试页面";
    }
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
      {/* 空白内容区域 */}
      <View style={styles.contentContainer}>
        <View style={styles.blankArea}>
          <ThemedText type="title" style={styles.blankTitle}>
            {getActionTitle()}
          </ThemedText>
          <ThemedText type="default" style={styles.blankDescription}>
            {getActionDescription()}
          </ThemedText>
          <ThemedText type="default" style={styles.testInfo}>
            用户: {username}
          </ThemedText>
          <ThemedText type="default" style={styles.testInfo}>
            手机号: {phoneNumber}
          </ThemedText>
        </View>
      </View>

      {/* 底部按钮 */}
      <View style={styles.buttonContainer}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: accentColor },
            pressed && styles.buttonPressed,
          ]}
        >
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>
            返回
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  blankArea: {
    alignItems: "center",
    gap: 16,
  },
  blankTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  blankDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 16,
  },
  testInfo: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
