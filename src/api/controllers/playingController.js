const Room = require('../models/roomModel');
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
        room.players.forEach(element =>{
           if( String(element._id) === String(req.params._id)){
              
                element.carte.forEach( (carte , index) =>{
                    console.log(index + " : " + carte)
                })
                res.status(200).json(element.carte) // player card 
           }             
        })
      
    })
}




/**
 * select a player's card
 * @param {*} req 
 * @param {*} res 
 */
exports.select_player_card = (req , res) =>{
    let token = req.headers['authorization'];
    const info_room  = jwt.decode(token);
    Room.findOne({pin : info_room.userData.pin})
    .then((room) =>{
        room.players.forEach(element =>{
           if( String(element._id) === String(req.params._id)){
                //console.log(element.pseudo)
                element.carte.forEach( (carte , index) =>{ 
                    if(index == req.params.key){
                        res.json(index + " : " + carte)
                        //search Card if exist sinon crée
                        //type carte 
                        //action 
                        //next 
                        //element.carte.splice(element.carte.indexOf(index) , 1); // delete card selected 
                        //change gameMaster
                        //mettre à jour la room
                    }
                })
           }             
        })
      
    })
}