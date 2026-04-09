import { World, Entity } from '../../core/ecs';
import { TransformComponent, VehicleComponent, SpriteComponent, CollisionComponent } from '../../components';
import { CarColor, VehicleAction } from '../../core/types';
import { LaneComponent } from '../../components/LaneComponent';
import { ROAD } from '../../config/constants';

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

        const vehicles = this.world.getEntitiesWithComponent('vehicle');
        for (const v of vehicles) {
            const vComp = v.getComponent<VehicleComponent>('vehicle');
            const vTransform = v.getComponent<TransformComponent>('transform');
            if (vComp && vTransform && vComp.laneId === lane.id) {
                const dist = Math.sqrt(
                    Math.pow(vTransform.position.x - laneComp.spawnPoint.x, 2) +
                    Math.pow(vTransform.position.y - laneComp.spawnPoint.y, 2)
                );
                if (dist < 100) {
                    return null;
                }
            }
        }

        const colors: CarColor[] = ['red', 'blue', 'green', 'yellow'];
        const selectedColor = color ?? colors[Math.floor(Math.random() * colors.length)];

        const vehicleRotation = laneTransform.rotation - Math.PI / 2;
        const startPos = this.calculateSpawnPosition(laneComp, laneTransform);

        const vehicle = this.world.createEntity();

        vehicle
            .addComponent(new TransformComponent(startPos.x, startPos.y, vehicleRotation))
            .addComponent(new VehicleComponent({
                speed: 1.5 + Math.random() * 1.0,
                maxSpeed: laneComp.speedLimit,
                targetSpeed: laneComp.speedLimit,
                laneId: lane.id,
                color: selectedColor,
                intendedAction: 'straight'
            }))
            .addComponent(new SpriteComponent(`car-${selectedColor}`, 28, 42))
            .addComponent(new CollisionComponent(20));

        laneComp.addVehicle(vehicle.id);

        return vehicle;
    }

    private calculateSpawnPosition(lane: LaneComponent, transform: TransformComponent): { x: number; y: number } {
        const offset = 150;
        const forward = transform.getForward();

        // Корректировка спавна для разных направлений
        let spawnX = lane.spawnPoint.x - forward.x * offset;
        let spawnY = lane.spawnPoint.y - forward.y * offset;

        // Для восточного направления (движение влево) корректируем Y
        if (lane.direction === 'east') {
            spawnY = lane.spawnPoint.y;
        }
        // Для западного направления (движение вправо) корректируем Y
        if (lane.direction === 'west') {
            spawnY = lane.spawnPoint.y;
        }
        // Для северного направления (движение вниз) корректируем X
        if (lane.direction === 'north') {
            spawnX = lane.spawnPoint.x;
        }
        // Для южного направления (движение вверх) корректируем X
        if (lane.direction === 'south') {
            spawnX = lane.spawnPoint.x;
        }

        return {
            x: spawnX,
            y: spawnY
        };
    }
}