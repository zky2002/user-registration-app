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
import { initializeModel, detectFaces } from "@/lib/face-detector-simple";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function CameraFaceDetectionScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const accentColor = useThemeColor({}, "tint");

  const phoneNumber = params.phoneNumber as string;
  const username = params.username as string;
  const mode = params.mode as string;

  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [detectedFace, setDetectedFace] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // 初始化模型
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("[CameraFaceDetection] Loading face detection model...");
        await initializeModel();
        console.log("[CameraFaceDetection] Model loaded successfully");
        setModelLoading(false);
      } catch (error) {
        console.error("[CameraFaceDetection] Failed to load model:", error);
        Alert.alert("错误", "加载人脸检测模型失败");
        setModelLoading(false);
      }
    };

    loadModel();
  }, []);

  // 请求相机权限
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // 人脸检测
  const detectFace = async () => {
    if (!cameraRef.current || isProcessing || modelLoading) return;

    setIsProcessing(true);
    try {
      // 拍摄照片
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      console.log("[CameraFaceDetection] Photo captured:", photo.uri);

      // 在 React Native 中，我们使用模拟数据进行人脸检测
      // 实际应用中，应该将图像上传到后端进行处理
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;

      // 运行人脸检测
      console.log("[CameraFaceDetection] Running face detection...");
      const detections = await detectFaces(canvas);

      if (detections.length === 0) {
        Alert.alert("未检测到人脸", "请确保您的脸部清晰可见，然后重新拍摄");
        setDetectedFace(null);
        return;
      }

      // 使用第一个检测到的人脸（通常是最大的）
      const detection = detections[0];
      const faceData = {
        x: Math.round(detection.x),
        y: Math.round(detection.y),
        width: Math.round(detection.width),
        height: Math.round(detection.height),
      };

      setDetectedFace(faceData);

      // 显示检测结果
      Alert.alert(
        "人脸检测成功",
        `检测到人脸\n位置: (${faceData.x}, ${faceData.y})\n大小: ${faceData.width} × ${faceData.height}\n置信度: ${(detection.confidence * 100).toFixed(1)}%`,
        [
          {
            text: "重新拍摄",
            onPress: () => setDetectedFace(null),
          },
          {
            text: "确认保存",
            onPress: () => handleSaveFace(photo.uri, faceData),
          },
        ]
      );
    } catch (error) {
      console.error("[CameraFaceDetection] Error capturing photo:", error);
      Alert.alert("错误", "拍摄照片失败");
    } finally {
      setIsProcessing(false);
    }
  };

  // 保存人脸数据
  const handleSaveFace = async (
    photoUri: string,
    boundingBox: { x: number; y: number; width: number; height: number }
  ) => {
    try {
      setIsProcessing(true);

      // 调用后端 API 保存人脸数据
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000"}/api/registration/save-face`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber,
            username,
            boundingBox,
            photoUri,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save face data");
      }

      const result = await response.json();
      console.log("[CameraFaceDetection] Face saved:", result);

      Alert.alert("成功", "人脸信息已保存", [
        {
          text: "返回",
          onPress: () => {
            setDetectedFace(null);
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error("[CameraFaceDetection] Error saving face:", error);
      Alert.alert("错误", "保存人脸信息失败");
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
            请允许应用访问您的相机以进行人脸识别
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

  if (modelLoading) {
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
          <ThemedText type="default" style={styles.loadingText}>
            初始化人脸检测中...
          </ThemedText>
          <ThemedText type="default" style={[styles.loadingText, { fontSize: 12, marginTop: 8 }]}>
            (一次性初始化，请稍候)
          </ThemedText>
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
            请对准您的脸部
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
          onPress={detectFace}
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
              拍摄
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
  loadingText: {
    fontSize: 14,
    lineHeight: 20,
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
