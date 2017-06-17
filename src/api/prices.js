// api/bitcoin.js

import cc from 'cryptocompare';

class PricesAPI {
  constructor(exchange) {
    this.current = undefined;
    this.previous = undefined;

    this.exchange = exchange;
  }

  // Fetch from the prices from the API and update the object
  async refresh() {
    let data = await cc.price('BTC', 'USD', { exchanges: this.exchange });
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

  // Return the exchange
  getExchange() {
    return this.exchange;
  }
}

export default PricesAPI;
