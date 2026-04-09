import { World, Entity } from '../../core/ecs';
import { TransformComponent, LaneComponent, SpriteComponent } from '../../components';
import { LaneConfig } from '../../config/intersection.config';
import { SCENE, ROAD } from '../../config/constants';

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
        let arrowRotation = config.rotation;

        switch (config.direction) {
            case 'north':
                arrowY = config.y + offset;
                arrowRotation = Math.PI / 2;
                break;
            case 'south':
                arrowY = config.y - offset;
                arrowRotation = -Math.PI / 2;
                break;
            case 'east':
                arrowX = config.x - offset;
                arrowRotation = Math.PI;
                break;
            case 'west':
                arrowX = config.x + offset;
                arrowRotation = 0;
                break;
        }

        arrow
            .addComponent(new TransformComponent(arrowX, arrowY, arrowRotation))
            .addComponent(new SpriteComponent(`arrow-${config.arrowType}`, 28, 28));
    }

    private createSpeedSign(config: LaneConfig): void {
        const sign = this.world.createEntity();
        const offset = 130;
        let signX = config.x;
        let signY = config.y;

        const LW = ROAD.LANE_WIDTH;
        const CX = SCENE.CENTER_X;
        const CY = SCENE.CENTER_Y;

        switch (config.direction) {
            case 'north':
                signY = config.y + offset;
                signX = config.x - 30;
                break;
            case 'south':
                signY = config.y - offset;
                signX = config.x + 30;
                break;
            case 'east':
                signX = config.x - offset;
                signY = config.y - 20;
                break;
            case 'west':
                signX = config.x + offset;
                signY = config.y + 20;
                break;
        }

        sign.addComponent(new TransformComponent(signX, signY, 0));
        const speedSignComp = new SpeedSignComponent(config.speedLimit);
        (sign as any).addComponent(speedSignComp.type, speedSignComp);
    }
}