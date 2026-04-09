import { RAGEngine, RAGControlSystem } from '../rag';
import { World } from '../core/ecs';
import { VehicleSpawnSystem } from '../systems';
import { StatsPanel } from './components/StatsPanel';
import { RAGPanel } from './components/RAGPanel';
import { ControlButtons } from './components/ControlButtons';

export class ControlPanel {
  private container: HTMLElement;
  private statsPanel: StatsPanel;
  private ragPanel: RAGPanel;
  private controlButtons: ControlButtons;

  constructor(
    ragEngine: RAGEngine,
    world: World,
    ragSystem: RAGControlSystem,
    spawnSystem: VehicleSpawnSystem
  ) {
    this.container = document.getElementById('control-panel')!;

    this.statsPanel = new StatsPanel(world);
    this.ragPanel = new RAGPanel(ragEngine, ragSystem);
    this.controlButtons = new ControlButtons(world, spawnSystem);

    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h2 style="color: #00d2ff; margin-bottom: 5px;">🚦 Traffic Intersection</h2>
        <p style="color: #aaa; font-size: 12px;">RAG-управляемый перекресток</p>
      </div>
      ${this.statsPanel.render()}
      ${this.ragPanel.render()}
      ${this.controlButtons.render()}
    `;

    this.ragPanel.setupEventListeners();
    this.controlButtons.setupEventListeners();
  }

  update(): void {
    this.statsPanel.update();
  }
}