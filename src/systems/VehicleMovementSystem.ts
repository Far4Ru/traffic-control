import { World, System, Entity } from '../core/ecs';
import { TransformComponent, VehicleComponent, LaneComponent, CollisionComponent, TrafficLightComponent } from '../components';
import { SCENE, PHASE_MAP } from '../config/constants';

export class VehicleMovementSystem extends System {
  private readonly SAFE_DISTANCE = 60;
  private readonly INTERSECTION_ZONE = 80;

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

      const canGo = this.canProceed(vehicle, world, laneComp);
      const hasVehicleAhead = this.checkVehicleAhead(vehicle, world);
      const shouldYield = this.shouldYieldToRight(vehicle, world);

      if (canGo && !hasVehicleAhead && !shouldYield) {
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

  private canProceed(vehicle: Entity, world: World, laneComp: LaneComponent): boolean {
    const transform = vehicle.getComponent<TransformComponent>('transform');
    if (!transform) return false;

    const distToCenter = this.getDistanceToCenter(transform);

    // Если далеко от перекрестка - можно ехать
    if (distToCenter > this.INTERSECTION_ZONE + 40) return true;
    // Если на перекрестке - продолжаем движение
    if (distToCenter < 30) return true;

    const lights = world.getEntitiesWithComponent('trafficLight');

    // Проверяем, включены ли светофоры
    let lightsEnabled = true;
    if (lights.length > 0) {
      const firstLight = lights[0].getComponent<TrafficLightComponent>('trafficLight');
      lightsEnabled = firstLight?.enabled ?? true;
    }

    // Если светофоры выключены - можно ехать (правило правой руки будет применено отдельно)
    if (!lightsEnabled) return true;

    // Нормальная работа светофоров
    const lanePhase = PHASE_MAP[laneComp.direction];

    for (const light of lights) {
      const lightComp = light.getComponent<TrafficLightComponent>('trafficLight');
      if (!lightComp) continue;

      // Определяем, относится ли светофор к нашему направлению
      let isOurLight = false;

      // Север-Юг (фазы 0 и 1)
      const isNorthSouth = (laneComp.direction === 'north' || laneComp.direction === 'south');
      // Восток-Запад (фазы 2 и 3)
      const isEastWest = (laneComp.direction === 'east' || laneComp.direction === 'west');

      if (isNorthSouth && (lightComp.phase === 0 || lightComp.phase === 1)) {
        isOurLight = true;
      }
      if (isEastWest && (lightComp.phase === 2 || lightComp.phase === 3)) {
        isOurLight = true;
      }

      if (isOurLight) {
        // Можно ехать только на зеленый
        return lightComp.state === 'green';
      }
    }

    return true;
  }

  private shouldYieldToRight(vehicle: Entity, world: World): boolean {
    const transform = vehicle.getComponent<TransformComponent>('transform');
    const vehicleComp = vehicle.getComponent<VehicleComponent>('vehicle');
    if (!transform || !vehicleComp) return false;

    const distToCenter = this.getDistanceToCenter(transform);

    // Только в зоне перекрестка
    if (distToCenter > this.INTERSECTION_ZONE) return false;

    const lights = world.getEntitiesWithComponent('trafficLight');
    let lightsEnabled = true;
    if (lights.length > 0) {
      const firstLight = lights[0].getComponent<TrafficLightComponent>('trafficLight');
      lightsEnabled = firstLight?.enabled ?? true;
    }

    // Правило правой руки работает только когда светофоры выключены
    if (lightsEnabled) return false;

    // Получаем направление движения и правую сторону
    const forward = transform.getRight();

    // Правая сторона относительно направления движения
    // Для правостороннего движения: поворот на 90 градусов по часовой стрелке
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
      if (otherDist > this.INTERSECTION_ZONE) continue;

      // Проверяем, находится ли другая машина справа
      const dx = otherTransform.position.x - transform.position.x;
      const dy = otherTransform.position.y - transform.position.y;

      const dotRight = dx * rightDirection.x + dy * rightDirection.y;

      // Если машина справа и расстояние меньше безопасного
      if (dotRight > 0 && Math.abs(dotRight) < this.SAFE_DISTANCE + 30) {
        // Также проверяем, что машина движется перпендикулярно (пересекает наш путь)
        const otherForward = otherTransform.getRight();
        const crossProduct = Math.abs(forward.x * otherForward.y - forward.y * otherForward.x);

        if (crossProduct > 0.5) {
          return true;
        }
      }
    }

    return false;
  }

  private getRightDirection(vehicle: VehicleComponent, transform: TransformComponent): { x: number, y: number } {
    // Направление вправо относительно движения
    const forward = transform.getRight();
    return {
      x: forward.y,
      y: -forward.x
    };
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

      // Только машины на той же полосе
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