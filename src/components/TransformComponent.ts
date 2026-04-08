import { Component } from '../core/ecs/Component';
import { Vector2 } from '../core/types';

export class TransformComponent extends Component {
    public position: Vector2;
    public rotation: number;
    public scale: Vector2;

    constructor(x: number = 0, y: number = 0, rotation: number = 0) {
        super('transform');
        this.position = { x, y };
        this.rotation = rotation;
        this.scale = { x: 1, y: 1 };
    }

    getForward(): Vector2 {
        return {
            x: Math.cos(this.rotation),
            y: Math.sin(this.rotation)
        };
    }

    getRight(): Vector2 {
        return {
            x: Math.cos(this.rotation + Math.PI / 2),
            y: Math.sin(this.rotation + Math.PI / 2)
        };
    }

    translate(dx: number, dy: number): void {
        this.position.x += dx;
        this.position.y += dy;
    }
}