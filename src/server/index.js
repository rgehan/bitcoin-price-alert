// server/index.js

import express from 'express';
import pug from 'pug';
import path from 'path';
import chalk from 'chalk';

import repo from '../ThresholdsRepository';

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
    repo.clearNotified();
    console.log(chalk.green(`Cleared all expired alerts`));
  });

  app.get('/price', (req, res) => {
    res.send(JSON.stringify(price));
  });

  // Starts the server
  app.listen(3000);
  console.log(chalk.blue("\n\nServer listening on localhost:3000"));
}
