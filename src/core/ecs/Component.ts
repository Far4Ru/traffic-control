import { Entity } from './Entity';

export abstract class Component {
    public readonly type: string;
    public entity?: Entity;

    constructor(type: string) {
        this.type = type;
    }
}