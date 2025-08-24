// Utility for dynamic viewport height calculation
// This ensures proper scaling across different desktop screen sizes

export function initDynamicViewport() {
  function setViewportHeight() {
    // Calculate the actual viewport height
    const vh = window.innerHeight * 0.01;
    // Set CSS custom property
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  // Set initial value
  setViewportHeight();

  // Update on resize with debouncing
  let resizeTimeout: NodeJS.Timeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(setViewportHeight, 100);
  });

  // Update on orientation change (mobile)
  window.addEventListener('orientationchange', () => {
    setTimeout(setViewportHeight, 100);
  });
}