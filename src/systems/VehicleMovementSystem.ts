import { World, System, Entity } from '../core/ecs';
import { TransformComponent, VehicleComponent, LaneComponent, CollisionComponent, TrafficLightComponent } from '../components';
import { COLLISION, PHASE_MAP, SCENE } from '../config/constants';

export class VehicleMovementSystem extends System {
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

      if (canGo && !hasVehicleAhead) {
        vehicleComp.accelerate(deltaTime);
      } else {
        vehicleComp.brake(deltaTime);
      }

      this.moveVehicle(transform, vehicleComp, deltaTime);
      this.handleIntersectionTurn(transform, vehicleComp, deltaTime);

      if (this.isOffScreen(transform)) {
        this.removeVehicle(vehicle, world);
      }
    }
  }

  private canProceed(vehicle: Entity, world: World, laneComp: LaneComponent): boolean {
    const transform = vehicle.getComponent<TransformComponent>('transform');
    if (!transform) return false;

    const distToCenter = this.getDistanceToCenter(transform);
    if (distToCenter > 150) return true;

    const lights = world.getEntitiesWithComponent('trafficLight');
    const lanePhase = PHASE_MAP[laneComp.direction];

    for (const light of lights) {
      const lightComp = light.getComponent<TrafficLightComponent>('trafficLight');
      if (!lightComp) continue;

      if (lightComp.phase === lanePhase) {
        return lightComp.isGreen();
      }
    }

    return true;
  }

  private checkVehicleAhead(vehicle: Entity, world: World): boolean {
    const transform = vehicle.getComponent<TransformComponent>('transform');
    const vehicleComp = vehicle.getComponent<VehicleComponent>('vehicle');
    if (!transform || !vehicleComp) return false;

    const forward = transform.getForward();

    for (const other of world.getEntitiesWithComponent('vehicle')) {
      if (other.id === vehicle.id) continue;

      const otherTransform = other.getComponent<TransformComponent>('transform');
      if (!otherTransform) continue;

      const dx = otherTransform.position.x - transform.position.x;
      const dy = otherTransform.position.y - transform.position.y;

      const dot = dx * forward.x + dy * forward.y;
      if (dot > 0 && dot < COLLISION.SAFE_DISTANCE) {
        const perpDist = Math.abs(dx * forward.y - dy * forward.x);
        if (perpDist < 30) {
          return true;
        }
      }
    }

    return false;
  }

  private moveVehicle(transform: TransformComponent, vehicle: VehicleComponent, deltaTime: number): void {
    const forward = transform.getForward();
    transform.position.x += forward.x * vehicle.speed * deltaTime;
    transform.position.y += forward.y * vehicle.speed * deltaTime;
  }

  private handleIntersectionTurn(transform: TransformComponent, vehicle: VehicleComponent, deltaTime: number): void {
    const distToCenter = this.getDistanceToCenter(transform);

    if (distToCenter > COLLISION.TURN_START_DISTANCE && distToCenter < COLLISION.TURN_END_DISTANCE) {
      const turnSpeed = COLLISION.TURN_SPEED * deltaTime;

      if (vehicle.intendedAction === 'left') {
        transform.rotation -= turnSpeed;
      } else if (vehicle.intendedAction === 'right') {
        transform.rotation += turnSpeed;
      }

      if (distToCenter > COLLISION.TURN_END_DISTANCE - 10) {
        vehicle.intendedAction = 'straight';
      }
    }
  }

  private getDistanceToCenter(transform: TransformComponent): number {
    return Math.sqrt(
      Math.pow(transform.position.x - SCENE.CENTER_X, 2) +
      Math.pow(transform.position.y - SCENE.CENTER_Y, 2)
    );
  }

  private isOffScreen(transform: TransformComponent): boolean {
    return transform.position.x < -200 || transform.position.x > SCENE.WIDTH + 200 ||
      transform.position.y < -200 || transform.position.y > SCENE.HEIGHT + 200;
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