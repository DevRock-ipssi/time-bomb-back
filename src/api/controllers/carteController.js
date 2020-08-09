const Room = require('../models/roomModel');
const jwt = require('jsonwebtoken');


/**
 * Return list of carte
 * @param {} numberOfPlayerInRoom 
 */

const getListOfCarte = (numberOfPlayerInRoom ) =>{

    return new Promise(( resolve , reject) =>{

        let data = [

            { numberOfPlayer : 4 , numberOfCableSecurite: 15 ,  numberOfCableDesamorcage: 4, numberOfBombe: 1 },
            { numberOfPlayer : 5 , numberOfCableSecurite: 19 ,  numberOfCableDesamorcage: 5, numberOfBombe: 1 },
            { numberOfPlayer : 6 , numberOfCableSecurite: 23 ,  numberOfCableDesamorcage: 6, numberOfBombe: 1 }, 
            { numberOfPlayer : 7 , numberOfCableSecurite: 27 ,  numberOfCableDesamorcage: 7, numberOfBombe: 1 },
            { numberOfPlayer : 8 , numberOfCableSecurite: 31 ,  numberOfCableDesamorcage: 8, numberOfBombe: 1 }
        ]
    
        let tabcarte = {}; 
        data.forEach(element => {
            if(numberOfPlayerInRoom === element.numberOfPlayer){
                tabcarte = {
                    "nbCableSecurite" : element.numberOfCableSecurite, 
                    "nbCableDesamorcage" : element.numberOfCableDesamorcage,
                    'nbBombe' : element.numberOfBombe
                }
            }
           
        });
        const CableSecurite = "cable_Securise/"; 
        const CableDesamorcage = "/cable_Desamorcage/"; 
        const Bombe = "/bombe";
        let nbCableSecurite = CableSecurite.repeat(tabcarte.nbCableSecurite);
        let nbCableDesamorcage = CableDesamorcage.repeat(tabcarte.nbCableDesamorcage);
        let nbBombe = Bombe.repeat(tabcarte.nbBombe)
      
        let list = nbCableSecurite + nbBombe + nbCableDesamorcage ; 
        if(list){
            resolve(list.split('/').filter(String)); 
        }else{
            reject("erreur");
        }
      
     
    

    })

    
    
}



/**
 * distribution of card at startup
 * @param {*} room 
 * @param {*} res 
 */
exports.distribution_of_cartes = (room) =>{
   
    return new Promise(( resolve , reject) =>{
        getListOfCarte(room.numberOfPlayers)
        .then((list) =>{

            // 5 cards/players 
            room.players.forEach(element =>{
                for(let i = 0 ; i < 5 ; i++){
                    let randomCarte = list[Math.floor(Math.random()*list.length)];
                    element.carte.push(randomCarte); 
                    list.splice(list.indexOf(randomCarte) , 1);
                }     
            })
            
            Room.findByIdAndUpdate(room._id , {players : room.players}  , {new: true}  , (erreur , room ) =>{
                if(erreur){
                    reject("Erreur dans l'attribution des cartes");
                }else{
                    resolve(room);  
                }
            })
                    
        })
        .catch((erreur)=>{
            reject("Erreur dans l'attribution des cartes"); 
        })
    })
   
 
 
}




/**
 * distribution of card at the end of a round for gameMaster
 * @param {*} res 
 * @param {*} req 
 */
exports.distribution_of_card_end_round = (req , res) =>{

    let token = req.headers['authorization'];
    const info_room  = jwt.decode(token);

    Room.findOne({pin : info_room.userData.pin })
    .then((room) =>{

        if(room.numberOfRounds !== 0 ){

            if(room.distribution === true){
            
                //collect players' cards
                let tabCarte = [];
                return new Promise(( resolve , reject) =>{
                    room.players.forEach(player =>{  
                        player.carte.forEach( (carte) =>{    
                            tabCarte.push(carte)
                        })
                    })
                    if(tabCarte){
                        resolve(tabCarte)
                    }else{
                        reject("erreur")
                    }
                
                })   
                .then((list) =>{
                    const numberCardsPerPlayer = (list.length / room.numberOfPlayers); 
                    let tabPlayers = []; 
                    
                    return new Promise(( resolve , reject) =>{
                        room.players.forEach(element =>{
                            
                            //deleted player'card
                            return new Promise((resolve , reject) =>{
                                element.carte.length = 0; 
                                if(element){
                                    resolve(element)
                                }else{
                                    reject("erreur")
                                }
                            })
                            .then((player) =>{
                                    
                                //distribution    
                                for(let i = 0 ; i < numberCardsPerPlayer ; i++){   
                                    let randomCarte = list[Math.floor(Math.random()* list.length)];
                                    player.carte.push(randomCarte); 
                                    list.splice(list.indexOf(randomCarte) , 1); 
                                }
                        
                                tabPlayers.push(player); 
                            
                                if(tabPlayers){
                                    resolve( tabPlayers)
                                }else{
                                    reject("Erreur dans la redistributions des cartes")
                                }
    
                            })
                        })
    
                    })
                    .then((response)=>{
                        room.distribution = false;
                        room.save()
                        .then(( roomUpdate) =>{
                            res.status(200).json({message:"Les cartes ont été redistribuées. La partie continue !" , roomUpdate});  
                        })
                        .catch((err) => {
                            res.status(500).json("Erreur dans la redistributions des cartes");
                        })
                    })  
                        
                })
                .catch((err) => {
                    res.status(500).json("Impossible de récupérer les cartes");
                })
    
            }else{
                res.status(500).json("Les cartes ont déjà été distribuées.");
            }
        

        }else{
            res.status(500).json("Cette partie est terminée");
        }
  
    
    
            
                
    })
    .catch((err) => {
        res.status(500).json("Pin invalide");
    })
   
   
}