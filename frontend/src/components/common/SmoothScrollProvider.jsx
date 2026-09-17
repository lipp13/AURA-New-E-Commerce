import React, { createContext, useContext } from 'react';

const SmoothScrollContext = createContext({
  lenis: null,
  scrollTo: () => {},
});

/**
 * High-Performance Native 120fps Scroll Provider
 * Uses direct hardware-accelerated browser scroll without virtual momentum damping or inertia lag.
 */
export const SmoothScrollProvider = ({ children }) => {
  const scrollTo = (target, options = {}) => {
    const behavior = options.immediate ? 'auto' : 'smooth';

    if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior });
    } else if (typeof target === 'string') {
      const el = document.querySelector(target);
      if (el) el.scrollIntoView({ behavior });
    } else if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior });
    }
  };

  return (
    <SmoothScrollContext.Provider value={{ lenis: null, scrollTo }}>
      {children}
    </SmoothScrollContext.Provider>
  );
};

export const useSmoothScroll = () => useContext(SmoothScrollContext);
