import { World } from '../ecs/World';
import { System } from '../ecs/System';

export class VehicleMovementSystem extends System {
  update(world: World, deltaTime: number) {
    const vehicles = world.getEntitiesWithComponent('vehicle');
    
    for (const vehicle of vehicles) {
      const transform = vehicle.getComponent('transform');
      const vehicleComp = vehicle.getComponent('vehicle');
      const collision = vehicle.getComponent('collision');
      
      if (!transform || !vehicleComp) continue;
      if (collision?.stopped) continue;
      
      // Apply right-of-way rule
      const canMove = this.checkRightOfWay(vehicle, world);
      
      if (canMove) {
        // Smooth acceleration
        if (vehicleComp.speed < vehicleComp.targetSpeed) {
          vehicleComp.speed += vehicleComp.acceleration * deltaTime;
        }
        
        // Move vehicle
        const dx = Math.cos(transform.rotation) * vehicleComp.speed * deltaTime;
        const dy = Math.sin(transform.rotation) * vehicleComp.speed * deltaTime;
        
        transform.x += dx;
        transform.y += dy;
      } else {
        // Brake
        vehicleComp.speed = Math.max(0, vehicleComp.speed - vehicleComp.braking * deltaTime);
      }
      
      // Check if vehicle left the scene
      if (this.isOffScreen(transform)) {
        this.removeVehicle(vehicle, world);
      }
    }
  }
  
  private checkRightOfWay(vehicle: any, world: World): boolean {
    const vehicleComp = vehicle.getComponent('vehicle');
    if (!vehicleComp) return false;
    
    // Check traffic light
    const lane = world.getEntity(vehicleComp.lane);
    if (!lane) return false;
    
    const trafficLight = this.getTrafficLightForLane(lane, world);
    const lightComp = trafficLight?.getComponent('trafficLight');
    if (lightComp && lightComp.state === 'red' && lightComp.enabled) {
      return false;
    }
    
    // Check other vehicles for right-of-way
    const otherVehicles = world.getEntitiesWithComponent('vehicle');
    for (const other of otherVehicles) {
      if (other.id === vehicle.id) continue;
      
      if (this.hasPriority(other, vehicle)) {
        const distance = this.getDistance(vehicle, other);
        if (distance < 50) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  private hasPriority(vehicle1: any, vehicle2: any): boolean {
    // Right-of-way rule: vehicle on the right has priority
    const transform1 = vehicle1.getComponent('transform');
    const transform2 = vehicle2.getComponent('transform');
    
    if (!transform1 || !transform2) return false;
    
    const angle1 = transform1.rotation;
    const angle2 = transform2.rotation;
    
    const relativeAngle = ((angle2 - angle1 + Math.PI * 2) % (Math.PI * 2));
    
    return relativeAngle > 0 && relativeAngle < Math.PI;
  }
  
  private getTrafficLightForLane(lane: any, world: World): any {
    const laneComp = lane.getComponent('lane');
    if (!laneComp) return null;
    
    const lights = world.getEntitiesWithComponent('trafficLight');
    
    // Map lane direction to traffic light
    const phaseMap: Record<string, number> = {
      'north': 2,
      'south': 3,
      'east': 1,
      'west': 0
    };
    
    return lights.find(l => {
      const lightComp = l.getComponent('trafficLight');
      return lightComp && lightComp.phase === phaseMap[laneComp.direction];
    });
  }
  
  private getDistance(entity1: any, entity2: any): number {
    const t1 = entity1.getComponent('transform');
    const t2 = entity2.getComponent('transform');
    
    if (!t1 || !t2) return Infinity;
    
    return Math.sqrt(Math.pow(t2.x - t1.x, 2) + Math.pow(t2.y - t1.y, 2));
  }
  
  private isOffScreen(transform: any): boolean {
    return transform.x < -100 || transform.x > 1380 || 
           transform.y < -100 || transform.y > 1124;
  }
  
  private removeVehicle(vehicle: any, world: World) {
    const vehicleComp = vehicle.getComponent('vehicle');
    if (!vehicleComp) return;
    
    const lane = world.getEntity(vehicleComp.lane);
    if (lane) {
      const laneComp = lane.getComponent('lane');
      if (laneComp) {
        laneComp.vehicles = laneComp.vehicles.filter((id: string) => id !== vehicle.id);
      }
    }
    world.removeEntity(vehicle.id);
  }
}