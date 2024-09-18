/**
 * A callback function to handle events.
 *
 * @param {any} data - The data associated with the event.
 */
type EventCallback = (data: any) => void;

/**
 * A custom event emitter that allows subscribing to events, emitting events, and unsubscribing from events.
 */
class CustomEventEmitter {
  /**
   * Stores the event listeners for different events.
   * @private
   */
  private events: { [key: string]: EventCallback[] } = {};

  /**
   * Subscribes to a specified event by adding an event listener callback.
   *
   * @param {string} eventName - The name of the event to listen for.
   * @param {EventCallback} callback - The callback function to be executed when the event is emitted.
   *
   * @example
   * const emitter = new CustomEventEmitter();
   * emitter.on("greet", (message) => {
   *   console.log(`Received message: ${message}`);
   * });
   */
  on(eventName: string, callback: EventCallback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  /**
   * Emits a specified event, calling all registered event listeners for that event.
   *
   * @param {string} eventName - The name of the event to emit.
   * @param {any} [data] - The data to pass to the event listeners.
   *
   * @example
   * const emitter = new CustomEventEmitter();
   * emitter.emit("greet", "Hello, World!");
   */
  emit(eventName: string, data?: any) {
    const eventListeners = this.events[eventName];
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data));
    }
  }

  /**
   * Unsubscribes from a specified event by removing a previously registered event listener.
   *
   * @param {string} eventName - The name of the event to unsubscribe from.
   * @param {EventCallback} callback - The callback function to remove from the event's listeners.
   *
   * @example
   * const emitter = new CustomEventEmitter();
   * const callback = (message) => console.log(message);
   * emitter.on("greet", callback);
   * emitter.off("greet", callback);
   */
  off(eventName: string, callback: EventCallback) {
    const eventListeners = this.events[eventName];
    if (eventListeners) {
      this.events[eventName] = eventListeners.filter(
        (listener) => listener !== callback
      );
    }
  }
}

export default CustomEventEmitter;
