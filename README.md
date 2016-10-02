[![Code Climate](https://codeclimate.com/github/dpca/play-gb-server/badges/gpa.svg)](https://codeclimate.com/github/dpca/play-gb-server)

* * *

# Play GB Server

Server for the Play GB Client. Lives in the cloud, or locally if you prefer.

## Installation

You'll need to install [redis](http://redis.io/), and
[cairo](http://cairographics.org/) for
[node-canvas](https://github.com/Automattic/node-canvas). Then it's just:

```bash
$ npm install
```

You'll also need to set some environment variables:

* ROM_FILE - Location of the Gameboy rom to play
* PORT - Port to serve websockets from, defaults to `8090`
* REDIS_URL - Redis URL, defaults to `localhost`
* REDIS_PORT - Redis port, defaults to `6379`

## Development

Uses [babel](https://babeljs.io/) for es2015, but no live reloading... To start
the dev server, run:

```bash
$ npm run dev
```

## Deploy

To bundle everything up, run:

```bash
$ npm run build
```

and serve with:

```bash
$ npm run server
```

Consider using something like [pm2](http://pm2.keymetrics.io/) to run in
production.
