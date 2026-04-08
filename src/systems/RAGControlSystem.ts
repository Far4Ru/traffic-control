import { World } from '../ecs/World';
import { System } from '../ecs/System';
import { RAGEngine, RAGResult } from '../rag/RAGEngine';

export class RAGControlSystem extends System {
  private ragEngine: RAGEngine;
  private currentBehavior: RAGResult | null = null;
  private behaviorQueue: RAGResult[] = [];
  
  constructor(ragEngine: RAGEngine) {
    super();
    this.ragEngine = ragEngine;
  }
  
  async processPrompt(prompt: string) {
    const result = await this.ragEngine.processPrompt(prompt);
    this.behaviorQueue.push(result);
  }
  
  update(world: World, _deltaTime: number) {
    // Apply queued behaviors
    if (this.behaviorQueue.length > 0) {
      this.currentBehavior = this.behaviorQueue.shift()!;
      this.applyBehavior(world, this.currentBehavior);
    }
    
    // Continuous behavior application
    if (this.currentBehavior) {
      this.applyContinuousBehavior(world);
    }
  }
  
  private applyBehavior(world: World, behavior: RAGResult) {
    const params = behavior.parameters;
    
    // Update traffic light system
    if (params.trafficLightsEnabled !== undefined) {
      const lights = world.getEntitiesWithComponent('trafficLight');
      lights.forEach(light => {
        const lightComp = light.getComponent('trafficLight');
        if (lightComp) {
          lightComp.enabled = params.trafficLightsEnabled;
        }
      });
    }
    
    // Update vehicle speeds
    const vehicles = world.getEntitiesWithComponent('vehicle');
    vehicles.forEach(vehicle => {
      const vehicleComp = vehicle.getComponent('vehicle');
      if (!vehicleComp) return;
      
      const lane = world.getEntity(vehicleComp.lane);
      if (!lane) return;
      
      const laneComp = lane.getComponent('lane');
      if (!laneComp) return;
      
      vehicleComp.maxSpeed = laneComp.speedLimit * (params.speedMultiplier || 1.0);
      vehicleComp.acceleration = 0.1 * (params.aggressionLevel || 1.0);
      vehicleComp.braking = 0.3 / (params.aggressionLevel || 1.0);
    });
    
    // Adjust vehicle density
    this.adjustVehicleDensity(world, params.densityMultiplier || 1.0);
  }
  
  private applyContinuousBehavior(world: World) {
    if (!this.currentBehavior) return;
    
    const vehicles = world.getEntitiesWithComponent('vehicle');
    vehicles.forEach(vehicle => {
      const vehicleComp = vehicle.getComponent('vehicle');
      if (!vehicleComp) return;
      
      const targetSpeed = vehicleComp.maxSpeed;
      vehicleComp.targetSpeed = targetSpeed;
    });
  }
  
  private adjustVehicleDensity(world: World, multiplier: number) {
    const vehicles = world.getEntitiesWithComponent('vehicle');
    const targetCount = Math.floor(8 * multiplier);
    
    const currentCount = vehicles.length;
    
    if (currentCount < targetCount) {
      for (let i = 0; i < targetCount - currentCount; i++) {
        setTimeout(() => this.spawnVehicle(world), i * 500);
      }
    } else if (currentCount > targetCount) {
      const toRemove = vehicles.slice(targetCount);
      toRemove.forEach(vehicle => {
        const vehicleComp = vehicle.getComponent('vehicle');
        if (!vehicleComp) return;
        
        const lane = world.getEntity(vehicleComp.lane);
        if (lane) {
          const laneComp = lane.getComponent('lane');
          if (laneComp) {
            laneComp.vehicles = laneComp.vehicles.filter((id: string) => id !== vehicle.id);
          }
        }
        world.removeEntity(vehicle.id);
      });
    }
  }
  
  private spawnVehicle(world: World) {
    const lanes = world.getEntitiesWithComponent('lane');
    const entryLanes = lanes.filter(e => {
      const laneComp = e.getComponent('lane');
      return laneComp && laneComp.isEntry;
    });
    
    if (entryLanes.length === 0) return;
    
    const lane = entryLanes[Math.floor(Math.random() * entryLanes.length)];
    const laneComp = lane.getComponent('lane');
    const transform = lane.getComponent('transform');
    
    if (!laneComp || !transform) return;
    
    const vehicle = world.createEntity();
    const colors = ['red', 'blue', 'green', 'yellow'] as const;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    vehicle.addComponent('transform', {
      x: transform.x,
      y: transform.y,
      rotation: transform.rotation,
      scale: { x: 1, y: 1 }
    });
    
    vehicle.addComponent('vehicle', {
      speed: 1,
      maxSpeed: laneComp.speedLimit,
      acceleration: 0.1,
      braking: 0.3,
      targetSpeed: laneComp.speedLimit,
      lane: lane.id,
      color,
      state: 'moving',
      intendedAction: this.getRandomAction()
    });
    
    vehicle.addComponent('sprite', {
      texture: `car-${color}`,
      width: 28,
      height: 42
    });
    
    vehicle.addComponent('collision', {
      radius: 20,
      colliding: false,
      stopped: false
    });
    
    laneComp.vehicles.push(vehicle.id);
  }
  
  private getRandomAction(): string {
    const actions = ['straight', 'left', 'right'];
    return actions[Math.floor(Math.random() * actions.length)];
  }
  
  getCurrentBehavior(): RAGResult | null {
    return this.currentBehavior;
  }
}