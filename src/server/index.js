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
    resave: false,
    saveUninitialized: false,
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
      return res.redirect('/');
    }

    res.redirect('/login');
  });

  /**
   * Register routes
   */
  app.get('/register', bindGlobals, (req, res) => {
    res.render('register');
  });

  app.post('/register', bindGlobals, async (req, res) => {
    let { username, password, confirm, pushed_id } = req.body;

    if(username && password && password == confirm && pushed_id) {
      await usersRepo.add(username, password, pushed_id);
      res.redirect('/login');
    } else {
      res.redirect('/register');
    }
  })

  /**
   * Thresholds listing route
   */
  app.get('/', ensureLoggedIn, bindGlobals, async (req, res) => {
    let uid = req.session.uid;
    let alerts = await alertsRepo.getAllForUser(uid);

    res.render('thresholds', { alerts, price, exchange });
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
    let uid = req.session.uid;

    if(id && await alertsRepo.remove(uid, id)) {
      console.log(chalk.green(`Removed alert ${id}`));
      return res.redirect('/');
    }

    res.send('Error while deleting a threshold');
  });

  /**
   * Alerts clearing route
   */
  app.get('/clear', ensureLoggedIn, bindGlobals, async (req, res) => {
    const has = param => req.query.hasOwnProperty(param);

    let uid = req.session.uid;

    if(has('inactive')) {
      alertsRepo.clearNotified(uid);
      console.log(chalk.green(`Cleared all expired alerts`));
    } else if(has('all')) {
      alertsRepo.clearAll(uid);
      console.log(chalk.green('Cleared all alerts'));
    }

    res.redirect('/');
  });

  /**
   * Price update route (for the ui to refresh)
   */
  app.get('/price', (req, res) => {
    res.send(JSON.stringify(price));
  });

  /**
   * Test push notification. See if everything works
   */
  app.get('/test-push', ensureLoggedIn, async (req, res) => {
    try {
      let { pushed_id } = await usersRepo.getPushedId(req.session.uid);
      notifications.rawSend('This is a test notification', pushed_id);

      res.redirect('/');
    } catch (err) {
      res.send("Cannot send push notification");
    }
  });

  // Starts the server
  app.listen(config.express_port);
  console.log(chalk.blue("\n\nServer listening on localhost:3000"));
}
