// index.js

import { PricesAPI, ParticleAPI } from './api';
import NotificationsManager from './NotificationsManager';
import config from './config';
import server, { setPrice } from './server';

/**
 * Launch the server allowing the user to add alerts and
 * watch the price.
 */
server();

const api = new PricesAPI('Bitstamp');
const particle = new ParticleAPI;

// Handle a price change
async function onPriceUpdate(){
  await api.refresh();

  let price = api.getCurrent();
  let delta = api.getDelta();

  setPrice(price, api.getExchange());

  NotificationsManager.handlePriceChange(price, delta);
  particle.notifyPrice(price, delta);

  // Re-trigger the method in x second
  setTimeout(onPriceUpdate, config.refresh_delay);
}

// Starts the refresh loop
onPriceUpdate();
