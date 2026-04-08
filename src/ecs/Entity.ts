import { Component } from './Component';
import { TransformComponent } from './components/TransformComponent';
import { VehicleComponent } from './components/VehicleComponent';
import { TrafficLightComponent } from './components/TrafficLightComponent';
import { LaneComponent } from './components/LaneComponent';
import { CollisionComponent } from './components/CollisionComponent';

export class Entity {
  public id: string;
  private components: Map<string, Component> = new Map();
  
  constructor() {
    this.id = this.generateId();
  }
  
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  addComponent(type: string, data: any): void {
    let component: Component;
    
    switch (type) {
      case 'transform':
        component = new TransformComponent(data);
        break;
      case 'vehicle':
        component = new VehicleComponent(data);
        break;
      case 'trafficLight':
        component = new TrafficLightComponent(data);
        break;
      case 'lane':
        component = new LaneComponent(data);
        break;
      case 'collision':
        component = new CollisionComponent(data);
        break;
      case 'sprite':
        component = { type, ...data } as Component;
        break;
      default:
        component = { type, ...data } as Component;
    }
    
    this.components.set(type, component);
  }
  
  getComponent<T extends Component>(type: string): T | undefined {
    return this.components.get(type) as T;
  }
  
  hasComponent(type: string): boolean {
    return this.components.has(type);
  }
  
  removeComponent(type: string): void {
    this.components.delete(type);
  }
  
  getAllComponents(): Map<string, Component> {
    return this.components;
  }
  
  getTransform(): TransformComponent | undefined {
    return this.getComponent<TransformComponent>('transform');
  }
  
  getVehicle(): VehicleComponent | undefined {
    return this.getComponent<VehicleComponent>('vehicle');
  }
  
  getTrafficLight(): TrafficLightComponent | undefined {
    return this.getComponent<TrafficLightComponent>('trafficLight');
  }
  
  getLane(): LaneComponent | undefined {
    return this.getComponent<LaneComponent>('lane');
  }
  
  getCollision(): CollisionComponent | undefined {
    return this.getComponent<CollisionComponent>('collision');
  }
}