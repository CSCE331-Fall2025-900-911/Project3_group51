import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import './MagnifyControls.css';

export default function MagnifyControls() {
  const { magnifyLevel, increaseMagnify, decreaseMagnify, MAX_LEVEL } = useAccessibility();

  return (
    <div className="magnify-controls">
      <span className="magnify-label">Magnify</span>
      <div className="magnify-buttons">
        <button
          onClick={decreaseMagnify}
          disabled={magnifyLevel === 0}
          title="Decrease font size"
        >
          -
        </button>
        <button
          onClick={increaseMagnify}
          disabled={magnifyLevel === MAX_LEVEL}
          title="Increase font size"
        >
          +
        </button>
      </div>
    </div>
  );
}