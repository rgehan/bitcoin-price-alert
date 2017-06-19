# [bitcoin-price-alert](https://github.com/rgehan/bitcoin-price-alert)

This is a simple tool allowing the user to register alerts for a certain BTC price. Whenever the price crosses a threshold, the user is notified via the Pushed API.

Pushed is a service allowing you to push notifications to a user phones on the Pushed app. It is particularly useful for such use cases, where you don't want to code a specific application.

## Dependencies
You need to install mongodb for this to work.

On mac:
```bash
brew install mongodb
```

On other platforms (or if you don't use brew), please refer to the [MongoDB documentation](https://docs.mongodb.com/manual/installation/)

## Installation

```bash
# Clone the repo
git clone git@github.com:rgehan/bitcoin-price-alert.git
cd bitcoin-price-alert/

# Install dependencies
npm install # or yarn install
```

## Pushed API setup
In order to be able to send notifications, you have to apply for a [Pushed API developper access](https://pushed.co/for-developers).

Create an app, get your app key and your app secret and create your `.env` file:
```dotenv
  PUSHED_KEY=[your Pushed key]
  PUSHED_SECRET=[your Pushed secret]
  EXPRESS_PORT=3000
  MONGO_PORT=27017
  SECRET=[secret for the sessions]
```

## Usage

```bash
# Start the mongodb database
npm run mongo # or yarn mongo

# Start the application
npm start # or yarn start

# The server is normally listening on port 3000
```

## Scripts
A few scripts are available:
* `build`: Delete previously compiled files and re-babel-ize the source code
* `debug`: Equivalent to `start`, but starts the application with the `--inspect` flag, allowing you to debug the application with the Chrome DevTools
* `mongo-shell`: Starts a MongoDB shell connected to the database

**Troubleshooting**: If a script fails to launch, you might want to perform the following actions:
```bash
chmod +x ./scripts/start-mongo.sh
chmod +x ./scripts/start-mongo-shell.sh
```

## Todo

* Make everything configurable
  * The exchange that is watched
* Add multi-exchange support
