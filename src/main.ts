import { Application } from 'pixi.js';
import { World } from './core/ecs';
import {
  RenderSystem,
  VehicleMovementSystem,
  TrafficLightSystem,
  CollisionSystem,
  RAGControlSystem,
  VehicleSpawnSystem
} from './systems';
import { RAGEngine } from './rag';
import { ControlPanel } from './ui';
import { TextureGenerator } from './rendering';
import { IntersectionPrefab } from './entities/prefabs/IntersectionPrefab';
import { SCENE } from './config/constants';

class TrafficIntersection {
  private app: Application;
  private world: World;
  private ragEngine: RAGEngine;
  private controlPanel!: ControlPanel;
  private spawnSystem!: VehicleSpawnSystem;

  constructor() {
    const canvas = document.getElementById('scene-canvas') as HTMLCanvasElement;

    this.app = new Application({
      view: canvas,
      width: SCENE.WIDTH,
      height: SCENE.HEIGHT,
      backgroundColor: SCENE.BACKGROUND_COLOR,
      antialias: true
    });

    this.world = new World();
    this.ragEngine = new RAGEngine();

    this.initialize();
  }

  private async initialize(): Promise<void> {
    this.generateTextures();
    this.setupECS();
    this.buildIntersection();
    this.setupUI();
    this.start();
  }

  private generateTextures(): void {
    const textureGenerator = new TextureGenerator(this.app.renderer);
    textureGenerator.generateAll();
  }

  private setupECS(): void {
    this.world.registerSystem(new RenderSystem(this.app));
    this.world.registerSystem(new TrafficLightSystem());
    this.world.registerSystem(new VehicleMovementSystem());
    this.world.registerSystem(new CollisionSystem());

    this.spawnSystem = new VehicleSpawnSystem();
    this.world.registerSystem(this.spawnSystem);

    const ragSystem = new RAGControlSystem(this.ragEngine);
    this.world.registerSystem(ragSystem);
  }

  private buildIntersection(): void {
    const intersection = new IntersectionPrefab(this.world);
    intersection.build();
  }

  private setupUI(): void {
    const ragSystem = this.world['systems'].find(
      s => s instanceof RAGControlSystem
    ) as RAGControlSystem;

    this.controlPanel = new ControlPanel(
      this.ragEngine,
      this.world,
      ragSystem,
      this.spawnSystem
    );
  }

  private start(): void {
    this.app.ticker.add((deltaTime: number) => {
      this.world.update(Math.min(deltaTime, 3));
      this.controlPanel.update();
    });
  }
}

new TrafficIntersection();