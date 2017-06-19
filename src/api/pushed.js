// api/pushed.js

import fetch from 'node-fetch';
import chalk from 'chalk';

global.fetch = fetch;
import rp from 'request-promise';

class PushedAPI {
  constructor({key, secret}) {
    this.key = key;
    this.secret = secret;
  }

  async send(msg, pushed_id = null) {
    let userOptions = pushed_id ? {
      target_type: 'pushed_id',
      target_alias: 'alias',
      pushed_id,
    } : {};

    let options = {
      method: 'POST',
      uri: 'https://api.pushed.co/1/push',
      form: {
        app_key: this.key,
        app_secret: this.secret,
        target_type: 'app',
        content: msg,
        ...userOptions
      },
    };

    try {
      let res = await rp(options);
      return true;
    } catch(err) {

      // Attemps to parse the error from JSON
      let error_message;
      try {
        error_message = JSON.parse(err.error).error.message;
      } catch (_) { // Fallbacks to string conversion
        error_message = err;
      }

      console.error(chalk.red("Pushed API error: " + error_message));
      return false;
    }
  }
}

export default PushedAPI;
