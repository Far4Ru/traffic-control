import { World, System, Entity } from '../core/ecs';
import { TransformComponent, VehicleComponent, LaneComponent, CollisionComponent, TrafficLightComponent } from '../components';
import { SCENE, PHASE_MAP } from '../config/constants';

export class VehicleMovementSystem extends System {
  private readonly SAFE_DISTANCE = 60;
  private readonly INTERSECTION_ZONE = 100;
  private readonly STOP_LINE_DISTANCE = 120; // Увеличенная дистанция остановки
  private readonly STOP_BUFFER = 30; // Дополнительный буфер остановки

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

      // Проверяем, находится ли машина уже на перекрестке
      const distToCenter = this.getDistanceToCenter(transform);
      const isOnIntersection = distToCenter < this.INTERSECTION_ZONE;

      // Получаем расстояние до стоп-линии
      const distToStopLine = this.getDistanceToStopLine(transform, laneComp);

      // Проверяем, нужно ли остановиться перед перекрестком
      const shouldStopForLight = this.shouldStopForTrafficLight(vehicle, world, laneComp, distToStopLine);
      const hasVehicleAhead = this.checkVehicleAhead(vehicle, world);
      const shouldYield = this.shouldYieldToRight(vehicle, world, isOnIntersection);

      // Если машина уже на перекрестке - всегда едет (завершает маневр)
      if (isOnIntersection) {
        vehicleComp.targetSpeed = vehicleComp.maxSpeed;
        vehicleComp.accelerate(deltaTime);
      }
      // Если нужно остановиться перед перекрестком на красный
      else if (shouldStopForLight && !isOnIntersection) {
        vehicleComp.targetSpeed = 0;
        vehicleComp.brake(deltaTime);

        // Плавная остановка с дополнительным торможением при приближении
        if (distToStopLine < 40) {
          vehicleComp.speed = Math.max(0, vehicleComp.speed - 0.5 * deltaTime);
        }
      }
      else if (!hasVehicleAhead && !shouldYield) {
        vehicleComp.targetSpeed = vehicleComp.maxSpeed;
        vehicleComp.accelerate(deltaTime);
      } else {
        vehicleComp.targetSpeed = 0;
        vehicleComp.brake(deltaTime);
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

    switch (laneComp.direction) {
      case 'north':
        stopLineY = CY - STOP_OFFSET;
        break;
      case 'south':
        stopLineY = CY + STOP_OFFSET;
        break;
      case 'east':
        stopLineX = CX + STOP_OFFSET;
        break;
      case 'west':
        stopLineX = CX - STOP_OFFSET;
        break;
    }

    const dx = stopLineX - transform.position.x;
    const dy = stopLineY - transform.position.y;
    const forward = transform.getRight();

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
    // Если далеко от стоп-линии - не останавливаемся
    if (distToStopLine > this.STOP_LINE_DISTANCE) return false;

    // Проверяем светофор
    const lights = world.getEntitiesWithComponent('trafficLight');
    let lightsEnabled = true;
    if (lights.length > 0) {
      const firstLight = lights[0].getComponent<TrafficLightComponent>('trafficLight');
      lightsEnabled = firstLight?.enabled ?? true;
    }

    // Если светофоры выключены - не останавливаемся (правило правой руки)
    if (!lightsEnabled) return false;

    // Проверяем, нужно ли остановиться на красный
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
        // Останавливаемся на красный
        // На желтый останавливаемся только если достаточно близко к стоп-линии
        if (lightComp.state === 'red') return true;
        if (lightComp.state === 'yellow' && distToStopLine < 50) return true;
        return false;
      }
    }

    return false;
  }

  private shouldYieldToRight(vehicle: Entity, world: World, isOnIntersection: boolean): boolean {
    const transform = vehicle.getComponent<TransformComponent>('transform');
    const vehicleComp = vehicle.getComponent<VehicleComponent>('vehicle');
    if (!transform || !vehicleComp) return false;

    const distToCenter = this.getDistanceToCenter(transform);

    // Только в зоне перекрестка или близко к нему
    if (distToCenter > this.INTERSECTION_ZONE + 50) return false;

    const lights = world.getEntitiesWithComponent('trafficLight');
    let lightsEnabled = true;
    if (lights.length > 0) {
      const firstLight = lights[0].getComponent<TrafficLightComponent>('trafficLight');
      lightsEnabled = firstLight?.enabled ?? true;
    }

    // Правило правой руки работает только когда светофоры выключены
    if (lightsEnabled) return false;

    // Если уже на перекрестке - имеем приоритет
    if (isOnIntersection) return false;

    // Получаем направление движения и правую сторону
    const forward = transform.getRight();

    // Правая сторона относительно направления движения
    const rightDirection = {
      x: forward.y,
      y: -forward.x
    };

    // Проверяем машины справа
    for (const other of world.getEntitiesWithComponent('vehicle')) {
      if (other.id === vehicle.id) continue;

      const otherTransform = other.getComponent<TransformComponent>('transform');
      const otherVehicle = other.getComponent<VehicleComponent>('vehicle');
      if (!otherTransform || !otherVehicle) continue;

      const otherDist = this.getDistanceToCenter(otherTransform);
      if (otherDist > this.INTERSECTION_ZONE + 30) continue;

      // Проверяем, находится ли другая машина справа
      const dx = otherTransform.position.x - transform.position.x;
      const dy = otherTransform.position.y - transform.position.y;

      const dotRight = dx * rightDirection.x + dy * rightDirection.y;

      if (dotRight > 0 && Math.abs(dotRight) < this.SAFE_DISTANCE + 30) {
        const otherForward = otherTransform.getRight();
        const crossProduct = Math.abs(forward.x * otherForward.y - forward.y * otherForward.x);

        if (crossProduct > 0.5) {
          return true;
        }
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
    const margin = 100;
    return transform.position.x < -margin ||
      transform.position.x > SCENE.WIDTH + margin ||
      transform.position.y < -margin ||
      transform.position.y > SCENE.HEIGHT + margin;
  }

  private removeVehicle(vehicle: Entity, world: World): void {
    const vehicleComp = vehicle.getComponent<VehicleComponent>('vehicle');
    if (vehicleComp) {
      const lane = world.getEntity(vehicleComp.laneId);
      const laneComp = lane?.getComponent<LaneComponent>('lane');
      laneComp?.removeVehicle(vehicle.id);
    }
    world.removeEntity(vehicle.id);
  }
}