import { World, System } from '../core/ecs';
import { VehicleFactory } from '../entities/factories';
import { LaneComponent } from '../components';
import { TRAFFIC } from '../config/constants';

export class VehicleSpawnSystem extends System {
    private vehicleFactory!: VehicleFactory;
    private spawnCooldown: Map<string, number> = new Map();

    constructor() {
        super(10);
    }

    onAttach(world: World): void {
        this.vehicleFactory = new VehicleFactory(world);
    }

    update(world: World, deltaTime: number): void {
        for (const [laneId, cooldown] of this.spawnCooldown.entries()) {
            if (cooldown <= 0) {
                this.spawnCooldown.delete(laneId);
            } else {
                this.spawnCooldown.set(laneId, cooldown - deltaTime);
            }
        }

        if (Math.random() < TRAFFIC.SPAWN_RATE) {
            this.trySpawnVehicle(world);
        }
    }

    private trySpawnVehicle(world: World): void {
        const vehicles = world.getEntitiesWithComponent('vehicle');
        if (vehicles.length >= TRAFFIC.MAX_VEHICLES) return;

        const entryLanes = world.getEntitiesWithComponent('lane')
            .filter(e => {
                const lane = e.getComponent<LaneComponent>('lane');
                return lane?.isEntry;
            });

        if (entryLanes.length === 0) return;

        // Перемешиваем массив для равномерного распределения
        const shuffled = [...entryLanes];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Пробуем создать машину на случайной полосе
        for (const lane of shuffled) {
            const laneComp = lane.getComponent<LaneComponent>('lane');
            if (!laneComp) continue;

            // Проверяем кулдаун для этой полосы
            if (this.spawnCooldown.has(lane.id)) continue;

            const result = this.vehicleFactory.createVehicle(lane);
            if (result) {
                // Устанавливаем кулдаун для этой полосы
                this.spawnCooldown.set(lane.id, 60); // 1 секунда при 60fps
                break;
            }
        }
    }

    spawnVehicleManually(world: World): void {
        const entryLanes = world.getEntitiesWithComponent('lane')
            .filter(e => {
                const lane = e.getComponent<LaneComponent>('lane');
                return lane?.isEntry;
            });

        if (entryLanes.length === 0) return;

        // Перемешиваем для ручного спавна
        const shuffled = [...entryLanes];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        for (const lane of shuffled) {
            const laneComp = lane.getComponent<LaneComponent>('lane');
            if (!laneComp) continue;

            const result = this.vehicleFactory.createVehicle(lane);
            if (result) break;
        }
    }

    spawnVehiclesOnAllLanes(world: World): void {
        const entryLanes = world.getEntitiesWithComponent('lane')
            .filter(e => {
                const lane = e.getComponent<LaneComponent>('lane');
                return lane?.isEntry;
            });

        entryLanes.forEach(lane => {
            this.vehicleFactory.createVehicle(lane);
        });
    }
}