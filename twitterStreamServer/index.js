// Require our dependencies
const express = require('express');
const http = require('http');
const Twitter = require('twitter');
const config = require('./config');
const Influx = require('influx');
const Moment = require('moment');
const Sentiment = require('sentiment');
const Geohash = require('latlon-geohash');

// Create an express instance and set a port variable
const app = express();
const port = process.env.PORT || 8081;

app.disable('etag');

const twit = new Twitter(config.twitter);

const server = http.createServer(app).listen(port, () => {
  console.log('Express server listening on port ' + port);
});

function epochNow() {
  const now = new Moment();
  // TODO REPLACE WITH ACTUAL TWEET DATA
  return now.unix() * 1000 * 1000 * 1000;
}

const streamHandler = (stream) => {
  const influx = new Influx.InfluxDB({
    host: 'localhost',
    database: 'derp'
  });

  stream.on('data', (data) => {
    if (data.coordinates) {
      const sentimentScore = Sentiment(data.text).score;
      if (sentimentScore !== 0) {
        const points = [
          {
            measurement: 'tweet',
            tags: {
              id: data.id,
              geohash: Geohash.encode(data.coordinates.coordinates[1], data.coordinates.coordinates[0])
            },
            fields: {
              value: 1,
              sentiment: Sentiment(data.text).score
            },
            timestamp: epochNow()
          }
        ];

        influx.writePoints(points).then((res) => {
          console.log('succesfully saved data');
        });
      }
    }
  });

  stream.on('error', (error) => {
    console.error(error);
    throw error;
  });
};

twit.stream('statuses/filter', { locations: '-18.98,32.20,37.08,70.36' }, streamHandler);
