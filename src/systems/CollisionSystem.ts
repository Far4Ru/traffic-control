import { World, System, Entity } from '../core/ecs';
import { TransformComponent, VehicleComponent, CollisionComponent } from '../components';

export class CollisionSystem extends System {
  private collisionPairs: Map<string, boolean> = new Map();

  constructor() {
    super(60);
  }

  update(world: World, _deltaTime: number): void {
    const vehicles = world.getEntitiesWithComponent('vehicle');

    for (const vehicle of vehicles) {
      const collision = vehicle.getComponent<CollisionComponent>('collision');
      if (collision) collision.colliding = false;
    }

    for (let i = 0; i < vehicles.length; i++) {
      for (let j = i + 1; j < vehicles.length; j++) {
        this.checkAndHandleCollision(vehicles[i], vehicles[j]);
      }
    }
  }

  private checkAndHandleCollision(v1: Entity, v2: Entity): void {
    const t1 = v1.getComponent<TransformComponent>('transform');
    const t2 = v2.getComponent<TransformComponent>('transform');
    const c1 = v1.getComponent<CollisionComponent>('collision');
    const c2 = v2.getComponent<CollisionComponent>('collision');
    const veh1 = v1.getComponent<VehicleComponent>('vehicle');
    const veh2 = v2.getComponent<VehicleComponent>('vehicle');

    if (!t1 || !t2 || !c1 || !c2 || !veh1 || !veh2) return;

    const distance = Math.sqrt(
      Math.pow(t2.position.x - t1.position.x, 2) +
      Math.pow(t2.position.y - t1.position.y, 2)
    );

    if (distance < c1.radius + c2.radius) {
      c1.setCollision(true, v2.id);
      c2.setCollision(true, v1.id);
      veh1.stop();
      veh2.stop();

      const pairId = [v1.id, v2.id].sort().join('-');
      this.collisionPairs.set(pairId, true);
    }
  }

  resolveCollisions(world: World): void {
    const vehicles = world.getEntitiesWithComponent('vehicle');

    for (const vehicle of vehicles) {
      const collision = vehicle.getComponent<CollisionComponent>('collision');
      if (collision) collision.resolve();
    }

    this.collisionPairs.clear();
  }
}