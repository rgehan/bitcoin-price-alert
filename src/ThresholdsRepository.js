// ThresholdsRepository.js

import { MongoClient, ObjectId } from 'mongodb';
import assert from 'assert';

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
      assert.equal(err, null);
      console.log('Connected to MongoDB.');
      this.db = db;
    })
  }

  /**
   * Insert a threshold into the collection
   */
  add(direction, threshold) {
    let collection = this.db.collection('thresholds');

    return new Promise((resolve, reject) => {
      collection.insert({
        direction,
        threshold,
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
  delete(id) {
    let collection = this.db.collection('thresholds');
    return new Promise((resolve, reject) => {
      collection.deleteOne({ _id: ObjectId(id) }, (err, res) => {
        if(err)
          reject(err);
        else
          resolve(res.result.n > 0);
      });
    })
  }

  /**
   * Return all the thresholds
   */
  async get() {
    let collection = this.db.collection('thresholds');

    return new Promise((resolve, reject) => {
      collection.find({}).toArray((err, docs) => {
        if(err)
          reject(err);
        else
          resolve(docs);
      });
    });
  }
}

export default new ThresholdsRepository;
