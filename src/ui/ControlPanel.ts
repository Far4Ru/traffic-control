import { RAGEngine } from '../rag/RAGEngine';
import { RAGControlSystem } from '../systems/RAGControlSystem';
import { PromptTemplates } from '../rag/PromptTemplates';
import { World } from '../ecs/World';
import { CollisionSystem } from '../systems/CollisionSystem';

export class ControlPanel {
  private container: HTMLElement;
  private ragSystem: RAGControlSystem;
  private world: World;
  private templates: PromptTemplates;
  
  constructor(_ragEngine: RAGEngine, world: World) {
    this.container = document.getElementById('control-panel')!;
    this.world = world;
    this.templates = new PromptTemplates();
    this.ragSystem = new RAGControlSystem(_ragEngine);
    
    this.world.registerSystem(this.ragSystem);
    
    this.render();
    this.setupEventListeners();
  }
  
  private render() {
    this.container.innerHTML = `
      <div class="control-section">
        <h3>📊 Статистика перекрестка</h3>
        <div class="stat-grid" id="stats-grid"></div>
      </div>
      
      <div class="control-section">
        <h3>🤖 RAG Управление</h3>
        <textarea 
          id="prompt-input" 
          class="prompt-input" 
          placeholder="Введите промпт для управления движением..."
        ></textarea>
        <button id="submit-prompt" class="btn btn-primary" style="margin-top: 10px; width: 100%;">
          Отправить
        </button>
        <div id="rag-status" class="rag-status">
          Готов к обработке промптов
        </div>
      </div>
      
      <div class="control-section">
        <h3>📋 Шаблонные промпты</h3>
        <div class="template-list" id="template-list"></div>
      </div>
      
      <div class="control-section">
        <h3>🎮 Управление</h3>
        <button id="reset-collisions" class="btn btn-secondary" style="width: 100%; margin-bottom: 8px;">
          Сбросить коллизии
        </button>
        <button id="add-vehicle" class="btn btn-secondary" style="width: 100%; margin-bottom: 8px;">
          Добавить машину
        </button>
        <button id="toggle-lights" class="btn btn-secondary" style="width: 100%;">
          Вкл/Выкл светофоры
        </button>
      </div>
    `;
    
    this.renderTemplates();
    this.updateStats();
  }
  
  private renderTemplates() {
    const templateList = document.getElementById('template-list')!;
    const prompts = this.templates.getTemplatePrompts();
    
    prompts.forEach(template => {
      const btn = document.createElement('button');
      btn.className = 'template-btn';
      btn.textContent = template.name;
      btn.onclick = () => {
        const input = document.getElementById('prompt-input') as HTMLTextAreaElement;
        input.value = template.prompt;
      };
      templateList.appendChild(btn);
    });
  }
  
  private setupEventListeners() {
    document.getElementById('submit-prompt')?.addEventListener('click', async () => {
      const input = document.getElementById('prompt-input') as HTMLTextAreaElement;
      const prompt = input.value.trim();
      
      if (!prompt) return;
      
      const statusEl = document.getElementById('rag-status')!;
      statusEl.textContent = 'Обработка промпта...';
      statusEl.style.color = '#f9ca24';
      
      try {
        await this.ragSystem.processPrompt(prompt);
        const behavior = this.ragSystem.getCurrentBehavior();
        
        if (behavior) {
          statusEl.innerHTML = `
            <strong>Применено:</strong> ${behavior.explanation}<br>
            <small>Уверенность: ${(behavior.confidence * 100).toFixed(1)}%</small>
          `;
          statusEl.style.color = '#00d2ff';
        }
      } catch (error) {
        statusEl.textContent = 'Ошибка обработки промпта';
        statusEl.style.color = '#e94560';
      }
    });
    
    document.getElementById('reset-collisions')?.addEventListener('click', () => {
      const systems = this.world.getSystems();
      const collisionSystem = systems.find(s => s instanceof CollisionSystem) as CollisionSystem;
      
      if (collisionSystem) {
        collisionSystem.resolveCollisions(this.world);
      }
    });
    
    document.getElementById('add-vehicle')?.addEventListener('click', () => {
      (this.ragSystem as any).spawnVehicle(this.world);
    });
    
    document.getElementById('toggle-lights')?.addEventListener('click', () => {
      const lights = this.world.getEntitiesWithComponent('trafficLight');
      if (lights.length === 0) return;
      
      const firstLight = lights[0].getComponent('trafficLight');
      if (!firstLight) return;
      
      const enabled = !firstLight.enabled;
      
      lights.forEach(light => {
        const lightComp = light.getComponent('trafficLight');
        if (lightComp) {
          lightComp.enabled = enabled;
        }
      });
    });
  }
  
  public update() {
    this.updateStats();
  }
  
  private updateStats() {
    const statsGrid = document.getElementById('stats-grid');
    if (!statsGrid) return;
    
    const vehicles = this.world.getEntitiesWithComponent('vehicle');
    const lanes = this.world.getEntitiesWithComponent('lane');
    const collisions = vehicles.filter(v => {
      const collision = v.getComponent('collision');
      return collision && collision.colliding;
    }).length;
    
    // Count vehicles by direction
    const directionCounts: Record<string, number> = {
      'north': 0, 'south': 0, 'east': 0, 'west': 0
    };
    
    vehicles.forEach(v => {
      const vehicleComp = v.getComponent('vehicle');
      if (!vehicleComp) return;
      
      const lane = this.world.getEntity(vehicleComp.lane);
      if (!lane) return;
      
      const laneComp = lane.getComponent('lane');
      if (laneComp) {
        const dir = laneComp.direction;
        if (dir in directionCounts) {
          directionCounts[dir]++;
        }
      }
    });
    
    statsGrid.innerHTML = `
      <div class="stat-item">
        <div class="stat-label">Всего машин</div>
        <div class="stat-value">${vehicles.length}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Коллизии</div>
        <div class="stat-value" style="color: ${collisions > 0 ? '#e94560' : '#00d2ff'}">${collisions}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Север</div>
        <div class="stat-value">${directionCounts.north}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Юг</div>
        <div class="stat-value">${directionCounts.south}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Восток</div>
        <div class="stat-value">${directionCounts.east}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Запад</div>
        <div class="stat-value">${directionCounts.west}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Ср. скорость</div>
        <div class="stat-value">${this.getAverageSpeed(vehicles)}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Полос</div>
        <div class="stat-value">${lanes.length}</div>
      </div>
    `;
  }
  
  private getAverageSpeed(vehicles: any[]): number {
    if (vehicles.length === 0) return 0;
    let sum = 0;
    let count = 0;
    
    vehicles.forEach(v => {
      const vehicleComp = v.getComponent('vehicle');
      if (vehicleComp) {
        sum += vehicleComp.speed;
        count++;
      }
    });
    
    return count > 0 ? Math.round((sum / count) * 10) : 0;
  }
}