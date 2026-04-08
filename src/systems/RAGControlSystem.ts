import { World, System } from '../core/ecs';
import { RAGEngine, RAGResult } from '../rag';
import { VehicleComponent, TrafficLightComponent, LaneComponent } from '../components';

export class RAGControlSystem extends System {
  private currentBehavior: RAGResult | null = null;
  private behaviorQueue: RAGResult[] = [];

  constructor(private ragEngine: RAGEngine) {
    super(20);
  }

  async processPrompt(prompt: string): Promise<void> {
    const result = await this.ragEngine.processPrompt(prompt);
    this.behaviorQueue.push(result);
  }

  update(world: World, _deltaTime: number): void {
    if (this.behaviorQueue.length > 0) {
      this.currentBehavior = this.behaviorQueue.shift()!;
      this.applyBehavior(world, this.currentBehavior);
    }

    if (this.currentBehavior) {
      this.applyContinuousBehavior(world);
    }
  }

  private applyBehavior(world: World, behavior: RAGResult): void {
    const params = behavior.parameters;

    if (params.trafficLightsEnabled !== undefined) {
      const lights = world.getEntitiesWithComponent('trafficLight');
      lights.forEach(light => {
        const lightComp = light.getComponent<TrafficLightComponent>('trafficLight');
        if (lightComp) lightComp.enabled = params.trafficLightsEnabled;
      });
    }

    const vehicles = world.getEntitiesWithComponent('vehicle');
    vehicles.forEach(vehicle => {
      const vehicleComp = vehicle.getComponent<VehicleComponent>('vehicle');
      if (!vehicleComp) return;

      const lane = world.getEntity(vehicleComp.laneId);
      const laneComp = lane?.getComponent<LaneComponent>('lane');
      if (!laneComp) return;

      vehicleComp.maxSpeed = laneComp.speedLimit * (params.speedMultiplier || 1.0);
      vehicleComp.acceleration = 0.08 * (params.aggressionLevel || 1.0);
      vehicleComp.braking = 0.25 / (params.aggressionLevel || 1.0);
    });
  }

  private applyContinuousBehavior(world: World): void {
    const vehicles = world.getEntitiesWithComponent('vehicle');

    vehicles.forEach(vehicle => {
      const vehicleComp = vehicle.getComponent<VehicleComponent>('vehicle');
      if (vehicleComp) {
        vehicleComp.targetSpeed = vehicleComp.maxSpeed;
      }
    });
  }

  getCurrentBehavior(): RAGResult | null {
    return this.currentBehavior;
  }
}