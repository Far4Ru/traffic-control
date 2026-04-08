import { Component } from '../core/ecs/Component';

export class SpriteComponent extends Component {
    public texture: string;
    public width: number;
    public height: number;
    public visible: boolean;

    constructor(texture: string, width: number = 32, height: number = 32) {
        super('sprite');
        this.texture = texture;
        this.width = width;
        this.height = height;
        this.visible = true;
    }
}