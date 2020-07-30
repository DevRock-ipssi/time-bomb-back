const User = require('../models/userModel');

/**
 * Return composition of team 
 * @param {} numberOfPlayerInRoom 
 */

const CompositionOfTeam = (numberOfPlayerInRoom ) =>{

    return new Promise(( resolve , reject) =>{

        let data = [

            { numberOfPlayer : 4 , numberOfCableSecurite: 15 ,  numberOfCableDesamorcage: 4, numberOfBombe: 1},
            { numberOfPlayer : 5 , numberOfCableSecurite: 19 ,  numberOfCableDesamorcage: 5, numberOfBombe: 1},
            { numberOfPlayer : 6,  numberOfCableSecurite: 23 ,  numberOfCableDesamorcage: 6, numberOfBombe: 1}, 
            { numberOfPlayer : 7 , numberOfCableSecurite: 27 ,  numberOfCableDesamorcage: 7, numberOfBombe: 1},
            { numberOfPlayer : 8 , numberOfCableSecurite: 31 ,  numberOfCableDesamorcage: 8, numberOfBombe: 1}
        ]
    
        let tabcomposition = {}; 
        data.forEach(element => {
            if(numberOfPlayerInRoom === element.numberOfPlayer){
                tabcomposition = {
                    "nbCableSecurite" : element.numberOfCableSecurite, 
                    "nbCableDesamorcage" : element.numberOfCableDesamorcage,
                    "nbbombe" : element.numberOfBombe
                }
            }
           
        });
        const CableSecurite = "cable_Securise/"; 
        const CableDesamorcage = "/cable_Desamorcage/"; 
        const Bombe = "Bombe"; 
        let nbCableSecurite = CableSecurite.repeat(tabcomposition.nbCableSecurite);
        let nbCableDesamorcage = CableDesamorcage.repeat(tabcomposition.nbCableDesamorcage);
        let nbBombe = Bombe.repeat(tabcomposition.numberOfBombe);
        let composition = nbCableSecurite + nbCableDesamorcage + nbBombe  ; 
        if(composition){
            resolve(composition.split('/').filter(String)); 
        }else{
            reject("erreur");
        }
      
     
    

    })

    
    
}



/**
 * distribution of cartes
 * @param {*} room 
 * @param {*} res 
 */
exports.distribution_of_cartes = (room , res) =>{
   
    CompositionOfTeam(room.numberOfPlayers)
    .then((composition) =>{
       
         room.players.forEach(element =>{
             let randomCarte = composition[Math.floor(Math.random()*composition.length)];
             element.carte = randomCarte; 
             User.findByIdAndUpdate(element._id , {carte : randomCarte} )
             .then((user) =>{      
                 composition.splice(composition.indexOf(randomCarte) , 1);
             })
         })
         res.status(200).json({room , message:"success"})
        
         
    })
    .catch((erreur)=>{
        res.status(500).json({message:"erreur"})
    })
   
 
 
 }