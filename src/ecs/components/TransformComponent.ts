import { ComponentBase } from '../Component';

export interface TransformData {
  x: number;
  y: number;
  rotation: number;
  scale: { x: number; y: number };
}

export class TransformComponent extends ComponentBase implements TransformData {
  x: number;
  y: number;
  rotation: number;
  scale: { x: number; y: number };
  
  constructor(data: Partial<TransformData> = {}) {
    super('transform');
    
    this.x = data.x ?? 0;
    this.y = data.y ?? 0;
    this.rotation = data.rotation ?? 0;
    this.scale = data.scale ?? { x: 1, y: 1 };
  }
  
  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }
  
  setRotation(rotation: number): void {
    this.rotation = rotation;
  }
  
  setScale(x: number, y: number): void {
    this.scale = { x, y };
  }
  
  translate(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }
  
  rotate(dr: number): void {
    this.rotation += dr;
  }
  
  getForward(): { x: number; y: number } {
    return {
      x: Math.cos(this.rotation),
      y: Math.sin(this.rotation)
    };
  }
  
  getRight(): { x: number; y: number } {
    return {
      x: Math.cos(this.rotation + Math.PI / 2),
      y: Math.sin(this.rotation + Math.PI / 2)
    };
  }
}