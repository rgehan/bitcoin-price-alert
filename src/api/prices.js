// api/bitcoin.js

import cc from 'cryptocompare';
import chalk from 'chalk';

class PricesAPI {
  constructor(exchange) {
    this.current = undefined;
    this.previous = undefined;

    this.exchange = exchange;
  }

  // Fetch from the prices from the API and update the object
  async refresh() {
    try {
      let data = await cc.price('BTC', 'USD', { exchanges: this.exchange });
      this.updateValue(data.USD);
    } catch(err) {
      console.error(chalk.red("Couldn't reach Cryptocompare API"));
    }
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
