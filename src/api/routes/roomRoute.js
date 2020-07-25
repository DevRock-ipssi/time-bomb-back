const { authCheck, authenticateUser } = require('../middlewares/authCheckMiddleware');

module.exports = (server) => {
	const { all_rooms, find_room_by_pin } = require('../controllers/roomController');

	server.get('/rooms', all_rooms); // Just for testing
	server.param('pin', find_room_by_pin); // any route with :pin will be executed the find_room_by_id method first   
											// TODO by pin and pseudo 
};
