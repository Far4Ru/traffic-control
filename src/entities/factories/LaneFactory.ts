import { World, Entity } from '../../core/ecs';
import { TransformComponent, LaneComponent, SpriteComponent } from '../../components';
import { LaneConfig } from '../../config/intersection.config';

class SpeedSignComponent {
    type = 'speedSign';
    speed: number;

    constructor(speed: number) {
        this.speed = speed;
    }
}

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
            this.createSpeedSign(config);
        }

        return lane;
    }

    private createArrow(config: LaneConfig): void {
        const arrow = this.world.createEntity();
        const offset = 100;
        let arrowX = config.x;
        let arrowY = config.y;

        // Стрелка указывает направление движения
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

        // Стрелка повернута так же как и полоса (направление движения)
        arrow
            .addComponent(new TransformComponent(arrowX, arrowY, config.rotation))
            .addComponent(new SpriteComponent(`arrow-${config.arrowType}`, 32, 32));
    }

    private createSpeedSign(config: LaneConfig): void {
        const sign = this.world.createEntity();
        const offset = 140;
        let signX = config.x;
        let signY = config.y;

        switch (config.direction) {
            case 'north':
                signY = config.y + offset;
                break;
            case 'south':
                signY = config.y - offset;
                break;
            case 'east':
                signX = config.x - offset;
                break;
            case 'west':
                signX = config.x + offset;
                break;
        }

        sign.addComponent(new TransformComponent(signX, signY, 0));
        const speedSignComp = new SpeedSignComponent(config.speedLimit);
        (sign as any).addComponent(speedSignComp.type, speedSignComp);
    }
}