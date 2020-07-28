const User = require('../models/userModel');

/**
 * Return composition of team 
 * @param {} numberOfPlayerInRoom 
 */
const getCompositionOfTeam = (numberOfPlayerInRoom ) =>{

    return new Promise(( resolve , reject) =>{

        let data = [

            { numberOfPlayer : 4 , numberOfRoleSherlock: 2 ,  numberOfRoleMoriarty: 2},
            { numberOfPlayer : 5 , numberOfRoleSherlock: 3 ,  numberOfRoleMoriarty: 2},
            { numberOfPlayer : 6,  numberOfRoleSherlock: 4 ,  numberOfRoleMoriarty: 2}, 
            { numberOfPlayer : 7 , numberOfRoleSherlock: 4 ,  numberOfRoleMoriarty: 3},
            { numberOfPlayer : 8 , numberOfRoleSherlock: 5 ,  numberOfRoleMoriarty: 3}
        ]
    
        let tabcomposition = {}; 
        data.forEach(element => {
            if(numberOfPlayerInRoom === element.numberOfPlayer){
                tabcomposition = {
                    "numberOfRoleSherlock" : element.numberOfRoleSherlock, 
                    "numberOfRoleMoriaty" : element.numberOfRoleMoriarty
                }
            }
           
        });
        const sherlock = "sherlock/"; 
        const moriarty = "/moriarty/"; 
        let nbRoleSherlock = sherlock.repeat(tabcomposition.numberOfRoleSherlock);
        let nbRoleMoriarty = moriarty.repeat(tabcomposition.numberOfRoleMoriaty);
        let composition = nbRoleSherlock + nbRoleMoriarty ; 
        if(composition){
            resolve(composition.split('/').filter(String)); 
        }else{
            reject("erreur");
        }
      
     
    

    })

    
    
}


/**
 * add role 
 * @param {*} room 
 * @param {*} res 
 */
exports.distribution_of_roles = (room , res) =>{
   
   getCompositionOfTeam(room.numberOfPlayers)
   .then((composition) =>{
      
        //Attribution des roles 
        room.players.forEach(element =>{
            let randomRole = composition[Math.floor(Math.random()*composition.length)];
            element.role = randomRole;  //update the users in the room
            User.findByIdAndUpdate(element._id , {role : randomRole} )
            .then((user) =>{      
                composition.splice(composition.indexOf(randomRole) , 1);//deleted the assigned role             
            })
        })
        res.status(200).json({room , message:"Rôles attribués"})
       
        
   })
   .catch((erreur)=>{
       res.status(500).json({message:"erreur"})
   })
  


}