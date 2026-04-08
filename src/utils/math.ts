import { Vector2 } from '../core/types';

export function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

export function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * clamp(t, 0, 1);
}

export function distance(a: Vector2, b: Vector2): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function dot(a: Vector2, b: Vector2): number {
    return a.x * b.x + a.y * b.y;
}

export function normalize(v: Vector2): Vector2 {
    const len = Math.sqrt(v.x * v.x + v.y * v.y);
    if (len === 0) return { x: 0, y: 0 };
    return { x: v.x / len, y: v.y / len };
}

export function rotateVector(v: Vector2, angle: number): Vector2 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: v.x * cos - v.y * sin,
        y: v.x * sin + v.y * cos
    };
}

export function angleBetween(a: Vector2, b: Vector2): number {
    return Math.atan2(b.y - a.y, b.x - a.x);
}

export function randomRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

export function randomInt(min: number, max: number): number {
    return Math.floor(randomRange(min, max + 1));
}