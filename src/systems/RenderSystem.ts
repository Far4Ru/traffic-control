import { World, System, Entity } from '../core/ecs';
import { Application, Sprite, Graphics, Text, Container, Texture } from 'pixi.js';
import { TransformComponent, SpriteComponent, TrafficLightComponent, LaneComponent } from '../components';

export class RenderSystem extends System {
  private container: Container;
  private spriteCache: Map<string, Sprite> = new Map();

  constructor(private app: Application) {
    super(100);
    this.container = new Container();
  }

  onAttach(): void {
    this.app.stage.addChild(this.container);
    console.log('RenderSystem attached to stage');
  }

  update(world: World, _deltaTime: number): void {
    this.container.removeChildren();

    const allSprites = world.getEntitiesWithComponent('sprite');
    console.log('Sprites to render:', allSprites.length);

    // Рендерим все спрайты
    allSprites.forEach(entity => {
      const spriteComp = entity.getComponent<SpriteComponent>('sprite');
      const transform = entity.getComponent<TransformComponent>('transform');

      if (spriteComp && transform) {
        console.log('Rendering sprite:', spriteComp.texture, 'at', transform.position.x, transform.position.y);
      }

      this.renderSprite(entity);
    });

    // Рендерим светофоры без спрайтов
    const lights = world.getEntitiesWithComponent('trafficLight');
    lights.forEach(light => {
      const lightComp = light.getComponent<TrafficLightComponent>('trafficLight');
      const transform = light.getComponent<TransformComponent>('transform');
      const sprite = light.getComponent<SpriteComponent>('sprite');

      if (!lightComp || !transform) return;

      if (!sprite) {
        this.renderTrafficLightGraphics(transform, lightComp);
      }
    });

    // Рендерим ограничения скорости
    const lanes = world.getEntitiesWithComponent('lane');
    lanes.forEach(lane => {
      const laneComp = lane.getComponent<LaneComponent>('lane');
      const transform = lane.getComponent<TransformComponent>('transform');
      if (laneComp && transform) {
        this.renderSpeedLimit(transform, laneComp);
      }
    });

    console.log('Total children rendered:', this.container.children.length);
  }

  private renderSprite(entity: Entity): void {
    const transform = entity.getComponent<TransformComponent>('transform');
    const spriteComp = entity.getComponent<SpriteComponent>('sprite');

    if (!transform || !spriteComp || !spriteComp.visible) {
      console.log('Skipping sprite - missing transform or not visible');
      return;
    }

    let sprite = this.spriteCache.get(entity.id);

    if (!sprite) {
      console.log('Creating new sprite for texture:', spriteComp.texture);
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

  private renderTrafficLightGraphics(transform: TransformComponent, lightComp: TrafficLightComponent): void {
    const g = new Graphics();

    g.beginFill(0x333333);
    g.drawRoundedRect(-25, -12, 50, 24, 4);
    g.endFill();

    const colors: Record<string, number> = {
      red: 0xff0000,
      yellow: 0xffff00,
      green: 0x00ff00
    };

    [-16, 0, 16].forEach((x, i) => {
      const state = ['red', 'yellow', 'green'][i];
      const color = state === lightComp.state ? colors[state] : 0x444444;

      g.beginFill(color);
      g.drawCircle(x, 0, 6);
      g.endFill();
    });

    g.x = transform.position.x;
    g.y = transform.position.y;
    g.rotation = transform.rotation;

    this.container.addChild(g);
  }

  private renderSpeedLimit(transform: TransformComponent, laneComp: LaneComponent): void {
    const text = new Text(`${Math.round(laneComp.speedLimit * 10)}`, {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0xffffff,
      align: 'center'
    });

    text.x = transform.position.x;
    text.y = transform.position.y + 20;
    text.anchor.set(0.5);

    this.container.addChild(text);
  }
}