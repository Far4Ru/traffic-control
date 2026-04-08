import { World, Entity } from '../../core/ecs';
import { TransformComponent, TrafficLightComponent, SpriteComponent } from '../../components';
import { TrafficLightConfig } from '../../config/intersection.config';

export class TrafficLightFactory {
    constructor(private world: World) { }

    createTrafficLight(config: TrafficLightConfig): Entity {
        const light = this.world.createEntity();

        light
            .addComponent(new TransformComponent(config.x, config.y, config.rotation))
            .addComponent(new TrafficLightComponent(config.phase))
            .addComponent(new SpriteComponent('traffic-light-red', 50, 25));

        return light;
    }
}