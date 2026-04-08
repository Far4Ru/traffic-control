import { ComponentBase } from '../Component';

export interface CollisionData {
  radius: number;
  colliding: boolean;
  stopped: boolean;
  collisionPoint?: { x: number; y: number };
  collisionWith?: string;
  resolveTimer?: number;
}

export class CollisionComponent extends ComponentBase implements CollisionData {
  radius: number;
  colliding: boolean;
  stopped: boolean;
  collisionPoint?: { x: number; y: number };
  collisionWith?: string;
  resolveTimer: number;
  
  constructor(data: Partial<CollisionData> = {}) {
    super('collision');
    
    this.radius = data.radius ?? 20;
    this.colliding = data.colliding ?? false;
    this.stopped = data.stopped ?? false;
    this.collisionPoint = data.collisionPoint;
    this.collisionWith = data.collisionWith;
    this.resolveTimer = data.resolveTimer ?? 0;
  }
  
  setCollision(colliding: boolean, withEntity?: string, point?: { x: number; y: number }): void {
    this.colliding = colliding;
    this.collisionWith = withEntity;
    this.collisionPoint = point;
    
    if (colliding) {
      this.stopped = true;
    }
  }
  
  resolve(): void {
    this.colliding = false;
    this.stopped = false;
    this.collisionWith = undefined;
    this.collisionPoint = undefined;
    this.resolveTimer = 0;
  }
  
  updateTimer(deltaTime: number): void {
    if (this.colliding) {
      this.resolveTimer += deltaTime;
    }
  }
  
  shouldAutoResolve(timeout: number): boolean {
    return this.colliding && this.resolveTimer >= timeout;
  }
  
  getBounds(): { minX: number; minY: number; maxX: number; maxY: number } {
    return {
      minX: -this.radius,
      minY: -this.radius,
      maxX: this.radius,
      maxY: this.radius
    };
  }
  
  intersects(other: CollisionComponent, transform1: any, transform2: any): boolean {
    const dx = transform2.x - transform1.x;
    const dy = transform2.y - transform1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < this.radius + other.radius;
  }
  
  getPenetrationVector(other: CollisionComponent, transform1: any, transform2: any): { x: number; y: number } {
    const dx = transform2.x - transform1.x;
    const dy = transform2.y - transform1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const overlap = this.radius + other.radius - distance;
    
    if (distance === 0) {
      return { x: overlap, y: 0 };
    }
    
    return {
      x: (dx / distance) * overlap,
      y: (dy / distance) * overlap
    };
  }
}