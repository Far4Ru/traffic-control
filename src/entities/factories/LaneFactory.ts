import { World, Entity } from '../../core/ecs';
import { TransformComponent, LaneComponent, SpriteComponent } from '../../components';
import { LaneConfig } from '../../config/intersection.config';
import { ROAD } from '../../config/constants';

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
        const offset = 80;
        let arrowX = config.x;
        let arrowY = config.y;

        // Стрелка перед перекрестком
        switch (config.direction) {
            case 'north':
                arrowY = config.y + offset;
                break;
            case 'south':
                arrowY = config.y - offset;
                break;
            case 'east':
                arrowX = config.x - offset;
                break;
            case 'west':
                arrowX = config.x + offset;
                break;
        }

        arrow
            .addComponent(new TransformComponent(arrowX, arrowY, 0))
            .addComponent(new SpriteComponent(`arrow-${config.arrowType}`, 32, 32));
    }

    private renderSpeedLimit(config: LaneConfig): void {
        const speedSign = this.world.createEntity();
        let signX = config.x;
        let signY = config.y;
        const offset = 40;

        switch (config.direction) {
            case 'north': signY = config.y - offset; break;
            case 'south': signY = config.y + offset; break;
            case 'east': signX = config.x + offset; break;
            case 'west': signX = config.x - offset; break;
        }

        speedSign.addComponent(new TransformComponent(signX, signY, 0));
        // Скорость будет отрендерена через Text в RenderSystem
    }
}