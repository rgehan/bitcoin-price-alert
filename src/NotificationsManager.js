// NotificationsManager.js

import { PushedAPI } from './api';
import config from './config';

// Builds a message for a price event
const getMessage = (direction, threshold, current) => {
  if(direction == 'rise')
    return `Valeur du BTC au dessus de ${threshold} (courant: ${current})`;
  else
    return `Valeur du BTC au dessous de ${threshold} (courant: ${current})`;  
}

class NotificationsManager {
  constructor() {
    this.thresholds = [];

    this.lastNotification = {rise: 0, fall: 0};

    // Build the Push API
    this.api = new PushedAPI({
      key: 'mf4KnNBk77NLERaZEvNI',
      secret: '05uQSpqCd9mpnFZ2ronq2MGSJyQ2v3qYrS2f0JqUFFPHGZT0V2kyY54d6EP3FmS4'
    });
  }

  // Adds a threshold to the list
  addThreshold(direction, threshold) {
    this.thresholds.push({
      direction,
      threshold
    });
  }

  // On price change, check if a threshold is crossed
  handlePriceChange(current, delta) {
    this.thresholds.forEach(({direction, threshold}) => {
      if(this.thresholdCrossed(direction, threshold, delta, current))
        this.attemptNotify(direction, threshold, current);
    });
  }

  // Return whether or not the user should be notified
  thresholdCrossed(direction, threshold, delta, current) {
    return delta > 0 && direction == 'rise' && current > threshold || 
           delta < 0 && direction == 'fall' && current < threshold;
  }

  // Attempts to notify the user
  attemptNotify(direction, threshold, current) {
    let delta = +(new Date) - this.lastNotification[direction];

    // If enough time has passed, notify
    if(delta > config.delay_between_same_notification) {
      console.log('Enough time has passed, notifying !');

      this.api.send(getMessage(direction, threshold, current));
      this.lastNotification[direction] = +(new Date);
    } else {
      let cooldown = Math.floor((config.delay_between_same_notification - (+new Date - this.lastNotification[direction])) / 1000);
      console.log(`Not enough time has passed, no notification (cooldown: ${cooldown} sec)`);
    }
  }
}

export default NotificationsManager;