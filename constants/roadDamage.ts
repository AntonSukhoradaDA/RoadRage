export type RoadDamageClassId = 0 | 1 | 2 | 3;

export interface RoadDamageClassInfo {
  id: RoadDamageClassId;
  code: 'D00' | 'D10' | 'D20' | 'D40';
  short: string;
  name: string;
  risk: 'medium' | 'high';
  description: string;
}

export const ROAD_DAMAGE_CLASSES: Record<RoadDamageClassId, RoadDamageClassInfo> = {
  0: {
    id: 0,
    code: 'D00',
    short: 'Longitudinal Crack',
    name: 'Поздовжня тріщина',
    risk: 'medium',
    description:
      'Тріщини, що проходять вздовж дороги у напрямку руху. Часто пов’язані з колійністю та температурними напруженнями.',
  },
  1: {
    id: 1,
    code: 'D10',
    short: 'Transverse Crack',
    name: 'Поперечна тріщина',
    risk: 'medium',
    description:
      'Тріщини, що йдуть поперек дороги. Зазвичай пов’язані з температурними змінами та швами покриття.',
  },
  2: {
    id: 2,
    code: 'D20',
    short: 'Alligator Crack',
    name: 'Сітчасті “крокодилячі” тріщини',
    risk: 'high',
    description:
      'Мережа дрібних тріщин, схожа на крокодилячу шкіру. Свідчить про структурне руйнування основи дорожнього покриття.',
  },
  3: {
    id: 3,
    code: 'D40',
    short: 'Pothole',
    name: 'Вибоїна / яма',
    risk: 'high',
    description:
      'Місцеве руйнування покриття з втратою матеріалу та утворенням глибокої ями. Небезпечно для транспорту.',
  },
};


