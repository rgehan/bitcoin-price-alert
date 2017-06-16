// api/pushed.js

import fetch from 'node-fetch';

global.fetch = fetch;
import rp from 'request-promise';

class PushedAPI {
  constructor({key, secret}) {
    this.key = key;
    this.secret = secret;
  }

  async send(msg) {
    let options = {
      method: 'POST',
      uri: 'https://api.pushed.co/1/push',
      form: {
        app_key: this.key,
        app_secret: this.secret,
        target_type: 'app',
        content: msg,
      },
    };

    try {
      let res = await rp(options);
      return true;
    } catch(err) {
      return false;
    }
  }
}

export default PushedAPI;