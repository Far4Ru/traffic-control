import { SCENE, ROAD } from './constants';
import { Direction, LaneSide, ArrowType } from '../core/types';

export interface LaneConfig {
    x: number;
    y: number;
    rotation: number;
    direction: Direction;
    isEntry: boolean;
    side: LaneSide;
    arrowType: ArrowType;
    speedLimit: number;
}

export interface TrafficLightConfig {
    x: number;
    y: number;
    rotation: number;
    phase: number;
}

const LW = ROAD.LANE_WIDTH;
const CX = SCENE.CENTER_X;
const CY = SCENE.CENTER_Y;

// Исправлены координаты спавна машин:
// Для восточного направления (движение влево) - машины должны быть на правой полосе движения
// В России/Европе правостороннее движение: машины едут по правой стороне дороги
export const LANE_CONFIGS: LaneConfig[] = [
    // ===== СЕВЕР (движение ВНИЗ) =====
    // Правая полоса (ближе к центру) - для движения прямо
    { x: CX - LW / 2, y: ROAD.ROAD_START, rotation: Math.PI / 2, direction: 'north', isEntry: true, side: 'right', arrowType: 'straight', speedLimit: 2.5 },
    // Левая полоса (дальше от центра) - для поворота налево
    { x: CX - LW * 1.5, y: ROAD.ROAD_START, rotation: Math.PI / 2, direction: 'north', isEntry: true, side: 'left', arrowType: 'straight', speedLimit: 2.0 },
    // Выездные полосы (север, направление выезда)
    { x: CX + LW / 2, y: ROAD.ROAD_END, rotation: -Math.PI / 2, direction: 'north', isEntry: false, side: 'right', arrowType: 'straight', speedLimit: 2.5 },
    { x: CX + LW * 1.5, y: ROAD.ROAD_END, rotation: -Math.PI / 2, direction: 'north', isEntry: false, side: 'left', arrowType: 'straight', speedLimit: 2.0 },

    // ===== ЮГ (движение ВВЕРХ) =====
    { x: CX + LW / 2, y: ROAD.ROAD_END, rotation: -Math.PI / 2, direction: 'south', isEntry: true, side: 'right', arrowType: 'straight', speedLimit: 2.5 },
    { x: CX + LW * 1.5, y: ROAD.ROAD_END, rotation: -Math.PI / 2, direction: 'south', isEntry: true, side: 'left', arrowType: 'straight', speedLimit: 2.0 },
    { x: CX - LW / 2, y: ROAD.ROAD_START, rotation: Math.PI / 2, direction: 'south', isEntry: false, side: 'right', arrowType: 'straight', speedLimit: 2.5 },
    { x: CX - LW * 1.5, y: ROAD.ROAD_START, rotation: Math.PI / 2, direction: 'south', isEntry: false, side: 'left', arrowType: 'straight', speedLimit: 2.0 },

    // ===== ВОСТОК (движение ВЛЕВО) =====
    // Исправлено: машины на восточной дороге должны спавниться справа (ближе к нижней части дороги)
    // Так как движение влево, правой стороной будет нижняя часть дороги (y + LW/2)
    { x: ROAD.ROAD_END, y: CY + LW / 2, rotation: Math.PI, direction: 'east', isEntry: true, side: 'right', arrowType: 'straight', speedLimit: 2.5 },
    { x: ROAD.ROAD_END, y: CY + LW * 1.5, rotation: Math.PI, direction: 'east', isEntry: true, side: 'left', arrowType: 'straight', speedLimit: 2.0 },
    { x: ROAD.ROAD_START, y: CY - LW / 2, rotation: 0, direction: 'east', isEntry: false, side: 'right', arrowType: 'straight', speedLimit: 2.5 },
    { x: ROAD.ROAD_START, y: CY - LW * 1.5, rotation: 0, direction: 'east', isEntry: false, side: 'left', arrowType: 'straight', speedLimit: 2.0 },

    // ===== ЗАПАД (движение ВПРАВО) =====
    // Исправлено: машины на западной дороге спавнятся справа (ближе к верхней части дороги)
    { x: ROAD.ROAD_START, y: CY - LW / 2, rotation: 0, direction: 'west', isEntry: true, side: 'right', arrowType: 'straight', speedLimit: 2.5 },
    { x: ROAD.ROAD_START, y: CY - LW * 1.5, rotation: 0, direction: 'west', isEntry: true, side: 'left', arrowType: 'straight', speedLimit: 2.0 },
    { x: ROAD.ROAD_END, y: CY + LW / 2, rotation: Math.PI, direction: 'west', isEntry: false, side: 'right', arrowType: 'straight', speedLimit: 2.5 },
    { x: ROAD.ROAD_END, y: CY + LW * 1.5, rotation: Math.PI, direction: 'west', isEntry: false, side: 'left', arrowType: 'straight', speedLimit: 2.0 },
];

export const TRAFFIC_LIGHT_CONFIGS: TrafficLightConfig[] = [
    { x: CX - LW * 2.5, y: CY - LW * 2, rotation: 0, phase: 0 },      // север
    { x: CX + LW * 2.5, y: CY + LW * 2, rotation: Math.PI, phase: 1 }, // юг
    { x: CX + LW * 2, y: CY + LW * 2.5, rotation: Math.PI / 2, phase: 2 }, // восток
    { x: CX - LW * 2, y: CY - LW * 2.5, rotation: -Math.PI / 2, phase: 3 }, // запад
];