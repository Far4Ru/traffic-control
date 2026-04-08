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
  
  constructor(ragEngine: RAGEngine, world: World) {
    this.container = document.getElementById('control-panel')!;
    this.world = world;
    this.templates = new PromptTemplates();
    this.ragSystem = new RAGControlSystem(ragEngine);
    
    this.world.registerSystem(this.ragSystem);
    
    this.render();
    this.setupEventListeners();
  }
  
  private render() {
    this.container.innerHTML = `
      <div class="control-section">
        <h3>📊 Статистика</h3>
        <div class="stat-grid" id="stats-grid"></div>
      </div>
      
      <div class="control-section">
        <h3>🤖 RAG Управление</h3>
        <textarea id="prompt-input" class="prompt-input" placeholder="Введите промпт..."></textarea>
        <button id="submit-prompt" class="btn btn-primary" style="margin-top: 10px; width: 100%;">Отправить</button>
        <div id="rag-status" class="rag-status">Готов к обработке</div>
      </div>
      
      <div class="control-section">
        <h3>📋 Шаблоны</h3>
        <div class="template-list" id="template-list"></div>
      </div>
      
      <div class="control-section">
        <h3>🎮 Управление</h3>
        <button id="reset-collisions" class="btn btn-secondary" style="width: 100%; margin-bottom: 8px;">Сбросить коллизии</button>
        <button id="add-vehicle" class="btn btn-secondary" style="width: 100%; margin-bottom: 8px;">Добавить машину</button>
        <button id="toggle-lights" class="btn btn-secondary" style="width: 100%;">Вкл/Выкл светофоры</button>
      </div>
    `;
    
    this.renderTemplates();
    this.update();
  }
  
  private renderTemplates() {
    const list = document.getElementById('template-list')!;
    const prompts = this.templates.getTemplatePrompts();
    
    prompts.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'template-btn';
      btn.textContent = t.name;
      btn.onclick = () => {
        (document.getElementById('prompt-input') as HTMLTextAreaElement).value = t.prompt;
      };
      list.appendChild(btn);
    });
  }
  
  private setupEventListeners() {
    document.getElementById('submit-prompt')?.addEventListener('click', async () => {
      const input = document.getElementById('prompt-input') as HTMLTextAreaElement;
      const prompt = input.value.trim();
      if (!prompt) return;
      
      const status = document.getElementById('rag-status')!;
      status.textContent = 'Обработка...';
      status.style.color = '#f9ca24';
      
      try {
        await this.ragSystem.processPrompt(prompt);
        const behavior = this.ragSystem.getCurrentBehavior();
        
        if (behavior) {
          status.innerHTML = `<strong>Применено:</strong> ${behavior.explanation}<br><small>Уверенность: ${(behavior.confidence * 100).toFixed(1)}%</small>`;
          status.style.color = '#00d2ff';
        }
      } catch (e) {
        status.textContent = 'Ошибка обработки';
        status.style.color = '#e94560';
      }
    });
    
    document.getElementById('reset-collisions')?.addEventListener('click', () => {
      const systems = this.world.getSystems();
      const cs = systems.find(s => s instanceof CollisionSystem) as CollisionSystem;
      if (cs) cs.resolveCollisions(this.world);
    });
    
    document.getElementById('add-vehicle')?.addEventListener('click', () => {
      (this.ragSystem as any).spawnVehicle(this.world);
    });
    
    document.getElementById('toggle-lights')?.addEventListener('click', () => {
      const lights = this.world.getEntitiesWithComponent('trafficLight');
      if (lights.length === 0) return;
      const first = lights[0].getComponent('trafficLight');
      if (!first) return;
      const newState = !first.enabled;
      lights.forEach(l => {
        const lc = l.getComponent('trafficLight');
        if (lc) lc.enabled = newState;
      });
    });
  }
  
  public update() {
    const grid = document.getElementById('stats-grid');
    if (!grid) return;
    
    const vehicles = this.world.getEntitiesWithComponent('vehicle');
    const collisions = vehicles.filter(v => v.getComponent('collision')?.colliding).length;
    
    const dirCounts: Record<string, number> = { north: 0, south: 0, east: 0, west: 0 };
    vehicles.forEach(v => {
      const vc = v.getComponent('vehicle');
      if (!vc) return;
      const lane = this.world.getEntity(vc.lane);
      const lc = lane?.getComponent('lane');
      if (lc) dirCounts[lc.direction]++;
    });
    
    let avgSpeed = 0;
    if (vehicles.length > 0) {
      let sum = 0, count = 0;
      vehicles.forEach(v => { const vc = v.getComponent('vehicle'); if (vc) { sum += vc.speed; count++; } });
      avgSpeed = count > 0 ? Math.round((sum / count) * 10) : 0;
    }
    
    grid.innerHTML = `
      <div class="stat-item"><div class="stat-label">Машин</div><div class="stat-value">${vehicles.length}</div></div>
      <div class="stat-item"><div class="stat-label">Коллизии</div><div class="stat-value" style="color: ${collisions > 0 ? '#e94560' : '#00d2ff'}">${collisions}</div></div>
      <div class="stat-item"><div class="stat-label">Север</div><div class="stat-value">${dirCounts.north}</div></div>
      <div class="stat-item"><div class="stat-label">Юг</div><div class="stat-value">${dirCounts.south}</div></div>
      <div class="stat-item"><div class="stat-label">Восток</div><div class="stat-value">${dirCounts.east}</div></div>
      <div class="stat-item"><div class="stat-label">Запад</div><div class="stat-value">${dirCounts.west}</div></div>
      <div class="stat-item"><div class="stat-label">Скорость</div><div class="stat-value">${avgSpeed}</div></div>
      <div class="stat-item"><div class="stat-label">Светофоры</div><div class="stat-value">${this.getLightsStatus()}</div></div>
    `;
  }
  
  private getLightsStatus(): string {
    const lights = this.world.getEntitiesWithComponent('trafficLight');
    if (lights.length === 0) return 'Нет';
    const first = lights[0].getComponent('trafficLight');
    return first?.enabled ? 'Вкл' : 'Выкл';
  }
}