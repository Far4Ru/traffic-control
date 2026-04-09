import { World, System, Entity } from '../core/ecs';
import { TransformComponent, VehicleComponent, CollisionComponent } from '../components';

export class CollisionSystem extends System {
  constructor() {
    super(60);
  }

  update(world: World, deltaTime: number): void {
    const vehicles = world.getEntitiesWithComponent('vehicle');

    // Сброс состояния коллизий
    for (const vehicle of vehicles) {
      const collision = vehicle.getComponent<CollisionComponent>('collision');
      if (collision) {
        collision.colliding = false;
        collision.collisionWith = undefined;
      }
    }

    // Проверка коллизий
    for (let i = 0; i < vehicles.length; i++) {
      for (let j = i + 1; j < vehicles.length; j++) {
        this.checkCollision(vehicles[i], vehicles[j], deltaTime);
      }
    }
  }

  private checkCollision(v1: Entity, v2: Entity, deltaTime: number): void {
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

    const minDistance = c1.radius + c2.radius;
    
    if (distance < minDistance) {
      // Отталкиваем машины друг от друга
      const angle = Math.atan2(t2.position.y - t1.position.y, t2.position.x - t1.position.x);
      const overlap = minDistance - distance;
      const pushX = Math.cos(angle) * overlap * 0.5;
      const pushY = Math.sin(angle) * overlap * 0.5;
      
      t1.position.x -= pushX;
      t1.position.y -= pushY;
      t2.position.x += pushX;
      t2.position.y += pushY;
      
      // Снижаем скорость при столкновении
      veh1.speed = Math.max(0, veh1.speed - 0.5 * deltaTime);
      veh2.speed = Math.max(0, veh2.speed - 0.5 * deltaTime);
      
      c1.colliding = true;
      c2.colliding = true;
    }
  }

  resolveCollisions(world: World): void {
    const vehicles = world.getEntitiesWithComponent('vehicle');

    for (const vehicle of vehicles) {
      const collision = vehicle.getComponent<CollisionComponent>('collision');
      const vehicleComp = vehicle.getComponent<VehicleComponent>('vehicle');
      if (collision) {
        collision.colliding = false;
        if (vehicleComp && collision.collisionWith) {
          vehicleComp.speed = Math.max(0, vehicleComp.speed * 0.5);
        }
        collision.collisionWith = undefined;
      }
    }
  }
}