// Defensive guard: Ensure window.fetch has a valid setter if running in a getter-only environment
if (typeof window !== 'undefined') {
  try {
    const proto = window.Window ? window.Window.prototype : Object.getPrototypeOf(window);
    const desc = Object.getOwnPropertyDescriptor(window, 'fetch') ||
                 (proto && Object.getOwnPropertyDescriptor(proto, 'fetch'));
    if (!desc || !desc.set || !desc.writable) {
      const origFetch = window.fetch ? window.fetch.bind(window) : null;
      let currentFetch = origFetch;
      Object.defineProperty(window, 'fetch', {
        configurable: true,
        enumerable: true,
        get: () => currentFetch,
        set: (fn) => { currentFetch = fn; },
      });
    }
  } catch (e) {
    console.warn('[instrumentation-client] fetch guard warning:', e);
  }
}

import { initBotId } from 'botid/client/core';

// Define the paths that need bot protection.
// These are paths that are routed to by your app.
initBotId({
  protect: [
    {
      path: '/api/checkout',
      method: 'POST',
    },
    {
      path: '/api/sensitive/*',
      method: 'POST',
    },
    {
      path: '/api/user/*',
      method: 'POST',
    },
    {
      path: '/api/v1/*',
      method: 'POST',
    },
  ],
});
