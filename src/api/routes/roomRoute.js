module.exports = (server) => {
	const { create_room, all_rooms, get_a_room } = require('../controllers/roomController');

	server.post('/rooms/create', create_room);
	server.get('/rooms', all_rooms);
	server.get('/rooms/:pin', get_a_room);
};
