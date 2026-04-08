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

export const LANE_CONFIGS: LaneConfig[] = [
    // Север (въезд)
    { x: SCENE.CENTER_X - ROAD.LANE_WIDTH / 2, y: ROAD.ROAD_START, rotation: Math.PI / 2, direction: 'north', isEntry: true, side: 'right', arrowType: 'straight-right', speedLimit: 2.5 },
    { x: SCENE.CENTER_X - ROAD.LANE_WIDTH * 1.5, y: ROAD.ROAD_START, rotation: Math.PI / 2, direction: 'north', isEntry: true, side: 'left', arrowType: 'straight-left', speedLimit: 2.0 },
    // Север (выезд)
    { x: SCENE.CENTER_X + ROAD.LANE_WIDTH / 2, y: ROAD.ROAD_END, rotation: -Math.PI / 2, direction: 'north', isEntry: false, side: 'right', arrowType: 'straight', speedLimit: 2.5 },
    { x: SCENE.CENTER_X + ROAD.LANE_WIDTH * 1.5, y: ROAD.ROAD_END, rotation: -Math.PI / 2, direction: 'north', isEntry: false, side: 'left', arrowType: 'straight', speedLimit: 2.0 },

    // Юг (въезд)
    { x: SCENE.CENTER_X + ROAD.LANE_WIDTH / 2, y: ROAD.ROAD_END, rotation: -Math.PI / 2, direction: 'south', isEntry: true, side: 'right', arrowType: 'straight-right', speedLimit: 2.5 },
    { x: SCENE.CENTER_X + ROAD.LANE_WIDTH * 1.5, y: ROAD.ROAD_END, rotation: -Math.PI / 2, direction: 'south', isEntry: true, side: 'left', arrowType: 'straight-left', speedLimit: 2.0 },
    // Юг (выезд)
    { x: SCENE.CENTER_X - ROAD.LANE_WIDTH / 2, y: ROAD.ROAD_START, rotation: Math.PI / 2, direction: 'south', isEntry: false, side: 'right', arrowType: 'straight', speedLimit: 2.5 },
    { x: SCENE.CENTER_X - ROAD.LANE_WIDTH * 1.5, y: ROAD.ROAD_START, rotation: Math.PI / 2, direction: 'south', isEntry: false, side: 'left', arrowType: 'straight', speedLimit: 2.0 },

    // Восток (въезд)
    { x: ROAD.ROAD_END, y: SCENE.CENTER_Y + ROAD.LANE_WIDTH / 2, rotation: Math.PI, direction: 'east', isEntry: true, side: 'right', arrowType: 'straight-right', speedLimit: 2.5 },
    { x: ROAD.ROAD_END, y: SCENE.CENTER_Y + ROAD.LANE_WIDTH * 1.5, rotation: Math.PI, direction: 'east', isEntry: true, side: 'left', arrowType: 'straight-left', speedLimit: 2.0 },
    // Восток (выезд)
    { x: ROAD.ROAD_START, y: SCENE.CENTER_Y - ROAD.LANE_WIDTH / 2, rotation: 0, direction: 'east', isEntry: false, side: 'right', arrowType: 'straight', speedLimit: 2.5 },
    { x: ROAD.ROAD_START, y: SCENE.CENTER_Y - ROAD.LANE_WIDTH * 1.5, rotation: 0, direction: 'east', isEntry: false, side: 'left', arrowType: 'straight', speedLimit: 2.0 },

    // Запад (въезд)
    { x: ROAD.ROAD_START, y: SCENE.CENTER_Y - ROAD.LANE_WIDTH / 2, rotation: 0, direction: 'west', isEntry: true, side: 'right', arrowType: 'straight-right', speedLimit: 2.5 },
    { x: ROAD.ROAD_START, y: SCENE.CENTER_Y - ROAD.LANE_WIDTH * 1.5, rotation: 0, direction: 'west', isEntry: true, side: 'left', arrowType: 'straight-left', speedLimit: 2.0 },
    // Запад (выезд)
    { x: ROAD.ROAD_END, y: SCENE.CENTER_Y + ROAD.LANE_WIDTH / 2, rotation: Math.PI, direction: 'west', isEntry: false, side: 'right', arrowType: 'straight', speedLimit: 2.5 },
    { x: ROAD.ROAD_END, y: SCENE.CENTER_Y + ROAD.LANE_WIDTH * 1.5, rotation: Math.PI, direction: 'west', isEntry: false, side: 'left', arrowType: 'straight', speedLimit: 2.0 },
];

export const TRAFFIC_LIGHT_CONFIGS: TrafficLightConfig[] = [
    { x: SCENE.CENTER_X - ROAD.LANE_WIDTH * 2, y: 440, rotation: 0, phase: 0 },
    { x: SCENE.CENTER_X + ROAD.LANE_WIDTH * 2, y: 584, rotation: Math.PI, phase: 1 },
    { x: 584, y: SCENE.CENTER_Y + ROAD.LANE_WIDTH * 2, rotation: Math.PI / 2, phase: 2 },
    { x: 440, y: SCENE.CENTER_Y - ROAD.LANE_WIDTH * 2, rotation: -Math.PI / 2, phase: 3 },
];