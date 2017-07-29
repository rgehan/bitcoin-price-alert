import Particle from 'particle-api-js';
import chalk from 'chalk';
import config from '../config';

class ParticleAPI {
  constructor() {
    this.particle = new Particle;
    this.initialized = false;
    this.token = undefined;
  }

  async init() {
    try {
      let data = await this.particle.login({
        username: config.particle.username,
        password: config.particle.password
      });

      this.token = data.body.access_token;
      this.initialized = true;
      console.log(`Access token set to: ${this.token}`);
    } catch (e) {
      console.error(chalk.red(`Error! ${e.shortErrorDescription || e}`));
    }
  }

  async notifyPrice(price, delta) {
    try {
      if(!this.initialized) {
        await this.init();
      }

      let res = await this.particle.callFunction({
        deviceId: config.particle.deviceId,
        name: 'btc-price',
        argument: price.toString(),
        auth: this.token,
      });

      return !!res;
    } catch (e) {
      console.error(chalk.red(`Error! ${e.shortErrorDescription || e}`));
    }

    return false;
  }
}

export default ParticleAPI;
