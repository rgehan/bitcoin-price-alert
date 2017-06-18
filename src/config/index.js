// config/index.js

import dotenv from 'dotenv';

// Load the .env config file
dotenv.config();

const config = () => {
  let refresh_per_hour = 500;

  return {
    refresh_per_hour,
    refresh_delay: 3600 * 1000 / refresh_per_hour,
    delay_between_same_notification: 5 * 60 * 1000, // 5 minutes

    pushed: {
      key: process.env.PUSHED_KEY,
      secret: process.env.PUSHED_SECRET,
    },

    express_port: process.env.EXPRESS_PORT,
    mongo_port: process.env.MONGO_PORT,
  };
}

export default config();
