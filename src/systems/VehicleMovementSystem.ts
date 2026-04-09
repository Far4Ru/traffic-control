import { World, System, Entity } from '../core/ecs';
import { TransformComponent, VehicleComponent, LaneComponent, CollisionComponent, TrafficLightComponent } from '../components';
import { SCENE, PHASE_MAP } from '../config/constants';

export class VehicleMovementSystem extends System {
  private readonly SAFE_DISTANCE = 60;
  private readonly INTERSECTION_ZONE = 100;
  private readonly STOP_LINE_DISTANCE = 120;
  private hasPassedIntersection: Map<string, boolean> = new Map();

  constructor() {
    super(50);
  }

  update(world: World, deltaTime: number): void {
    const vehicles = world.getEntitiesWithComponent('vehicle');

    for (const vehicle of vehicles) {
      const transform = vehicle.getComponent<TransformComponent>('transform');
      const vehicleComp = vehicle.getComponent<VehicleComponent>('vehicle');
      const collision = vehicle.getComponent<CollisionComponent>('collision');

      if (!transform || !vehicleComp) continue;
      if (collision?.stopped) continue;

      const lane = world.getEntity(vehicleComp.laneId);
      const laneComp = lane?.getComponent<LaneComponent>('lane');
      if (!laneComp) continue;

      const distToCenter = this.getDistanceToCenter(transform);
      const isOnIntersection = distToCenter < this.INTERSECTION_ZONE;
      const hasPassed = this.hasPassedIntersection.get(vehicle.id) || false;
      
      // Если машина проехала перекресток - больше не реагируем на светофор
      if (hasPassed) {
        vehicleComp.targetSpeed = vehicleComp.maxSpeed;
        vehicleComp.accelerate(deltaTime);
        this.moveVehicle(transform, vehicleComp, deltaTime);
        
        if (this.isOffScreen(transform)) {
          this.removeVehicle(vehicle, world);
        }
        continue;
      }
      
      // Если машина на перекрестке - отмечаем, что она его проехала
      if (isOnIntersection) {
        this.hasPassedIntersection.set(vehicle.id, true);
        vehicleComp.targetSpeed = vehicleComp.maxSpeed;
        vehicleComp.accelerate(deltaTime);
      }
      else {
        const distToStopLine = this.getDistanceToStopLine(transform, laneComp);
        const shouldStopForLight = this.shouldStopForTrafficLight(vehicle, world, laneComp, distToStopLine);
        const hasVehicleAhead = this.checkVehicleAhead(vehicle, world);
        
        if (shouldStopForLight && distToStopLine < this.STOP_LINE_DISTANCE) {
          vehicleComp.targetSpeed = 0;
          vehicleComp.brake(deltaTime);
          
          if (distToStopLine < 30) {
            vehicleComp.speed = Math.max(0, vehicleComp.speed - 0.8 * deltaTime);
          }
        }
        else if (!hasVehicleAhead) {
          vehicleComp.targetSpeed = vehicleComp.maxSpeed;
          vehicleComp.accelerate(deltaTime);
        } else {
          vehicleComp.targetSpeed = vehicleComp.maxSpeed * 0.7;
          vehicleComp.accelerate(deltaTime);
        }
      }

      this.moveVehicle(transform, vehicleComp, deltaTime);

      if (this.isOffScreen(transform)) {
        this.removeVehicle(vehicle, world);
      }
    }
  }

  private getDistanceToStopLine(transform: TransformComponent, laneComp: LaneComponent): number {
    const CX = SCENE.CENTER_X;
    const CY = SCENE.CENTER_Y;
    const STOP_OFFSET = 10; // Расстояние от центра до стоп-линии

    let stopLineX = CX;
    let stopLineY = CY;
    let forward = transform.getRight();

    switch (laneComp.direction) {
      case 'north':
        // Движение вниз (юг), стоп-линия сверху от центра
        stopLineY = CY - STOP_OFFSET;
        forward = { x: 0, y: 1 };
        break;
      case 'south':
        // Движение вверх (север), стоп-линия снизу от центра
        stopLineY = CY + STOP_OFFSET;
        forward = { x: 0, y: -1 };
        break;
      case 'east':
        // Движение влево (запад), стоп-линия справа от центра
        stopLineX = CX + STOP_OFFSET;
        forward = { x: -1, y: 0 };
        break;
      case 'west':
        // Движение вправо (восток), стоп-линия слева от центра
        stopLineX = CX - STOP_OFFSET;
        forward = { x: 1, y: 0 };
        break;
    }

    const dx = stopLineX - transform.position.x;
    const dy = stopLineY - transform.position.y;
    
    // Проекция на направление движения
    const dot = dx * forward.x + dy * forward.y;

    return Math.max(0, dot);
  }

