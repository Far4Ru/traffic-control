import { Application, Graphics, Texture } from 'pixi.js';
import { World } from './ecs/World';
import { RenderSystem } from './systems/RenderSystem';
import { VehicleMovementSystem } from './systems/VehicleMovementSystem';
import { TrafficLightSystem } from './systems/TrafficLightSystem';
import { CollisionSystem } from './systems/CollisionSystem';
import { RAGControlSystem } from './systems/RAGControlSystem';
import { RAGEngine } from './rag/RAGEngine';
import { ControlPanel } from './ui/ControlPanel';

class TrafficIntersection {
  private app: Application;
  private world: World;
  private ragEngine: RAGEngine;
  private controlPanel: ControlPanel;

  constructor() {
    const canvas = document.getElementById('scene-canvas') as HTMLCanvasElement;
    
    this.app = new Application({
      view: canvas,
      width: 1280,
      height: 1024,
      backgroundColor: 0x1a1a2e,
      antialias: true
    });

    this.world = new World();
    this.ragEngine = new RAGEngine();
    this.controlPanel = new ControlPanel(this.ragEngine, this.world);
    
    this.initialize();
  }

  private async initialize() {
    await this.loadAssets();
    this.setupECS();
    this.setupIntersection();
    this.startGameLoop();
  }

  private async loadAssets() {
    this.createFallbackTextures();
  }

