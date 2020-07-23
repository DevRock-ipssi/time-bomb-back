const shortid = require('shortid');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');
const Room = require('../models/roomModel');
const { authCheck } = require('../middlewares/authCheckMiddleware');
const { randomInteger } = require('../helpers/index.js');

const MIN_PLAYERS = 4;
const MAX_PLAYERS = 8;
const MIN_ROUNDS = 4;
const MAX_ROUNDS = 8;

/**
 * Create a room or return it if it exists
 *
 * @param {*} req
 * @param {*} res
 */
exports.create_room = async (req, res) => {
	try {
		// verify if a token is sended by client side
		const gameMaster = await authCheck(req, res);
		if (gameMaster) {
			const { userData } = gameMaster;
			//console.log('USERDATA', userData);
			const { pseudo, pin, isGameMaster } = userData;

			// Checks if user exist in db
			const userFomDB = await User.findOne({ pseudo }).exec();
			if (userFomDB) {
				// generate randomly the number of rounds and players
				const numOfPlayers = randomInteger(MIN_PLAYERS, MAX_PLAYERS);
				const numOfRounds = randomInteger(MIN_ROUNDS, MAX_ROUNDS);
				// counter users in DB to know if user is gameMaster or not
				//const numberOfPlayersInRoom;
				// save room in the DB if not exist or return existing one
				const existingRoom = await Room.findOne({ pin }, async (err, room) => {
					if (err) {
						res.status(500).json({ room });
					}

					return (await room.execPopulate('gameMaster', '_id pseudo')).execPopulate('players', '_id pseudo'); // don't work properly
				});
				// Return the room if exist in DB or create it if not
				if (existingRoom) {
					//numOfPlayersInRoom = existingRoom.players;
					return res.status(200).json({ room: existingRoom });
				} else {
					//const isGameMaster
					new Room({
						name: shortid.generate(),
						numberOfPlayers: numOfPlayers,
						numberOfRounds: numOfRounds,
						gameMaster: userFomDB,
						players: [ userFomDB ],
						pin: pin
					})
						.save()
						.then((room) => {
							return res.status(201).json({ room });
						})
						.catch((error) => {
							console.log(error);
							res.status(500).json({ message: 'Erreur serveur.' });
						});
				}
			}
		}
	} catch (error) {
		console.log(error);
		res
			.status(401)
			.json({ message: "Vous n'êtes pas autorisé à accéder au jeu !<br>Veuillez vérifier votre pin !" });
	}
};

exports.join_a_room = async (req, res, next) => {
	try {
		res.send({ message: 'User is joining Room' });
	} catch (error) {
		console.log(error.message);
	}
};

exports.all_rooms = async (req, res) => {
	try {
		const rooms = await Room.find(async (err, rooms) => {
			if (err) {
				console.log(err);
				return res.status(500).json({
					message: 'Erreur Serveur'
				});
			}
			return rooms;
		}).populate('gameMaster', '_id pseudo');
		if (rooms) {
			res.status(200);
			res.send(rooms);
		}
	} catch (error) {
		console.log(error);
	}
};

exports.get_a_room = async (req, res) => {
	console.log('PARAMS: ', req.params);
	try {
		const room = await Room.findOne({ pin: req.params.pin }, async (err, room) => {
			if (err) {
				console.log(err);
				return res.status(500).json({
					message: 'Erreur Serveur'
				});
			}
			return room;
		}).populate('gameMaster', '_id pseudo');

		if (room) {
			res.status(200).json({ room });
		} else {
			res.status(404).json({ message: 'Aucun room avec ce pin!' });
		}
	} catch (error) {
		console.log(error);
	}
};
