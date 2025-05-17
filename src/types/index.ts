export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  mass: number;
  opacity: number;
  trail: Array<{x: number, y: number}>;
}

export interface SimulationSettings {
  particleCount: number;
  gravity: number;
  friction: number;
  elasticity: number;
  particleSize: number;
  maxSpeed: number;
  showTrails: boolean;
  colorMode: 'solid' | 'velocity' | 'random';
  baseColor: string;
}
