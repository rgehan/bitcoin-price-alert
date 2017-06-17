// NotificationsManager.js

import { PushedAPI } from './api';
import config from './config';
import AlertsRepository from './AlertsRepository';

class NotificationsManager {

  /**
   * Initialize the instance
   */
  constructor() {
    // The list of the threshold we can cross
    this.thresholdsRepo = AlertsRepository;

    // Build the Pusher API
    this.api = new PushedAPI({
      key: config.pushed.key,
      secret: config.pushed.secret,
    });
  }

  /**
   * On price change, check if a threshold is crossed
   */
  async handlePriceChange(current, delta) {
    let thresholds = await this.thresholdsRepo.getActive();

    // console.log("Handling: " + thresholds.length);

    thresholds.forEach(({_id, direction, threshold }) => {
      if(this.thresholdCrossed(direction, threshold, delta, current)) {
        this.notify(direction, threshold, current);
        this.thresholdsRepo.markNotified(_id);
      }
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
  notify(direction, threshold, current) {
    this.rawSend(this.buildEventMessage(direction, threshold, current));
  }

  /**
   * Sends a string via Pushed
   */
  rawSend(msg) {
    this.api.send(msg);
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

export default new NotificationsManager;
