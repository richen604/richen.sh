/** Hide the cursor after 2 seconds */
const TIMEOUT_MS = 2000;

/**
 * Add a process to the DOM that hides the cursor after a certain period of time since the last cursor movement
 *
 * @param {HTMLElement} element
 * @returns {() => void} A function to show the cursor and remove the added process from the DOM
 */
export function registerCursorTimeout(element) {
  let timeoutId;

  const showCursorAndSetCursorTimeout = () => {
    element.style.cursor = "inherit";

    if (timeoutId != null) {
      clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => {
      element.style.cursor = "none";
    }, TIMEOUT_MS);
  };

  element.addEventListener("pointermove", showCursorAndSetCursorTimeout);

  return () => {
    element.removeEventListener("pointermove", showCursorAndSetCursorTimeout);

    if (timeoutId != null) {
      clearTimeout(timeoutId);
    }

    element.style.cursor = "inherit";
  };
}
