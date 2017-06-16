// NotificationsManager.js

import { PushedAPI } from './api';
import config from './config';

class NotificationsManager {

  /**
   * Initialize the instance
   */
  constructor() {
    // The list of the threshold we can cross
    this.thresholds = [];

    // Last notification times for the different events
    this.lastNotification = {rise: 0, fall: 0};

    // Build the Pusher API
    this.api = new PushedAPI({
      key: config.pushed.key,
      secret: config.pushed.secret,
    });
  }

  /**
   * Add a threshold to the list
   */
  addThreshold(direction, threshold) {
    this.thresholds.push({
      direction,
      threshold
    });
  }

  /**
   * On price change, check if a threshold is crossed
   */
  handlePriceChange(current, delta) {
    this.thresholds.forEach(({direction, threshold}) => {
      if(this.thresholdCrossed(direction, threshold, delta, current))
        this.attemptNotify(direction, threshold, current);
    });
  }

  /**
   * Return whether or not the user should be notified
   */
  thresholdCrossed(direction, threshold, delta, current) {
    return delta > 0 && direction == 'rise' && current > threshold ||
           delta < 0 && direction == 'fall' && current < threshold;
  }

  /**
   * Attempts to notify the user
   */
  attemptNotify(direction, threshold, current) {
    let delta = +(new Date) - this.lastNotification[direction];

    // If enough time has passed, notify
    if(delta > config.delay_between_same_notification) {
      this.api.send(this.buildEventMessage(direction, threshold, current));
      this.lastNotification[direction] = +(new Date);
    }
  }

  /**
   * Build a message for a price event
   */
  buildEventMessage(direction, threshold, current) {
    if(direction == 'rise')
      return `Valeur du BTC au dessus de ${threshold} (courant: ${current})`;
    else if(direction == 'fall')
      return `Valeur du BTC au dessous de ${threshold} (courant: ${current})`;
  }
}

export default NotificationsManager;