  private shouldStopForTrafficLight(
    vehicle: Entity,
    world: World,
    laneComp: LaneComponent,
    distToStopLine: number
  ): boolean {
    const lights = world.getEntitiesWithComponent('trafficLight');
    if (lights.length === 0) return false;
    
    const firstLight = lights[0].getComponent<TrafficLightComponent>('trafficLight');
    const lightsEnabled = firstLight?.enabled ?? true;

    // Если светофоры выключены - не останавливаемся
    if (!lightsEnabled) return false;

    // Если далеко от стоп-линии - не останавливаемся
    if (distToStopLine > this.STOP_LINE_DISTANCE) return false;

    const isNorthSouth = (laneComp.direction === 'north' || laneComp.direction === 'south');
    const isEastWest = (laneComp.direction === 'east' || laneComp.direction === 'west');

    for (const light of lights) {
      const lightComp = light.getComponent<TrafficLightComponent>('trafficLight');
      if (!lightComp) continue;

      let isOurLight = false;
      if (isNorthSouth && (lightComp.phase === 0 || lightComp.phase === 1)) {
        isOurLight = true;
      }
      if (isEastWest && (lightComp.phase === 2 || lightComp.phase === 3)) {
        isOurLight = true;
      }

      if (isOurLight) {
        if (lightComp.state === 'red') return true;
        if (lightComp.state === 'yellow' && distToStopLine < 40) return true;
        return false;
      }
    }

    return false;
  }

  private checkVehicleAhead(vehicle: Entity, world: World): boolean {
    const transform = vehicle.getComponent<TransformComponent>('transform');
    const vehicleComp = vehicle.getComponent<VehicleComponent>('vehicle');
    if (!transform || !vehicleComp) return false;

    const forward = transform.getRight();

    for (const other of world.getEntitiesWithComponent('vehicle')) {
      if (other.id === vehicle.id) continue;

      const otherTransform = other.getComponent<TransformComponent>('transform');
      const otherVehicle = other.getComponent<VehicleComponent>('vehicle');
      if (!otherTransform || !otherVehicle) continue;

      if (otherVehicle.laneId !== vehicleComp.laneId) continue;

      const dx = otherTransform.position.x - transform.position.x;
      const dy = otherTransform.position.y - transform.position.y;

      const dot = dx * forward.x + dy * forward.y;
      if (dot > 0 && dot < this.SAFE_DISTANCE) {
        return true;
      }
    }

    return false;
  }

  private moveVehicle(transform: TransformComponent, vehicle: VehicleComponent, deltaTime: number): void {
    const forward = transform.getRight();
    transform.position.x += forward.x * vehicle.speed * deltaTime;
    transform.position.y += forward.y * vehicle.speed * deltaTime;
  }

  private getDistanceToCenter(transform: TransformComponent): number {
    return Math.sqrt(
      Math.pow(transform.position.x - SCENE.CENTER_X, 2) +
      Math.pow(transform.position.y - SCENE.CENTER_Y, 2)
    );
  }

  private isOffScreen(transform: TransformComponent): boolean {
    const margin = 150;
    return transform.position.x < -margin ||
      transform.position.x > SCENE.WIDTH + margin ||
      transform.position.y < -margin ||
      transform.position.y > SCENE.HEIGHT + margin;
  }

  private removeVehicle(vehicle: Entity, world: World): void {
    this.hasPassedIntersection.delete(vehicle.id);
    
    const vehicleComp = vehicle.getComponent<VehicleComponent>('vehicle');
    if (vehicleComp) {
      const lane = world.getEntity(vehicleComp.laneId);
      const laneComp = lane?.getComponent<LaneComponent>('lane');
      laneComp?.removeVehicle(vehicle.id);
    }
    world.removeEntity(vehicle.id);
  }
}