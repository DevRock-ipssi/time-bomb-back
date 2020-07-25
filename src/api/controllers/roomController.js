const shortid = require('shortid');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');
const Room = require('../models/roomModel');
const { authCheck } = require('../middlewares/authCheckMiddleware');
const { randomInteger } = require('../helpers/index.js');



/**
 * Create a room or return it if it exists
 * @param {*} res
 */
exports.create_room = (token , res) => {
	
	if(typeof token !== 'undefined'){
		jwt.verify(token, process.env.JWT_KEY, (error, authData) => {

			if(error){
				res.status(401);
				res.json({message: "Vous n'êtes pas autorisé à accéder au jeu !<br>Veuillez vérifier votre pin !"});
			
			}else{
				
				const user_info_decode  = jwt.decode(token); // retrieve user info

				// Checks if user exist in db
				User.findOne({ pseudo: user_info_decode.userData.pseudo})
					.then((user) => {	
						
						// save room in the DB if not exist or return existing one
						Room.findOne({ pin : user_info_decode.userData.pin})
						.then((room) =>{

							if(room){
								res.status(201);
								res.json({room })
								
							}else{		

								let players = {
									"role" : null, 
									"_id" : user._id, 
									"pseudo" : user.pseudo,
									"_v" : 0
								}
							
								let user_data = {
									name: shortid.generate(),
									gameMaster: user,
									players: players ,
									pin: user_info_decode.userData.pin,
									numberOfPlayers: 1 //init number playeur
								}; 	
							 
	
								//const isGameMaster
								let new_room = new Room(user_data); 
								new_room
								.save()
								.then((info) => {
									return res.status(201).json({ info});
								})
								.catch((error) => {
									console.log(error);
									res.status(500).json({ message: 'Erreur serveur.' });
								});
								

							}

						})
						.catch((error) => {
							console.log(error);
							res.json('erreur');
						});
				
					})
					.catch((error) => {
						console.log(error);
						res.json('user non trouvé');
					});
			}
		})
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



/**
 * Join an existing Room
 *
 * @param {*} req
 * @param {*} res
 */
exports.join_a_room = (token , res) => {

	if(typeof token !== 'undefined'){
		jwt.verify(token, process.env.JWT_KEY, (error, authData) => {

			const user_info_decode  = jwt.decode(token); 
			Room.findOne({ pin: user_info_decode.userData.pin })
			
			//.populate('gameMaster', '_id pseudo')
			
			.then((room) => {
				
				if(room){
					
					updateRoom(user_info_decode.userData , res); 
				}else{
					res.json('Le pin entré est invalide !');
				}
				
				
			})
			.catch((error) => {
				console.log(error);
				res.json('Erreur serveur');
			});
		})
	}else{
		res.status(401);
		res.json({message: "Vous n'êtes pas autorisé à accéder au jeu !<br>Veuillez vérifier votre pin !"});
	
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

/**
 * Update a Room before each user's join
 *
 * @param {*} userData
 * @param {*} res
 */
const updateRoom = async (userData, res) => {

	
	try {
		if (userData !== null) {
			const userJoining = await User.findOne({ pseudo: userData.pseudo }, async (err, user) => {
				if (err) {
					console.log(err);
					return res.status(500).json({
						message: 'Erreur Serveur'
					});
				}
				
				return user;
			});
			
			const roomToUpdate = await Room.findOne({ pin: userData.pin }).exec();
			if (roomToUpdate) {
				let actualPlayersInTheRoom = roomToUpdate.players.length ; 

				let isUserInRoom = false; 
				
				//vérification si user déjà présent 	
				roomToUpdate.players.forEach(element => {
					element.pseudo ==  userData.pseudo ? isUserInRoom = true : "";  			
				});
				
				
				// Number of playeur < 8 (nb max) and players.pseudo is not in room 
				if (actualPlayersInTheRoom < 8 && isUserInRoom == false) {
					roomToUpdate.players.push(userJoining);
					actualPlayersInTheRoom ++; 
					
					roomToUpdate.numberOfPlayers = actualPlayersInTheRoom ; //nb players update
					
					actualPlayersInTheRoom == 8 ? roomToUpdate.waiting = false : ""; 
					Room.findOneAndUpdate({ pin: userData.pin }, roomToUpdate ,  {new: true}, (error, room) => {
						if(error){
						  res.status(500);
						  console.log(error);
						  res.json({message: "Erreur serveur."})
						}
						else {
						  res.status(200);
						  res.json(room);
						}
					})

				} 
				else if (actualPlayersInTheRoom > 8 && isUserInRoom == false ) {
	
					res.json({message : 'Nombre de participant maximal atteint, vous ne pouvez plus intégrer la partie' });

				} else if(isUserInRoom == true) {
					
					res.json({message: "Vous êtes déjà inscrit"})
				
				}else if (roomToUpdate.waiting == false ) { 
					res.json({message : 'Le JEU va démarré. Vous ne pouvez plus intégrer la partie' });

				}
				
			}
		}
	} catch (error) {
		console.log("erreur");
	}
};