  private createFallbackTextures() {
    const graphics = new Graphics();
    
    // Car texture - red
    graphics.clear();
    graphics.beginFill(0xff3333);
    graphics.drawRoundedRect(0, 0, 32, 48, 8);
    graphics.endFill();
    graphics.beginFill(0x333333);
    graphics.drawRect(4, 8, 6, 12);
    graphics.drawRect(22, 8, 6, 12);
    graphics.drawRect(4, 28, 6, 12);
    graphics.drawRect(22, 28, 6, 12);
    graphics.endFill();
    let texture = this.app.renderer.generateTexture(graphics);
    Texture.addToCache(texture, 'car-red');
    
    // Car texture - blue
    graphics.clear();
    graphics.beginFill(0x3366ff);
    graphics.drawRoundedRect(0, 0, 32, 48, 8);
    graphics.endFill();
    graphics.beginFill(0x222222);
    graphics.drawRect(4, 8, 6, 12);
    graphics.drawRect(22, 8, 6, 12);
    graphics.drawRect(4, 28, 6, 12);
    graphics.drawRect(22, 28, 6, 12);
    graphics.endFill();
    texture = this.app.renderer.generateTexture(graphics);
    Texture.addToCache(texture, 'car-blue');
    
    // Car texture - green
    graphics.clear();
    graphics.beginFill(0x33cc33);
    graphics.drawRoundedRect(0, 0, 32, 48, 8);
    graphics.endFill();
    graphics.beginFill(0x222222);
    graphics.drawRect(4, 8, 6, 12);
    graphics.drawRect(22, 8, 6, 12);
    graphics.drawRect(4, 28, 6, 12);
    graphics.drawRect(22, 28, 6, 12);
    graphics.endFill();
    texture = this.app.renderer.generateTexture(graphics);
    Texture.addToCache(texture, 'car-green');
    
    // Car texture - yellow
    graphics.clear();
    graphics.beginFill(0xffcc00);
    graphics.drawRoundedRect(0, 0, 32, 48, 8);
    graphics.endFill();
    graphics.beginFill(0x222222);
    graphics.drawRect(4, 8, 6, 12);
    graphics.drawRect(22, 8, 6, 12);
    graphics.drawRect(4, 28, 6, 12);
    graphics.drawRect(22, 28, 6, 12);
    graphics.endFill();
    texture = this.app.renderer.generateTexture(graphics);
    Texture.addToCache(texture, 'car-yellow');
    
    // Road horizontal
    graphics.clear();
    graphics.beginFill(0x444444);
    graphics.drawRect(0, 0, 1280, 128);
    graphics.endFill();
    // Center line
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.moveTo(0, 64);
    graphics.lineTo(1280, 64);
    // Lane dividers
    graphics.lineStyle(1, 0xffffff, 1);
    for (let i = 0; i < 1280; i += 40) {
      graphics.moveTo(i, 32);
      graphics.lineTo(i + 20, 32);
      graphics.moveTo(i, 96);
      graphics.lineTo(i + 20, 96);
    }
    texture = this.app.renderer.generateTexture(graphics);
    Texture.addToCache(texture, 'road-horizontal');
    
    // Road vertical
    graphics.clear();
    graphics.beginFill(0x444444);
    graphics.drawRect(0, 0, 128, 1024);
    graphics.endFill();
    // Center line
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.moveTo(64, 0);
    graphics.lineTo(64, 1024);
    // Lane dividers
    graphics.lineStyle(1, 0xffffff, 1);
    for (let i = 0; i < 1024; i += 40) {
      graphics.moveTo(32, i);
      graphics.lineTo(32, i + 20);
      graphics.moveTo(96, i);
      graphics.lineTo(96, i + 20);
    }
    texture = this.app.renderer.generateTexture(graphics);
    Texture.addToCache(texture, 'road-vertical');
    
    // Arrow textures
    const arrows = ['straight', 'left', 'right', 'straight-left', 'straight-right', 'all', 'u-turn', 'stop'];
    arrows.forEach(arrow => {
      graphics.clear();
      graphics.beginFill(0x1a1a2e);
      graphics.drawCircle(16, 16, 16);
      graphics.endFill();
      graphics.beginFill(0x00d2ff);
      
      if (arrow === 'straight') {
        graphics.drawPolygon([8, 22, 24, 22, 16, 8]);
      } else if (arrow === 'left') {
        graphics.drawPolygon([22, 8, 22, 24, 8, 16]);
      } else if (arrow === 'right') {
        graphics.drawPolygon([10, 8, 10, 24, 24, 16]);
      } else if (arrow === 'straight-left') {
        graphics.drawPolygon([8, 22, 16, 22, 16, 8]);
        graphics.drawPolygon([22, 8, 22, 16, 8, 16]);
      } else if (arrow === 'straight-right') {
        graphics.drawPolygon([16, 22, 24, 22, 16, 8]);
        graphics.drawPolygon([10, 8, 10, 16, 24, 16]);
      } else if (arrow === 'all') {
        graphics.drawPolygon([8, 22, 24, 22, 16, 8]);
        graphics.drawPolygon([22, 8, 22, 24, 8, 16]);
        graphics.drawPolygon([10, 8, 10, 24, 24, 16]);
      } else if (arrow === 'u-turn') {
        graphics.moveTo(10, 20);
        graphics.quadraticCurveTo(10, 8, 16, 8);
        graphics.quadraticCurveTo(22, 8, 22, 20);
        graphics.drawPolygon([18, 18, 22, 20, 18, 22]);
      } else if (arrow === 'stop') {
        graphics.drawRect(8, 8, 16, 16);
      }
      
      graphics.endFill();
      texture = this.app.renderer.generateTexture(graphics);
      Texture.addToCache(texture, `arrow-${arrow}`);
    });
    
    // Traffic light textures
    const lightStates = ['red', 'yellow', 'green'];
    lightStates.forEach(state => {
      graphics.clear();
      graphics.beginFill(0x333333);
      graphics.drawRoundedRect(0, 0, 48, 24, 4);
      graphics.endFill();
      
      const colors: Record<string, number> = {
        red: 0xff0000,
        yellow: 0xffff00,
        green: 0x00ff00
      };
      
      const positions = [8, 24, 40];
      const states = ['red', 'yellow', 'green'];
      
      positions.forEach((x, i) => {
        graphics.beginFill(states[i] === state ? colors[states[i]] : 0x222222);
        graphics.drawCircle(x, 12, 6);
        graphics.endFill();
      });
      
      texture = this.app.renderer.generateTexture(graphics);
      Texture.addToCache(texture, `traffic-light-${state}`);
    });
  }

  private setupECS() {
    this.world.registerSystem(new RenderSystem(this.app));
    this.world.registerSystem(new TrafficLightSystem());
    this.world.registerSystem(new VehicleMovementSystem());
    this.world.registerSystem(new CollisionSystem());
    this.world.registerSystem(new RAGControlSystem(this.ragEngine));
  }

  private setupIntersection() {
    this.createRoads();
    this.createLanes();
    this.createTrafficLights();
    this.spawnInitialVehicles();
  }

  private createRoads() {
    const horizontalRoad = this.world.createEntity();
    horizontalRoad.addComponent('transform', {
      x: 640, y: 512, rotation: 0, scale: { x: 1, y: 1 }
    });
    horizontalRoad.addComponent('sprite', {
      texture: 'road-horizontal',
      width: 1280,
      height: 128
    });

    const verticalRoad = this.world.createEntity();
    verticalRoad.addComponent('transform', {
      x: 640, y: 512, rotation: 0, scale: { x: 1, y: 1 }
    });
    verticalRoad.addComponent('sprite', {
      texture: 'road-vertical',
      width: 128,
      height: 1024
    });
  }

