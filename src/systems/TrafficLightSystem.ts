import { World } from '../ecs/World';
import { System } from '../ecs/System';

export class TrafficLightSystem extends System {
  private globalTimer: number = 0;
  
  update(world: World, deltaTime: number) {
    this.globalTimer += deltaTime * 16.67; // Convert to milliseconds
    
    const lights = world.getEntitiesWithComponent('trafficLight');
    const phases = new Set<number>();
    
    // Collect all phases
    for (const light of lights) {
      const lightComp = light.getComponent('trafficLight');
      if (lightComp) {
        phases.add(lightComp.phase);
      }
    }
    
    // Calculate current active phase
    const phaseCount = phases.size;
    const cycleTime = 20000; // 20 seconds per cycle
    const activePhase = phaseCount > 0 
      ? Math.floor((this.globalTimer / cycleTime) * phaseCount) % phaseCount 
      : 0;
    
    // Update each traffic light
    for (const light of lights) {
      const lightComp = light.getComponent('trafficLight');
      if (!lightComp) continue;
      
      const phaseTime = this.globalTimer % cycleTime;
      
      if (lightComp.phase === activePhase) {
        // This phase is active
        if (phaseTime < lightComp.greenDuration) {
          lightComp.state = 'green';
        } else if (phaseTime < lightComp.greenDuration + lightComp.yellowDuration) {
          lightComp.state = 'yellow';
        } else {
          lightComp.state = 'red';
        }
      } else {
        lightComp.state = 'red';
      }
      
      // Update sprite based on state
      const sprite = light.getComponent('sprite');
      if (sprite) {
        sprite.texture = `traffic-light-${lightComp.state}`;
      }
    }
  }
}