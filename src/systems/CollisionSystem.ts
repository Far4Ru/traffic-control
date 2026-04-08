import { World } from '../ecs/World';
import { System } from '../ecs/System';

export class CollisionSystem extends System {
  private collisionMap: Map<string, string[]> = new Map();
  
  update(world: World, _deltaTime: number) {
    const vehicles = world.getEntitiesWithComponent('vehicle');
    
    // Reset collision states
    for (const vehicle of vehicles) {
      const collision = vehicle.getComponent('collision');
      if (collision) {
        collision.colliding = false;
      }
    }
    
    // Check collisions
    for (let i = 0; i < vehicles.length; i++) {
      for (let j = i + 1; j < vehicles.length; j++) {
        const v1 = vehicles[i];
        const v2 = vehicles[j];
        
        if (this.checkCollision(v1, v2)) {
          this.handleCollision(v1, v2);
        }
      }
    }
  }
  
  private checkCollision(v1: any, v2: any): boolean {
    const t1 = v1.getComponent('transform');
    const t2 = v2.getComponent('transform');
    const c1 = v1.getComponent('collision');
    const c2 = v2.getComponent('collision');
    
    if (!t1 || !t2 || !c1 || !c2) return false;
    
    const distance = Math.sqrt(Math.pow(t2.x - t1.x, 2) + Math.pow(t2.y - t1.y, 2));
    const minDistance = c1.radius + c2.radius;
    
    return distance < minDistance;
  }
  
  private handleCollision(v1: any, v2: any) {
    const c1 = v1.getComponent('collision');
    const c2 = v2.getComponent('collision');
    const veh1 = v1.getComponent('vehicle');
    const veh2 = v2.getComponent('vehicle');
    
    if (!c1 || !c2 || !veh1 || !veh2) return;
    
    c1.colliding = true;
    c2.colliding = true;
    
    // Stop both vehicles
    c1.stopped = true;
    c2.stopped = true;
    veh1.speed = 0;
    veh2.speed = 0;
    
    // Store collision pair
    const pairId = [v1.id, v2.id].sort().join('-');
    if (!this.collisionMap.has(pairId)) {
      this.collisionMap.set(pairId, [v1.id, v2.id]);
    }
  }
  
  public resolveCollisions(world: World) {
    const vehicles = world.getEntitiesWithComponent('vehicle');
    for (const vehicle of vehicles) {
      const collision = vehicle.getComponent('collision');
      if (collision) {
        collision.stopped = false;
        collision.colliding = false;
      }
    }
    this.collisionMap.clear();
  }
}