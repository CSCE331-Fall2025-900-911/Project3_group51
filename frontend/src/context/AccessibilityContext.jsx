import React, { createContext, useContext, useState, useEffect } from 'react';

// Define max magnification level
const MAX_LEVEL = 2; // 0 = default, 1 = 110%, 2 = 120%

// 1. Create the Context
const AccessibilityContext = createContext();

// 2. Custom Hook
export const useAccessibility = () => useContext(AccessibilityContext);

// 3. Provider component
export const AccessibilityProvider = ({ children }) => {
  // Use a number for state, not a boolean
  const [magnifyLevel, setMagnifyLevel] = useState(0);

  // Update the <body> attribute when the level changes
  useEffect(() => {
    // This allows CSS to target the level: body[data-magnify-level="1"] { ... }
    document.body.dataset.magnifyLevel = magnifyLevel;
  }, [magnifyLevel]);

  // Function to increase magnification
  const increaseMagnify = () => {
    setMagnifyLevel(level => Math.min(level + 1, MAX_LEVEL)); // Cap at MAX_LEVEL
  };

  // Function to decrease magnification
  const decreaseMagnify = () => {
    setMagnifyLevel(level => Math.max(level - 1, 0)); // Stop at 0
  };

  // 4. Provide the new state and functions
  const value = {
    magnifyLevel,
    increaseMagnify,
    decreaseMagnify,
    MAX_LEVEL
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};