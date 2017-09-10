// Require our dependencies
const express = require('express');
const http = require('http');
const Twitter = require('ntwitter');
const config = require('./config');
const streamHandler = require('./streamHandler');

// Create an express instance and set a port variable
const app = express();
const port = process.env.PORT || 8081;

// Set handlebars as the templating engine
// app.engine('handlebars', exphbs({ defaultLayout: 'main'}));
// app.set('view engine', 'handlebars');

// Disable etag headers on responses
app.disable('etag');

// Connect to our mongo database
// mongoose.connect('mongodb://localhost/react-tweets');

// Create a new ntwitter instance
const twit = new Twitter(config.twitter);

// Index Route
// app.get('/', routes.index);

// Page Route
// app.get('/page/:page/:skip', routes.page);

// Set /public as our static content dir
// app.use("/", express.static(__dirname + "/public/"));

// Fire it up (start our server)
const server = http.createServer(app).listen(port, () => {
  console.log('Express server listening on port ' + port);
});

// Initialize socket.io
const io = require('socket.io').listen(server);

// Set a stream listener for tweets matching tracking keywords
twit.stream('statuses/filter', { locations: '-18.98,32.20,37.08,70.36' }, (stream) => {
  console.log('Ive got a stream, ROPOPO');
  streamHandler(stream, io);
});
