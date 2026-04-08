import { Component } from '../core/ecs/Component';
import { TrafficLightState } from '../core/types';

export class TrafficLightComponent extends Component {
    public state: TrafficLightState;
    public phase: number;
    public enabled: boolean;
    public greenDuration: number;
    public yellowDuration: number;
    public redDuration: number;
    public timer: number;
    public blinkTimer: number;

    constructor(phase: number = 0) {
        super('trafficLight');
        this.state = 'red';
        this.phase = phase;
        this.enabled = true;
        this.greenDuration = 5000;
        this.yellowDuration = 2000;
        this.redDuration = 15000;
        this.timer = 0;
        this.blinkTimer = 0;
    }

    setState(state: TrafficLightState): void {
        this.state = state;
        this.timer = 0;
    }

    isGreen(): boolean {
        return this.state === 'green' && this.enabled;
    }

    isYellow(): boolean {
        return this.state === 'yellow' && this.enabled;
    }

    isRed(): boolean {
        return this.state === 'red' || !this.enabled;
    }

    canPass(): boolean {
        return this.isGreen();
    }

    updateTimer(deltaTime: number): void {
        this.timer += deltaTime;
    }

    getCurrentPhaseDuration(): number {
        switch (this.state) {
            case 'green': return this.greenDuration;
            case 'yellow': return this.yellowDuration;
            case 'red': return this.redDuration;
            default: return 0;
        }
    }

    shouldChange(): boolean {
        return this.timer >= this.getCurrentPhaseDuration();
    }

    getNextState(): TrafficLightState {
        switch (this.state) {
            case 'green': return 'yellow';
            case 'yellow': return 'red';
            case 'red': return 'green';
            default: return 'red';
        }
    }

    reset(): void {
        this.state = 'red';
        this.timer = 0;
        this.enabled = true;
    }
}