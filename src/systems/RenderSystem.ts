import { World, System, Entity } from '../core/ecs';
import { Application, Sprite, Graphics, Text, Container, Texture } from 'pixi.js';
import { TransformComponent, SpriteComponent, TrafficLightComponent, LaneComponent } from '../components';

interface SpeedSignComponent {
  type: string;
  speed: number;
}

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

    // Рендерим дорогу
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

    // Рендерим знаки скорости
    const allEntities = world.getEntitiesWithComponent('transform');
    allEntities.forEach(entity => {
      const speedSign = entity.getComponent<SpeedSignComponent>('speedSign');
      const transform = entity.getComponent<TransformComponent>('transform');
      if (speedSign && transform) {
        this.renderSpeedSign(transform, speedSign.speed);
      }
    });

    // Рендерим светофоры
    const lights = world.getEntitiesWithComponent('trafficLight');
    lights.forEach(light => {
      const lightComp = light.getComponent<TrafficLightComponent>('trafficLight');
      const transform = light.getComponent<TransformComponent>('transform');
      const sprite = light.getComponent<SpriteComponent>('sprite');

      if (!lightComp || !transform) return;

      if (sprite) {
        sprite.texture = `traffic-light-${lightComp.state}`;
        this.renderSprite(light);
      }
    });

    // Рендерим машины
    const vehicles = world.getEntitiesWithComponent('vehicle');
    vehicles.forEach(vehicle => this.renderSprite(vehicle));
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
    bg.drawCircle(0, 0, 16);
    bg.endFill();
    bg.beginFill(0xff0000);
    bg.drawCircle(0, 0, 13);
    bg.endFill();
    bg.x = transform.position.x;
    bg.y = transform.position.y;
    this.container.addChild(bg);

    const text = new Text(`${Math.round(speed * 10)}`, {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0xffffff,
      align: 'center',
      fontWeight: 'bold'
    } as any);

    text.x = transform.position.x;
    text.y = transform.position.y;
    text.anchor.set(0.5);

    this.container.addChild(text);
  }
}