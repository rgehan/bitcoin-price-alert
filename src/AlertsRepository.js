// AlertsRepository.js

import { MongoClient, ObjectId } from 'mongodb';
import chalk from 'chalk';

import config from './config';

/**
 * Serve as an interface between the database and the rest of the code.
 * It is used by the price watcher, to trigger push notifications, as well
 * as by the Express server, when the user attempts adding a new threshold.
 */
class AlertsRepository {
  constructor() {
    // Connection to the mongodb database
    let url = `mongodb://localhost:${config.mongo_port}/bitcoin-tracker`;
    MongoClient.connect(url, (err, db) => {
      if(err) {
        console.error(chalk.red("Unable to connect to MongoDB"));
        process.exit(1);
      }

      console.log(chalk.green('Alerts repo connected to MongoDB'));
      this.db = db;
    })
  }

  /**
   * Insert an alert into the collection
   */
  add(direction, threshold, uid) {
    return new Promise((resolve, reject) => {
      this.db.collection('users').update({
        "_id": ObjectId(uid)
      }, {
        $push: {
          alerts: {
            direction,
            threshold,
            notified: false,
            notified_when: undefined,
          },
        },
      }, (err, res) => {
        if(err) reject(err);
        else resolve(res.result.n > 0);
      });
    });
  }

  /**
   * Delete an alert by id
   */
  remove(id) {
    return new Promise((resolve, reject) => {
      this.db.collection('alerts').deleteOne({ _id: ObjectId(id) }, (err, res) => {
        if(err)
          reject(err);
        else
          resolve(res.result.n > 0);
      });
    });
  }

  /**
   * Mark an alert as notified
   */
  markNotified(id) {
    return new Promise((resolve, reject) => {
      this.db.collection('alerts').update({
        _id: ObjectId(id)
      }, {
        $set: {
          notified: true,
          date_notified: new Date
        }
      }, null, (err, res) => {
        if(err)
          reject(err);
        else
          resolve(res.result.n);
      });
    })
  }

  /**
   * Return all the alerts
   */
  async getAllForUser(uid) {
    return new Promise((resolve, reject) => {
      this.db.collection('alerts').find({}).toArray((err, docs) => {
        if(err)
          reject(err);
        else
          resolve(docs);
      });
    });
  }

  /**
   * Return all the active (not notified) alerts
   */
  async getActive() {
    return new Promise((resolve, reject) => {
      this.db.collection('alerts').find({ notified: false }).toArray((err, docs) => {
        if(err)
          reject(err);
        else
          resolve(docs);
      });
    });
  }

  /**
   * Clear the alerts that were already notified
   */
  async clearNotified() {
    return new Promise((resolve, reject) => {
      this.db.collection('alerts').deleteMany({ notified: true }, (err, res) => {
        if(err)
          reject(err);
        else
          resolve(res.result.n);
      });
    });
  }

  /**
   * Clear the alerts
   */
  async clearAll() {
    return new Promise((resolve, reject) => {
      this.db.collection('alerts').deleteMany({}, (err, res) => {
        if(err)
          reject(err);
        else
          resolve(res.result.n);
      });
    });
  }
}

export default new AlertsRepository;
