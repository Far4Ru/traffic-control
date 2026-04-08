import { Component } from './Component';
import { World } from './World';

export class Entity {
    public readonly id: string;
    private components: Map<string, Component> = new Map();
    private tags: Set<string> = new Set();
    private world: World | null = null;

    constructor(id?: string) {
        this.id = id ?? Entity.generateId();
    }

    static generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    setWorld(world: World): void {
        this.world = world;
    }

    addComponent<T extends Component>(component: Component): this {
        this.components.set(component.type, component);
        component.entity = this;

        if (this.world) {
            this.world.onComponentAdded(this, component.type);
        }

        return this;
    }

    getComponent<T extends Component>(type: string): T | undefined {
        return this.components.get(type) as T;
    }

    hasComponent(type: string): boolean {
        return this.components.has(type);
    }

    removeComponent(type: string): this {
        const component = this.components.get(type);
        if (component) {
            component.entity = undefined;
            this.components.delete(type);

            if (this.world) {
                this.world.onComponentRemoved(this, type);
            }
        }
        return this;
    }

    getAllComponents(): Map<string, Component> {
        return this.components;
    }

    addTag(tag: string): this {
        this.tags.add(tag);
        return this;
    }

    hasTag(tag: string): boolean {
        return this.tags.has(tag);
    }

    removeTag(tag: string): this {
        this.tags.delete(tag);
        return this;
    }

    destroy(): void {
        this.components.clear();
        this.tags.clear();
        this.world = null;
    }
}