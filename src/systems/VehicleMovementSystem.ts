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
      
      const lane = world.getEntity(vehicleComp.lane);
      const laneComp = lane?.getComponent('lane');
      if (!laneComp) continue;
      
      // Проверка светофора
      const canGo = this.canProceed(vehicle, world, laneComp);
      
      // Проверка машин впереди
      const hasVehicleAhead = this.checkVehicleAhead(vehicle, world);
      
      if (canGo && !hasVehicleAhead) {
        if (vehicleComp.speed < vehicleComp.targetSpeed) {
          vehicleComp.speed += vehicleComp.acceleration * deltaTime;
        }
      } else {
        vehicleComp.speed = Math.max(0, vehicleComp.speed - vehicleComp.braking * deltaTime);
      }
      
      // Движение
      const forwardX = Math.cos(transform.rotation);
      const forwardY = Math.sin(transform.rotation);
      transform.x += forwardX * vehicleComp.speed * deltaTime;
      transform.y += forwardY * vehicleComp.speed * deltaTime;
      
      // Поворот на перекрестке
      this.handleIntersectionTurn(vehicle, deltaTime);
      
      // Удаление если уехал далеко
      if (transform.x < -200 || transform.x > 1480 || transform.y < -200 || transform.y > 1224) {
        this.removeVehicle(vehicle, world);
      }
    }
  }
  
  private canProceed(vehicle: any, world: World, laneComp: any): boolean {
    const transform = vehicle.getComponent('transform');
    if (!transform) return false;
    
    // Проверяем расстояние до перекрестка
    const distToCenter = Math.sqrt(Math.pow(transform.x - 640, 2) + Math.pow(transform.y - 512, 2));
    
    // Если далеко от перекрестка - можно ехать
    if (distToCenter > 150) return true;
    
    // Найти светофор для этого направления
    const lights = world.getEntitiesWithComponent('trafficLight');
    const phaseMap: Record<string, number> = {
      'north': 0, 'south': 1, 'east': 2, 'west': 3
    };
    const lanePhase = phaseMap[laneComp.direction];
    
    for (const light of lights) {
      const lightComp = light.getComponent('trafficLight');
      if (!lightComp) continue;
      
      if (lightComp.phase === lanePhase && lightComp.enabled) {
        return lightComp.state === 'green';
      }
    }
    
    return true;
  }
  
  private checkVehicleAhead(vehicle: any, world: World): boolean {
    const transform = vehicle.getComponent('transform');
    const vehicleComp = vehicle.getComponent('vehicle');
    if (!transform || !vehicleComp) return false;
    
    const forwardX = Math.cos(transform.rotation);
    const forwardY = Math.sin(transform.rotation);
    
    for (const other of world.getEntitiesWithComponent('vehicle')) {
      if (other.id === vehicle.id) continue;
      
      const otherTransform = other.getComponent('transform');
      if (!otherTransform) continue;
      
      const dx = otherTransform.x - transform.x;
      const dy = otherTransform.y - transform.y;
      
      const dot = dx * forwardX + dy * forwardY;
      if (dot > 0 && dot < 65) {
        const perpDist = Math.abs(dx * forwardY - dy * forwardX);
        if (perpDist < 30) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  private handleIntersectionTurn(vehicle: any, deltaTime: number) {
    const transform = vehicle.getComponent('transform');
    const vehicleComp = vehicle.getComponent('vehicle');
    if (!transform || !vehicleComp) return;
    
    const centerDist = Math.sqrt(Math.pow(transform.x - 640, 2) + Math.pow(transform.y - 512, 2));
    
    if (centerDist > 50 && centerDist < 130) {
      const action = vehicleComp.intendedAction;
      const turnSpeed = 0.025 * deltaTime;
      
      if (action === 'left') {
        transform.rotation -= turnSpeed;
      } else if (action === 'right') {
        transform.rotation += turnSpeed;
      }
      
      // Сбрасываем действие после поворота
      if (centerDist > 120) {
        vehicleComp.intendedAction = 'straight';
      }
    }
  }
  
  private removeVehicle(vehicle: any, world: World) {
    const vehicleComp = vehicle.getComponent('vehicle');
    if (vehicleComp) {
      const lane = world.getEntity(vehicleComp.lane);
      if (lane) {
        const laneComp = lane.getComponent('lane');
        if (laneComp) {
          laneComp.vehicles = laneComp.vehicles.filter((id: string) => id !== vehicle.id);
        }
      }
    }
    world.removeEntity(vehicle.id);
  }
}