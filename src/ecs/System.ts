import { World } from './World';

export interface ISystem {
  update(world: World, deltaTime: number): void;
  onAttach?(world: World): void;
  onDetach?(world: World): void;
  enable(): void;
  disable(): void;
  isEnabled(): boolean;
}

export abstract class System implements ISystem {
  protected enabled: boolean = true;
  
  abstract update(world: World, deltaTime: number): void;
  
  onAttach(_world: World): void {
    // Override in derived classes
  }
  
  onDetach(_world: World): void {
    // Override in derived classes
  }
  
  enable(): void {
    this.enabled = true;
  }
  
  disable(): void {
    this.enabled = false;
  }
  
  isEnabled(): boolean {
    return this.enabled;
  }
}