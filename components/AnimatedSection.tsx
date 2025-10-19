
import React, { useState, useEffect } from 'react';

interface AnimatedSectionProps {
  children: React.ReactNode;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Mount animation
    const timer = setTimeout(() => setIsVisible(true), 50); // a small delay to ensure transition triggers
    return () => clearTimeout(timer);
  }, []);

  return (
    // FIX: Corrected typo from isVisiible to isVisible.
    <div className={`transition-opacity duration-700 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </div>
  );
};

export default AnimatedSection;