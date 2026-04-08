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
            g.destroy();
        }
    }

    private generateRoadTexture(): void {
        const g = new Graphics();
        const LW = ROAD.LANE_WIDTH;
        const CX = SCENE.CENTER_X;
        const CY = SCENE.CENTER_Y;

        // Фон - газон
        g.beginFill(0x2d5016);
        g.drawRect(0, 0, SCENE.WIDTH, SCENE.HEIGHT);
        g.endFill();

        // Асфальт
        g.beginFill(0x555555);
        // Горизонтальная дорога
        g.drawRect(0, CY - LW * 2, SCENE.WIDTH, LW * 4);
        // Вертикальная дорога
        g.drawRect(CX - LW * 2, 0, LW * 4, SCENE.HEIGHT);
        g.endFill();

        // Тротуары/обочины
        g.beginFill(0x666666);
        g.drawRect(0, CY - LW * 2 - 5, SCENE.WIDTH, 5);
        g.drawRect(0, CY + LW * 2, SCENE.WIDTH, 5);
        g.drawRect(CX - LW * 2 - 5, 0, 5, SCENE.HEIGHT);
        g.drawRect(CX + LW * 2, 0, 5, SCENE.HEIGHT);
        g.endFill();

        // Разметка
        g.lineStyle(2, 0xffffff, 1);

        // Центральные линии (сплошные)
        g.moveTo(0, CY);
        g.lineTo(SCENE.WIDTH, CY);
        g.moveTo(CX, 0);
        g.lineTo(CX, SCENE.HEIGHT);

        // Линии между полосами (прерывистые)
        g.lineStyle(2, 0xffffff, 0.8);

        // Горизонтальные разделители
        for (let i = 0; i < SCENE.WIDTH; i += 50) {
            g.moveTo(i, CY - LW);
            g.lineTo(i + 25, CY - LW);
            g.moveTo(i, CY + LW);
            g.lineTo(i + 25, CY + LW);
        }

        // Вертикальные разделители
        for (let i = 0; i < SCENE.HEIGHT; i += 50) {
            g.moveTo(CX - LW, i);
            g.lineTo(CX - LW, i + 25);
            g.moveTo(CX + LW, i);
            g.lineTo(CX + LW, i + 25);
        }

        // Краевые линии (сплошные)
        g.lineStyle(2, 0xffffff, 1);
        g.moveTo(0, CY - LW * 2);
        g.lineTo(SCENE.WIDTH, CY - LW * 2);
        g.moveTo(0, CY + LW * 2);
        g.lineTo(SCENE.WIDTH, CY + LW * 2);
        g.moveTo(CX - LW * 2, 0);
        g.lineTo(CX - LW * 2, SCENE.HEIGHT);
        g.moveTo(CX + LW * 2, 0);
        g.lineTo(CX + LW * 2, SCENE.HEIGHT);

        // Стоп-линии
        g.lineStyle(4, 0xffffff, 1);
        const stopOffset = LW * 2.5;
        // Север
        g.moveTo(CX - LW * 2, CY - stopOffset);
        g.lineTo(CX + LW * 2, CY - stopOffset);
        // Юг
        g.moveTo(CX - LW * 2, CY + stopOffset);
        g.lineTo(CX + LW * 2, CY + stopOffset);
        // Запад
        g.moveTo(CX - stopOffset, CY - LW * 2);
        g.lineTo(CX - stopOffset, CY + LW * 2);
        // Восток
        g.moveTo(CX + stopOffset, CY - LW * 2);
        g.lineTo(CX + stopOffset, CY + LW * 2);

        const texture = this.renderer.generateTexture(g);
        Texture.addToCache(texture, 'road-texture');
        g.destroy();
    }

    private generateArrowTextures(): void {
        const arrows: Record<string, number[][][]> = {
            'straight': [[[-8, 12], [8, 12], [0, -10]]],
            'left': [[[12, -8], [12, 8], [-10, 0]]],
            'right': [[[-12, -8], [-12, 8], [10, 0]]],
            'straight-left': [[[-8, 12], [0, 12], [0, -10]], [[12, -8], [12, 0], [-10, 0]]],
            'straight-right': [[[0, 12], [8, 12], [0, -10]], [[-12, -8], [-12, 0], [10, 0]]],
            'all': [[[-8, 12], [8, 12], [0, -10]], [[12, -8], [12, 8], [-10, 0]], [[-12, -8], [-12, 8], [10, 0]]],
        };

        for (const [name, polys] of Object.entries(arrows)) {
            const g = new Graphics();

            g.beginFill(0x1a1a2e);
            g.drawCircle(0, 0, 18);
            g.endFill();

            g.beginFill(0x00d2ff);
            polys.forEach(poly => g.drawPolygon(poly.flat()));
            g.endFill();

            const texture = this.renderer.generateTexture(g);
            Texture.addToCache(texture, `arrow-${name}`);
            g.destroy();
        }
    }

    private generateTrafficLightTextures(): void {
        const colors: Record<string, number> = { red: 0xff0000, yellow: 0xffff00, green: 0x00ff00 };

        for (const state of ['red', 'yellow', 'green']) {
            const g = new Graphics();

            g.beginFill(0x222222);
            g.drawRoundedRect(-35, -18, 70, 36, 6);
            g.endFill();

            ['red', 'yellow', 'green'].forEach((s, i) => {
                g.beginFill(s === state ? colors[s] : 0x333333);
                g.drawCircle(-24 + i * 24, 0, 8);
                g.endFill();
            });

            const texture = this.renderer.generateTexture(g);
            Texture.addToCache(texture, `traffic-light-${state}`);
            g.destroy();
        }
    }
}