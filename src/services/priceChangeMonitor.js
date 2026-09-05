/**
 * Price Change Monitor
 * 
 * FPL player prices typically change around 1:30 AM GMT (01:30 UTC).
 * During this window, we should poll bootstrap-static more frequently
 * to detect price rises/falls quickly.
 * 
 * USAGE:
 *   const monitor = createPriceChangeMonitor({
 *     onPriceWindow: () => queryClient.invalidateQueries(fplQueryKeys.bootstrap()),
 *   });
 *   monitor.start();
 *   // Later: monitor.stop();
 */

export const createPriceChangeMonitor = (options = {}) => {
  const {
    onPriceWindow,
    onExitPriceWindow,
    priceChangeHour = 1,
    // 1 AM UTC
    windowDurationMinutes = 60
  } = options;
  let intervalId = null;
  let wasInWindow = false;
  const isInPriceWindow = () => {
    const now = new Date();
    const utcHour = now.getUTCHours();
    const utcMinute = now.getUTCMinutes();

    // Convert current time to minutes since midnight UTC
    const currentMinutes = utcHour * 60 + utcMinute;

    // Convert price window to minutes
    const windowStart = priceChangeHour * 60;
    const windowEnd = windowStart + windowDurationMinutes;
    return currentMinutes >= windowStart && currentMinutes < windowEnd;
  };
  const checkWindow = () => {
    const inWindow = isInPriceWindow();
    if (inWindow && !wasInWindow) {
      // Entering price window
      wasInWindow = true;
      onPriceWindow?.();
    } else if (!inWindow && wasInWindow) {
      // Exiting price window
      wasInWindow = false;
      onExitPriceWindow?.();
    }
  };
  const start = () => {
    if (intervalId) return; // Already running

    // Check immediately
    checkWindow();

    // Check every minute
    intervalId = setInterval(checkWindow, 60 * 1000);
  };
  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    wasInWindow = false;
  };
  return {
    start,
    stop,
    isInPriceWindow
  };
};

/**
 * Calculate the time until the next price change window.
 * Returns milliseconds until the next window starts.
 */
export const getTimeUntilNextPriceWindow = (priceChangeHour = 1) => {
  const now = new Date();
  const nextWindow = new Date();
  nextWindow.setUTCHours(priceChangeHour, 0, 0, 0);

  // If we've passed today's window, move to tomorrow
  if (now.getTime() > nextWindow.getTime()) {
    nextWindow.setUTCDate(nextWindow.getUTCDate() + 1);
  }
  return nextWindow.getTime() - now.getTime();
};

/**
 * Format time until next price window as human-readable string.
 * Example: "2h 15m" or "45m" or "in progress"
 */
export const formatTimeUntilPriceWindow = (priceChangeHour = 1, windowDurationMinutes = 60) => {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcMinute = now.getUTCMinutes();
  const currentMinutes = utcHour * 60 + utcMinute;
  const windowStart = priceChangeHour * 60;
  const windowEnd = windowStart + windowDurationMinutes;

  // Check if in window
  if (currentMinutes >= windowStart && currentMinutes < windowEnd) {
    return "in progress";
  }
  const msUntil = getTimeUntilNextPriceWindow(priceChangeHour);
  const hoursUntil = Math.floor(msUntil / (1000 * 60 * 60));
  const minutesUntil = Math.floor(msUntil % (1000 * 60 * 60) / (1000 * 60));
  if (hoursUntil > 0) {
    return `${hoursUntil}h ${minutesUntil}m`;
  }
  return `${minutesUntil}m`;
};