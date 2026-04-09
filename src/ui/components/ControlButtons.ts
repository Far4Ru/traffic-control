import { World } from '../../core/ecs';
import { VehicleSpawnSystem } from '../../systems';
import { CollisionSystem } from '../../systems/CollisionSystem';
import { TrafficLightComponent } from '../../components';
import { IntersectionPrefab } from '../../entities/prefabs/IntersectionPrefab';
import { TrafficLightSystem } from '../../systems/TrafficLightSystem';

export class ControlButtons {
  private intersectionPrefab: IntersectionPrefab;

  constructor(
    private world: World,
    private spawnSystem: VehicleSpawnSystem
  ) {
    this.intersectionPrefab = new IntersectionPrefab(world);
  }

  render(): string {
    return `
      <div class="control-section">
        <h3>🎮 Управление</h3>
        <button id="reset-collisions" class="btn btn-secondary" style="width: 100%; margin-bottom: 8px;">
          Сбросить коллизии
        </button>
        <button id="add-vehicle" class="btn btn-secondary" style="width: 100%; margin-bottom: 8px;">
          Добавить машину
        </button>
        <button id="toggle-lights" class="btn btn-secondary" style="width: 100%; margin-bottom: 8px;">
          Вкл/Выкл светофоры
        </button>
        <button id="reset-scene" class="btn btn-secondary" style="width: 100%;">
          Сбросить сцену
        </button>
      </div>
    `;
  }

  setupEventListeners(): void {
    document.getElementById('reset-collisions')?.addEventListener('click', () => {
      const systems = this.world['systems'] as any[];
      const cs = systems.find(s => s instanceof CollisionSystem) as CollisionSystem;
      cs?.resolveCollisions(this.world);
    });

    document.getElementById('add-vehicle')?.addEventListener('click', () => {
      this.spawnSystem.spawnVehicleManually(this.world);
    });

    document.getElementById('toggle-lights')?.addEventListener('click', () => {
      const lights = this.world.getEntitiesWithComponent('trafficLight');
      if (lights.length === 0) return;

      const first = lights[0].getComponent<TrafficLightComponent>('trafficLight');
      if (!first) return;

      const newState = !first.enabled;
      lights.forEach(l => {
        const lc = l.getComponent<TrafficLightComponent>('trafficLight');
        if (lc) {
          lc.enabled = newState;
          if (!newState) {
            lc.state = 'yellow';
          }
        }
      });

      // Сбрасываем таймер светофоров
      const systems = this.world['systems'] as any[];
      const tls = systems.find(s => s instanceof TrafficLightSystem) as TrafficLightSystem;
      if (tls) {
        tls.reset();
      }
    });

    document.getElementById('reset-scene')?.addEventListener('click', () => {
      this.resetScene();
    });
  }

  private resetScene(): void {
    // Удаляем все машины
    const vehicles = this.world.getEntitiesWithComponent('vehicle');
    vehicles.forEach(v => this.world.removeEntity(v.id));

    // Сбрасываем светофоры
    const lights = this.world.getEntitiesWithComponent('trafficLight');
    lights.forEach(l => {
      const lc = l.getComponent<TrafficLightComponent>('trafficLight');
      if (lc) {
        lc.enabled = true;
        lc.state = 'red';
      }
    });

    // Сбрасываем таймер светофоров
    const systems = this.world['systems'] as any[];
    const tls = systems.find(s => s instanceof TrafficLightSystem) as TrafficLightSystem;
    if (tls) {
      tls.reset();
    }

    // Сбрасываем коллизии
    const cs = systems.find(s => s instanceof CollisionSystem) as CollisionSystem;
    cs?.resolveCollisions(this.world);

    // Создаем новые машины
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        this.spawnSystem.spawnVehicleManually(this.world);
      }, i * 300);
    }
  }
}