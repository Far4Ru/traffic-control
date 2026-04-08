import { Component } from '../core/ecs/Component';

export class CollisionComponent extends Component {
    public radius: number;
    public colliding: boolean;
    public stopped: boolean;
    public collisionWith?: string;

    constructor(radius: number = 24) {
        super('collision');
        this.radius = radius;
        this.colliding = false;
        this.stopped = false;
    }

    setCollision(colliding: boolean, withEntity?: string): void {
        this.colliding = colliding;
        this.collisionWith = withEntity;
        if (colliding) {
            this.stopped = true;
        }
    }

    resolve(): void {
        this.colliding = false;
        this.stopped = false;
        this.collisionWith = undefined;
    }
}