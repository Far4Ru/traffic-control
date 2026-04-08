import { ComponentBase } from '../Component';

export type TrafficLightState = 'red' | 'yellow' | 'green';

export interface TrafficLightData {
  state: TrafficLightState;
  timer: number;
  phase: number;
  greenDuration: number;
  yellowDuration: number;
  redDuration: number;
  enabled: boolean;
  blinkTimer?: number;
}

export class TrafficLightComponent extends ComponentBase implements TrafficLightData {
  state: TrafficLightState;
  timer: number;
  phase: number;
  greenDuration: number;
  yellowDuration: number;
  redDuration: number;
  enabled: boolean;
  blinkTimer: number;
  
  constructor(data: Partial<TrafficLightData> = {}) {
    super('trafficLight');
    
    this.state = data.state ?? 'red';
    this.timer = data.timer ?? 0;
    this.phase = data.phase ?? 0;
    this.greenDuration = data.greenDuration ?? 5000;
    this.yellowDuration = data.yellowDuration ?? 2000;
    this.redDuration = data.redDuration ?? 15000;
    this.enabled = data.enabled ?? true;
    this.blinkTimer = data.blinkTimer ?? 0;
  }
  
  updateTimer(deltaTime: number): void {
    this.timer += deltaTime;
  }
  
  resetTimer(): void {
    this.timer = 0;
  }
  
  setState(state: TrafficLightState): void {
    this.state = state;
    this.resetTimer();
  }
  
  getCurrentPhaseDuration(): number {
    switch (this.state) {
      case 'green':
        return this.greenDuration;
      case 'yellow':
        return this.yellowDuration;
      case 'red':
        return this.redDuration;
      default:
        return 0;
    }
  }
  
  shouldChange(): boolean {
    return this.timer >= this.getCurrentPhaseDuration();
  }
  
  getNextState(): TrafficLightState {
    switch (this.state) {
      case 'green':
        return 'yellow';
      case 'yellow':
        return 'red';
      case 'red':
        return 'green';
      default:
        return 'red';
    }
  }
  
  isRed(): boolean {
    return this.state === 'red' && this.enabled;
  }
  
  isYellow(): boolean {
    return this.state === 'yellow' && this.enabled;
  }
  
  isGreen(): boolean {
    return this.state === 'green' && this.enabled;
  }
  
  canPass(): boolean {
    return this.isGreen() || (!this.enabled && this.state !== 'red');
  }
}