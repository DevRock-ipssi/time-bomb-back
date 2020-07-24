const express = require('express');
const server = express();

const hostname = '0.0.0.0';
const port = 3000;

const mongoose = require('mongoose');
mongoose.connect('mongodb://mongo/timeBomb');

const bodyParser = require('body-parser');
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

const roleRoute = require('./api/routes/roleRoute');
roleRoute(server);

const cors = require('cors');
server.use(cors());


/*server.get('/', (req, res )=> {
    res.send('hello')
} )*/

/*
const postRoute = require('./api/routes/postRoute');
postRoute(server);

const commentRoute = require('./api/routes/commentRoute');
commentRoute(server);
*/
const userRoute = require('./api/routes/userRoute');
userRoute(server);


server.listen(port, hostname);

const factory = require('./factory/userFactory.js');
factory.createRoles();

