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

            // Кузов
            g.beginFill(color);
            g.drawRoundedRect(-14, -21, 28, 42, 6);
            g.endFill();

            // Окна
            g.beginFill(0x222222);
            g.drawRect(-10, -14, 5, 10);
            g.drawRect(5, -14, 5, 10);
            g.drawRect(-10, 4, 5, 10);
            g.drawRect(5, 4, 5, 10);
            g.endFill();

            // Фары
            g.beginFill(0xffdd00);
            g.drawRect(-12, 19, 3, 3);
            g.drawRect(9, 19, 3, 3);
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
        // Горизонтальная дорога (запад-восток)
        g.drawRect(0, CY - LW * 2, SCENE.WIDTH, LW * 4);
        // Вертикальная дорога (север-юг)
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
        for (let i = 0; i < SCENE.WIDTH; i += 40) {
            g.moveTo(i, CY - LW);
            g.lineTo(i + 20, CY - LW);
            g.moveTo(i, CY + LW);
            g.lineTo(i + 20, CY + LW);
        }

        // Вертикальные разделители
        for (let i = 0; i < SCENE.HEIGHT; i += 40) {
            g.moveTo(CX - LW, i);
            g.lineTo(CX - LW, i + 20);
            g.moveTo(CX + LW, i);
            g.lineTo(CX + LW, i + 20);
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
        const stopOffset = LW * 2.2;
        // Север (перед перекрестком снизу)
        g.moveTo(CX - LW * 2, CY - stopOffset);
        g.lineTo(CX + LW * 2, CY - stopOffset);
        // Юг (перед перекрестком сверху)
        g.moveTo(CX - LW * 2, CY + stopOffset);
        g.lineTo(CX + LW * 2, CY + stopOffset);
        // Запад (перед перекрестком справа)
        g.moveTo(CX - stopOffset, CY - LW * 2);
        g.lineTo(CX - stopOffset, CY + LW * 2);
        // Восток (перед перекрестком слева)
        g.moveTo(CX + stopOffset, CY - LW * 2);
        g.lineTo(CX + stopOffset, CY + LW * 2);

        const texture = this.renderer.generateTexture(g);
        Texture.addToCache(texture, 'road-texture');
        g.destroy();
    }

    private generateArrowTextures(): void {
        // Создаем только стрелку прямо (направление вправо, потом повернем через rotation)
        const g = new Graphics();

        g.beginFill(0x1a1a2e);
        g.drawCircle(0, 0, 14);
        g.endFill();

        g.beginFill(0x00d2ff);
        // Стрелка, указывающая вправо (0 градусов)
        g.moveTo(-10, -5);
        g.lineTo(0, -5);
        g.lineTo(0, -10);
        g.lineTo(12, 0);
        g.lineTo(0, 10);
        g.lineTo(0, 5);
        g.lineTo(-10, 5);
        g.lineTo(-10, -5);
        g.endFill();

        const texture = this.renderer.generateTexture(g);
        Texture.addToCache(texture, `arrow-straight`);
        g.destroy();
    }

    private generateTrafficLightTextures(): void {
        const colors: Record<string, number> = { red: 0xff0000, yellow: 0xffff00, green: 0x00ff00 };

        for (const state of ['red', 'yellow', 'green']) {
            const g = new Graphics();

            g.beginFill(0x222222);
            g.drawRoundedRect(-30, -15, 60, 30, 5);
            g.endFill();

            ['red', 'yellow', 'green'].forEach((s, i) => {
                g.beginFill(s === state ? colors[s] : 0x333333);
                g.drawCircle(-20 + i * 20, 0, 7);
                g.endFill();
            });

            const texture = this.renderer.generateTexture(g);
            Texture.addToCache(texture, `traffic-light-${state}`);
            g.destroy();
        }
    }
}