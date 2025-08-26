// Jest setup for Mithril testing

// Mock window.requestAnimationFrame
(globalThis as any).requestAnimationFrame = (callback: FrameRequestCallback): number => {
  return setTimeout(callback, 0);
};

(globalThis as any).cancelAnimationFrame = (id: number): void => {
  clearTimeout(id);
};

// Setup for mithril-materialized components testing
Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  value: jest.fn(() => ({
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0,
  })),
  writable: true,
});