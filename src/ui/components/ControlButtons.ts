import { World } from '../../core/ecs';
import { VehicleSpawnSystem } from '../../systems';
import { CollisionSystem } from '../../systems/CollisionSystem';
import { TrafficLightComponent } from '../../components';

export class ControlButtons {
    constructor(
        private world: World,
        private spawnSystem: VehicleSpawnSystem
    ) { }

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
        <button id="toggle-lights" class="btn btn-secondary" style="width: 100%;">
          Вкл/Выкл светофоры
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
                if (lc) lc.enabled = newState;
            });
        });
    }
}