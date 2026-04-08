export interface Component {
  type: string;
  [key: string]: any;
}

export class ComponentBase implements Component {
  type: string;
  
  constructor(type: string) {
    this.type = type;
  }
}

export type ComponentClass<T extends Component> = new (...args: any[]) => T;