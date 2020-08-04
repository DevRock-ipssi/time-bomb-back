const { verify_token , verify_token_gameMaster  } = require('../middlewares/authCheckMiddleware');

module.exports = (server) => {
	const { all_rooms, find_user_profil_in_room , start_game } = require('../controllers/roomController');

	server.get('/rooms', all_rooms); // Just for testing
	server.get('/room/start', verify_token_gameMaster , start_game); //for gameMaster
	server.get('/room/user/:_id', verify_token , find_user_profil_in_room); // user profil in room 

};
