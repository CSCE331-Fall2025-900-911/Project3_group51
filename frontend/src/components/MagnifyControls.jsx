import React, { useState, useEffect, useRef } from 'react'; 
import { useAccessibility } from '../context/AccessibilityContext';
import './MagnifyControls.css';

export default function MagnifyControls() {
  const { magnifyLevel, increaseMagnify, decreaseMagnify, MAX_LEVEL } = useAccessibility();

  const [position, setPosition] = useState({ x: 15, y: 15 }); // Initial position
  const [isDragging, setIsDragging] = useState(false);
  
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    // Only drag when clicking the container, not the buttons
    if (e.target !== e.currentTarget) return; 

    setIsDragging(true);
    // Calculate the offset from the top-left corner of the div
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    e.preventDefault(); // Prevent text selection while dragging
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    // Calculate new position based on mouse movement and offset
    setPosition({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // This allows dragging even if the mouse leaves the component
  useEffect(() => {
    if (isDragging) {
      // Add listeners when dragging starts
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      // Clean up listeners when dragging stops
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    // Cleanup function when component unmounts
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]); // Only re-run this effect if isDragging changes

  return (
    <div 
      className="magnify-controls"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      onMouseDown={handleMouseDown} // Add mousedown event here
    >
      {/* Decrease Button */}
      <button
        onClick={decreaseMagnify}
        disabled={magnifyLevel === 0}
        title="Decrease font size"
      >
        -
      </button>

      {/* Increase Button */}
      <button
        onClick={increaseMagnify}
        disabled={magnifyLevel === MAX_LEVEL}
        title="Increase font size"
      >
        +
      </button>
    </div>
  );
}