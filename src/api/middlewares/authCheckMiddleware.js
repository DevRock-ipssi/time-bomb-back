const jwt = require('jsonwebtoken');
const Room = require('../models/roomModel');
const User = require('../models/userModel.js');




exports.authCheck = async (req) => {
	if (req.body.token) {
		const currentUser = await jwt.verify(req.body.token, process.env.JWT_KEY);
		// check token validity
		// Retrieve user data { pseudo: 'xxxx', pin: 'yyyyzzz' }
		if (currentUser) {
			console.log('CURRENT USER: ', currentUser);
			return currentUser;
		}
	} else {
		console.log("Vous n'êtes pas autorisé à accéder à cette ressource !");
	}
};



exports.verify_token = (req, res, next) => {
  let token = req.headers['authorization'];

  if(typeof token !== 'undefined'){
    jwt.verify(token, process.env.JWT_KEY, (error, userData) => {
      if(error){
        res.status(401);
        res.json({message: "Accès interdit"})
      }
      else{
        next();
      }
    })
  }
  else{
    res.status(401);
    res.json({message: "Accès interdit"})
  }
}




exports.verify_token_gameMaster = (req, res, next) => {
  let token = req.headers['authorization'];

  if(typeof token !== 'undefined'){
    jwt.verify(token, process.env.JWT_KEY, (error, userData) => {
      if(error){
        res.status(401);
        res.json({message: "Token invalide"}); 
      }
      else{ 
      
        //verif if gameMaster 
        Room.findOne({pin : userData.userData.pin })
        .then((room) =>{
          
          User.findOne({ pseudo: userData.userData.pseudo})
					.then((user) => {	
           
            if( String(room.gameMaster) === String(user._id)){
              next();   
            }else{
              res.status(401).json({message : "Accès interdit"})
            } 
            
          })
          .catch((erreur) =>{
            res.status(500).json({message : "Erreur serveur"})
          })
           
        })
        .catch((erreur) =>{
          res.status(500).json({message : "Pin invalide !"})
        })
       
      }
    })
  }
  else{
    res.status(401).json({message : "Accès interdit"})
  }
}
