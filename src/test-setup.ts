import '@testing-library/jest-dom';

// Mock matchMedia for GSAP ScrollTrigger in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock ResizeObserver for Lenis smooth scroll
class MockResizeObserver {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) { this.callback = callback; }
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
}
(globalThis as any).ResizeObserver = MockResizeObserver;

// Mock scrollTo / scrollIntoView for jsdom
Element.prototype.scrollTo = () => {};
Element.prototype.scrollIntoView = () => {};
window.scrollTo = () => {};
