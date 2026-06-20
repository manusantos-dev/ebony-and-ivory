const listeners = new Map();

export function on(event, handler) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(handler);
}

export function emit(event, payload) {
  if (!listeners.has(event)) return;
  listeners.get(event).forEach((handler) => handler(payload));
}
