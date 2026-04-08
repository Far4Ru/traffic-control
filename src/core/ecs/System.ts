import { World } from './World';

export abstract class System {
    protected enabled: boolean = true;
    public readonly priority: number;

    constructor(priority: number = 0) {
        this.priority = priority;
    }

    abstract update(world: World, deltaTime: number): void;

    onAttach(world: World): void { }
    onDetach(world: World): void { }

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