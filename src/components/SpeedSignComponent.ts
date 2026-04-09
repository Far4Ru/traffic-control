import { Component } from '../core/ecs/Component';

export class SpeedSignComponent extends Component {
    public speed: number;

    constructor(speed: number) {
        super('speedSign');
        this.speed = speed;
    }
}