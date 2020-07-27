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
						
						// save room in the DB if not exist or return existing one ?? LA ROOM N'EST PAS CESSÉE EXISTER
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
							 
	
								let new_room = new Room(user_data); 
								new_room
								.save()
								.then((info) => {
									return res.status(201).json({ info ,token });
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
			.then((room) => {	
				if(room){	
					updateRoom(user_info_decode.userData , token , res); 
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








/**
 * find room by pin and user
 * @param {*} req 
 * @param {*} res 
 */
exports.find_room_by_pin = async function(req, res) {
	try {

		let pin = req.params.room_pin;
		let user_id = req.params._id; 

		Room.findOne({ pin: pin })
		.then((room) => {
			if(room){	
				User.findById({ _id: user_id})
				.then(user =>{
					
					//vérification si id_user dans la room 
					room.players.forEach(element => {	
						if(String(element._id) === String(user._id) ){
							res.status(200).json({room , user})
						}		 			
					});			
				})
				.catch((error) => {
					res.status(500).json({message : "Ce compte n'existe pas" })
				});			
			
			}else{
				res.status(500).json({message : "Une erreur est survenue , veuillez re-essayer ultérieurement." })
			}
		
		})
		.catch((error) => {
			res.status(500).json({message : "Pin non valide" })
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
const updateRoom = async (userData , token, res) => {

	
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
						  res.status(500).json({ message: "Erreur serveur."})
						}
						else {
						  res.status(200).json({ message: "Félicitation " + userData.pseudo + " votre inscription est validée !" , room ,  userData})
						}
					})

				} 
				else if (actualPlayersInTheRoom > 8 && isUserInRoom == false ) {
					res.status(200).json({ message: "Désolé le nombre de participant maximal est atteint, vous ne pouvez plus intégrer la partie" });

				} else if(isUserInRoom == true) {
					
					res.status(200).json({message: "vous êtes déjà inscrit !" , userJoining , token , userData , roomToUpdate })
				
				}else if (roomToUpdate.waiting == false ) { 
					res.status(200).json({ erreur: "Le JEU va démarré. Vous ne pouvez plus intégrer la partie" });


				}
				
			}
		} else {
			userData.pin ? res.status(404).json({ erreur: 'Le pin entré est invalide !' }) : res.status(404).json({ erreur: 'Vous devez entré un pin pour accéder au jeu !' });
		}
	} catch (error) {
		res.status(500).json({ erreur: 'Erreur serveur' })
	}
};
