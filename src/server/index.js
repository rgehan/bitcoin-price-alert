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

    const generateForm = () => {
      return `<form action="/add" method="GET">
                <select name="direction">
                  <option>rise</option>
                  <option>fall</option>
                </select><br/>
                <input type="number" name="threshold"><br/>
                <input type="submit">
              </form>`;
    }

    let thresholds = await repo.get();
    res.send(generateForm() + '<h3>List</h3><ul>' + thresholds.reduce((acc,t) => acc + generateLi(t), '') + '</ul>');
  });

  /**
   * Threshold adding route
   */
  app.get('/add', async (req, res) => {
    let direction = req.query.direction;
    let threshold = req.query.threshold;

    if(direction && threshold && await repo.add(direction, threshold)) {
      res.redirect('/');
    } else {
      res.send('Error while adding a threshold');
    }
  });

  /**
   * Threshold deletion route
   */
  app.get('/delete', async (req, res) => {
    let id = req.query.id;

    if(id && await repo.delete(id))
      return res.redirect('/');

    res.send('Error while deleting a threshold');
  })

  // Starts the server
  app.listen(3000);
}
