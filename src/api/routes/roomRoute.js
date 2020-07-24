const { verify_token } = require('../middlewares/authCheckMiddleware');

module.exports = (server) => {
	const { create_room, all_rooms, get_a_room, join_a_room, find_room_by_pin } = require('../controllers/roomController');

	server.post('/rooms/create', verify_token, create_room);
    server.post('/rooms/join', verify_token , join_a_room);
	server.get('/rooms', verify_token , all_rooms); // Just for testing

    server.param('pin', find_room_by_pin); // any route with :pin will be executed the find_room_by_id method first
};
