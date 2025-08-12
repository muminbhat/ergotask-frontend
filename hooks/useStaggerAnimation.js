'use client'

import { useEffect, useState } from 'react';

export function useStaggerAnimation(delay = 100) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return {
    isVisible,
    staggerClass: isVisible ? 'animate-stagger-in' : 'animate-stagger-out',
    containerClass: 'stagger-container'
  };
}