  private createLanes() {
    const directions = ['north', 'south', 'east', 'west'] as const;
    const laneWidth = 32;
    const roadWidth = laneWidth * 2;
    
    directions.forEach(dir => {
      for (let i = 0; i < 2; i++) {
        const lane = this.world.createEntity();
        const isEntry = i === 0;
        
        let x = 640, y = 512, rotation = 0;
        
        if (dir === 'north') {
          x = 640 + (i * 2 - 1) * laneWidth;
          y = 512 - roadWidth;
          rotation = 0;
        } else if (dir === 'south') {
          x = 640 + (i * 2 - 1) * laneWidth;
          y = 512 + roadWidth;
          rotation = Math.PI;
        } else if (dir === 'east') {
          x = 640 + roadWidth;
          y = 512 + (i * 2 - 1) * laneWidth;
          rotation = Math.PI / 2;
        } else if (dir === 'west') {
          x = 640 - roadWidth;
          y = 512 + (i * 2 - 1) * laneWidth;
          rotation = -Math.PI / 2;
        }

        lane.addComponent('transform', { x, y, rotation, scale: { x: 1, y: 1 } });
        lane.addComponent('lane', {
          direction: dir,
          isEntry,
          speedLimit: 2 + Math.random() * 2,
          arrowType: this.getRandomArrowType(),
          vehicles: []
        });
      }
    });
  }

  private getRandomArrowType(): string {
    const types = ['straight', 'left', 'right', 'straight-left', 'straight-right', 'all', 'u-turn'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private createTrafficLights() {
    const positions = [
      { x: 640 - 80, y: 512 - 40 }, // West
      { x: 640 + 80, y: 512 - 40 }, // East
      { x: 640 - 40, y: 512 - 80 }, // North
      { x: 640 - 40, y: 512 + 80 }  // South
    ];

    positions.forEach((pos, index) => {
      const light = this.world.createEntity();
      light.addComponent('transform', {
        x: pos.x, y: pos.y, rotation: 0, scale: { x: 1, y: 1 }
      });
      light.addComponent('trafficLight', {
        state: 'red',
        timer: 0,
        phase: index,
        greenDuration: 5000,
        yellowDuration: 2000,
        redDuration: 15000,
        enabled: true
      });
      light.addComponent('sprite', {
        texture: 'traffic-light-red',
        width: 48,
        height: 24
      });
    });
  }

  private spawnInitialVehicles() {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => this.spawnVehicle(), i * 1000);
    }
  }

  private spawnVehicle() {
    const lanes = this.world.getEntitiesWithComponent('lane');
    const entryLanes = lanes.filter(e => {
      const laneComp = e.getComponent('lane');
      return laneComp && laneComp.isEntry;
    });
    
    if (entryLanes.length === 0) return;
    
    const lane = entryLanes[Math.floor(Math.random() * entryLanes.length)];
    const laneComp = lane.getComponent('lane');
    const transform = lane.getComponent('transform');
    
    if (!laneComp || !transform) return;
    
    const vehicle = this.world.createEntity();
    const colors = ['red', 'blue', 'green', 'yellow'] as const;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    vehicle.addComponent('transform', {
      x: transform.x,
      y: transform.y,
      rotation: transform.rotation,
      scale: { x: 1, y: 1 }
    });
    
    vehicle.addComponent('vehicle', {
      speed: 1 + Math.random() * 2,
      maxSpeed: laneComp.speedLimit,
      acceleration: 0.1,
      braking: 0.3,
      targetSpeed: laneComp.speedLimit,
      lane: lane.id,
      color,
      state: 'moving',
      intendedAction: this.getActionFromArrow(laneComp.arrowType)
    });
    
    vehicle.addComponent('sprite', {
      texture: `car-${color}`,
      width: 28,
      height: 42
    });
    
    vehicle.addComponent('collision', {
      radius: 20,
      colliding: false,
      stopped: false
    });
    
    laneComp.vehicles.push(vehicle.id);
  }

  private getActionFromArrow(arrowType: string): string {
    const actions = ['straight', 'left', 'right', 'u-turn'];
    if (arrowType === 'all') {
      return actions[Math.floor(Math.random() * actions.length)];
    }
    if (arrowType.includes('-')) {
      const options = arrowType.split('-');
      return options[Math.floor(Math.random() * options.length)];
    }
    return arrowType;
  }

  private startGameLoop() {
    this.app.ticker.add((deltaTime: number) => {
      this.world.update(deltaTime);
      this.controlPanel.update();
    });
  }
}

// Start application
new TrafficIntersection();