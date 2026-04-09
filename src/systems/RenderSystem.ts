import { World, System, Entity } from '../core/ecs';
import { Application, Sprite, Graphics, Text, Container, Texture } from 'pixi.js';
import { TransformComponent, SpriteComponent, TrafficLightComponent } from '../components';
import { SpeedSignComponent } from '../components/SpeedSignComponent';

export class RenderSystem extends System {
  private container: Container;
  private spriteCache: Map<string, Sprite> = new Map();

  constructor(private app: Application) {
    super(100);
    this.container = new Container();
  }

  onAttach(): void {
    this.app.stage.addChild(this.container);
  }

  update(world: World, _deltaTime: number): void {
    this.container.removeChildren();

    const allSprites = world.getEntitiesWithComponent('sprite');

    // Рендерим дорогу первой
    allSprites.forEach(entity => {
      const spriteComp = entity.getComponent<SpriteComponent>('sprite');
      if (spriteComp?.texture.includes('road')) {
        this.renderSprite(entity);
      }
    });

    // Рендерим стрелки
    allSprites.forEach(entity => {
      const spriteComp = entity.getComponent<SpriteComponent>('sprite');
      if (spriteComp?.texture.includes('arrow')) {
        this.renderSprite(entity);
      }
    });

    // Рендерим знаки скорости (исправлено)
    const allEntities = world.getEntitiesWithComponent('transform');
    for (const entity of allEntities) {
      const speedSign = entity.getComponent<SpeedSignComponent>('speedSign');
      const transform = entity.getComponent<TransformComponent>('transform');
      if (speedSign && transform) {
        this.renderSpeedSign(transform, speedSign.speed);
      }
    }

    // Рендерим машины последними
    const vehicles = world.getEntitiesWithComponent('vehicle');
    for (const vehicle of vehicles) {
      this.renderSprite(vehicle);
    }

    // Рендерим светофоры
    const lights = world.getEntitiesWithComponent('trafficLight');
    for (const light of lights) {
      const lightComp = light.getComponent<TrafficLightComponent>('trafficLight');
      const transform = light.getComponent<TransformComponent>('transform');
      const sprite = light.getComponent<SpriteComponent>('sprite');

      if (!lightComp || !transform) continue;

      if (sprite) {
        sprite.texture = `traffic-light-${lightComp.state}`;
        this.renderSprite(light);
      } else {
        this.renderTrafficLightLight(transform, lightComp);
      }
    }
  }

  private renderSprite(entity: Entity): void {
    const transform = entity.getComponent<TransformComponent>('transform');
    const spriteComp = entity.getComponent<SpriteComponent>('sprite');

    if (!transform || !spriteComp || !spriteComp.visible) return;

    let sprite = this.spriteCache.get(entity.id);

    if (!sprite) {
      const texture = Texture.from(spriteComp.texture);
      sprite = new Sprite(texture);
      sprite.anchor.set(0.5);
      this.spriteCache.set(entity.id, sprite);
    } else if (sprite.texture !== Texture.from(spriteComp.texture)) {
      sprite.texture = Texture.from(spriteComp.texture);
    }

    sprite.x = transform.position.x;
    sprite.y = transform.position.y;
    sprite.rotation = transform.rotation;
    sprite.width = spriteComp.width;
    sprite.height = spriteComp.height;

    this.container.addChild(sprite);
  }

  private renderSpeedSign(transform: TransformComponent, speed: number): void {
    const bg = new Graphics();
    bg.beginFill(0xffffff);
    bg.drawCircle(0, 0, 14);
    bg.endFill();
    bg.beginFill(0xff0000);
    bg.drawCircle(0, 0, 11);
    bg.endFill();
    bg.beginFill(0xffffff);
    bg.drawCircle(0, 0, 9);
    bg.endFill();
    bg.x = transform.position.x;
    bg.y = transform.position.y;
    this.container.addChild(bg);

    const speedValue = Math.round(speed * 10);
    const text = new Text(`${speedValue}`, {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0x000000,
      align: 'center',
      fontWeight: 'bold'
    });

    text.x = transform.position.x;
    text.y = transform.position.y;
    text.anchor.set(0.5);
    this.container.addChild(text);
  }

  private renderTrafficLightLight(transform: TransformComponent, lightComp: TrafficLightComponent): void {
    const g = new Graphics();

    // Корпус светофора
    g.beginFill(0x333333);
    g.drawRoundedRect(-12, -30, 24, 60, 4);
    g.endFill();

    // Лампы
    const colors = { red: 0xff0000, yellow: 0xffaa00, green: 0x00ff00 };
    const states = ['red', 'yellow', 'green'];

    states.forEach((state, i) => {
      const isActive = lightComp.state === state;
      g.beginFill(isActive ? colors[state as keyof typeof colors] : 0x441111);
      g.drawCircle(0, -18 + i * 18, 6);
      g.endFill();
    });

    g.x = transform.position.x;
    g.y = transform.position.y;
    g.rotation = transform.rotation;

    this.container.addChild(g);
  }
}