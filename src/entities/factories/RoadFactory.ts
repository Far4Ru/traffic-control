import { World, Entity } from '../../core/ecs';
import { TransformComponent, SpriteComponent } from '../../components';
import { SCENE } from '../../config/constants';

export class RoadFactory {
    constructor(private world: World) { }

    createRoad(texture: string): Entity {
        const road = this.world.createEntity();

        road
            .addComponent(new TransformComponent(SCENE.CENTER_X, SCENE.CENTER_Y, 0))
            .addComponent(new SpriteComponent(texture, SCENE.WIDTH, SCENE.HEIGHT));

        return road;
    }
}