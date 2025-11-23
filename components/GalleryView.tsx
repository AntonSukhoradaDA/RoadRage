import { useThemeColor } from '@/hooks/use-theme-color';
import { detectRoadDamageYolo } from '@/services/roadDamageYolo';
import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export default function GalleryView() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<{
    hasDamage: boolean;
    confidence: number;
    detections: any[];
    damageType?: string;
    warning?: string;
  } | null>(null);

  const tintColor = useThemeColor({}, 'tint');
  const successColor = useThemeColor({}, 'success');
  const cardColor = useThemeColor({}, 'card');
  const cardBorderColor = useThemeColor({}, 'cardBorder');
  const [imageLayout, setImageLayout] = useState<{ width: number; height: number } | null>(null);
  const [originalImageSize, setOriginalImageSize] = useState<{ width: number; height: number } | null>(null);

  const damageSummary = useMemo(() => {
    if (!detectionResult || !detectionResult.detections?.length) {
      return [];
    }

    const groups: Record<
      string,
      { code: string; name: string; count: number; maxScore: number }
    > = {};

    detectionResult.detections.forEach((det: any) => {
      const code = det.classCode ?? String(det.classId ?? 'unknown');
      const name = det.className ?? '';
      const score = typeof det.score === 'number' ? det.score : 0;

      if (!groups[code]) {
        groups[code] = { code, name, count: 0, maxScore: 0 };
      }

      groups[code].count += 1;
      if (score > groups[code].maxScore) {
        groups[code].maxScore = score;
      }
    });

    return Object.values(groups).sort((a, b) => b.maxScore - a.maxScore);
  }, [detectionResult]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Потрібен доступ',
        'Потрібен доступ до галереї для вибору фото'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setDetectionResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    setIsProcessing(true);
    setDetectionResult(null);

    try {
      const imageInfo = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        Image.getSize(selectedImage, (width, height) => resolve({ width, height }), reject);
      });

      const result = await detectRoadDamageYolo(
        selectedImage,
        imageInfo.width,
        imageInfo.height
      );

      setOriginalImageSize(imageInfo);
      setDetectionResult(result);
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Помилка', 'Не вдалося проаналізувати фото');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>
          Road Damage Detection
        </ThemedText>
        {!selectedImage && (
          <View style={styles.infoBlock}>
            <View
              style={[
                styles.infoCard,
                { backgroundColor: cardColor, borderColor: cardBorderColor },
              ]}>
              <ThemedText type="subtitle" style={styles.howItWorksTitle}>
                Про додаток
              </ThemedText>
              <ThemedText style={styles.howItWorksText}>
                RoadRage - додаток для розпізнавання пошкоджень дорожнього полотна за допомогою штучного інтелекту.
              </ThemedText>
              <ThemedText style={styles.howItWorksText}>
                Оберіть фото з галереї, щоб проаналізувати стан дорожнього покриття. Увесь інтерфейс оформлений у темній темі для зручності вночі.
              </ThemedText>
            </View>

            <View
              style={[
                styles.infoCard,
                { backgroundColor: cardColor, borderColor: cardBorderColor },
              ]}>
              <ThemedText type="subtitle" style={styles.howItWorksTitle}>
                Як це працює
              </ThemedText>
              <ThemedText style={styles.howItWorksText}>
                1. Завантажте фото дороги з галереї.
              </ThemedText>
              <ThemedText style={styles.howItWorksText}>
                2. Алгоритм виявляє потенційні пошкодження та виділяє їх на зображенні.
              </ThemedText>
              <ThemedText style={styles.howItWorksText}>
                3. Ви бачите типи пошкоджень, їх кількість та рівень впевненості моделі.
              </ThemedText>
            </View>

            <View
              style={[
                styles.infoCard,
                { backgroundColor: cardColor, borderColor: cardBorderColor },
              ]}>
              <ThemedText type="subtitle" style={styles.howItWorksTitle}>
                Рекомендації
              </ThemedText>
              <ThemedText style={styles.howItWorksText}>
                • Робіть фото при хорошому освітленні, без сильних відблисків від фар.
              </ThemedText>
              <ThemedText style={styles.howItWorksText}>
                • Намагайтеся знімати дорогу під невеликим кутом і без розмиття руху.
              </ThemedText>
              <ThemedText style={styles.howItWorksText}>
                • Не використовуйте фото з сильними фільтрами чи обробкою - це може вплинути на якість аналізу.
              </ThemedText>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: tintColor },
            Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
              },
              android: {
                elevation: 4,
              },
            }),
          ]}
          onPress={pickImage}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Вибрати фото</Text>
        </TouchableOpacity>

        {selectedImage && (
          <View style={styles.imageContainer}>
            <View
              style={[
                styles.imageWrapper,
                { backgroundColor: cardColor, borderColor: cardBorderColor },
                Platform.select({
                  ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                  },
                  android: {
                    elevation: 4,
                  },
                }),
              ]}
            >
              <Image
                source={{ uri: selectedImage }}
                style={styles.image}
                onLayout={(event) => {
                  const { width, height } = event.nativeEvent.layout;
                  setImageLayout({ width, height });
                }}
              />
              {isProcessing && (
                <View style={styles.imageOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={styles.imageOverlayText}>Аналізую фото...</Text>
                </View>
              )}
              {imageLayout &&
                originalImageSize &&
                detectionResult &&
                detectionResult.detections.map((detection, index) => {
                  const { width: layoutW, height: layoutH } = imageLayout;
                  const { width: origW, height: origH } = originalImageSize;

                  const scale = Math.min(layoutW / origW, layoutH / origH);
                  const displayedW = origW * scale;
                  const displayedH = origH * scale;

                  const padX = (layoutW - displayedW) / 2;
                  const padY = (layoutH - displayedH) / 2;

                  const left = padX + detection.x * displayedW;
                  const top = padY + detection.y * displayedH;
                  const width = detection.width * displayedW;
                  const height = detection.height * displayedH;
                  return (
                    <View
                      key={index}
                      style={[
                        styles.box,
                        {
                          left,
                          top,
                          width,
                          height,
                        },
                      ]}>
                      <View style={styles.boxLabel}>
                        <Text
                          style={styles.boxLabelText}
                          numberOfLines={1}
                          ellipsizeMode="clip"
                        >
                          {detection.classCode}
                        </Text>
                      </View>
                    </View>
                  );
                })}
            </View>

            {!detectionResult && (
              <TouchableOpacity
                style={[
                  styles.analyzeButton,
                  { backgroundColor: successColor },
                  isProcessing && styles.buttonDisabled,
                  Platform.select({
                    ios: {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.2,
                      shadowRadius: 8,
                    },
                    android: {
                      elevation: 4,
                    },
                  }),
                ]}
                onPress={analyzeImage}
                disabled={isProcessing}
                activeOpacity={0.8}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Проаналізувати</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" />
            <ThemedText style={styles.processingText}>
              Аналізую фото...
            </ThemedText>
          </View>
        )}

        {detectionResult && (
          <View style={styles.resultContainer}>
            <ThemedText type="subtitle" style={styles.resultTitle}>
              Результати аналізу:
            </ThemedText>

            <View style={[
              styles.resultBox,
              { backgroundColor: `rgba(255, 149, 0, 0.1)`, borderColor: `rgba(255, 149, 0, 0.3)` },
            ]}>
              <ThemedText style={styles.resultText}>
                {damageSummary.length > 0
                  ? 'Знайдені пошкодження:'
                  : detectionResult.damageType || 'Аналіз завершено'}
              </ThemedText>

              {damageSummary.length > 0 && (
                <View style={styles.detectionsContainer}>
                  {damageSummary.map((item) => (
                    <View
                      key={item.code}
                      style={[
                        styles.detectionItem,
                        { backgroundColor: 'rgba(255, 149, 0, 0.06)' },
                      ]}
                    >
                      <ThemedText style={styles.detectionText}>
                        {item.code}
                        {item.name ? ` - ${item.name}` : ''} ({item.count}×){' '}
                        {item.maxScore > 0 &&
                          `- макс. впевненість ${(item.maxScore * 100).toFixed(1)}%`}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              )}
              {detectionResult.warning && (
                <ThemedText style={styles.warningText}>
                  ⚠️ {detectionResult.warning}
                </ThemedText>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    marginBottom: 32,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    minWidth: 380,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  infoBlock: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  infoCard: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  howItWorksTitle: {
    marginBottom: 8,
    fontSize: 18,
  },
  howItWorksText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.85,
  },
  imageContainer: {
    width: '100%',
    marginBottom: 24,
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 0,
  },
  image: {
    width: '100%',
    height: 320,
    borderRadius: 16,
    resizeMode: 'contain',
  },
  analyzeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 220,
  },
  processingContainer: {
    alignItems: 'center',
    marginTop: 32,
    padding: 24,
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    width: '100%',
  },
  resultTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
  },
  resultBox: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 2,
  },
  resultText: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  confidenceText: {
    fontSize: 15,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
    fontWeight: '500',
  },
  warningText: {
    fontSize: 13,
    opacity: 0.75,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  detectionsContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  detectionsTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  detectionItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
  },
  detectionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  box: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderRadius: 8,
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageOverlayText: {
    marginTop: 8,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  boxLabel: {
    position: 'absolute',
    left: 0,
    top: -22,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  boxLabelText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
});

