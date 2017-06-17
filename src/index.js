// index.js

import { PricesAPI } from './api';
import NotificationsManager from './NotificationsManager';
import config from './config';
import server, { setPrice } from './server';

server();

// Build the Prices API
const api = new PricesAPI('Bitstamp');

// Build the notification manager
const notifications = new NotificationsManager;

// Handle a price change
async function onPriceUpdate(){
  await api.refresh();

  let price = api.getCurrent();
  let delta = api.getDelta();

  setPrice(price, api.getExchange());

  notifications.handlePriceChange(price, delta);

  // Re-trigger the method in x second
  setTimeout(onPriceUpdate, config.refresh_delay);
}

// Starts the refresh loop
onPriceUpdate();
