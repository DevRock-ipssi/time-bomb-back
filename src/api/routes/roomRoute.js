const { authCheck, authenticateUser } = require('../middlewares/authCheckMiddleware');

module.exports = (server) => {
	const { create_room, all_rooms, get_a_room, join_a_room } = require('../controllers/roomController');

	server.post('/rooms/create', create_room);
    server.get('/rooms/join/:pin', join_a_room);
	server.get('/rooms', all_rooms); // Just for testing
	server.get('/rooms/:pin', get_a_room); // Just for testing
};
