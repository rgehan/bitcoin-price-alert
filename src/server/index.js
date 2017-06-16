// server/index.js

import express from 'express';
import bodyParser from 'body-parser';

import repo from '../ThresholdsRepository';

export default function() {
  const app = express();

  app.use(bodyParser.urlencoded({
    extended: true,
  }));

  app.get('/', async (req, res) => {
    const generateLi = t => {
      return '<li>' + t.direction + ' ' + t.threshold + ' (<a href="/delete?id='+ t._id +'">Delete</a>)';
    }

    let thresholds = await repo.get();
    res.send('<ul>' + thresholds.reduce((acc,t) => acc + generateLi(t), '') + '</ul>');
  });

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

  app.get('/delete', async (req, res) => {
    let id = req.query.id;

    if(id && await repo.delete(id))
      return res.redirect('/');

    res.send('Error while deleting the threshold...');
  })

  app.listen(3000);
}
