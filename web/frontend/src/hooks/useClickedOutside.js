import { useEffect, useRef } from 'react';

/**
 * Custom hook to detect clicks outside a specified DOM element.
 *
 * @param {Function} handler - The function to call when a click outside is detected.
 * @returns {React.RefObject} A ref object to be attached to the component's root DOM element.
 */
function useClickedOutside(handler) {
  const ref = useRef(null); // Create a ref to hold the DOM element

  useEffect(() => {
    // Define the event listener function
    const listener = (event) => {
      // If the ref's current element doesn't exist OR
      // the click event target is inside the ref's current element, do nothing.
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      // Otherwise, the click was outside, so call the handler
      handler(event);
    };

    // Attach the mousedown event listener to the document
    document.addEventListener('mousedown', listener);
    // You can also add 'touchstart' for mobile devices if desired
    // document.addEventListener('touchstart', listener);

    // Cleanup function: remove the event listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', listener);
      // document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]); // Dependencies: re-run effect if ref or handler changes

  return ref; // Return the ref so it can be attached to a DOM element
}

export default useClickedOutside;
