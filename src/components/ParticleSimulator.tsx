import { useRef, useEffect, useState, useCallback } from 'react';
import { useParticles } from '../hooks/useParticles';
import Controls from './Controls';
import { SimulationSettings } from '../types';

const ParticleSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Default simulation settings
  const [settings, setSettings] = useState<SimulationSettings>({
    particleCount: 100,
    gravity: 0.05,
    friction: 0.01,
    elasticity: 0.7,
    particleSize: 5,
    maxSpeed: 200,
    showTrails: true,
    colorMode: 'velocity',
    baseColor: '#3498db'
  });

  const { particles, addParticles, resetParticles } = useParticles(
    canvasRef as React.RefObject<HTMLCanvasElement>,
    settings
  );

  // Handle window resize
  const handleResize = useCallback(() => {
    if (canvasRef.current && containerRef.current) {
      canvasRef.current.width = containerRef.current.clientWidth;
      canvasRef.current.height = containerRef.current.clientHeight;
    }
  }, []);

  // Set up canvas and resize listener
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Handle canvas click to add particles
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    addParticles(x, y, 10);
  };

  // Helper function to add alpha to any color format
  const addAlpha = (color: string, alpha: number): string => {
    // Check if color is hex
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // If it's already rgb or rgba
    if (color.startsWith('rgb')) {
      // If it's already rgba, replace the alpha
      if (color.startsWith('rgba')) {
        return color.replace(/[\d\.]+\)$/, `${alpha})`);
      }
      // Convert rgb to rgba
      return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
    }

    // Fallback for any other format
    return `rgba(128, 128, 128, ${alpha})`;
  };

  // Draw particles on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each particle
    particles.forEach(particle => {
      // Draw trail if enabled
      if (settings.showTrails && particle.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(particle.trail[0].x, particle.trail[0].y);

        for (let i = 1; i < particle.trail.length; i++) {
          ctx.lineTo(particle.trail[i].x, particle.trail[i].y);
        }

        ctx.strokeStyle = addAlpha(particle.color, 0.25); // 25% opacity
        ctx.lineWidth = particle.radius * 0.5;
        ctx.stroke();
      }

      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();

      // Add subtle glow effect
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, particle.radius * 0.5,
        particle.x, particle.y, particle.radius * 2
      );
      gradient.addColorStop(0, addAlpha(particle.color, 0.25));
      gradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    });
  }, [particles, settings.showTrails]);

  return (
    <div className="w-full h-screen overflow-hidden" ref={containerRef} data-testid="simulator-container">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full bg-gray-900"
        data-testid="particle-canvas"
      />

      <Controls
        settings={settings}
        onSettingsChange={setSettings}
        onReset={resetParticles}
      />

      <div className="fixed bottom-4 left-4 text-sm text-gray-400 bg-gray-800 bg-opacity-50 p-2 rounded">
        Click anywhere to add particles!
      </div>
    </div>
  );
};

export default ParticleSimulator;
