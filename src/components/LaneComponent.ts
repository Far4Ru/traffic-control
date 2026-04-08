import { Component } from '../core/ecs/Component';
import { Direction, ArrowType, LaneSide, Vector2 } from '../core/types';

export class LaneComponent extends Component {
    public direction: Direction;
    public isEntry: boolean;
    public side: LaneSide;
    public speedLimit: number;
    public arrowType: ArrowType;
    public vehicleIds: string[];
    public spawnPoint: Vector2;

    constructor(data: Partial<LaneComponent> = {}) {
        super('lane');
        this.direction = data.direction ?? 'north';
        this.isEntry = data.isEntry ?? true;
        this.side = data.side ?? 'right';
        this.speedLimit = data.speedLimit ?? 2.5;
        this.arrowType = data.arrowType ?? 'straight';
        this.vehicleIds = data.vehicleIds ?? [];
        this.spawnPoint = data.spawnPoint ?? { x: 0, y: 0 };
    }

    addVehicle(vehicleId: string): void {
        if (!this.vehicleIds.includes(vehicleId)) {
            this.vehicleIds.push(vehicleId);
        }
    }

    removeVehicle(vehicleId: string): void {
        const index = this.vehicleIds.indexOf(vehicleId);
        if (index > -1) {
            this.vehicleIds.splice(index, 1);
        }
    }

    getVehicleCount(): number {
        return this.vehicleIds.length;
    }
}