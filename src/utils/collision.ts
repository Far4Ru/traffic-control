import { Vector2 } from '../core/types';
import { distance, dot, normalize } from './math';

export interface Circle {
    center: Vector2;
    radius: number;
}

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
}

export function circleCollision(a: Circle, b: Circle): boolean {
    return distance(a.center, b.center) < a.radius + b.radius;
}

export function getPenetrationVector(a: Circle, b: Circle): Vector2 {
    const dx = b.center.x - a.center.x;
    const dy = b.center.y - a.center.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const overlap = a.radius + b.radius - dist;

    if (dist === 0) {
        return { x: overlap, y: 0 };
    }

    return {
        x: (dx / dist) * overlap,
        y: (dy / dist) * overlap
    };
}

export function pointInRect(point: Vector2, rect: Rect): boolean {
    if (rect.rotation) {
        const cos = Math.cos(-rect.rotation);
        const sin = Math.sin(-rect.rotation);
        const dx = point.x - (rect.x + rect.width / 2);
        const dy = point.y - (rect.y + rect.height / 2);
        const localX = dx * cos - dy * sin + rect.width / 2;
        const localY = dx * sin + dy * cos + rect.height / 2;

        return localX >= 0 && localX <= rect.width && localY >= 0 && localY <= rect.height;
    }

    return point.x >= rect.x && point.x <= rect.x + rect.width &&
        point.y >= rect.y && point.y <= rect.y + rect.height;
}

export function rectCollision(a: Rect, b: Rect): boolean {
    if (a.rotation || b.rotation) {
        return satCollision(a, b);
    }

    return !(a.x + a.width < b.x || b.x + b.width < a.x ||
        a.y + a.height < b.y || b.y + b.height < a.y);
}

function satCollision(a: Rect, b: Rect): boolean {
    const axes = [
        { x: 1, y: 0 },
        { x: 0, y: 1 }
    ];

    if (a.rotation) {
        const angle = a.rotation;
        axes.push({ x: Math.cos(angle), y: Math.sin(angle) });
    }
    if (b.rotation) {
        const angle = b.rotation;
        axes.push({ x: Math.cos(angle), y: Math.sin(angle) });
    }

    for (const axis of axes) {
        const projA = projectRect(a, axis);
        const projB = projectRect(b, axis);

        if (projA.max < projB.min || projB.max < projA.min) {
            return false;
        }
    }

    return true;
}

function projectRect(rect: Rect, axis: Vector2): { min: number; max: number } {
    const corners = getRectCorners(rect);
    let min = dot(corners[0], axis);
    let max = min;

    for (let i = 1; i < corners.length; i++) {
        const proj = dot(corners[i], axis);
        min = Math.min(min, proj);
        max = Math.max(max, proj);
    }

    return { min, max };
}

function getRectCorners(rect: Rect): Vector2[] {
    const hw = rect.width / 2;
    const hh = rect.height / 2;
    const cx = rect.x + hw;
    const cy = rect.y + hh;

    const corners: Vector2[] = [
        { x: -hw, y: -hh },
        { x: hw, y: -hh },
        { x: hw, y: hh },
        { x: -hw, y: hh }
    ];

    if (rect.rotation) {
        const cos = Math.cos(rect.rotation);
        const sin = Math.sin(rect.rotation);

        for (const corner of corners) {
            const x = corner.x;
            const y = corner.y;
            corner.x = x * cos - y * sin + cx;
            corner.y = x * sin + y * cos + cy;
        }
    } else {
        for (const corner of corners) {
            corner.x += cx;
            corner.y += cy;
        }
    }

    return corners;
}