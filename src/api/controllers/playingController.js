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
 * select a player and show their cards (gameMaster)
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
 * select a player's card (gameMaster)
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
            
            room.players.forEach(player =>{  
           
                if( String(player._id) === String(req.params._id)  ){   
                    if(info_room.userData.pseudo != player.pseudo){

                        // list of card (tab)
                        player.carte.forEach( (carte , index) =>{    
                            if(index == req.params.key){
                                console.log("index : " + index + " key:" + req.params.key)
                                let round = room.numberOfRounds; //nb round init = 4
                                let numberOfCardsToReturn =  room.numberOfCardsToReturn -= 1; //nb card to return init = numberOfPlayers
                            
                                numberOfCardsToReturn == 0 ? round -= 1 : ""; // round - 1
                                numberOfCardsToReturn == 0 ? numberOfCardsToReturn = room.numberOfPlayers : "" ;        
                            
                                if(carte ===  "cable_Securise"){
                                    player.carte.splice(req.params.key , 1); // delete card selected                                
                                    User.findOne({pseudo : player.pseudo})
                                    .then((user) =>{
                                        let dataUpdate = {
                                            players : room.players, 
                                            gameMaster : user._id, //change gameMaster
                                            numberOfCardsToReturn : numberOfCardsToReturn, 
                                            numberOfRounds : round
                                        }
                                        Room.findOneAndUpdate({pin : info_room.userData.pin} , dataUpdate  , {new: true}  )
                                        .then((room) =>{

                                            getResult(room.pin)
                                            .then((response) =>{
                                                res.status(200).json({cardSelect :"cable_Securise" ,response}); 
                                            })
                                            .catch((erreur) =>{
                                                res.status(500).json({message : erreur})
                                            })
                                              
                                        })
                                        .catch((erreur)=>{
                                            res.status(500).json("Erreur serveur"); 
                                        })
                                    })
                                    .catch((erreur)=>{
                                        res.status(500).json("Erreur serveur"); 
                                    })
                                    
                                }else if(carte === "cable_Desamorcage"){
                    
                                    let updateCarte =  room.numberOfCarteCableDesamorcageFound += 1; //cpt card desamorcage
                                    player.carte.splice(req.params.key, 1); // delete card selected 
                                 
                                    User.findOne({pseudo : player.pseudo})
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

                                            getResult(room.pin)
                                            .then((response) =>{
                                                res.status(200).json( {cardSelect : "cable_Desamorcage" , response } ); 
                                            })
                                            .catch((erreur) =>{
                                                res.status(500).json({message : erreur})
                                            })
                                           
                                        })
                                    })
                                    .catch((erreur)=>{
                                        res.status(500).json("Erreur serveur"); 
                                    })
                                
                                }else if(carte === "bombe"){
                                    player.carte.splice(req.params.key, 1); // delete card selected 
                                    let dataUpdate = {
                                        carteBombeFound : true,
                                        numberOfRounds : 0
                                    }
                                    Room.findOneAndUpdate({pin : info_room.userData.pin} , dataUpdate, {new: true}  )
                                    .then((room) =>{
                                        res.status(200).json({room, cardSelect : "bombe" , message: "La bombe a éploisée ! L'équipe de Moriarty à gagné" }); 
                                    })
                                    .catch((erreur)=>{
                                        res.status(500).json("Erreur serveur"); 
                                    })
                                    
                                }
                            }
                        })
                    }else{
                        res.status(403).json({message : "Vous ne pouvez pas couper vos propres cartes"}) 
                    }
                }            
            })

        }else if(room.waiting === true){
            res.status(403).json({message : "Le jeu n'a pas encore démarré"}) 
        }else{
            res.status(403).json({message : "Cette partie est fini"}); 
        }
      
    })
}


/**
 * 
 * @param {*} room EN COURS
 */
const getResult = (pin) =>{
    
    return new Promise(( resolve , reject) =>{
        Room.findOne({ pin : pin})
        .then((room) => {
           
            if(room.numberOfCarteCableDesamorcageFound == room.numberOfPlayers){ // card desamorcage found 
                room.numberOfRounds = 0;
                room
                .save();
                resolve( room , "Félicitation l'équipe de Sherlock à gagné ! Vous avez réussi à désarmorcer la bombe"); 
       
            }else if(room.numberOfRounds == 0 && room.numberOfCarteCableDesamorcageFound != room.numberOfPlayers ){
                resolve(room , "La bombe a éploisée ! L'équipe de Moriarty à gagné"); 
    
            }else{
                resolve(room , "Le jeu continue"); 
            }
        })
        .catch((erreur) =>{
            reject("Erreur serveur");
        })

 

    }); 
    
}