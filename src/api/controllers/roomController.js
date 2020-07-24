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
 * Update a Room before each user's join
 *
 * @param {*} userData
 * @param {*} res
 */
const updateRoom = async (req, res) => {
	try {
		if (req.body.pseudo && req.body.pin) {
			const userJoining = await User.findOne({ pseudo: req.body.pseudo }, (err, user) => {
				if (err) {
					console.log(err);
					return res.status(500).json({
						message: 'Erreur Serveur'
					});
				}

				if (user) {
					return user;
				}
				// If user first join the game, save it
				const newUserJoining = new User({ pseudo: req.body.pseudo }).save((err, user) => {
					if (err) {
						console.log(err);
						return res.status(500).json({
							message: 'Erreur Serveur'
						});
					}

					return user;
				});

				return newUserJoining;
			});

			const roomToUpdate = await Room.findOne({ pin: req.body.pin }).exec();

			if (roomToUpdate) {
				const actualPlayersInTheRoom = +roomToUpdate.players.length;
				const initialNumOfPlayers = roomToUpdate.numberOfPlayers;
				const isUserInRoom = roomToUpdate.players.some((val) => val.pseudo !== req.body.pseudo);

				if (actualPlayersInTheRoom < initialNumOfPlayers || isUserInRoom) {
					roomToUpdate.players.push(userJoining);

					let updatedRoom = await Room.findOneAndUpdate({ pin: req.body.pin }, roomToUpdate, { new: true })
						.exec()
						.then((room) => room.populate('gameMaster', '_id pseudo').execPopulate());
					return updatedRoom;
				} else if (actualPlayersInTheRoom === initialNumOfPlayers || isUserInRoom) {
					roomToUpdate.waiting = false;
					let updatedRoom = await Room.findOneAndUpdate({ pin: req.body.pin }, roomToUpdate, { new: true })
						.exec()
						.then((room) => room.populate('gameMaster', '_id pseudo').execPopulate());
					console.log('Le JEU va démarré. Le nombre de joeurs max est atteint.');
					return updatedRoom;
				} else {
					return;
				}
			}
		} else {
			req.body.pin
				? res.status(404).json({ message: "'Vous devez entré votre pseudo pour accéder au jeu !'" })
				: res.status(404).json({ message: 'Vous devez entré un pin pour accéder au jeu !' });
		}
	} catch (error) {
		console.log(error);
	}
};

/**
 * Create a room or return it if it exists
 *
 * @param {*} req
 * @param {*} res
 */
exports.create_room = async (req, res, next) => {
	try {
		const token = req.headers['authorization'];
		const { userData: { pseudo, pin } } = jwt.decode(token); // retrieve user infos

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

				return (await room.execPopulate('gameMaster', '_id pseudo'))
					.populate('players')
					.then(console.log(room.players)); // don't work properly
			});

			const userNotExist = await User.findOne({ pseudo }).exec();
			// Return the room if exist in DB or create it if not
			if (existingRoom ) {
				const existingRoomPopulated = (await existingRoom.execPopulate('gameMaster', '_id pseudo')).then((err, room) => {
                    return !err ? room.populate('players') : new Error(err);

                });
				//numOfPlayersInRoom = existingRoom.players;
				//const newUser = await User.findOne({ pseudo }).exec();
				//await Room.update(existingRoom)
				return res.status(200).json({ room: existingRoomPopulated });
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
		} else {
			let new_user = new User(req.body);
			new_user.save((err, user) => {
				if (err) {
					console.log(err);
					return res.status(500).json({
						message: 'Erreur Serveur'
					});
				}
				updateRoom(req, res); // update the room
				return user;
			});
		}
	} catch (error) {
		console.log(error);
		res
			.status(401)
			.json({ message: "Vous n'êtes pas autorisé à accéder au jeu !<br>Veuillez vérifier votre pin !" });
	}
};

/**
 * Join an existing Room
 *
 * @param {*} req
 * @param {*} res
 */
exports.join_a_room = async (req, res, next) => {
	try {
		updateRoom(req, res); // update room states when a user join it
	} catch (error) {
		console.log(error);
        next(err);
	}
};

/**
 * List all rooms
 * @todo secure this route alter to allow only a user with admin  role to view them  (@Mor)
 *
 * @param {*} req
 * @param {*} res
 */
exports.all_rooms = async (req, res) => {
	try {
		const rooms = await Room.find((err, rooms) => {
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

exports.find_room_by_pin = async function(req, res, next, pin) {
	try {
		// verify if a token is sended by client side
		const gameMaster = await authCheck(req, res); // gameMaster iss the person who init the game

		await Room.findOne({ pin }).exec((err, room) => {
			if (err || !room) {
				return res.status(400).json({
					message: "Cette salle de jeu n'existe pas !"
				});
			}
			req.room = room; // adds room object to req with Room infos
			next();
		});
	} catch (err) {
		next(err);
	}
};
