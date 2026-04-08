import { World, Entity } from '../../core/ecs';
import { TransformComponent, TrafficLightComponent, SpriteComponent } from '../../components';
import { TrafficLightConfig } from '../../config/intersection.config';
import { TrafficLightState } from '../../core/types';

export class TrafficLightFactory {
    constructor(private world: World) { }

    /**
     * Создает светофор на основе конфигурации
     */
    createTrafficLight(config: TrafficLightConfig): Entity {
        const light = this.world.createEntity();

        light
            .addComponent(new TransformComponent(config.x, config.y, config.rotation))
            .addComponent(new TrafficLightComponent(config.phase))
            .addComponent(new SpriteComponent('traffic-light-red', 50, 25));

        return light;
    }

    /**
     * Создает светофор с дополнительными параметрами
     */
    createCustomTrafficLight(
        x: number,
        y: number,
        rotation: number,
        phase: number,
        initialState: TrafficLightState = 'red'
    ): Entity {
        const light = this.world.createEntity();

        const trafficLightComp = new TrafficLightComponent(phase);
        trafficLightComp.setState(initialState);

        light
            .addComponent(new TransformComponent(x, y, rotation))
            .addComponent(trafficLightComp)
            .addComponent(new SpriteComponent(`traffic-light-${initialState}`, 50, 25));

        return light;
    }

    /**
     * Создает группу светофоров для перекрестка
     */
    createIntersectionLights(configs: TrafficLightConfig[]): Entity[] {
        return configs.map(config => this.createTrafficLight(config));
    }

    /**
     * Создает светофор с заданными длительностями фаз
     */
    createTrafficLightWithTimings(
        config: TrafficLightConfig,
        greenDuration: number,
        yellowDuration: number
    ): Entity {
        const light = this.world.createEntity();

        const trafficLightComp = new TrafficLightComponent(config.phase);
        trafficLightComp.greenDuration = greenDuration;
        trafficLightComp.yellowDuration = yellowDuration;

        light
            .addComponent(new TransformComponent(config.x, config.y, config.rotation))
            .addComponent(trafficLightComp)
            .addComponent(new SpriteComponent('traffic-light-red', 50, 25));

        return light;
    }

    /**
     * Обновляет текстуру светофора в соответствии с его состоянием
     */
    updateLightTexture(light: Entity, state: TrafficLightState): void {
        const sprite = light.getComponent<SpriteComponent>('sprite');
        if (sprite) {
            sprite.texture = `traffic-light-${state}`;
        }
    }

    /**
     * Переключает состояние светофора
     */
    setLightState(light: Entity, state: TrafficLightState): void {
        const lightComp = light.getComponent<TrafficLightComponent>('trafficLight');
        if (lightComp) {
            lightComp.setState(state);
            this.updateLightTexture(light, state);
        }
    }

    /**
     * Включает/выключает светофор
     */
    setLightEnabled(light: Entity, enabled: boolean): void {
        const lightComp = light.getComponent<TrafficLightComponent>('trafficLight');
        if (lightComp) {
            lightComp.enabled = enabled;
            if (!enabled) {
                this.updateLightTexture(light, 'red');
            }
        }
    }

    /**
     * Создает светофор для пешеходного перехода
     */
    createPedestrianLight(x: number, y: number, phase: number): Entity {
        const light = this.world.createEntity();

        light
            .addComponent(new TransformComponent(x, y, 0))
            .addComponent(new TrafficLightComponent(phase))
            .addComponent(new SpriteComponent('traffic-light-red', 40, 20));

        return light;
    }

    /**
     * Удаляет светофор
     */
    destroyTrafficLight(light: Entity): void {
        this.world.removeEntity(light.id);
    }
}