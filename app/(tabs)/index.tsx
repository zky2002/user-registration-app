import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { trpc } from "@/lib/trpc";

export default function HomeScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; username?: string }>({});
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "icon");
  const inputBgColor = useThemeColor({}, "background");

  const registerMutation = trpc.registration.register.useMutation();
  const loginMutation = trpc.registration.login.useMutation();

  // 验证手机号格式
  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  // 验证用户名
  const validateUsername = (name: string): boolean => {
    return name.trim().length >= 2 && name.trim().length <= 20;
  };

  // 处理注册/登录
  const handleRegisterOrLogin = async () => {
    const newErrors: { phone?: string; username?: string } = {};

    // 验证输入
    if (!phoneNumber) {
      newErrors.phone = "请输入手机号";
    } else if (!validatePhoneNumber(phoneNumber)) {
      newErrors.phone = "请输入有效的手机号";
    }

    if (!username) {
      newErrors.username = "请输入用户名";
    } else if (!validateUsername(username)) {
      newErrors.username = "用户名长度需在 2-20 个字符";
    }

    setErrors(newErrors);

    // 如果有错误，不继续
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    try {
      // 先尝试登录
      try {
        const loginResult = await loginMutation.mutateAsync({
          phoneNumber: phoneNumber.trim(),
        });

        if (loginResult.success) {
          // 登录成功，导航到第二个页面
          router.push({
            pathname: "/face-recognition" as any,
            params: {
              phoneNumber: phoneNumber.trim(),
              username: loginResult.username,
              isLogin: "true",
            },
          });
          return;
        }
      } catch (loginError) {
        // 登录失败，尝试注册
        console.log("[Register] Login failed, attempting registration...");
      }

      // 如果登录失败，进行注册
      const registerResult = await registerMutation.mutateAsync({
        phoneNumber: phoneNumber.trim(),
        username: username.trim(),
      });

      if (registerResult.success) {
        // 注册成功，导航到第二个页面
        router.push({
          pathname: "/face-recognition" as any,
          params: {
            phoneNumber: phoneNumber.trim(),
            username: username.trim(),
            isLogin: "false",
          },
        });
      }
    } catch (error) {
      console.error("[Register] Error:", error);
      const errorMessage = error instanceof Error ? error.message : "操作失败";
      Alert.alert("失败", errorMessage);
    } finally {
      setIsLoading(false);
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
      {/* 标题 */}
      <View style={styles.headerContainer}>
        <ThemedText type="title" style={styles.title}>
          用户注册/登录
        </ThemedText>
        <ThemedText type="default" style={styles.subtitle}>
          输入您的信息完成注册或登录
        </ThemedText>
      </View>

      {/* 表单容器 */}
      <View style={styles.formContainer}>
        {/* 手机号输入框 */}
        <View style={styles.inputGroup}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            手机号
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                color: textColor,
                backgroundColor: inputBgColor,
                borderColor: errors.phone ? "#FF3B30" : "#E5E5EA",
              },
            ]}
            placeholder="请输入手机号"
            placeholderTextColor={placeholderColor}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              if (errors.phone) {
                setErrors({ ...errors, phone: undefined });
              }
            }}
            editable={!isLoading}
            maxLength={11}
          />
          {errors.phone && (
            <ThemedText type="default" style={styles.errorText}>
              {errors.phone}
            </ThemedText>
          )}
        </View>

        {/* 用户名输入框 */}
        <View style={styles.inputGroup}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            用户名
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                color: textColor,
                backgroundColor: inputBgColor,
                borderColor: errors.username ? "#FF3B30" : "#E5E5EA",
              },
            ]}
            placeholder="请输入用户名"
            placeholderTextColor={placeholderColor}
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              if (errors.username) {
                setErrors({ ...errors, username: undefined });
              }
            }}
            editable={!isLoading}
            maxLength={20}
          />
          {errors.username && (
            <ThemedText type="default" style={styles.errorText}>
              {errors.username}
            </ThemedText>
          )}
        </View>
      </View>

      {/* 注册/登录按钮 */}
      <Pressable
        onPress={handleRegisterOrLogin}
        disabled={isLoading}
        style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText type="defaultSemiBold" style={styles.registerButtonText}>
            注册/登录
          </ThemedText>
        )}
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  formContainer: {
    marginBottom: 32,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 48,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    lineHeight: 16,
    marginLeft: 4,
  },
  registerButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
