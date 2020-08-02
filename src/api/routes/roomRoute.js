const { verify_token , verify_token_gameMaster, authenticateUser } = require('../middlewares/authCheckMiddleware');

module.exports = (server) => {
	const { all_rooms, find_room_by_pin , start_game } = require('../controllers/roomController');

	server.get('/rooms', all_rooms); // Just for testing
	server.get('/room/start/:room_pin', verify_token_gameMaster , start_game); //for gameMaster
	server.get('/room/:room_pin/:_id', verify_token , find_room_by_pin); 

};
