const { verify_token , authCheck, authenticateUser } = require('../middlewares/authCheckMiddleware');

module.exports = (server) => {
	const { all_rooms, find_room_by_pin } = require('../controllers/roomController');

	server.get('/rooms', all_rooms); // Just for testing
	server.get('/room/:room_pin/:_id', verify_token , find_room_by_pin); 
};
