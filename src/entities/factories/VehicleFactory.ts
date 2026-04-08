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

        // Проверяем, нет ли машины слишком близко
        const vehicles = this.world.getEntitiesWithComponent('vehicle');
        for (const v of vehicles) {
            const vComp = v.getComponent<VehicleComponent>('vehicle');
            const vTransform = v.getComponent<TransformComponent>('transform');
            if (vComp && vTransform && vComp.laneId === lane.id) {
                const dist = Math.sqrt(
                    Math.pow(vTransform.position.x - laneComp.spawnPoint.x, 2) +
                    Math.pow(vTransform.position.y - laneComp.spawnPoint.y, 2)
                );
                if (dist < 80) {
                    return null;
                }
            }
        }

        const colors: CarColor[] = ['red', 'blue', 'green', 'yellow'];
        const selectedColor = color ?? colors[Math.floor(Math.random() * colors.length)];
        const selectedAction = action ?? this.getRandomAction(laneComp.arrowType);

        // Корректировка поворота: спрайт машины смотрит "вверх" при rotation = -PI/2
        // Для движения по направлению полосы нужно добавить -PI/2 к rotation полосы
        const vehicleRotation = laneTransform.rotation - Math.PI / 2;

        const startPos = this.calculateSpawnPosition(laneComp, laneTransform);

        const vehicle = this.world.createEntity();

        vehicle
            .addComponent(new TransformComponent(startPos.x, startPos.y, vehicleRotation))
            .addComponent(new VehicleComponent({
                speed: 1.5 + Math.random() * 1.5,
                maxSpeed: laneComp.speedLimit,
                targetSpeed: laneComp.speedLimit,
                laneId: lane.id,
                color: selectedColor,
                intendedAction: selectedAction
            }))
            .addComponent(new SpriteComponent(`car-${selectedColor}`, 32, 48))
            .addComponent(new CollisionComponent(24));

        laneComp.addVehicle(vehicle.id);

        return vehicle;
    }

    private calculateSpawnPosition(lane: LaneComponent, transform: TransformComponent): { x: number; y: number } {
        const offset = 200;
        // Используем getForward() который указывает направление движения полосы
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