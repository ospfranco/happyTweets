const Influx = require('influx');
const Moment = require('moment');
const Sentiment = require('sentiment');

const Geohash = require('latlon-geohash');

// function epoch(year, month, day, hour, minute, second) {
//   const result = Moment(`${year}-${month}-${day}-${hour}-${minute}-${second}`, 'YYYY-M-D-H-m-s');
//   return result.unix() * 1000 * 1000 * 1000;
// }

function epochNow() {
  const now = new Moment();
  // TODO REPLACE WITH ACTUAL TWEET DATA
  return now.unix() * 1000 * 1000 * 1000;
}

module.exports = (stream, io) => {
  const influx = new Influx.InfluxDB({
    host: 'localhost',
    database: 'derp'
  });

  // When tweets get sent our way ...
  stream.on('data', (data) => {
    // console.log('received tweet', data)

    if (data.coordinates) {
      // coordinates: { type: 'Point', coordinates: [ -123.01214587, 37.69876675 ] },
      // console.log('received tweet with coordinates data', data.text);

      // console.log('tweet sentiment:', Sentiment(data.text));
      const sentimentScore = Sentiment(data.text).score;

      if(sentimentScore !== 0) {

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
  });
};
