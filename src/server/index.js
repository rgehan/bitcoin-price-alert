// server/index.js

import express from 'express';
import bodyParser from 'body-parser';

import repo from '../ThresholdsRepository';

export default function() {
  const app = express();

  /**
   * Thresholds listing route
   */
  app.get('/', async (req, res) => {
    const generateLi = t => {
      return '<li>' + t.direction + ' ' + t.threshold + ' (<a href="/delete?id='+ t._id +'">Delete</a>)';
    }

    let thresholds = await repo.get();
    res.send('<ul>' + thresholds.reduce((acc,t) => acc + generateLi(t), '') + '</ul>');
  });

  /**
   * Threshold adding route
   */
  app.get('/add', (req, res) => {
    let direction = req.query.direction;
    let threshold = req.query.threshold;

    if(direction && threshold) {
      repo.add(direction, threshold);
      res.send('ok');
    } else {
      res.send('nok');
    }
  });

  /**
   * Threshold deletion route
   */
  app.get('/delete', async (req, res) => {
    let id = req.query.id;

    if(id && await repo.delete(id))
      return res.redirect('/');

    res.send('Error while deleting the threshold...');
  })

  // Starts the server
  app.listen(3000);
}
