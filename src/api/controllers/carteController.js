const User = require('../models/userModel');

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
        const Bombe = "/Bombe";
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
 * distribution of cartes
 * @param {*} room 
 * @param {*} res 
 */
exports.distribution_of_cartes = (room) =>{
   
    return new Promise(( resolve , reject) =>{
        getListOfCarte(room.numberOfPlayers)
        .then((list) =>{

            // 5 cartes/players 
            room.players.forEach(element =>{
                for(let i = 0 ; i < 5 ; i++){
                    let randomCarte = list[Math.floor(Math.random()*list.length)];
                    element.carte.push(randomCarte); 
                    list.splice(list.indexOf(randomCarte) , 1);
                }     
            })
            resolve(room)              
        })
        .catch((erreur)=>{
            reject("Erreur dans l'attribution des cartes"); 
        })
    })
   
 
 
 }