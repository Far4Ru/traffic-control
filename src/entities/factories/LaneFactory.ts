import { World, Entity } from '../../core/ecs';
import { TransformComponent, LaneComponent, SpriteComponent } from '../../components';
import { SpeedSignComponent } from '../../components/SpeedSignComponent';
import { LaneConfig } from '../../config/intersection.config';
import { SCENE, ROAD } from '../../config/constants';

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
        const offset = 80;
        let arrowX = config.x;
        let arrowY = config.y;
        let arrowRotation = config.rotation;

        const CX = SCENE.CENTER_X;
        const CY = SCENE.CENTER_Y;

        switch (config.direction) {
            case 'north':
                arrowY = config.y + offset + 64;
                arrowX = config.x;
                arrowRotation = Math.PI / 2;
                break;
            case 'south':
                arrowY = config.y - offset - 520;
                arrowX = config.x;
                arrowRotation = -Math.PI / 2;
                break;
            case 'east':
                arrowX = config.x - offset - 400;
                arrowY = config.y;
                arrowRotation = Math.PI;
                break;
            case 'west':
                arrowX = config.x + offset + 200;
                arrowY = config.y;
                arrowRotation = 0;
                break;
        }

        arrow
            .addComponent(new TransformComponent(arrowX, arrowY, arrowRotation))
            .addComponent(new SpriteComponent(`arrow-${config.arrowType}`, 28, 28));
    }

    private createSpeedSign(config: LaneConfig): void {
        const sign = this.world.createEntity();
        const offset = 140;
        let signX = config.x;
        let signY = config.y;

        const CX = SCENE.CENTER_X;
        const CY = SCENE.CENTER_Y;

        switch (config.direction) {
            case 'north':
                signY = config.y + offset - 30;
                signX = config.x;
                break;
            case 'south':
                signY = config.y - offset - 420;
                signX = config.x;
                break;
            case 'east':
                signX = config.x - offset - 305;
                signY = config.y;
                break;
            case 'west':
                signX = config.x + offset + 105;
                signY = config.y;
                break;
        }

        sign.addComponent(new TransformComponent(signX, signY, 0));
        sign.addComponent(new SpeedSignComponent(config.speedLimit));
    }
}