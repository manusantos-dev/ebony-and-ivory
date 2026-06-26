// INIT: Type-Safe Publish/Subscribe Event Bus
type EventHandler = (payload: any) => void;

class EventBus {
  private listeners: Map<string, Set<EventHandler>>;

  constructor() {
    this.listeners = new Map();
  }

  on(event: string, handler: EventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    return () => this.off(event, handler);
  }

  off(event: string, handler: EventHandler): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(handler);
    }
  }

  emit(event: string, payload?: any): void {
    if (!this.listeners.has(event)) return;
    for (const handler of this.listeners.get(event)!) {
      try {
        handler(payload);
      } catch (error) {
        console.error(`EventBus Error [${event}]:`, error);
      }
    }
  }
}

const bus = new EventBus();

export const on = bus.on.bind(bus);
export const emit = bus.emit.bind(bus);
export const off = bus.off.bind(bus);
