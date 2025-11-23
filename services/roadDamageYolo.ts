import { ROAD_DAMAGE_CLASSES, type RoadDamageClassId } from '@/constants/roadDamage';


export const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://192.168.0.163:8000';

export interface RoadDamageBox {
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
  classId: RoadDamageClassId;
  classCode: string;
  className: string;
}

export interface RoadDamageResult {
  hasDamage: boolean;
  confidence: number;
  detections: RoadDamageBox[];
  damageType?: string;
  warning?: string;
}

export async function detectRoadDamageYolo(
  imageUri: string,
  imageWidth: number,
  imageHeight: number
): Promise<RoadDamageResult> {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      name: 'image.jpg',
      type: 'image/jpeg',
    } as any);

    const response = await fetch(`${BACKEND_URL}/detect`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Backend error response:', text);
      throw new Error(`Backend error: ${response.status}`);
    }

    const data: {
      hasDamage: boolean;
      confidence: number;
      detections: {
        x: number;
        y: number;
        width: number;
        height: number;
        score: number;
        classId: number;
      }[];
      warning?: string;
    } = await response.json();

    const detections: RoadDamageBox[] = data.detections.map((d) => {
      const classId = d.classId as RoadDamageClassId;
      const classInfo = ROAD_DAMAGE_CLASSES[classId];

      return {
        x: d.x,
        y: d.y,
        width: d.width,
        height: d.height,
        score: d.score,
        classId,
        classCode: classInfo.code,
        className: classInfo.name,
      };
    });

    const hasDamage = detections.length > 0;
    const confidence =
      detections.length > 0
        ? detections.reduce((sum, d) => sum + d.score, 0) / detections.length
        : 0;

    let damageType: string | undefined;
    if (hasDamage) {
      const sorted = [...detections].sort((a, b) => b.score - a.score);
      const top = sorted[0];
      const topInfo = ROAD_DAMAGE_CLASSES[top.classId];
      damageType = `${topInfo.code} - ${topInfo.name}`;
    }

    return {
      hasDamage,
      confidence,
      detections,
      damageType,
      warning: data.warning,
    };
  } catch (error) {
    console.error('Error in detectRoadDamageYolo:', error);
    return {
      hasDamage: false,
      confidence: 0,
      detections: [],
      warning: 'Помилка при аналізі зображення моделлю YOLOv8',
    };
  }
}


