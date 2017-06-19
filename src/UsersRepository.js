// UsersRepository.js

import { MongoClient, ObjectId } from 'mongodb';
import chalk from 'chalk';

import config from './config';

/**
 * Serve as an interface between the database and the rest of the code.
 */
class UsersRepository {
  constructor() {
    // Connection to the mongodb database
    let url = `mongodb://localhost:${config.mongo_port}/bitcoin-tracker`;
    MongoClient.connect(url, (err, db) => {
      if(err) {
        console.error(chalk.red("Unable to connect to MongoDB"));
        process.exit(1);
      }

      console.log(chalk.green('Users repo connected to MongoDB'));
      this.db = db;
    })
  }

  /**
   * Adds an user
   */
  async add(username, password) {
    return new Promise((resolve, reject) => {
      this.db.collection('users').insert({
        username,
        password
      }, (err, res) => {
        if(err)
          reject(err);
        else
          resolve(res.result.n > 0);
      });
    });
  }

  /**
   * Attempts to find an user
   */
  async findByCredentials(username, password) {
    return new Promise((resolve, reject) => {
      this.db.collection('users').find({
        username,
        password
      })
      .toArray((err, docs) => {
        if(err)
          reject(err);
        else
          resolve(docs);
      });
    });
  }
}

export default new UsersRepository;
