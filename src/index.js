// index.js

import { PricesAPI } from './api';
import NotificationsManager from './NotificationsManager';
import config from './config';

// Build the Prices API
const api = new PricesAPI;

// Build the notification manager
const notifications = new NotificationsManager;
notifications.addThreshold('rise', 2517);
notifications.addThreshold('fall', 2500);

// Handle a price change
async function onPriceUpdate(){
  await api.refresh();

  let price = api.getCurrent();
  let delta = api.getDelta();

  console.log('Price:', price);

  notifications.handlePriceChange(price, delta);
}

// Triggers the logic every x second
setInterval(onPriceUpdate, config.refresh_delay);
