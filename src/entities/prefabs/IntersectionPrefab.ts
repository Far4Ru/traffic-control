import { World, Entity } from '../../core/ecs';
import { LaneFactory, TrafficLightFactory, RoadFactory } from '../factories';
import { LANE_CONFIGS, TRAFFIC_LIGHT_CONFIGS } from '../../config/intersection.config';

export class IntersectionPrefab {
    private laneFactory: LaneFactory;
    private trafficLightFactory: TrafficLightFactory;
    private roadFactory: RoadFactory;

    constructor(private world: World) {
        this.laneFactory = new LaneFactory(world);
        this.trafficLightFactory = new TrafficLightFactory(world);
        this.roadFactory = new RoadFactory(world);
    }

    build(): void {
        this.roadFactory.createRoad('road-texture');

        LANE_CONFIGS.forEach(config => {
            this.laneFactory.createLane(config);
        });

        this.trafficLightFactory.createIntersectionLights(TRAFFIC_LIGHT_CONFIGS);
    }

    getTrafficLights(): Entity[] {
        return this.world.getEntitiesWithComponent('trafficLight');
    }

    setAllLightsEnabled(enabled: boolean): void {
        const lights = this.getTrafficLights();
        lights.forEach(light => {
            this.trafficLightFactory.setLightEnabled(light, enabled);
        });
    }

    resetAllLights(): void {
        const lights = this.getTrafficLights();
        lights.forEach(light => {
            this.trafficLightFactory.setLightState(light, 'red');
        });
    }
}