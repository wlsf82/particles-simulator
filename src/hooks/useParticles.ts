import { useState, useEffect, useCallback, useRef } from 'react';
import { Particle, SimulationSettings } from '../types';

// Generate a random color
const getRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Get color based on velocity
const getVelocityColor = (vx: number, vy: number, maxSpeed: number): string => {
  const speed = Math.sqrt(vx * vx + vy * vy);
  const normalizedSpeed = Math.min(speed / maxSpeed, 1);

  // Blue to purple to red gradient based on speed
  const r = Math.floor(normalizedSpeed * 255);
  const g = Math.floor(Math.max(0, 100 - normalizedSpeed * 100));
  const b = Math.floor(Math.max(50, 255 - normalizedSpeed * 200));

  return `rgb(${r}, ${g}, ${b})`;
};

export const useParticles = (canvasRef: React.RefObject<HTMLCanvasElement>, settings: SimulationSettings) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const lastUpdateTimeRef = useRef<number>(0);

  // Generate initial particles
  const initParticles = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const newParticles: Particle[] = [];

    for (let i = 0; i < settings.particleCount; i++) {
      newParticles.push(createParticle(canvas.width, canvas.height, settings));
    }

    setParticles(newParticles);
  }, [canvasRef, settings.particleCount, settings.particleSize, settings.colorMode, settings.baseColor]);

  // Create a single particle
  const createParticle = (width: number, height: number, settings: SimulationSettings, x?: number, y?: number): Particle => {
    const radius = settings.particleSize * (0.5 + Math.random() * 0.5);
    const mass = radius * radius * Math.PI;

    let color = settings.baseColor;
    if (settings.colorMode === 'random') {
      color = getRandomColor();
    }

    return {
      id: Math.random(),
      x: x ?? Math.random() * width,
      y: y ?? Math.random() * height,
      vx: (Math.random() - 0.5) * settings.maxSpeed,
      vy: (Math.random() - 0.5) * settings.maxSpeed,
      radius,
      color,
      mass,
      opacity: 0.8,
      trail: []
    };
  };

  // Add particles at a specific location
  const addParticles = useCallback((x: number, y: number, count: number = 5) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    setParticles(prev => {
      const newParticles = [...prev];
      for (let i = 0; i < count; i++) {
        newParticles.push(createParticle(canvas.width, canvas.height, settings, x, y));
      }
      return newParticles;
    });
  }, [canvasRef, settings]);

  // Reset the simulation
  const resetParticles = useCallback(() => {
    initParticles();
  }, [initParticles]);

  // Update particle positions
  const updateParticles = useCallback((deltaTime: number) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const { width, height } = canvas;

    setParticles(prev => {
      const updatedParticles = prev.map(particle => {
        // Apply gravity
        particle.vy += settings.gravity * deltaTime;

        // Apply friction
        particle.vx *= Math.pow(1 - settings.friction, deltaTime);
        particle.vy *= Math.pow(1 - settings.friction, deltaTime);

        // Update position
        particle.x += particle.vx * deltaTime;
        particle.y += particle.vy * deltaTime;

        // Save trail points
        if (settings.showTrails) {
          particle.trail.push({ x: particle.x, y: particle.y });
          if (particle.trail.length > 10) {
            particle.trail.shift();
          }
        } else {
          particle.trail = [];
        }

        // Handle wall collisions
        if (particle.x - particle.radius < 0) {
          particle.x = particle.radius;
          particle.vx = Math.abs(particle.vx) * settings.elasticity;
        } else if (particle.x + particle.radius > width) {
          particle.x = width - particle.radius;
          particle.vx = -Math.abs(particle.vx) * settings.elasticity;
        }

        if (particle.y - particle.radius < 0) {
          particle.y = particle.radius;
          particle.vy = Math.abs(particle.vy) * settings.elasticity;
        } else if (particle.y + particle.radius > height) {
          particle.y = height - particle.radius;
          particle.vy = -Math.abs(particle.vy) * settings.elasticity;
        }

        // Update color based on velocity for velocity mode
        if (settings.colorMode === 'velocity') {
          particle.color = getVelocityColor(particle.vx, particle.vy, settings.maxSpeed);
        }

        return particle;
      });

      // Handle particle collisions
      for (let i = 0; i < updatedParticles.length; i++) {
        for (let j = i + 1; j < updatedParticles.length; j++) {
          const p1 = updatedParticles[i];
          const p2 = updatedParticles[j];

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < p1.radius + p2.radius) {
            // Calculate collision normal
            const nx = dx / distance;
            const ny = dy / distance;

            // Calculate relative velocity
            const relVelx = p2.vx - p1.vx;
            const relVely = p2.vy - p1.vy;

            // Calculate relative velocity in terms of the normal direction
            const normalVel = relVelx * nx + relVely * ny;

            // Don't resolve if objects are moving away from each other
            if (normalVel > 0) continue;

            // Calculate impulse scalar
            const impulseScalar = -(1 + settings.elasticity) * normalVel / (1/p1.mass + 1/p2.mass);

            // Apply impulse
            p1.vx -= impulseScalar * nx / p1.mass;
            p1.vy -= impulseScalar * ny / p1.mass;
            p2.vx += impulseScalar * nx / p2.mass;
            p2.vy += impulseScalar * ny / p2.mass;

            // Separate particles to prevent sticking
            const overlap = p1.radius + p2.radius - distance;
            const separationX = nx * overlap * 0.5;
            const separationY = ny * overlap * 0.5;

            p1.x -= separationX;
            p1.y -= separationY;
            p2.x += separationX;
            p2.y += separationY;
          }
        }
      }

      return updatedParticles;
    });
  }, [canvasRef, settings]);

  // Animation loop
  const animate = useCallback((timestamp: number) => {
    if (!lastUpdateTimeRef.current) {
      lastUpdateTimeRef.current = timestamp;
    }

    const deltaTime = Math.min((timestamp - lastUpdateTimeRef.current) / 1000, 0.1);
    lastUpdateTimeRef.current = timestamp;

    updateParticles(deltaTime);
    animationRef.current = requestAnimationFrame(animate);
  }, [updateParticles]);

  // Initialize and handle animation
  useEffect(() => {
    initParticles();

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initParticles, animate]);

  // Adjust particle count if settings change
  useEffect(() => {
    setParticles(prev => {
      if (prev.length === settings.particleCount) return prev;

      if (prev.length < settings.particleCount) {
        // Add particles
        const canvas = canvasRef.current;
        if (!canvas) return prev;

        const newParticles = [...prev];
        for (let i = prev.length; i < settings.particleCount; i++) {
          newParticles.push(createParticle(canvas.width, canvas.height, settings));
        }
        return newParticles;
      } else {
        // Remove particles
        return prev.slice(0, settings.particleCount);
      }
    });
  }, [settings.particleCount, canvasRef]);

  return { particles, addParticles, resetParticles };
};
