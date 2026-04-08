import { Entity } from './Entity';
import { System } from './System';

export class World {
    private entities: Map<string, Entity> = new Map();
    private systems: System[] = [];
    private entitiesByComponent: Map<string, Set<Entity>> = new Map();
    createEntity(id?: string): Entity {
        const entity = new Entity(id);
        entity.setWorld(this);
        this.entities.set(entity.id, entity);
        return entity;
    }

    addEntity(entity: Entity): void {
        this.entities.set(entity.id, entity);
        this.indexEntity(entity);
    }

    removeEntity(id: string): void {
        const entity = this.entities.get(id);
        if (entity) {
            this.unindexEntity(entity);
            entity.destroy();
            this.entities.delete(id);
        }
    }

    getEntity(id: string): Entity | undefined {
        return this.entities.get(id);
    }

    getEntitiesWithComponent(componentType: string): Entity[] {
        const set = this.entitiesByComponent.get(componentType);
        return set ? Array.from(set) : [];
    }

    getEntitiesWithTag(tag: string): Entity[] {
        return Array.from(this.entities.values()).filter(e => e.hasTag(tag));
    }

    registerSystem(system: System): void {
        this.systems.push(system);
        this.systems.sort((a, b) => a.priority - b.priority);
        system.onAttach(this);
    }

    getSystems(): System[] {
        return [...this.systems];
    }

    update(deltaTime: number): void {
        for (const system of this.systems) {
            if (system.isEnabled()) {
                system.update(this, deltaTime);
            }
        }
    }

    // Вызывать этот метод когда у сущности добавляется компонент
    onComponentAdded(entity: Entity, componentType: string): void {
        if (!this.entitiesByComponent.has(componentType)) {
            this.entitiesByComponent.set(componentType, new Set());
        }
        this.entitiesByComponent.get(componentType)!.add(entity);
    }

    // Вызывать когда у сущности удаляется компонент
    onComponentRemoved(entity: Entity, componentType: string): void {
        this.entitiesByComponent.get(componentType)?.delete(entity);
    }

    private indexEntity(entity: Entity): void {
        const components = entity.getAllComponents();
        for (const type of components.keys()) {
            if (!this.entitiesByComponent.has(type)) {
                this.entitiesByComponent.set(type, new Set());
            }
            this.entitiesByComponent.get(type)!.add(entity);
        }
    }

    private unindexEntity(entity: Entity): void {
        const components = entity.getAllComponents();
        for (const type of components.keys()) {
            this.entitiesByComponent.get(type)?.delete(entity);
        }
    }

    clear(): void {
        this.entities.forEach(entity => entity.destroy());
        this.entities.clear();
        this.entitiesByComponent.clear();
        this.systems = [];
    }
}