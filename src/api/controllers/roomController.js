const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');
const Room = require('../models/roomModel');
const Role = require('../controllers/roleController');
const Carte = require('../controllers/carteController');



/**
 * Create a room
 * @param {*} res
 */
exports.create_room = (token , res) => {

	if(typeof token !== 'undefined'){
		jwt.verify(token, process.env.JWT_KEY, (error, authData) => {

			if(error){
				res.status(401).json({message: "Vous n'êtes pas autorisé à accéder au jeu !<br>Veuillez vérifier votre pin !"});

			}else{

				const user_info_decode  = jwt.decode(token); // retrieve user info

				// Checks if user exist in db
				User.findOne({ pseudo: user_info_decode.userData.pseudo})
					.then((user) => {

						Room.findOne({ pin : user_info_decode.userData.pin})
						.then((room) =>{

							if(room){

								res.status(201).json({room });

							}else{

								let players = {
									"role" : null,
									"_id" : user._id,
									"pseudo" : user.pseudo,
									"_v" : 0,
									"carte" :[]
								}

								let user_data = {
									gameMaster: user,
									players: players ,
									pin: user_info_decode.userData.pin,
									numberOfPlayers: 1 //init number playeur
								};


								let new_room = new Room(user_data);
								new_room
								.save()
								.then((info) => {
									res.status(200).json({ info ,token });
								})
								.catch((error) => {
									res.status(500).json({ message: 'Erreur serveur.' });
								});


							}

						})
						.catch((error) => {
							res.status(500).json({ message: 'Erreur serveur.' });
						});

					})
					.catch((error) => {
						res.status(404).json({ message: 'User non trouvé' });
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
					res.status(500).json({ message: 'Le pin entré est invalide !' });
				}
			})
			.catch((error) => {
				res.status(500).json({ message: 'Erreur serveur.' });
			});
		})
	}else{
		res.status(401).json({ message: "Vous n'êtes pas autorisé à accéder au jeu !<br>Veuillez vérifier votre pin !" });
	}
};








/**
 * find user profil in room
 * @param {*} req
 * @param {*} res
 */
exports.find_user_profil_in_room = async function(req, res) {
	try {

		let user_id = req.params._id;
		let token = req.headers['authorization'];
		const info_room  = jwt.decode(token);

		Room.findOne({ pin: info_room.userData.pin })
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
					res.status(401).json({message : "Ce compte n'existe pas" })
				});

			}else{
				res.status(404).json({message : "Pin invalide" })
			}

		})
		.catch((error) => {
			res.status(500).json({message : "Erreur serveur" })
		});
	} catch (err) {
		next(err);
	}
};





/**
 * gameMaster start game
 * @param {*} req
 * @param {*} res
 */
exports.start_game = (req , res) =>{

	let token = req.headers['authorization'];
    const info_room  = jwt.decode(token);
	Room.findOne({pin : info_room.userData.pin })
	.then((room) =>{

		if(room.numberOfRounds != 0){

			if(room.numberOfPlayers >= 4){

				if(room.waiting === true){

					//distribution of roles
					Role.distribution_of_roles(room)
					.then((roomUpdate) =>{
						//distribution of cartes
						Carte.distribution_of_cartes(roomUpdate, res)
						.then((roomUpdateAfter) =>{
							roomUpdateAfter.waiting = false; // blocked room
							roomUpdateAfter
							.save()
							.then((roomUp)=>{
								res.status(200).json(roomUp);
							})
							.catch((error) =>{
								res.status(500).json({message : "Impossible de bloquer l'accès à la room"})
							})
						})
						.catch((erreur) =>{
							res.status(500).json({message : erreur })
						})


					})
					.catch((erreur) =>{
						res.status(500).json({message : erreur})
					})

				}else{
					res.status(403).json({message : "Le jeu a déjà démarré"})
				}


			}else{
				res.status(403).json({message : "Le nombre de joueur n'est pas suffisant pour démarrer le jeu."})
			}
		}else{
			res.status(403).json({message : "Cette partie est fini"})
		}
	})
	.catch((error) =>{
		res.status(500).json({message : "Pin invalide !"})
	})





}





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

					return res.status(500).json({
						message: 'Erreur Serveur'
					});
				}

				return user;
			});

			const roomToUpdate = await Room.findOne({ pin: userData.pin }).exec();
			if (roomToUpdate) {

				if(roomToUpdate.numberOfRounds != 0){


					let actualPlayersInTheRoom = roomToUpdate.players.length ;
					roomToUpdate.numberOfCardsToReturn = actualPlayersInTheRoom ;
					let isUserInRoom = false;

					//vérification si user déjà présent
					roomToUpdate.players.forEach(element => {
						element.pseudo ==  userData.pseudo ? isUserInRoom = true : "";
					});


					// Number of playeur < 8 (nb max) and players.pseudo is not in room
					if (actualPlayersInTheRoom < 8 && isUserInRoom === false && roomToUpdate.waiting === true) {
						roomToUpdate.players.push(userJoining);
						actualPlayersInTheRoom ++;

						roomToUpdate.numberOfPlayers = actualPlayersInTheRoom ; //nb players update
						roomToUpdate.numberOfCardsToReturn = actualPlayersInTheRoom; // nb carte to return == nb players
						actualPlayersInTheRoom === 8 ? roomToUpdate.waiting = false : "";
						Room.findOneAndUpdate({ pin: userData.pin }, roomToUpdate ,  {new: true}, (error, room) => {
							if(error){
							res.status(500).json({ message: "Erreur serveur."})
							}
							else {
                               const userDataExtended = {...userData, user: room.players[room.players.length - 1]}
							res.status(200).json({ message: "Félicitation " + userData.pseudo + " votre inscription est validée !" , room ,  userData: userDataExtended , token})
							}
						})

					}
					else if (actualPlayersInTheRoom > 8 && isUserInRoom === false ) {
						res.status(200).json({ message: "Désolé le nombre de participant maximal est atteint, vous ne pouvez plus intégrer la partie" });

					} else if(isUserInRoom === true) {

						res.status(200).json({message: "vous êtes déjà inscrit !" , userJoining , token , userData , roomToUpdate })

					}else if (roomToUpdate.waiting === false ) {
						res.status(200).json({ message: "Le JEU a démarré. Vous ne pouvez plus intégrer la partie" });
					}
				}else{
					res.status(403).json({ message: 'Cette partie est fini' })
				}
			}

		} else {
			userData.pin ? res.status(404).json({ message: 'Le pin entré est invalide !' }) : res.status(404).json({ erreur: 'Vous devez entré un pin pour accéder au jeu !' });
		}
	} catch (error) {
		res.status(500).json({ message: 'Erreur serveur' })
	}
};



