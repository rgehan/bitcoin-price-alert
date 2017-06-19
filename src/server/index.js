// server/index.js

import express from 'express';
import pug from 'pug';
import path from 'path';
import chalk from 'chalk';
import bodyParser from 'body-parser';
import session from 'express-session';

import config from '../config';
import alertsRepo from '../AlertsRepository';
import usersRepo from '../UsersRepository';
import notifications from '../NotificationsManager';

let price;
let exchange;
export function setPrice(p, e) {
  price = p;
  exchange = e;
};

export default function() {
  const app = express();

  // Enable body parsing
  app.use(bodyParser.urlencoded({ extended: false }));

  // Maps /public webserver folder to the static asset folder
  app.use('/public', express.static(path.join(__dirname, '/public')));

  // Enable sessions
  app.use(session({
    secret: config.secret,
  }));

  // Setup view engine
  app.set('view engine', 'pug');
  app.set('views', path.join(__dirname, '/views'));

  // Route protection middleware
  const ensureLoggedIn = (req, res, next) => {
    if(req.session && req.session.uid)
      return next();

    res.redirect('/login');
  }

  // View globals binding middleware
  const bindGlobals = (req, res, next) => {
    res.locals = {
      session: { isLoggedIn: false },
    };

    if(req.session && req.session.uid && req.session.username) {
      res.locals = {
        session: {
          isLoggedIn: true,
          uid: req.session.uid,
          username: req.session.username,
        },
      };
    }

    next();
  }

  /**
   * Login routes
   */
  app.get('/login', bindGlobals, (req, res) => {
    res.render('login');
  });

  app.post('/login', async (req, res) => {
    let { username, password } = req.body;
    let users = await usersRepo.findByCredentials(username, password);

    if(users.length) {
      req.session.uid = users[0]._id;
      req.session.username = users[0].username;
      res.redirect('/');
    }

    res.redirect('/login');
  });

  /**
   * Thresholds listing route
   */
  app.get('/', ensureLoggedIn, bindGlobals, async (req, res) => {
    let uid = req.session.uid;
    let thresholds = await alertsRepo.getAllForUser(uid);
    res.render('thresholds', { thresholds, price, exchange });
  });

  /**
   * Threshold adding route
   */
  app.get('/add', ensureLoggedIn, bindGlobals, async (req, res) => {
    let direction = req.query.direction;
    let threshold = req.query.threshold;
    let uid = req.session.uid;

    if(direction && threshold && await alertsRepo.add(direction, threshold, uid)) {
      console.log(chalk.green(`Alert added on ${direction} with threshold ${threshold}`));
      res.redirect('/');
    } else {
      res.send('Error while adding a threshold');
    }
  });

  /**
   * Threshold deletion route
   */
  app.get('/remove', ensureLoggedIn, bindGlobals, async (req, res) => {
    let id = req.query.id;

    if(id && await alertsRepo.remove(id)) {
      console.log(chalk.green(`Removed alert ${id}`));
      return res.redirect('/');
    }

    res.send('Error while deleting a threshold');
  });

  app.get('/clear', ensureLoggedIn, bindGlobals, async (req, res) => {
    const has = param => req.query.hasOwnProperty(param);

    if(has('inactive')) {
      alertsRepo.clearNotified();
      console.log(chalk.green(`Cleared all expired alerts`));
    } else if(has('all')) {
      alertsRepo.clearAll();
      console.log(chalk.green('Cleared all alerts'));
    }

    res.redirect('/');
  });

  app.get('/price', (req, res) => {
    res.send(JSON.stringify(price));
  });

  app.get('/test-push', ensureLoggedIn, (req, res) => {
    notifications.rawSend('This is a test notification');
    res.redirect('/');
  });

  // Starts the server
  app.listen(config.express_port);
  console.log(chalk.blue("\n\nServer listening on localhost:3000"));
}
