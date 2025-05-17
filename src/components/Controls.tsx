
import { useState } from 'react';
import { SimulationSettings } from '../types';

interface ControlsProps {
  settings: SimulationSettings;
  onSettingsChange: (settings: SimulationSettings) => void;
  onReset: () => void;
}

const Controls: React.FC<ControlsProps> = ({ settings, onSettingsChange, onReset }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleChange = <K extends keyof SimulationSettings>(key: K, value: SimulationSettings[K]) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="fixed top-0 right-0 p-4 z-10">
      <div className="flex justify-end mb-2">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="button text-sm"
          data-testid="toggle-controls"
        >
          {isOpen ? 'Hide Controls' : 'Show Controls'}
        </button>
      </div>
      
      {isOpen && (
        <div 
          className="control-panel w-64 max-h-[80vh] overflow-y-auto" 
          data-testid="control-panel"
        >
          <h2 className="text-lg font-bold mb-4">Particle Settings</h2>
          
          <div className="slider-container">
            <label htmlFor="particleCount">Particle Count: {settings.particleCount}</label>
            <input
              type="range"
              id="particleCount"
              min="10"
              max="500"
              step="10"
              value={settings.particleCount}
              onChange={(e) => handleChange('particleCount', parseInt(e.target.value))}
              data-testid="particle-count-slider"
            />
          </div>
          
          <div className="slider-container">
            <label htmlFor="particleSize">Particle Size: {settings.particleSize}</label>
            <input
              type="range"
              id="particleSize"
              min="1"
              max="20"
              step="1"
              value={settings.particleSize}
              onChange={(e) => handleChange('particleSize', parseInt(e.target.value))}
              data-testid="particle-size-slider"
            />
          </div>
          
          <div className="slider-container">
            <label htmlFor="maxSpeed">Max Speed: {settings.maxSpeed}</label>
            <input
              type="range"
              id="maxSpeed"
              min="50"
              max="500"
              step="10"
              value={settings.maxSpeed}
              onChange={(e) => handleChange('maxSpeed', parseInt(e.target.value))}
              data-testid="max-speed-slider"
            />
          </div>
          
          <h2 className="text-lg font-bold mt-6 mb-4">Physics Settings</h2>
          
          <div className="slider-container">
            <label htmlFor="gravity">Gravity: {settings.gravity.toFixed(2)}</label>
            <input
              type="range"
              id="gravity"
              min="-50"
              max="50"
              step="1"
              value={settings.gravity * 100}
              onChange={(e) => handleChange('gravity', parseInt(e.target.value) / 100)}
              data-testid="gravity-slider"
            />
          </div>
          
          <div className="slider-container">
            <label htmlFor="friction">Friction: {settings.friction.toFixed(2)}</label>
            <input
              type="range"
              id="friction"
              min="0"
              max="10"
              step="1"
              value={settings.friction * 100}
              onChange={(e) => handleChange('friction', parseInt(e.target.value) / 100)}
              data-testid="friction-slider"
            />
          </div>
          
          <div className="slider-container">
            <label htmlFor="elasticity">Elasticity: {settings.elasticity.toFixed(2)}</label>
            <input
              type="range"
              id="elasticity"
              min="0"
              max="100"
              step="1"
              value={settings.elasticity * 100}
              onChange={(e) => handleChange('elasticity', parseInt(e.target.value) / 100)}
              data-testid="elasticity-slider"
            />
          </div>
          
          <h2 className="text-lg font-bold mt-6 mb-4">Visual Settings</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-300">Color Mode</label>
            <select
              value={settings.colorMode}
              onChange={(e) => handleChange('colorMode', e.target.value as SimulationSettings['colorMode'])}
              className="w-full bg-gray-700 text-white p-2 rounded-md"
              data-testid="color-mode-select"
            >
              <option value="solid">Solid Color</option>
              <option value="velocity">Velocity Based</option>
              <option value="random">Random Colors</option>
            </select>
          </div>
          
          {settings.colorMode === 'solid' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-300">Base Color</label>
              <input
                type="color"
                value={settings.baseColor}
                onChange={(e) => handleChange('baseColor', e.target.value)}
                className="w-full h-8 bg-gray-700 rounded-md"
                data-testid="color-picker"
              />
            </div>
          )}
          
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="showTrails"
              checked={settings.showTrails}
              onChange={(e) => handleChange('showTrails', e.target.checked)}
              className="mr-2"
              data-testid="show-trails-checkbox"
            />
            <label htmlFor="showTrails" className="text-sm font-medium text-gray-300">Show Trails</label>
          </div>
          
          <button 
            onClick={onReset} 
            className="button w-full mt-4"
            data-testid="reset-button"
          >
            Reset Simulation
          </button>
        </div>
      )}
    </div>
  );
};

export default Controls;
