import { World, Entity } from '../../core/ecs';
import { VehicleComponent, LaneComponent, CollisionComponent, TrafficLightComponent } from '../../components';

export class StatsPanel {
  constructor(private world: World) { }

  render(): string {
    return `
      <div class="control-section">
        <h3>📊 Статистика</h3>
        <div class="stat-grid" id="stats-grid"></div>
      </div>
    `;
  }

  update(): void {
    const grid = document.getElementById('stats-grid');
    if (!grid) return;

    const vehicles = this.world.getEntitiesWithComponent('vehicle');
    const collisions = vehicles.filter(v =>
      v.getComponent<CollisionComponent>('collision')?.colliding
    ).length;

    const dirCounts = this.countVehiclesByDirection(vehicles);
    const avgSpeed = this.calculateAverageSpeed(vehicles);
    const lightsStatus = this.getLightsStatus();

    grid.innerHTML = `
      <div class="stat-item">
        <div class="stat-label">Машин</div>
        <div class="stat-value">${vehicles.length}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Коллизии</div>
        <div class="stat-value" style="color: ${collisions > 0 ? '#e94560' : '#00d2ff'}">${collisions}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Север</div>
        <div class="stat-value">${dirCounts.north}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Юг</div>
        <div class="stat-value">${dirCounts.south}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Восток</div>
        <div class="stat-value">${dirCounts.east}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Запад</div>
        <div class="stat-value">${dirCounts.west}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Скорость</div>
        <div class="stat-value">${avgSpeed}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Светофоры</div>
        <div class="stat-value">${lightsStatus}</div>
      </div>
    `;
  }

  private countVehiclesByDirection(vehicles: Entity[]): Record<string, number> {
    const counts = { north: 0, south: 0, east: 0, west: 0 };

    vehicles.forEach(v => {
      const vehicle = v.getComponent<VehicleComponent>('vehicle');
      if (!vehicle) return;

      const lane = this.world.getEntity(vehicle.laneId);
      const laneComp = lane?.getComponent<LaneComponent>('lane');
      if (laneComp) counts[laneComp.direction]++;
    });

    return counts;
  }

  private calculateAverageSpeed(vehicles: Entity[]): number {
    if (vehicles.length === 0) return 0;

    let sum = 0;
    let count = 0;

    vehicles.forEach(v => {
      const vehicle = v.getComponent<VehicleComponent>('vehicle');
      if (vehicle) {
        sum += vehicle.speed;
        count++;
      }
    });

    return count > 0 ? Math.round((sum / count) * 10) : 0;
  }

  private getLightsStatus(): string {
    const lights = this.world.getEntitiesWithComponent('trafficLight');
    if (lights.length === 0) return 'Нет';

    const first = lights[0].getComponent<TrafficLightComponent>('trafficLight');
    return first?.enabled ? 'Вкл' : 'Выкл';
  }
}