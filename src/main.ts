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
      backgroundColor: 0x2d5016,
      antialias: true
    });

    this.world = new World();
    this.ragEngine = new RAGEngine();
    this.controlPanel = new ControlPanel(this.ragEngine, this.world);
    
    this.initialize();
  }

  private async initialize() {
    this.createFallbackTextures();
    this.setupECS();
    this.setupIntersection();
    this.startGameLoop();
  }

  private createFallbackTextures() {
    const g = new Graphics();
    
    // Машины
    const carColors = { red: 0xff3333, blue: 0x3366ff, green: 0x33cc33, yellow: 0xffcc00 };
    for (const [name, color] of Object.entries(carColors)) {
      g.clear();
      g.beginFill(color);
      g.drawRoundedRect(-16, -24, 32, 48, 8);
      g.endFill();
      g.beginFill(0x222222);
      g.drawRect(-12, -16, 6, 12);
      g.drawRect(6, -16, 6, 12);
      g.drawRect(-12, 4, 6, 12);
      g.drawRect(6, 4, 6, 12);
      g.endFill();
      // Фары
      g.beginFill(0xffdd00);
      g.drawRect(-14, 22, 4, 4);
      g.drawRect(10, 22, 4, 4);
      g.endFill();
      const texture = this.app.renderer.generateTexture(g);
      Texture.addToCache(texture, `car-${name}`);
    }

    // Создаем текстуру дороги
    this.createRoadTexture();
    
    // Стрелки
    const arrows: Record<string, number[][][]> = {
      'straight': [[[-8, 10], [8, 10], [0, -10]]],
      'left': [[[10, -8], [10, 8], [-10, 0]]],
      'right': [[[-10, -8], [-10, 8], [10, 0]]],
      'straight-left': [[[-8, 10], [0, 10], [0, -10]], [[10, -8], [10, 0], [-10, 0]]],
      'straight-right': [[[0, 10], [8, 10], [0, -10]], [[-10, -8], [-10, 0], [10, 0]]],
      'all': [[[-8, 10], [8, 10], [0, -10]], [[10, -8], [10, 8], [-10, 0]], [[-10, -8], [-10, 8], [10, 0]]],
    };
    
    for (const [name, polys] of Object.entries(arrows)) {
      g.clear();
      g.beginFill(0x1a1a2e);
      g.drawCircle(0, 0, 16);
      g.endFill();
      g.beginFill(0xffffff);
      for (const poly of polys) {
        g.drawPolygon(poly.flat());
      }
      g.endFill();
      const texture = this.app.renderer.generateTexture(g);
      Texture.addToCache(texture, `arrow-${name}`);
    }

    // Светофоры
    for (const state of ['red', 'yellow', 'green']) {
      g.clear();
      g.beginFill(0x222222);
      g.drawRoundedRect(-30, -15, 60, 30, 5);
      g.endFill();
      const colors: Record<string, number> = { red: 0xff0000, yellow: 0xffff00, green: 0x00ff00 };
      for (let i = 0; i < 3; i++) {
        const s = ['red', 'yellow', 'green'][i];
        g.beginFill(s === state ? colors[s] : 0x444444);
        g.drawCircle(-20 + i * 20, 0, 7);
        g.endFill();
      }
      const texture = this.app.renderer.generateTexture(g);
      Texture.addToCache(texture, `traffic-light-${state}`);
    }
  }

  private createRoadTexture() {
    const g = new Graphics();
    const laneWidth = 32;
    
    // Фон
    g.beginFill(0x555555);
    g.drawRect(0, 0, 1280, 1024);
    g.endFill();
    
    // Горизонтальная дорога (4 полосы)
    g.beginFill(0x444444);
    g.drawRect(0, 512 - laneWidth * 2, 1280, laneWidth * 4);
    g.endFill();
    
    // Вертикальная дорога (4 полосы)
    g.beginFill(0x444444);
    g.drawRect(640 - laneWidth * 2, 0, laneWidth * 4, 1024);
    g.endFill();
    
    // Разметка горизонтальной дороги
    g.lineStyle(2, 0xffffff, 1);
    // Центральная линия
    g.moveTo(0, 512);
    g.lineTo(1280, 512);
    
    // Линии полос
    g.lineStyle(1, 0xffffff, 0.6);
    g.moveTo(0, 512 - laneWidth);
    g.lineTo(1280, 512 - laneWidth);
    g.moveTo(0, 512 + laneWidth);
    g.lineTo(1280, 512 + laneWidth);
    
    // Прерывистые линии
    for (let i = 0; i < 1280; i += 40) {
      g.moveTo(i, 512 - laneWidth * 1.5);
      g.lineTo(i + 20, 512 - laneWidth * 1.5);
      g.moveTo(i, 512 + laneWidth * 1.5);
      g.lineTo(i + 20, 512 + laneWidth * 1.5);
    }
    
    // Разметка вертикальной дороги
    g.lineStyle(2, 0xffffff, 1);
    g.moveTo(640, 0);
    g.lineTo(640, 1024);
    
    g.lineStyle(1, 0xffffff, 0.6);
    g.moveTo(640 - laneWidth, 0);
    g.lineTo(640 - laneWidth, 1024);
    g.moveTo(640 + laneWidth, 0);
    g.lineTo(640 + laneWidth, 1024);
    
    // Прерывистые линии
    for (let i = 0; i < 1024; i += 40) {
      g.moveTo(640 - laneWidth * 1.5, i);
      g.lineTo(640 - laneWidth * 1.5, i + 20);
      g.moveTo(640 + laneWidth * 1.5, i);
      g.lineTo(640 + laneWidth * 1.5, i + 20);
    }
    
    // Стоп-линии
    g.lineStyle(3, 0xffffff, 1);
    const stopPositions = [
      [640 - laneWidth * 2.5, 512 - laneWidth * 2.5],
      [640 + laneWidth * 2.5, 512 - laneWidth * 2.5],
      [640 - laneWidth * 2.5, 512 + laneWidth * 2.5],
      [640 + laneWidth * 2.5, 512 + laneWidth * 2.5]
    ];
    
    stopPositions.forEach(([x, y]) => {
      g.moveTo(x - 20, y - 3);
      g.lineTo(x + 20, y - 3);
      g.moveTo(x - 20, y + 3);
      g.lineTo(x + 20, y + 3);
    });
    
    const texture = this.app.renderer.generateTexture(g);
    Texture.addToCache(texture, 'road-texture');
  }

  private setupECS() {
    this.world.registerSystem(new RenderSystem(this.app));
    this.world.registerSystem(new TrafficLightSystem());
    this.world.registerSystem(new VehicleMovementSystem());
    this.world.registerSystem(new CollisionSystem());
    this.world.registerSystem(new RAGControlSystem(this.ragEngine));
  }

  private setupIntersection() {
    // Фон с дорогой
    const bg = this.world.createEntity();
    bg.addComponent('transform', { x: 640, y: 512, rotation: 0, scale: { x: 1, y: 1 } });
    bg.addComponent('sprite', { texture: 'road-texture', width: 1280, height: 1024 });

    const laneWidth = 32;
    const roadStart = 200;
    const roadEnd = 824;
    
    // СЕВЕР (движение ВНИЗ - к центру)
    // Правая полоса (ближе к центру дороги)
    this.createLane(640 - laneWidth/2, roadStart, Math.PI/2, 'north', true, 'right', 'straight-right', 2.5);
    // Левая полоса (дальше от центра)
    this.createLane(640 - laneWidth*1.5, roadStart, Math.PI/2, 'north', true, 'left', 'straight-left', 2.0);
    // Выездные полосы
    this.createLane(640 + laneWidth/2, roadEnd, -Math.PI/2, 'north', false, 'right', 'straight', 2.5);
    this.createLane(640 + laneWidth*1.5, roadEnd, -Math.PI/2, 'north', false, 'left', 'straight', 2.0);
    
    // ЮГ (движение ВВЕРХ - к центру)
    // Правая полоса
    this.createLane(640 + laneWidth/2, roadEnd, -Math.PI/2, 'south', true, 'right', 'straight-right', 2.5);
    // Левая полоса
    this.createLane(640 + laneWidth*1.5, roadEnd, -Math.PI/2, 'south', true, 'left', 'straight-left', 2.0);
    // Выездные
    this.createLane(640 - laneWidth/2, roadStart, Math.PI/2, 'south', false, 'right', 'straight', 2.5);
    this.createLane(640 - laneWidth*1.5, roadStart, Math.PI/2, 'south', false, 'left', 'straight', 2.0);
    
    // ВОСТОК (движение ВЛЕВО - к центру)
    // Правая полоса (ближе к центру)
    this.createLane(roadEnd, 512 + laneWidth/2, Math.PI, 'east', true, 'right', 'straight-right', 2.5);
    // Левая полоса
    this.createLane(roadEnd, 512 + laneWidth*1.5, Math.PI, 'east', true, 'left', 'straight-left', 2.0);
    // Выездные
    this.createLane(roadStart, 512 - laneWidth/2, 0, 'east', false, 'right', 'straight', 2.5);
    this.createLane(roadStart, 512 - laneWidth*1.5, 0, 'east', false, 'left', 'straight', 2.0);
    
    // ЗАПАД (движение ВПРАВО - к центру)
    // Правая полоса
    this.createLane(roadStart, 512 - laneWidth/2, 0, 'west', true, 'right', 'straight-right', 2.5);
    // Левая полоса
    this.createLane(roadStart, 512 - laneWidth*1.5, 0, 'west', true, 'left', 'straight-left', 2.0);
    // Выездные
    this.createLane(roadEnd, 512 + laneWidth/2, Math.PI, 'west', false, 'right', 'straight', 2.5);
    this.createLane(roadEnd, 512 + laneWidth*1.5, Math.PI, 'west', false, 'left', 'straight', 2.0);

    // Светофоры (4 штуки, по одному на направление)
    this.createTrafficLight(640 - laneWidth*2, 440, 0, 0);      // Север
    this.createTrafficLight(640 + laneWidth*2, 584, Math.PI, 1); // Юг
    this.createTrafficLight(584, 512 + laneWidth*2, Math.PI/2, 2); // Восток
    this.createTrafficLight(440, 512 - laneWidth*2, -Math.PI/2, 3); // Запад

    // Спавним машины
    for (let i = 0; i < 12; i++) {
      setTimeout(() => this.spawnVehicle(), i * 800);
    }
  }

  private createLane(x: number, y: number, rotation: number, dir: string, isEntry: boolean, side: string, arrowType: string, speedLimit: number) {
    const lane = this.world.createEntity();
    
    lane.addComponent('transform', { x, y, rotation, scale: { x: 1, y: 1 } });
    lane.addComponent('lane', {
      direction: dir,
      isEntry,
      side,
      speedLimit,
      arrowType,
      vehicles: [],
      spawnPoint: { x, y }
    });
    
    // Стрелка на въезде
    if (isEntry) {
      const arrow = this.world.createEntity();
      let arrowX = x, arrowY = y;
      const offset = 70;
      
      if (dir === 'north') arrowY += offset;
      else if (dir === 'south') arrowY -= offset;
      else if (dir === 'east') arrowX -= offset;
      else if (dir === 'west') arrowX += offset;
      
      arrow.addComponent('transform', { x: arrowX, y: arrowY, rotation: 0, scale: { x: 1.2, y: 1.2 } });
      arrow.addComponent('sprite', { texture: `arrow-${arrowType}`, width: 28, height: 28 });
    }
  }

  private createTrafficLight(x: number, y: number, rotation: number, phase: number) {
    const light = this.world.createEntity();
    light.addComponent('transform', { x, y, rotation, scale: { x: 1, y: 1 } });
    light.addComponent('trafficLight', {
      state: 'red',
      timer: 0,
      phase,
      greenDuration: 5000,
      yellowDuration: 2000,
      redDuration: 15000,
      enabled: true
    });
    light.addComponent('sprite', { texture: 'traffic-light-red', width: 50, height: 25 });
  }

  private spawnVehicle() {
    const entryLanes = this.world.getEntitiesWithComponent('lane').filter(e => {
      const l = e.getComponent('lane');
      return l && l.isEntry;
    });
    
    if (entryLanes.length === 0) return;
    
    const lane = entryLanes[Math.floor(Math.random() * entryLanes.length)];
    const laneComp = lane.getComponent('lane');
    const transform = lane.getComponent('transform');
    
    if (!laneComp || !transform) return;
    
    const vehicle = this.world.createEntity();
    const colors = ['red', 'blue', 'green', 'yellow'] as const;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Стартовая позиция дальше от перекрестка
    let startX = transform.x, startY = transform.y;
    const offset = 180;
    
    if (laneComp.direction === 'north') startY = transform.y - offset;
    else if (laneComp.direction === 'south') startY = transform.y + offset;
    else if (laneComp.direction === 'east') startX = transform.x + offset;
    else if (laneComp.direction === 'west') startX = transform.x - offset;
    
    vehicle.addComponent('transform', {
      x: startX,
      y: startY,
      rotation: transform.rotation,
      scale: { x: 1, y: 1 }
    });
    
    vehicle.addComponent('vehicle', {
      speed: 1.5 + Math.random() * 1.5,
      maxSpeed: laneComp.speedLimit,
      acceleration: 0.08,
      braking: 0.25,
      targetSpeed: laneComp.speedLimit,
      lane: lane.id,
      color,
      state: 'moving',
      intendedAction: this.getActionFromArrow(laneComp.arrowType)
    });
    
    vehicle.addComponent('sprite', { texture: `car-${color}`, width: 30, height: 45 });
    vehicle.addComponent('collision', { radius: 24, colliding: false, stopped: false });
    
    laneComp.vehicles.push(vehicle.id);
  }

  private getActionFromArrow(arrowType: string): string {
    if (arrowType === 'straight-right') return Math.random() > 0.5 ? 'straight' : 'right';
    if (arrowType === 'straight-left') return Math.random() > 0.5 ? 'straight' : 'left';
    return 'straight';
  }

  private startGameLoop() {
    this.app.ticker.add((deltaTime: number) => {
      this.world.update(Math.min(deltaTime, 3));
      this.controlPanel.update();
      
      // Периодический спавн машин
      if (Math.random() < 0.015) {
        this.spawnVehicle();
      }
    });
  }
}

new TrafficIntersection();