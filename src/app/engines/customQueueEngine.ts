/**
 * Represents the structure of a task in the task queue.
 *
 * @template TaskData - The type of data associated with the task.
 */
interface TaskTypes<TaskData> {
  /**
   * Unique identifier for the task.
   */
  taskId: string;

  /**
   * The data associated with the task.
   */
  data: TaskData;

  /**
   * The date and time when the task expires.
   */
  expiryDate: Date;
}

/**
 * Represents a type that can either be a single task, an array of tasks, or a basic data type.
 *
 * @template TaskData - The type of data associated with the task.
 */
type CalculateType<TaskData> =
  | TaskTypes<TaskData>[]
  | TaskTypes<TaskData>
  | string
  | number;

/**
 * Represents a callback function that handles task-related events.
 *
 * @template TaskData - The type of data associated with the task.
 * @param data - The task data associated with the event.
 */
type EventCallback<TaskData> = (data: TaskTypes<TaskData>) => void;

/**
 * Enum for the different types of task events that can be emitted.
 */
enum EmitListenTypes {
  /**
   * Event type for when a task is added.
   */
  ADD = "ADD",

  /**
   * Event type for when a task is removed.
   */
  REMOVE = "REMOVE",

  /**
   * Event type for when a task expires.
   */
  EXPIRED = "EXPIRED",
}

/**
 * A task queue that manages tasks, checking their expiry and emitting events for task-related actions.
 *
 * @template TaskData - The type of data associated with the tasks in the queue.
 */
class CustomQueue<TaskData> {
  /**
   * Interval in milliseconds at which the task queue checks for expired tasks.
   */
  private checkInterval: number;

  /**
   * Array that holds the tasks in the queue.
   */
  private tasks: TaskTypes<TaskData>[];

  /**
   * Interval ID for the task checking mechanism.
   */
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Object that holds event listeners for different task events.
   */
  private events: { [key: string]: EventCallback<TaskData>[] } = {};

  /**
   * Initializes a new instance of the CustomQueue class.
   */
  constructor() {
    this.tasks = [];
    this.checkInterval = 1000; // Check every second
    this.init();
  }

  /**
   * Initializes the task checking interval.
   * @private
   */
  private init() {
    this.intervalId = setInterval(() => this.checkTasks(), this.checkInterval);
  }

  /**
   * Adds a new task to the task queue if it doesn't already exist.
   * If a task with the same `taskId` is found, an error is thrown.
   *
   * @param {string} taskId - The unique identifier for the task.
   * @param {TaskData} data - The data associated with the task.
   * @param {Date} expiryDate - The date and time when the task should expire.
   * @throws {Error} Will throw an error if a task with the same `taskId` already exists in the queue.
   *
   * @example
   * const queue = new CustomQueue<DataType>();
   * queue.addTask("task1", { value: 123 }, new Date("2024-12-31"));
   */
  addTask(taskId: string, data: TaskData, expiryDate: Date) {
    if (this.intervalId === null) return;
    const found = this.tasks.find((task) => task.taskId === taskId);
    if (!found) {
      this.tasks.push({ taskId, data, expiryDate });
      this.emit(EmitListenTypes.ADD, { taskId, data, expiryDate });
    } else {
      throw new Error("'taskId' already exist.");
    }
  }

  /**
   * Removes a task from the task queue by its `taskId`.
   * If a task with the given `taskId` is found, it is removed and a `REMOVE` event is emitted.
   * If no task with the given `taskId` is found, an error is thrown.
   *
   * @param {string} taskId - The unique identifier for the task to be removed.
   * @throws {Error} Will throw an error if no task with the specified `taskId` exists in the queue.
   *
   * @example
   * const queue = new CustomQueue<DataType>();
   * queue.removeTask("task1");
   */
  removeTask(taskId: string) {
    const found = this.tasks.find((task) => task.taskId === taskId);
    if (found) {
      this.tasks = this.tasks.filter((taskObj) => {
        if (taskObj.taskId.toLowerCase() === taskId.toLowerCase()) {
          this.emit(EmitListenTypes.REMOVE, taskObj);
          return false;
        }
        return true;
      });
    } else {
      throw new Error("'taskId' does not exist.");
    }
  }

  /**
   * Checks the tasks in the queue to determine if any have expired.
   * If a task has expired, it is removed from the queue, and an `EXPIRED` event is emitted.
   * @private
   */
  private checkTasks() {
    const now = new Date();

    this.tasks = this.tasks.filter((taskObj) => {
      if (now >= taskObj.expiryDate) {
        this.emit(EmitListenTypes.EXPIRED, taskObj);
        return false;
      }
      return true;
    });
  }

  /**
   * Registers an event listener for a specific task event.
   *
   * @param eventName - The name of the event to listen for.
   * @param callback - The function to call when the event is emitted.
   */
  on(eventName: EmitListenTypes, callback: EventCallback<TaskData>) {
    if (this.intervalId === null) {
      this.start();
      console.log("Starting queue");
    }
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  /**
   * Emits a specific event to all registered listeners.
   * @private
   * @param eventName - The name of the event to emit.
   * @param data - The data to pass to the event listeners.
   */
  private emit(eventName: EmitListenTypes, data: TaskTypes<TaskData>) {
    const eventListeners = this.events[eventName];
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data));
    }
  }

  /**
   * Unregisters an event listener for a specific task event.
   *
   * @param eventName - The name of the event to stop listening for.
   * @param callback - The function that was previously registered.
   */
  off(eventName: EmitListenTypes, callback: EventCallback<TaskData>) {
    const eventListeners = this.events[eventName];
    if (eventListeners) {
      this.events[eventName] = eventListeners.filter(
        (listener) => listener !== callback
      );
    }
  }

  /**
   * Approximates the size in memory of the provided object.
   * @private
   * @param obj - The object to estimate the size of.
   * @returns The approximate size of the object in bytes.
   */
  private approximateSize(obj: CalculateType<TaskData>): number {
    const type = typeof obj;
    let size: number = 0;

    if (obj instanceof Array) {
      obj.forEach(
        (e: CalculateType<TaskData>) => (size += this.approximateSize(e))
      );
    } else if (typeof obj === "string") {
      size = obj.length * 2; // Assuming 2 bytes per character (UTF-16)
    } else if (type === "object" && typeof obj === "object") {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = (obj as TaskTypes<TaskData>)[
            key as keyof TaskTypes<TaskData>
          ];
          size += this.approximateSize(value as CalculateType<TaskData>);
        }
      }
      size += 16; // Adjust based on your understanding of object overhead
    } else if (typeof obj === "number" || typeof obj === "boolean") {
      size = 8; // Assuming 8 bytes for doubles and booleans
    }

    return size;
  }

  /**
   * Returns the approximate size in memory of the current tasks in the queue.
   *
   * @returns The approximate size of the tasks in bytes.
   */
  sizeInMemory(): number {
    return this.approximateSize(this.tasks);
  }

  /**
   * Stops the task checking interval and clears the tasks in the queue.
   * @private
   */
  private stopInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.tasks = [];
    }
  }

  /**
   * Starts the task checking interval if it is not already running.
   */
  start() {
    if (this.intervalId === null) {
      this.init();
    }
  }

  /**
   * Stops the task checking interval and clears the tasks in the queue.
   */
  stop() {
    this.stopInterval();
  }
}

export { CustomQueue, TaskTypes, EmitListenTypes };
