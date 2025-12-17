import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function VerifyCameraFaceDetectionScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const accentColor = useThemeColor({}, "tint");

  const phoneNumber = params.phoneNumber as string;
  const username = params.username as string;
  const mode = params.mode as string; // verify_own 或 verify_other
  const targetUsername = params.targetUsername as string; // 仅在 verify_other 时使用

  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedFace, setDetectedFace] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // 请求相机权限
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // 模拟人脸检测和对比
  const detectAndVerifyFace = async () => {
    if (!cameraRef.current || isProcessing) return;

    setIsProcessing(true);
    try {
      // 拍摄照片
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      console.log("[VerifyCameraFaceDetection] Photo captured:", photo.uri);

      // 模拟人脸检测
      const mockFaceDetection = {
        x: screenWidth * 0.2,
        y: screenHeight * 0.25,
        width: screenWidth * 0.6,
        height: screenHeight * 0.5,
      };

      setDetectedFace(mockFaceDetection);

      // 模拟人脸对比（测试状态：均通过）
      const verificationResult = {
        success: true,
        similarity: 0.95, // 相似度 95%
        message: "人脸验证成功",
      };

      if (verificationResult.success) {
        Alert.alert(
          "验证成功",
          `人脸验证通过\n相似度: ${Math.round(verificationResult.similarity * 100)}%`,
          [
            {
              text: "返回",
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert(
          "验证失败",
          "人脸不匹配，请重新尝试",
          [
            {
              text: "重新拍摄",
              onPress: () => setDetectedFace(null),
            },
          ]
        );
      }
    } catch (error) {
      console.error("[VerifyCameraFaceDetection] Error capturing photo:", error);
      Alert.alert("错误", "拍摄照片失败");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!permission?.granted) {
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
          <ThemedText type="title" style={styles.permissionTitle}>
            需要相机权限
          </ThemedText>
          <ThemedText type="default" style={styles.permissionText}>
            请允许应用访问您的相机以进行人脸验证
          </ThemedText>
          <Pressable
            onPress={requestPermission}
            style={({ pressed }) => [
              styles.permissionButton,
              { backgroundColor: accentColor },
              pressed && styles.permissionButtonPressed,
            ]}
          >
            <ThemedText type="defaultSemiBold" style={styles.permissionButtonText}>
              授予权限
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* 相机预览 */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
      >
        {/* 人脸检测框 */}
        {detectedFace && (
          <View
            style={[
              styles.detectionBox,
              {
                left: detectedFace.x,
                top: detectedFace.y,
                width: detectedFace.width,
                height: detectedFace.height,
              },
            ]}
          />
        )}

        {/* 提示文字 */}
        <View style={styles.instructionContainer}>
          <ThemedText type="defaultSemiBold" style={styles.instructionText}>
            {mode === "verify_own"
              ? "请对准您的脸部进行验证"
              : `请对准 ${targetUsername} 的脸部进行验证`}
          </ThemedText>
        </View>
      </CameraView>

      {/* 底部控制区 */}
      <View
        style={[
          styles.controlContainer,
          {
            paddingBottom: Math.max(insets.bottom, 20),
          },
        ]}
      >
        <Pressable
          onPress={detectAndVerifyFace}
          disabled={isProcessing}
          style={({ pressed }) => [
            styles.captureButton,
            { backgroundColor: accentColor },
            pressed && styles.captureButtonPressed,
            isProcessing && styles.captureButtonDisabled,
          ]}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText type="defaultSemiBold" style={styles.captureButtonText}>
              验证
            </ThemedText>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          disabled={isProcessing}
          style={({ pressed }) => [
            styles.cancelButton,
            pressed && styles.cancelButtonPressed,
          ]}
        >
          <ThemedText type="default" style={[styles.cancelButtonText, { color: accentColor }]}>
            取消
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 16,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  permissionText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  permissionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  permissionButtonPressed: {
    opacity: 0.8,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  camera: {
    flex: 1,
    justifyContent: "space-between",
  },
  detectionBox: {
    position: "absolute",
    borderWidth: 3,
    borderColor: "#34C759",
    borderRadius: 8,
  },
  instructionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
  },
  instructionText: {
    color: "#fff",
    fontSize: 16,
  },
  controlContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  captureButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  captureButtonPressed: {
    opacity: 0.8,
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonPressed: {
    opacity: 0.6,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
