import { World, System } from '../core/ecs';
import { VehicleFactory } from '../entities/factories';
import { LaneComponent } from '../components';
import { TRAFFIC } from '../config/constants';

export class VehicleSpawnSystem extends System {
    private vehicleFactory!: VehicleFactory;

    constructor() {
        super(10);
    }

    onAttach(world: World): void {
        this.vehicleFactory = new VehicleFactory(world);
    }

    update(world: World, _deltaTime: number): void {
        if (Math.random() < TRAFFIC.SPAWN_RATE) {
            this.trySpawnVehicle(world);
        }
    }

    private trySpawnVehicle(world: World): void {
        const vehicles = world.getEntitiesWithComponent('vehicle');
        if (vehicles.length >= TRAFFIC.MAX_VEHICLES) return;

        const entryLanes = world.getEntitiesWithComponent('lane')
            .filter(e => e.getComponent<LaneComponent>('lane')?.isEntry);

        if (entryLanes.length === 0) return;

        const lane = entryLanes[Math.floor(Math.random() * entryLanes.length)];
        this.vehicleFactory.createVehicle(lane);
    }

    spawnVehicleManually(world: World): void {
        const entryLanes = world.getEntitiesWithComponent('lane')
            .filter(e => e.getComponent<LaneComponent>('lane')?.isEntry);

        if (entryLanes.length === 0) return;

        const lane = entryLanes[Math.floor(Math.random() * entryLanes.length)];
        this.vehicleFactory.createVehicle(lane);
    }
}