import { ComponentBase } from '../Component';

export type Direction = 'north' | 'south' | 'east' | 'west';
export type ArrowType = 
  | 'straight'
  | 'left'
  | 'right'
  | 'straight-left'
  | 'straight-right'
  | 'all'
  | 'u-turn'
  | 'stop';

export interface LaneData {
  direction: Direction;
  isEntry: boolean;
  speedLimit: number;
  arrowType: ArrowType;
  vehicles: string[];
  queueLength?: number;
  spawnTimer?: number;
}

export class LaneComponent extends ComponentBase implements LaneData {
  direction: Direction;
  isEntry: boolean;
  speedLimit: number;
  arrowType: ArrowType;
  vehicles: string[];
  queueLength: number;
  spawnTimer: number;
  
  constructor(data: Partial<LaneData> = {}) {
    super('lane');
    
    this.direction = data.direction ?? 'north';
    this.isEntry = data.isEntry ?? true;
    this.speedLimit = data.speedLimit ?? 2;
    this.arrowType = data.arrowType ?? 'straight';
    this.vehicles = data.vehicles ?? [];
    this.queueLength = data.queueLength ?? 0;
    this.spawnTimer = data.spawnTimer ?? 0;
  }
  
  addVehicle(vehicleId: string): void {
    if (!this.vehicles.includes(vehicleId)) {
      this.vehicles.push(vehicleId);
      this.updateQueueLength();
    }
  }
  
  removeVehicle(vehicleId: string): void {
    const index = this.vehicles.indexOf(vehicleId);
    if (index > -1) {
      this.vehicles.splice(index, 1);
      this.updateQueueLength();
    }
  }
  
  updateQueueLength(): void {
    this.queueLength = this.vehicles.length;
  }
  
  getFirstVehicle(): string | null {
    return this.vehicles.length > 0 ? this.vehicles[0] : null;
  }
  
  getLastVehicle(): string | null {
    return this.vehicles.length > 0 ? this.vehicles[this.vehicles.length - 1] : null;
  }
  
  getAllowedActions(): string[] {
    switch (this.arrowType) {
      case 'straight':
        return ['straight'];
      case 'left':
        return ['left'];
      case 'right':
        return ['right'];
      case 'straight-left':
        return ['straight', 'left'];
      case 'straight-right':
        return ['straight', 'right'];
      case 'all':
        return ['straight', 'left', 'right'];
      case 'u-turn':
        return ['u-turn'];
      case 'stop':
        return [];
      default:
        return [];
    }
  }
  
  isActionAllowed(action: string): boolean {
    return this.getAllowedActions().includes(action);
  }
  
  getOppositeDirection(): Direction {
    const opposites: Record<Direction, Direction> = {
      'north': 'south',
      'south': 'north',
      'east': 'west',
      'west': 'east'
    };
    return opposites[this.direction];
  }
  
  getRightDirection(): Direction {
    const rights: Record<Direction, Direction> = {
      'north': 'east',
      'east': 'south',
      'south': 'west',
      'west': 'north'
    };
    return rights[this.direction];
  }
  
  getLeftDirection(): Direction {
    const lefts: Record<Direction, Direction> = {
      'north': 'west',
      'west': 'south',
      'south': 'east',
      'east': 'north'
    };
    return lefts[this.direction];
  }
}