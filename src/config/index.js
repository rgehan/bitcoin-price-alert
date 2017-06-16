// config/index.js

const config = () => {
  let refresh_per_hour = 500;

  return {
    refresh_per_hour,
    refresh_delay: 3600 * 1000 / refresh_per_hour,
    delay_between_same_notification: 5 * 60 * 1000, // 5 minutes
  };
}

export default config();