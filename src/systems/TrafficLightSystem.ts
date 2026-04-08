import { World } from '../ecs/World';
import { System } from '../ecs/System';

export class TrafficLightSystem extends System {
  private globalTimer: number = 0;
  private currentPhase: number = 0;
  
  update(world: World, deltaTime: number) {
    this.globalTimer += deltaTime * 16.67;
    
    const cycleTime = 24000; // 24 секунды полный цикл
    const greenTime = 6000;
    const yellowTime = 2000;
    
    // Определяем текущую фазу
    const phaseTime = this.globalTimer % cycleTime;
    
    if (phaseTime < greenTime) {
      this.currentPhase = 0;
    } else if (phaseTime < greenTime + yellowTime) {
      this.currentPhase = -1; // yellow для всех
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
      const lightComp = light.getComponent('trafficLight');
      if (!lightComp || !lightComp.enabled) continue;
      
      if (this.currentPhase === -1) {
        lightComp.state = 'yellow';
      } else if (lightComp.phase === this.currentPhase) {
        lightComp.state = 'green';
      } else {
        lightComp.state = 'red';
      }
      
      // Обновляем спрайт
      const sprite = light.getComponent('sprite');
      if (sprite) {
        sprite.texture = `traffic-light-${lightComp.state}`;
      }
    }
  }
}