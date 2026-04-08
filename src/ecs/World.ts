import { Entity } from './Entity';
import { ISystem } from './System';

export class World {
  private entities: Map<string, Entity> = new Map();
  private systems: ISystem[] = [];
  private systemsToAdd: ISystem[] = [];
  private systemsToRemove: ISystem[] = [];
  
  createEntity(): Entity {
    const entity = new Entity();
    this.entities.set(entity.id, entity);
    return entity;
  }
  
  removeEntity(id: string): void {
    this.entities.delete(id);
  }
  
  getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }
  
  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }
  
  getEntitiesWithComponent(componentType: string): Entity[] {
    return this.getAllEntities().filter(e => e.hasComponent(componentType));
  }
  
  registerSystem(system: ISystem): void {
    this.systemsToAdd.push(system);
    if (system.onAttach) {
      system.onAttach(this);
    }
  }
  
  unregisterSystem(system: ISystem): void {
    this.systemsToRemove.push(system);
    if (system.onDetach) {
      system.onDetach(this);
    }
  }
  
  update(deltaTime: number): void {
    // Add pending systems
    for (const system of this.systemsToAdd) {
      this.systems.push(system);
    }
    this.systemsToAdd = [];
    
    // Remove pending systems
    for (const system of this.systemsToRemove) {
      const index = this.systems.indexOf(system);
      if (index > -1) {
        this.systems.splice(index, 1);
      }
    }
    this.systemsToRemove = [];
    
    // Update active systems
    for (const system of this.systems) {
      if (system.isEnabled()) {
        system.update(this, deltaTime);
      }
    }
  }
  
  getSystems(): ISystem[] {
    return [...this.systems];
  }
  
  clear(): void {
    this.entities.clear();
    this.systems = [];
    this.systemsToAdd = [];
    this.systemsToRemove = [];
  }
}