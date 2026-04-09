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
    try {
      const result = await this.ragEngine.processPrompt(prompt);
      this.behaviorQueue.push(result);
    } catch (error) {
      console.error('RAG processing error:', error);
    }
  }

  update(world: World, _deltaTime: number): void {
    if (this.behaviorQueue.length > 0) {
      this.currentBehavior = this.behaviorQueue.shift()!;
      this.applyBehavior(world, this.currentBehavior);
    }
  }

  private applyBehavior(world: World, behavior: RAGResult): void {
    const params = behavior.parameters;

    // Применяем настройки светофоров
    if (params.trafficLightsEnabled !== undefined) {
      const lights = world.getEntitiesWithComponent('trafficLight');
      lights.forEach(light => {
        const lightComp = light.getComponent<TrafficLightComponent>('trafficLight');
        if (lightComp) {
          lightComp.enabled = params.trafficLightsEnabled;
          // Если светофоры выключаем, устанавливаем желтый мигающий режим
          if (!params.trafficLightsEnabled) {
            lightComp.state = 'yellow';
          } else {
            lightComp.state = 'red';
          }
        }
      });
    }

    // Применяем настройки к машинам
    const vehicles = world.getEntitiesWithComponent('vehicle');
    vehicles.forEach(vehicle => {
      const vehicleComp = vehicle.getComponent<VehicleComponent>('vehicle');
      if (!vehicleComp) return;

      const lane = world.getEntity(vehicleComp.laneId);
      const laneComp = lane?.getComponent<LaneComponent>('lane');
      if (!laneComp) return;

      // Обновляем параметры машины
      vehicleComp.maxSpeed = laneComp.speedLimit * (params.speedMultiplier || 1.0);
      vehicleComp.acceleration = 0.08 * (params.aggressionLevel || 1.0);
      vehicleComp.braking = 0.25 / Math.max(0.5, params.aggressionLevel || 1.0);
      vehicleComp.targetSpeed = vehicleComp.maxSpeed;
    });

    console.log('Behavior applied:', behavior);
  }

  getCurrentBehavior(): RAGResult | null {
    return this.currentBehavior;
  }
}