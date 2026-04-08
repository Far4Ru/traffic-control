import { Graphics, IRenderer, Texture } from 'pixi.js';
import { SCENE, ROAD } from '../config/constants';

export class TextureGenerator {
    constructor(private renderer: IRenderer) { }

    generateAll(): void {
        console.log('Generating textures...');
        this.generateCarTextures();
        this.generateRoadTexture();
        this.generateArrowTextures();
        this.generateTrafficLightTextures();
        console.log('Textures generated');
    }

    private generateCarTextures(): void {
        const colors = { red: 0xff3333, blue: 0x3366ff, green: 0x33cc33, yellow: 0xffcc00 };

        for (const [name, color] of Object.entries(colors)) {
            const g = new Graphics();

            g.beginFill(color);
            g.drawRoundedRect(-16, -24, 32, 48, 8);
            g.endFill();

            g.beginFill(0x222222);
            g.drawRect(-12, -16, 6, 12);
            g.drawRect(6, -16, 6, 12);
            g.drawRect(-12, 4, 6, 12);
            g.drawRect(6, 4, 6, 12);
            g.endFill();

            g.beginFill(0xffdd00);
            g.drawRect(-14, 22, 4, 4);
            g.drawRect(10, 22, 4, 4);
            g.endFill();

            const texture = this.renderer.generateTexture(g);
            Texture.addToCache(texture, `car-${name}`);
            console.log('Generated texture:', `car-${name}`);
            g.destroy();
        }
    }

    private generateRoadTexture(): void {
        const g = new Graphics();

        // Фон
        g.beginFill(0x2d5016); // Зеленый газон
        g.drawRect(0, 0, SCENE.WIDTH, SCENE.HEIGHT);
        g.endFill();

        // Дорога
        g.beginFill(0x444444);
        g.drawRect(0, SCENE.CENTER_Y - ROAD.LANE_WIDTH * 2, SCENE.WIDTH, ROAD.ROAD_WIDTH);
        g.drawRect(SCENE.CENTER_X - ROAD.LANE_WIDTH * 2, 0, ROAD.ROAD_WIDTH, SCENE.HEIGHT);
        g.endFill();

        this.addRoadMarkings(g);

        const texture = this.renderer.generateTexture(g);
        Texture.addToCache(texture, 'road-texture');
        console.log('Generated texture: road-texture');
        g.destroy();
    }

    private addRoadMarkings(g: Graphics): void {
        const laneW = ROAD.LANE_WIDTH;

        // Центральные линии
        g.lineStyle(2, 0xffffff, 1);
        g.moveTo(0, SCENE.CENTER_Y);
        g.lineTo(SCENE.WIDTH, SCENE.CENTER_Y);
        g.moveTo(SCENE.CENTER_X, 0);
        g.lineTo(SCENE.CENTER_X, SCENE.HEIGHT);

        // Разделительные полосы
        g.lineStyle(1, 0xffffff, 0.6);

        // Горизонтальные пунктиры
        for (let i = 0; i < SCENE.WIDTH; i += 40) {
            g.moveTo(i, SCENE.CENTER_Y - laneW * 1.5);
            g.lineTo(i + 20, SCENE.CENTER_Y - laneW * 1.5);
            g.moveTo(i, SCENE.CENTER_Y + laneW * 1.5);
            g.lineTo(i + 20, SCENE.CENTER_Y + laneW * 1.5);
        }

        // Вертикальные пунктиры
        for (let i = 0; i < SCENE.HEIGHT; i += 40) {
            g.moveTo(SCENE.CENTER_X - laneW * 1.5, i);
            g.lineTo(SCENE.CENTER_X - laneW * 1.5, i + 20);
            g.moveTo(SCENE.CENTER_X + laneW * 1.5, i);
            g.lineTo(SCENE.CENTER_X + laneW * 1.5, i + 20);
        }
    }

    private generateArrowTextures(): void {
        const arrows: Record<string, number[][][]> = {
            'straight': [[[-8, 10], [8, 10], [0, -10]]],
            'left': [[[10, -8], [10, 8], [-10, 0]]],
            'right': [[[-10, -8], [-10, 8], [10, 0]]],
            'straight-left': [[[-8, 10], [0, 10], [0, -10]], [[10, -8], [10, 0], [-10, 0]]],
            'straight-right': [[[0, 10], [8, 10], [0, -10]], [[-10, -8], [-10, 0], [10, 0]]],
            'all': [[[-8, 10], [8, 10], [0, -10]], [[10, -8], [10, 8], [-10, 0]], [[-10, -8], [-10, 8], [10, 0]]],
        };

        for (const [name, polys] of Object.entries(arrows)) {
            const g = new Graphics();

            g.beginFill(0x1a1a2e);
            g.drawCircle(0, 0, 16);
            g.endFill();

            g.beginFill(0x00d2ff);
            polys.forEach(poly => g.drawPolygon(poly.flat()));
            g.endFill();

            const texture = this.renderer.generateTexture(g);
            Texture.addToCache(texture, `arrow-${name}`);
            console.log('Generated texture:', `arrow-${name}`);
            g.destroy();
        }
    }

    private generateTrafficLightTextures(): void {
        const colors: Record<string, number> = { red: 0xff0000, yellow: 0xffff00, green: 0x00ff00 };

        for (const state of ['red', 'yellow', 'green']) {
            const g = new Graphics();

            g.beginFill(0x222222);
            g.drawRoundedRect(-30, -15, 60, 30, 5);
            g.endFill();

            ['red', 'yellow', 'green'].forEach((s, i) => {
                g.beginFill(s === state ? colors[s] : 0x444444);
                g.drawCircle(-20 + i * 20, 0, 7);
                g.endFill();
            });

            const texture = this.renderer.generateTexture(g);
            Texture.addToCache(texture, `traffic-light-${state}`);
            console.log('Generated texture:', `traffic-light-${state}`);
            g.destroy();
        }
    }
}