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

// Suppress JSDOM navigation errors by intercepting them
const originalError = console.error;
console.error = (...args) => {
  // Filter out JSDOM navigation errors
  if (args[0] && args[0].toString && args[0].toString().includes('Not implemented: navigation')) {
    return;
  }
  originalError.apply(console, args);
};

// Mock window.location to prevent JSDOM navigation errors
delete (window as any).location;
(window as any).location = {
  search: '?param1=value1&param2=value2&array[]=item1&array[]=item2',
  hash: '#section?id=123&name=test',
  href: 'http://localhost',
  hostname: 'localhost',
  port: '',
  protocol: 'http:',
  pathname: '/',
  assign: jest.fn(),
  reload: jest.fn(),
  replace: jest.fn(),
};