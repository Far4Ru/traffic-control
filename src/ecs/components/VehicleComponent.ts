import { ComponentBase } from '../Component';

export type VehicleState = 'moving' | 'stopped' | 'waiting' | 'turning';
export type VehicleAction = 'straight' | 'left' | 'right' | 'u-turn';

export interface VehicleData {
  speed: number;
  maxSpeed: number;
  acceleration: number;
  braking: number;
  targetSpeed: number;
  lane: string;
  color: string;
  state: VehicleState;
  intendedAction: VehicleAction;
  turnProgress?: number;
  waitTimer?: number;
}

export class VehicleComponent extends ComponentBase implements VehicleData {
  speed: number;
  maxSpeed: number;
  acceleration: number;
  braking: number;
  targetSpeed: number;
  lane: string;
  color: string;
  state: VehicleState;
  intendedAction: VehicleAction;
  turnProgress: number;
  waitTimer: number;
  
  constructor(data: Partial<VehicleData> = {}) {
    super('vehicle');
    
    this.speed = data.speed ?? 0;
    this.maxSpeed = data.maxSpeed ?? 2;
    this.acceleration = data.acceleration ?? 0.1;
    this.braking = data.braking ?? 0.3;
    this.targetSpeed = data.targetSpeed ?? 2;
    this.lane = data.lane ?? '';
    this.color = data.color ?? 'red';
    this.state = data.state ?? 'moving';
    this.intendedAction = data.intendedAction ?? 'straight';
    this.turnProgress = data.turnProgress ?? 0;
    this.waitTimer = data.waitTimer ?? 0;
  }
  
  accelerate(deltaTime: number): void {
    if (this.speed < this.targetSpeed) {
      this.speed = Math.min(
        this.targetSpeed,
        this.speed + this.acceleration * deltaTime
      );
    }
  }
  
  brake(deltaTime: number): void {
    this.speed = Math.max(0, this.speed - this.braking * deltaTime);
  }
  
  stop(): void {
    this.speed = 0;
    this.state = 'stopped';
  }
  
  resume(): void {
    this.state = 'moving';
  }
  
  setTargetSpeed(speed: number): void {
    this.targetSpeed = Math.min(speed, this.maxSpeed);
  }
  
  getSpeedPercentage(): number {
    return this.speed / this.maxSpeed;
  }
  
  isStopped(): boolean {
    return this.speed < 0.01;
  }
}