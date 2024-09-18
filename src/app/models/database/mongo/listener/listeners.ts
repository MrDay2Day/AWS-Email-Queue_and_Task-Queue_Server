import Demo from "../schemas/Demo_User";

/**
 * Main MongoDB Listener Function
 *
 * This function initializes the main MongoDB listener by calling the DemoListener function.
 * If an error occurs during the initialization, it logs the error to the console.
 *
 * @function MongoMainListener
 * @example To start listening for changes on the Demo collection:
 * MongoMainListener();
 * @returns {void}
 */
export function MongoMainListener(): void {
  try {
    DemoListener();
  } catch (error) {
    console.log("MongoMainListener", { error });
  }
}

/**
 * Demo MongoDB Event Listener
 *
 * This function sets up a change stream listener on the 'Demo' collection.
 * The 'watch' function is used to monitor changes on the collection and log
 * them to the console. If an error occurs while setting up the listener, it logs
 * the error to the console.
 *
 * @function DemoListener
 * @example Automatically called by MongoMainListener to start listening for changes:
 * DemoListener();
 *
 * @description
 * Example use case:
 * 1. Listening for real-time updates to the 'Demo' collection.
 * 2. Logging changes to the console for debugging or monitoring purposes.
 * 3. Triggering additional application logic based on changes in the collection.
 */
function DemoListener() {
  try {
    const demo_watch = Demo.watch();

    /**
     * Event listener for change events on the Demo collection.
     *
     * @event change
     * @param {Object} change - The change event object.
     */
    demo_watch.on("change", (change) => {
      console.log(change);
    });
    /**
     * Event listener for error events on the Demo collection.
     *
     * @event error
     * @param {Error} error - The error object.
     */
    demo_watch.on("error", (error) => {
      demo_watch.close();
      console.log(error);
    });

    /**
     * Event listener for the close event on the Demo collection.
     * This event is triggered when the listener is closed.
     *
     * @event close
     */
    demo_watch.on("close", () => {
      console.log("demo_watch listener close.");

      setTimeout(DemoListener, 5000);
    });
  } catch (error) {
    console.log("DemoListener", { error });
  }
}
