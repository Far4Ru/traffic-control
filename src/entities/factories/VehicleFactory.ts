import { World, Entity } from '../../core/ecs';
import { TransformComponent, VehicleComponent, SpriteComponent, CollisionComponent } from '../../components';
import { CarColor, VehicleAction } from '../../core/types';
import { LaneComponent } from '../../components/LaneComponent';

export class VehicleFactory {
    constructor(private world: World) { }

    createVehicle(
        lane: Entity,
        color?: CarColor,
        action?: VehicleAction
    ): Entity | null {
        const laneComp = lane.getComponent<LaneComponent>('lane');
        const laneTransform = lane.getComponent<TransformComponent>('transform');

        if (!laneComp || !laneTransform) return null;

        const colors: CarColor[] = ['red', 'blue', 'green', 'yellow'];
        const selectedColor = color ?? colors[Math.floor(Math.random() * colors.length)];
        const selectedAction = action ?? this.getRandomAction(laneComp.arrowType);

        const startPos = this.calculateSpawnPosition(laneComp, laneTransform);

        const vehicle = this.world.createEntity();

        vehicle
            .addComponent(new TransformComponent(startPos.x, startPos.y, laneTransform.rotation))
            .addComponent(new VehicleComponent({
                speed: 1.5 + Math.random() * 1.5,
                maxSpeed: laneComp.speedLimit,
                targetSpeed: laneComp.speedLimit,
                laneId: lane.id,
                color: selectedColor,
                intendedAction: selectedAction
            }))
            .addComponent(new SpriteComponent(`car-${selectedColor}`, 30, 45))
            .addComponent(new CollisionComponent(24));

        laneComp.addVehicle(vehicle.id);

        return vehicle;
    }

    private calculateSpawnPosition(lane: LaneComponent, transform: TransformComponent): { x: number; y: number } {
        const offset = 180;
        const forward = transform.getForward();

        return {
            x: lane.spawnPoint.x - forward.x * offset,
            y: lane.spawnPoint.y - forward.y * offset
        };
    }

    private getRandomAction(arrowType: string): VehicleAction {
        if (arrowType === 'straight-right') {
            return Math.random() > 0.5 ? 'straight' : 'right';
        }
        if (arrowType === 'straight-left') {
            return Math.random() > 0.5 ? 'straight' : 'left';
        }
        return 'straight';
    }
}