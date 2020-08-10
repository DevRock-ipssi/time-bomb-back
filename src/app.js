const express = require('express');
const server = express();

const hostname = '0.0.0.0';
const port = 8080;

const mongoose = require('mongoose');

const db = async () => {
	try {
		await mongoose.connect('mongodb://mongo:27017/time_bomb', {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false // To Suppress deprecated warning messages
		});
		console.log('DB connected');
	} catch (error) {
		console.log(`Connection Error : ${error}`);
	}
};
// Execute DB connection
db();

const bodyParser = require('body-parser');
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

const cors = require('cors');
server.use(cors());

const userRoute = require('./api/routes/userRoute');
userRoute(server);

const roomRoute = require('./api/routes/roomRoute');
roomRoute(server);

const playingRoute = require('./api/routes/playingRoute');
playingRoute(server);


if(!module.parent){
	server.listen(port, hostname);
  }
  else {
	module.exports = server
  }

