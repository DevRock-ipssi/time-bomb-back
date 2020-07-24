const express = require('express');
const server = express();

const hostname = '0.0.0.0';
const port = 3000;

const mongoose = require('mongoose');
<<<<<<< HEAD
mongoose.connect('mongodb://mongo/timeBomb');
=======

const db = async () => {
	try {
		await mongoose.connect('mongodb://mongo/time_bomb', {
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
>>>>>>> cab2e6567631577e9d20a4bace7eb155ae5b6f98

const bodyParser = require('body-parser');
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

const roleRoute = require('./api/routes/roleRoute');
roleRoute(server);

const cors = require('cors');
server.use(cors());

<<<<<<< HEAD

/*server.get('/', (req, res )=> {
    res.send('hello')
} )*/

/*
const postRoute = require('./api/routes/postRoute');
postRoute(server);

const commentRoute = require('./api/routes/commentRoute');
commentRoute(server);
*/
=======
>>>>>>> cab2e6567631577e9d20a4bace7eb155ae5b6f98
const userRoute = require('./api/routes/userRoute');
userRoute(server);

const roomRoute = require('./api/routes/roomRoute');
roomRoute(server);

server.listen(port, hostname);

const factory = require('./factory/userFactory.js');
factory.createRoles();

