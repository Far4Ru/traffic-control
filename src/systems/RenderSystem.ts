import { World } from '../ecs/World';
import { System } from '../ecs/System';
import { Application, Sprite, Graphics, Text, Container, Texture, TextStyle } from 'pixi.js';

export class RenderSystem extends System {
  private app: Application;
  private container: Container;
  private spriteMap: Map<string, Sprite> = new Map();
  
  constructor(app: Application) {
    super();
    this.app = app;
    this.container = new Container();
    this.app.stage.addChild(this.container);
  }
  
  update(world: World, _deltaTime: number) {
    this.container.removeChildren();
    
    const roads = world.getEntitiesWithComponent('sprite').filter(e => {
      const sprite = e.getComponent('sprite');
      return sprite && sprite.texture?.includes('road');
    });
    for (const road of roads) {
      this.renderEntity(road);
    }
    
    const lanes = world.getEntitiesWithComponent('lane');
    for (const lane of lanes) {
      this.renderLaneArrow(lane);
      this.renderSpeedLimit(lane);
    }
    
    const lights = world.getEntitiesWithComponent('trafficLight');
    for (const light of lights) {
      this.renderTrafficLight(light);
    }
    
    const vehicles = world.getEntitiesWithComponent('vehicle');
    for (const vehicle of vehicles) {
      this.renderEntity(vehicle);
    }
  }
  
  private renderEntity(entity: any) {
    const transform = entity.getComponent('transform');
    const spriteComp = entity.getComponent('sprite');
    
    if (!transform || !spriteComp) return;
    
    let sprite: Sprite;
    
    if (this.spriteMap.has(entity.id)) {
      sprite = this.spriteMap.get(entity.id)!;
    } else {
      const texture = Texture.from(spriteComp.texture);
      sprite = new Sprite(texture);
      this.spriteMap.set(entity.id, sprite);
    }
    
    sprite.x = transform.x;
    sprite.y = transform.y;
    sprite.rotation = transform.rotation;
    sprite.width = spriteComp.width;
    sprite.height = spriteComp.height;
    sprite.anchor.set(0.5);
    
    this.container.addChild(sprite);
  }
  
  private renderTrafficLight(light: any) {
    const transform = light.getComponent('transform');
    const lightComp = light.getComponent('trafficLight');
    const spriteComp = light.getComponent('sprite');
    
    if (!transform || !lightComp) return;
    
    if (spriteComp) {
      spriteComp.texture = `traffic-light-${lightComp.state}`;
    }
    
    const container = new Graphics();
    
    container.beginFill(0x333333);
    container.drawRoundedRect(-24, -12, 48, 24, 4);
    container.endFill();
    
    const colors: Record<string, number> = {
      red: 0xff0000,
      yellow: 0xffff00,
      green: 0x00ff00
    };
    
    const activeColor = lightComp.state as string;
    const positions = [-16, 0, 16];
    
    positions.forEach((x, i) => {
      const state = ['red', 'yellow', 'green'][i];
      const color = state === activeColor ? colors[state] : 0x444444;
      
      container.beginFill(color);
      container.drawCircle(x, 0, 5);
      container.endFill();
    });
    
    container.x = transform.x;
    container.y = transform.y;
    
    this.container.addChild(container);
  }
  
  private renderLaneArrow(lane: any) {
    const transform = lane.getComponent('transform');
    const laneComp = lane.getComponent('lane');
    
    if (!transform || !laneComp) return;
    
    const texture = Texture.from(`arrow-${laneComp.arrowType}`);
    const sprite = new Sprite(texture);
    
    sprite.x = transform.x;
    sprite.y = transform.y - 20;
    sprite.width = 24;
    sprite.height = 24;
    sprite.anchor.set(0.5);
    
    this.container.addChild(sprite);
  }
  
  private renderSpeedLimit(lane: any) {
    const transform = lane.getComponent('transform');
    const laneComp = lane.getComponent('lane');
    
    if (!transform || !laneComp) return;
    
    const style = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0xffffff,
      align: 'center'
    });
    
    const text = new Text(`${Math.round(laneComp.speedLimit * 10)}`, style);
    
    text.x = transform.x;
    text.y = transform.y + 20;
    text.anchor.set(0.5);
    
    this.container.addChild(text);
  }
}