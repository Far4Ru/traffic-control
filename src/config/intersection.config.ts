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

// Правостороннее движение
// Север -> вниз (southbound), Юг -> вверх (northbound)
// Восток -> влево (westbound), Запад -> вправо (eastbound)

export const LANE_CONFIGS: LaneConfig[] = [
    // ===== СЕВЕР (движение ВНИЗ, к центру) =====
    // Правая полоса (ближе к центру дороги) - прямо и направо
    { x: CX - LW / 2, y: ROAD.ROAD_START, rotation: Math.PI / 2, direction: 'north', isEntry: true, side: 'right', arrowType: 'straight-right', speedLimit: 2.5 },
    // Левая полоса (дальше от центра) - прямо и налево
    { x: CX - LW * 1.5, y: ROAD.ROAD_START, rotation: Math.PI / 2, direction: 'north', isEntry: true, side: 'left', arrowType: 'straight-left', speedLimit: 2.0 },
    // Выездные полосы (для машин с юга)
    { x: CX + LW / 2, y: ROAD.ROAD_END, rotation: -Math.PI / 2, direction: 'north', isEntry: false, side: 'right', arrowType: 'straight', speedLimit: 2.5 },
    { x: CX + LW * 1.5, y: ROAD.ROAD_END, rotation: -Math.PI / 2, direction: 'north', isEntry: false, side: 'left', arrowType: 'straight', speedLimit: 2.0 },

    // ===== ЮГ (движение ВВЕРХ, к центру) =====
    // Правая полоса (ближе к центру) - прямо и направо
    { x: CX + LW / 2, y: ROAD.ROAD_END, rotation: -Math.PI / 2, direction: 'south', isEntry: true, side: 'right', arrowType: 'straight-right', speedLimit: 2.5 },
    // Левая полоса - прямо и налево
    { x: CX + LW * 1.5, y: ROAD.ROAD_END, rotation: -Math.PI / 2, direction: 'south', isEntry: true, side: 'left', arrowType: 'straight-left', speedLimit: 2.0 },
    // Выездные
    { x: CX - LW / 2, y: ROAD.ROAD_START, rotation: Math.PI / 2, direction: 'south', isEntry: false, side: 'right', arrowType: 'straight', speedLimit: 2.5 },
    { x: CX - LW * 1.5, y: ROAD.ROAD_START, rotation: Math.PI / 2, direction: 'south', isEntry: false, side: 'left', arrowType: 'straight', speedLimit: 2.0 },

    // ===== ВОСТОК (движение ВЛЕВО, к центру) =====
    // Правая полоса (ближе к центру)
    { x: ROAD.ROAD_END, y: CY + LW / 2, rotation: Math.PI, direction: 'east', isEntry: true, side: 'right', arrowType: 'straight-right', speedLimit: 2.5 },
    // Левая полоса
    { x: ROAD.ROAD_END, y: CY + LW * 1.5, rotation: Math.PI, direction: 'east', isEntry: true, side: 'left', arrowType: 'straight-left', speedLimit: 2.0 },
    // Выездные
    { x: ROAD.ROAD_START, y: CY - LW / 2, rotation: 0, direction: 'east', isEntry: false, side: 'right', arrowType: 'straight', speedLimit: 2.5 },
    { x: ROAD.ROAD_START, y: CY - LW * 1.5, rotation: 0, direction: 'east', isEntry: false, side: 'left', arrowType: 'straight', speedLimit: 2.0 },

    // ===== ЗАПАД (движение ВПРАВО, к центру) =====
    // Правая полоса
    { x: ROAD.ROAD_START, y: CY - LW / 2, rotation: 0, direction: 'west', isEntry: true, side: 'right', arrowType: 'straight-right', speedLimit: 2.5 },
    // Левая полоса
    { x: ROAD.ROAD_START, y: CY - LW * 1.5, rotation: 0, direction: 'west', isEntry: true, side: 'left', arrowType: 'straight-left', speedLimit: 2.0 },
    // Выездные
    { x: ROAD.ROAD_END, y: CY + LW / 2, rotation: Math.PI, direction: 'west', isEntry: false, side: 'right', arrowType: 'straight', speedLimit: 2.5 },
    { x: ROAD.ROAD_END, y: CY + LW * 1.5, rotation: Math.PI, direction: 'west', isEntry: false, side: 'left', arrowType: 'straight', speedLimit: 2.0 },
];

export const TRAFFIC_LIGHT_CONFIGS: TrafficLightConfig[] = [
    // Светофор для севера (перед перекрестком, смотрит на север)
    { x: CX - LW * 2, y: CY - LW * 3, rotation: 0, phase: 0 },
    // Светофор для юга
    { x: CX + LW * 2, y: CY + LW * 3, rotation: Math.PI, phase: 1 },
    // Светофор для востока
    { x: CX + LW * 3, y: CY + LW * 2, rotation: Math.PI / 2, phase: 2 },
    // Светофор для запада
    { x: CX - LW * 3, y: CY - LW * 2, rotation: -Math.PI / 2, phase: 3 },
];