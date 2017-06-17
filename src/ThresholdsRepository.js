// ThresholdsRepository.js

import { MongoClient, ObjectId } from 'mongodb';
import chalk from 'chalk';

/**
 * Serve as an interface between the database and the rest of the code.
 * It is used by the price watcher, to trigger push notifications, as well
 * as by the Express server, when the user attempts adding a new threshold.
 */
class ThresholdsRepository {
  constructor() {
    // Connection to the mongodb database
    let url = 'mongodb://localhost:27017/bitcoin-tracker';
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
   * Insert a threshold into the collection
   */
  add(direction, threshold) {
    return new Promise((resolve, reject) => {
      this.db.collection('thresholds').insert({
        direction,
        threshold,
        notified: false,
        notified_when: undefined,
      }, (err, res) => {
        if(err)
          reject(err);
        else
          resolve(res.result.n > 0);
      });
    });
  }

  /**
   * Delete a threshold by id
   */
  remove(id) {
    return new Promise((resolve, reject) => {
      this.db.collection('thresholds').deleteOne({ _id: ObjectId(id) }, (err, res) => {
        if(err)
          reject(err);
        else
          resolve(res.result.n > 0);
      });
    });
  }

  /**
   * Mark a threshold as notified
   */
  markNotified(id) {
    return new Promise((resolve, reject) => {
      this.db.collection('thresholds').update({
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
   * Return all the thresholds
   */
  async getAll() {
    return new Promise((resolve, reject) => {
      this.db.collection('thresholds').find({}).toArray((err, docs) => {
        if(err)
          reject(err);
        else
          resolve(docs);
      });
    });
  }

  /**
   * Return all the active (not notified) thresholds
   */
  async getActive() {
    return new Promise((resolve, reject) => {
      this.db.collection('thresholds').find({ notified: false }).toArray((err, docs) => {
        if(err)
          reject(err);
        else
          resolve(docs);
      });
    });
  }

  /**
   * Clear the thresholds that were already notified
   */
  async clearNotified() {
    return new Promise((resolve, reject) => {
      this.db.collection('thresholds').deleteOne({ notified: true }, (err, res) => {
        if(err)
          reject(err);
        else
          resolve(res.result.n);
      });
    });
  }
}

export default new ThresholdsRepository;
