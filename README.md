# [bitcoin-price-alert](https://github.com/rgehan/bitcoin-price-alert)

This is a simple tool allowing the user to register alerts for a certain BTC price. Whenever the price crosses a threshold, the user is notified via the Pushed API.

Pushed is a service allowing you to push notifications to a user phones on the Pushed app. It is particularly useful for such use cases, where you don't want to code a specific application.

## Installation

```bash
# Clone the repo
git clone git@github.com:rgehan/bitcoin-price-alert.git
cd bitcoin-price-alert/

# Install dependencies
npm install # or yarn install

# Start the mongodb database
npm run mongo # or yarn mongo

# Start the application
npm start # or yarn start

# The server is normally listening on port 3000
```

## Todo

* Make everything configurable
  * The exchange that is watched
  * The port mongo runs on
  * The port the app runs on
* Add multi-exchange support
* Add multi-user support
