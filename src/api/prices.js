// api/bitcoin.js

import cc from 'cryptocompare';

class PricesAPI {
  constructor() {
    this.current = undefined;
    this.previous = undefined;
  }

  // Fetch from the prices from the API and update the object
  async refresh() {
    let data = await cc.price('BTC', 'USD');
    this.updateValue(data.USD);
  }

  // Update all the internal values
  updateValue(usd) {
    this.previous = this.current;
    this.current = usd;
  }

  // Return the current price
  getCurrent() {
    return this.current;
  }

  // Return the delta
  getDelta() {
    return this.current - this.previous;
  }
}

export default PricesAPI;