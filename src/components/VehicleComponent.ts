import { Component } from '../core/ecs/Component';
import { VehicleState, VehicleAction, CarColor } from '../core/types';

export class VehicleComponent extends Component {
    public speed: number;
    public maxSpeed: number;
    public acceleration: number;
    public braking: number;
    public targetSpeed: number;
    public laneId: string;
    public color: CarColor;
    public state: VehicleState;
    public intendedAction: VehicleAction;
    public turnProgress: number;

    constructor(data: Partial<VehicleComponent> = {}) {
        super('vehicle');
        this.speed = data.speed ?? 0;
        this.maxSpeed = data.maxSpeed ?? 2.5;
        this.acceleration = data.acceleration ?? 0.08;
        this.braking = data.braking ?? 0.25;
        this.targetSpeed = data.targetSpeed ?? 2.5;
        this.laneId = data.laneId ?? '';
        this.color = data.color ?? 'red';
        this.state = data.state ?? 'moving';
        this.intendedAction = data.intendedAction ?? 'straight';
        this.turnProgress = data.turnProgress ?? 0;
    }

    accelerate(deltaTime: number): void {
        if (this.speed < this.targetSpeed) {
            this.speed = Math.min(this.targetSpeed, this.speed + this.acceleration * deltaTime);
        }
    }

    brake(deltaTime: number): void {
        this.speed = Math.max(0, this.speed - this.braking * deltaTime);
    }

    stop(): void {
        this.speed = 0;
        this.state = 'stopped';
    }
}