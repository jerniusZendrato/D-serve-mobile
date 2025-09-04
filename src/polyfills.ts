// polyfills.ts
// Polyfill global untuk library Node.js (sockjs, stompjs) di browser
(window as any).global = window;
(window as any).process = {
  env: { DEBUG: undefined },
  version: '',
  nextTick: (fn: Function) => setTimeout(fn, 0)
};
(window as any).Buffer = (window as any).Buffer || {};
