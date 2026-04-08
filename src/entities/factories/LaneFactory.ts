import { World, Entity } from '../../core/ecs';
import { TransformComponent, LaneComponent, SpriteComponent } from '../../components';
import { LaneConfig } from '../../config/intersection.config';

export class LaneFactory {
    constructor(private world: World) { }

    createLane(config: LaneConfig): Entity {
        const lane = this.world.createEntity();

        lane
            .addComponent(new TransformComponent(config.x, config.y, config.rotation))
            .addComponent(new LaneComponent({
                direction: config.direction,
                isEntry: config.isEntry,
                side: config.side,
                speedLimit: config.speedLimit,
                arrowType: config.arrowType,
                spawnPoint: { x: config.x, y: config.y }
            }));

        if (config.isEntry) {
            this.createArrow(config);
        }

        return lane;
    }

    private createArrow(config: LaneConfig): void {
        const arrow = this.world.createEntity();
        const offset = 70;
        let arrowX = config.x;
        let arrowY = config.y;

        switch (config.direction) {
            case 'north': arrowY += offset; break;
            case 'south': arrowY -= offset; break;
            case 'east': arrowX -= offset; break;
            case 'west': arrowX += offset; break;
        }

        arrow
            .addComponent(new TransformComponent(arrowX, arrowY, 0))
            .addComponent(new SpriteComponent(`arrow-${config.arrowType}`, 28, 28));

        arrow.getComponent<TransformComponent>('transform')!.scale = { x: 1.2, y: 1.2 };
    }
}