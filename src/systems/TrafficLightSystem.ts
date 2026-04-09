import { World, System } from '../core/ecs';
import { TrafficLightComponent, SpriteComponent } from '../components';
import { TRAFFIC } from '../config/constants';

export class TrafficLightSystem extends System {
  private globalTimer: number = 0;
  private currentPhase: number = 0; // 0: север-юг зеленый, 1: восток-запад зеленый
  private phaseTimer: number = 0;
  private isYellowPhase: boolean = false;

  constructor() {
    super(30);
  }

  update(world: World, deltaTime: number): void {
    this.globalTimer += deltaTime * 16.67;

    const lights = world.getEntitiesWithComponent('trafficLight');
    if (lights.length === 0) return;

    // Проверяем, включены ли светофоры
    const firstLight = lights[0].getComponent<TrafficLightComponent>('trafficLight');
    const enabled = firstLight?.enabled ?? true;

    // Если светофоры выключены - все желтые мигающие
    if (!enabled) {
      const blinkState = Math.floor(this.globalTimer / 500) % 2 === 0;
      lights.forEach(light => {
        const lightComp = light.getComponent<TrafficLightComponent>('trafficLight');
        if (lightComp) {
          lightComp.state = blinkState ? 'yellow' : 'red';
          const sprite = light.getComponent<SpriteComponent>('sprite');
          if (sprite) {
            sprite.texture = blinkState ? 'traffic-light-yellow' : 'traffic-light-red';
          }
        }
      });
      return;
    }

    // Нормальный режим работы светофоров
    const greenDuration = TRAFFIC.GREEN_DURATION;
    const yellowDuration = TRAFFIC.YELLOW_DURATION;

    this.phaseTimer += deltaTime * 16.67;

    if (!this.isYellowPhase) {
      // Зеленая фаза
      if (this.phaseTimer >= greenDuration) {
        // Переключаемся на желтый
        this.isYellowPhase = true;
        this.phaseTimer = 0;

        // Устанавливаем желтый для текущей фазы
        lights.forEach(light => {
          const lightComp = light.getComponent<TrafficLightComponent>('trafficLight');
          if (lightComp) {
            if ((this.currentPhase === 0 && (lightComp.phase === 0 || lightComp.phase === 1)) ||
              (this.currentPhase === 1 && (lightComp.phase === 2 || lightComp.phase === 3))) {
              lightComp.state = 'yellow';
            } else {
              lightComp.state = 'red';
            }

            const sprite = light.getComponent<SpriteComponent>('sprite');
            if (sprite) {
              sprite.texture = `traffic-light-${lightComp.state}`;
            }
          }
        });
      }
    } else {
      // Желтая фаза
      if (this.phaseTimer >= yellowDuration) {
        // Переключаем фазу
        this.isYellowPhase = false;
        this.phaseTimer = 0;
        this.currentPhase = this.currentPhase === 0 ? 1 : 0;

        // Устанавливаем новые состояния
        lights.forEach(light => {
          const lightComp = light.getComponent<TrafficLightComponent>('trafficLight');
          if (lightComp) {
            const isNorthSouth = (lightComp.phase === 0 || lightComp.phase === 1);
            const isEastWest = (lightComp.phase === 2 || lightComp.phase === 3);

            if (this.currentPhase === 0) {
              // Север-Юг зеленый, Восток-Запад красный
              if (isNorthSouth) {
                lightComp.state = 'green';
              } else {
                lightComp.state = 'red';
              }
            } else {
              // Восток-Запад зеленый, Север-Юг красный
              if (isEastWest) {
                lightComp.state = 'green';
              } else {
                lightComp.state = 'red';
              }
            }

            const sprite = light.getComponent<SpriteComponent>('sprite');
            if (sprite) {
              sprite.texture = `traffic-light-${lightComp.state}`;
            }
          }
        });
      }
    }
  }

  reset(): void {
    this.globalTimer = 0;
    this.currentPhase = 0;
    this.phaseTimer = 0;
    this.isYellowPhase = false;
  }

  getCurrentPhase(): number {
    return this.currentPhase;
  }

  isYellow(): boolean {
    return this.isYellowPhase;
  }
}