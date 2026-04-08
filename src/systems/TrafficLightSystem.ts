import { World, System } from '../core/ecs';
import { TrafficLightComponent, SpriteComponent } from '../components';
import { TRAFFIC } from '../config/constants';

export class TrafficLightSystem extends System {
  private globalTimer: number = 0;
  private currentPhase: number = 0;

  constructor() {
    super(30);
  }

  update(world: World, deltaTime: number): void {
    this.globalTimer += deltaTime * 16.67;

    const cycleTime = TRAFFIC.CYCLE_TIME;
    const greenTime = TRAFFIC.GREEN_DURATION;
    const yellowTime = TRAFFIC.YELLOW_DURATION;

    const phaseTime = this.globalTimer % cycleTime;

    // Определяем текущую фазу
    if (phaseTime < greenTime) {
      this.currentPhase = 0;
    } else if (phaseTime < greenTime + yellowTime) {
      this.currentPhase = -1;
    } else if (phaseTime < greenTime * 2 + yellowTime) {
      this.currentPhase = 1;
    } else if (phaseTime < greenTime * 2 + yellowTime * 2) {
      this.currentPhase = -1;
    } else if (phaseTime < greenTime * 3 + yellowTime * 2) {
      this.currentPhase = 2;
    } else if (phaseTime < greenTime * 3 + yellowTime * 3) {
      this.currentPhase = -1;
    } else {
      this.currentPhase = 3;
    }

    const lights = world.getEntitiesWithComponent('trafficLight');

    for (const light of lights) {
      const lightComp = light.getComponent<TrafficLightComponent>('trafficLight');
      if (!lightComp) continue;

      if (!lightComp.enabled) {
        lightComp.state = 'red';
      } else if (this.currentPhase === -1) {
        lightComp.state = 'yellow';
      } else if (lightComp.phase === this.currentPhase) {
        lightComp.state = 'green';
      } else {
        lightComp.state = 'red';
      }

      // Обновляем спрайт
      const sprite = light.getComponent<SpriteComponent>('sprite');
      if (sprite) {
        sprite.texture = `traffic-light-${lightComp.state}`;
      }
    }
  }
}