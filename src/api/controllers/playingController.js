const Room = require('../models/roomModel');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');



/**
 * all player in room
 */
exports.all_player = (req , res) =>{
    let token = req.headers['authorization'];
    const info_room  = jwt.decode(token);
    Room.findOne({pin : info_room.userData.pin})
    .then((room) =>{
        res.status(200).json(room.players)
    })
    .catch((erreur) =>{
        res.status(500).json({ message : "Pin invalide"})
    })
}


/**
 * select a player and show their cards 
 * @param {*} req 
 * @param {*} res 
 */
exports.select_a_player = (req , res) =>{
    let token = req.headers['authorization'];
    const info_room  = jwt.decode(token);
   
    Room.findOne({pin : info_room.userData.pin})
    .then((room) =>{
        if(room.waiting === false){
            room.players.forEach(element =>{
                if( String(element._id) === String(req.params._id)){ 
                    res.status(200).json(element.carte) // player card 
                }             
            })
        }else{
            res.status(403).json({message : "Le jeu n'a pas encore démarré"}) 
        }
  
      
    })
    .catch((erreur) =>{
        res.status(500).json({ message : "Pin invalide"})
    })
}




/**
 * select a player's card (index of card) (EN COURS)
 * @param {*} req 
 * @param {*} res 
 */
exports.select_player_card = (req , res) =>{
    let token = req.headers['authorization'];
    const info_room  = jwt.decode(token);
    Room.findOne({pin : info_room.userData.pin})
    .then((room) =>{
        //véri if round != 0 
        if(room.waiting === false && room.numberOfRounds != 0){
            room.players.forEach(element =>{
                if( String(element._id) === String(req.params._id)){
                    // list of card (tab)
                    element.carte.forEach( (carte , index) =>{ 
                       
                        if(index == req.params.key){
                            
                            let round = room.numberOfRounds; //nb round init = 4
                            let numberOfCardsToReturn =  room.numberOfCardsToReturn -= 1; //nb card to return init = numberOfPlayers
                        
                            numberOfCardsToReturn == 0 ? round -= 1 : ""; // round - 1
                            numberOfCardsToReturn == 0 ? numberOfCardsToReturn = room.numberOfPlayers : "" ; 
                            
                        
                            if(carte ===  "cable_Securise"){
                                element.carte.splice(element.carte.indexOf(index) , 1); // delete card selected 
                                    
                                User.findOne({pseudo : element.pseudo})
                                .then((user) =>{
                                    let dataUpdate = {
                                        players : room.players, 
                                        gameMaster : user._id, //change gameMaster
                                        numberOfCardsToReturn : numberOfCardsToReturn, 
                                        numberOfRounds : round
                                    }
                                    Room.findOneAndUpdate({pin : info_room.userData.pin} , dataUpdate  , {new: true}  )
                                    .then((room) =>{
                                        res.status(200).json({room ,  cardSelect :"cable_Securise"}); 
                                    })
                                })
                                
                            }else if(carte === "cable_Desamorcage"){
                                let updateCarte =  room.numberOfCarteCableDesamorcageFound += 1; //cpt card desamorcage
                                element.carte.splice(element.carte.indexOf(index) , 1); // delete card selected 
                                User.findOne({pseudo : element.pseudo})
                                .then((user) =>{
                                    let dataUpdate = {
                                        players : room.players, 
                                        gameMaster : user._id, //change gameMaster
                                        numberOfCardsToReturn : numberOfCardsToReturn, 
                                        numberOfCarteCableDesamorcageFound : updateCarte,
                                        numberOfRounds : round
                                    }
                                    Room.findOneAndUpdate({pin : info_room.userData.pin} , dataUpdate  , {new: true}  )
                                    .then((room) =>{
                                        res.status(200).json( {room , cardSelect : "cable_Desamorcage"} ); 
                                    })
                                })
                            
                            }else if(carte === "bombe"){

                                Room.findOneAndUpdate({pin : info_room.userData.pin} , {carteBombeFound : true} , {new: true}  )
                                .then((room) =>{
                                    res.status(200).json({room , cardSelect :"bombe"}); 
                                })
                                
                            }
                        }
                    })
                }             
            })
        }
        else if(room.waiting === true){
            res.status(403).json({message : "Le jeu n'a pas encore démarré"}) 
        }else{
            res.status(403).json({message : "Cette partie est fini"}); 
        }
      
    })
}