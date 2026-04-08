export type Direction = 'north' | 'south' | 'east' | 'west';
export type VehicleState = 'moving' | 'stopped' | 'waiting' | 'turning';
export type VehicleAction = 'straight' | 'left' | 'right';
export type TrafficLightState = 'red' | 'yellow' | 'green';
export type ArrowType = 'straight' | 'left' | 'right' | 'straight-left' | 'straight-right' | 'all';
export type LaneSide = 'right' | 'left';
export type CarColor = 'red' | 'blue' | 'green' | 'yellow';

export interface Vector2 {
    x: number;
    y: number;
}

export interface Transform {
    position: Vector2;
    rotation: number;
    scale: Vector2;
}