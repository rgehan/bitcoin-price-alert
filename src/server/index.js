// server/index.js

import express from 'express';
import pug from 'pug';
import path from 'path';
import chalk from 'chalk';

import config from '../config';
import repo from '../AlertsRepository';
import notifications from '../NotificationsManager';

let price;
let exchange;
export function setPrice(p, e) {
  price = p;
  exchange = e;
};

export default function() {
  const app = express();

  app.use('/public', express.static(path.join(__dirname, '/public')));

  app.set('view engine', 'pug');
  app.set('views', path.join(__dirname, '/views'));

  /**
   * Login route
   */
  app.get('/login', async (req, res) => {
    res.render('login');
  });

  /**
   * Thresholds listing route
   */
  app.get('/', async (req, res) => {
    let thresholds = await repo.getAll();
    res.render('thresholds', { thresholds, price, exchange });
  });

  /**
   * Threshold adding route
   */
  app.get('/add', async (req, res) => {
    let direction = req.query.direction;
    let threshold = req.query.threshold;

    if(direction && threshold && await repo.add(direction, threshold)) {
      console.log(chalk.green(`Alert added on ${direction} with threshold ${threshold}`));
      res.redirect('/');
    } else {
      res.send('Error while adding a threshold');
    }
  });

  /**
   * Threshold deletion route
   */
  app.get('/remove', async (req, res) => {
    let id = req.query.id;

    if(id && await repo.remove(id)) {
      console.log(chalk.green(`Removed alert ${id}`));
      return res.redirect('/');
    }

    res.send('Error while deleting a threshold');
  });

  app.get('/clear', async (req, res) => {
    const has = param => req.query.hasOwnProperty(param);

    if(has('inactive')) {
      repo.clearNotified();
      console.log(chalk.green(`Cleared all expired alerts`));
    } else if(has('all')) {
      repo.clearAll();
      console.log(chalk.green('Cleared all alerts'));
    }

    res.redirect('/');
  });

  app.get('/price', (req, res) => {
    res.send(JSON.stringify(price));
  });

  app.get('/test-push', (req, res) => {
    notifications.rawSend('This is a test notification');
    res.redirect('/');
  });

  // Starts the server
  app.listen(config.express_port);
  console.log(chalk.blue("\n\nServer listening on localhost:3000"));
}
