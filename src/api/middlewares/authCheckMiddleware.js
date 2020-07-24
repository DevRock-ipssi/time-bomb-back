const jwt = require('jsonwebtoken');

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
