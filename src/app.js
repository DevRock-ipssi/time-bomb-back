const express = require('express');
const server = express();

const hostname = '0.0.0.0';
const port = 8000;

const mongoose = require('mongoose');
mongoose.connect('mongodb://mongo/time_bomb');

const bodyParser = require('body-parser');
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

const cors = require('cors');
server.use(cors());


const postRoute = require('./api/routes/postRoute');
postRoute(server);

const commentRoute = require('./api/routes/commentRoute');
commentRoute(server);

const userRoute = require('./api/routes/userRoute');
userRoute(server);

server.listen(port, hostname);
