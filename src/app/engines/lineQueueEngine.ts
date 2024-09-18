/**
 * A class representing a line queue that processes items in a FIFO manner with a set interval and delay between executions.
 *
 * @template T - The type of the items in the queue.
 * @template R - The type of the result returned from the queueFunction.
 */
class LineQueue<T, R> {
  /**
   * The wait time (in milliseconds) before restarting the queue after reaching the interval limit.
   * @type {number}
   */
  private wait: number;

  /**
   * The internal queue that holds items to be processed.
   * @type {T[]}
   */
  private queue: T[];

  /**
   * The number of items to process in one batch.
   * @type {number}
   */
  private interval: number;

  /**
   * The number of items processed in the current batch.
   * @type {number}
   */
  private executed: number;

  /**
   * The interval time (in milliseconds) to check for new queue items.
   * @type {number}
   */
  private checkInterval: number;

  /**
   * Interval ID for the queue interval.
   */
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * The function to be executed for each item in the queue.
   * @type {(x: T) => Promise<R>}
   */
  private queueFunction: (x: T) => Promise<R>;

  /**
   * An object storing event listeners for custom events.
   * @private
   * @type {{ [key: string]: Array<(data: any) => void> }}
   */
  private events: { [key: string]: Array<(data: any) => void> } = {};

  /**
   * Constructs a new LineQueue.
   *
   * @param {number} [wait=1000] - The wait time (in milliseconds) before restarting the queue.
   * @param {number} [interval=10] - The number of items to process in a batch.
   * @param {(x: T) => Promise<R>} queueFunction - The function to process each item in the queue.
   */
  constructor(
    wait: number = 1000,
    interval: number = 10,
    queueFunction: (x: T) => Promise<R>
  ) {
    this.wait = wait;
    this.queue = [];
    this.interval = interval;
    this.executed = 0;
    this.checkInterval = 1000;
    this.queueFunction = queueFunction;
    this.init();
  }

  /**
   * Initializes the queue by starting the process.
   * @private
   */
  private init() {
    this.intervalId = setInterval(() => {}, this.checkInterval);
    this.startQueue();
  }

  /**
   * Emits an event with the provided name and data to all registered listeners.
   *
   * @private
   * @param {string} eventName - The name of the event to emit. This could be any string used when registering events (e.g., "success", "error").
   * @param {[R, T] | [unknown, T]} data - The data to pass to event listeners.
   *   - If emitting a "success" event, the data will be a tuple where the first element is the result of the queueFunction (of type `R`) and the second element is the original item from the queue (of type `T`).
   *   - If emitting an "error" event, the data will be a tuple where the first element is the error (of type `unknown`) and the second element is the original item from the queue (of type `T`).
   */
  private emit(eventName: string, data: [R, T] | [unknown, T]) {
    const eventListeners = this.events[eventName];
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data));
    }
  }

  /**
   * Starts processing the queue, executing the queue function on each item in the queue.
   * This function is asynchronous and ensures that the number of executions per interval is respected.
   *
   * @private
   * @returns {Promise<void>}
   */

  private async startQueue(): Promise<void> {
    if (this.queue && this.queue.length > 0) {
      if (this.executed >= this.interval) {
        return;
      }
      this.executed++;
      const tempt = this.queue[0];
      this.queue = this.queue.filter(
        (qt) => JSON.stringify(qt) !== JSON.stringify(tempt)
      );

      try {
        const response = await this.queueFunction(tempt);

        this.emit("success", [response, tempt]);
      } catch (error) {
        this.emit("error", [error, tempt]);
      }

      if (this.executed === this.interval) {
        this.executed = 0;
        console.log(`Triggering next ${this.interval}.`);
        setTimeout(() => this.startQueue(), this.wait);
      } else if (this.executed < this.interval) {
        this.startQueue();
      } else {
        console.log("Queue processing...");
      }
    }
  }

  /**
   * Adds a new item to the queue and starts processing if the queue is idle.
   *
   * @param {T} x - The item to add to the queue.
   */
  add(x: T) {
    if (this.queue.length > 0) {
      this.queue.push(x);
    } else {
      this.queue.push(x);
      this.startQueue();
    }
  }

  /**
   * Registers an event listener for a specific event.
   *
   * @param {"success" | "error"} eventName - The name of the event to listen for.
   *   - "success": Triggered when an item is successfully processed by the queueFunction.
   *   - "error": Triggered when the queueFunction encounters an error.
   * @param {(data: [R, T] | [unknown, T]) => void} callback - The callback function to execute when the event is emitted.
   *   - If the event is "success", the callback will receive a tuple where the first element is the result of the queueFunction (of type `R`) and the second element is the original item from the queue (of type `T`).
   *   - If the event is "error", the callback will receive a tuple where the first element is the error (of type `unknown`) and the second element is the original item from the queue (of type `T`).
   */
  on(
    eventName: "success" | "error",
    callback: (data: [R, T] | [unknown, T]) => void
  ) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  /**
   * Unregisters an event listener for a specific event.
   *
   * @param {string} eventName - The name of the event to stop listening for.
   * @param {(data: any) => void} callback - The callback function to remove from the listener list.
   */
  off(eventName: string, callback: (data: any) => void) {
    const eventListeners = this.events[eventName];
    if (eventListeners) {
      this.events[eventName] = eventListeners.filter(
        (listener) => listener !== callback
      );
    }
  }
}

export default LineQueue;
