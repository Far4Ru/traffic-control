export const SCENE = {
    WIDTH: 1280,
    HEIGHT: 1024,
    CENTER_X: 640,
    CENTER_Y: 512,
    BACKGROUND_COLOR: 0x2d5016
} as const;

export const ROAD = {
    LANE_WIDTH: 32,
    TOTAL_LANES: 4,
    ROAD_WIDTH: 128,
    ROAD_START: 200,
    ROAD_END: 824
} as const;

export const TRAFFIC = {
    CYCLE_TIME: 24000,
    GREEN_DURATION: 6000,
    YELLOW_DURATION: 2000,
    DEFAULT_SPEED_LIMIT: 2.5,
    SPAWN_RATE: 0.015,
    MAX_VEHICLES: 30
} as const;

export const COLLISION = {
    VEHICLE_RADIUS: 24,
    SAFE_DISTANCE: 65,
    TURN_START_DISTANCE: 50,
    TURN_END_DISTANCE: 130,
    TURN_SPEED: 0.025
} as const;

export const DIRECTIONS = {
    NORTH: 'north',
    SOUTH: 'south',
    EAST: 'east',
    WEST: 'west'
} as const;

export const PHASE_MAP: Record<string, number> = {
    north: 0,
    south: 1,
    east: 2,
    west: 3
} as const;