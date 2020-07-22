const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');
const cryptoRandomString = require('crypto-random-string');


/**
 * Register user , create pin game
 */
exports.user_register = (req, res) => {
    let new_user = new User(req.body);

    //génère un pin
    let pinRandom = cryptoRandomString({length: 10});

    //Crée la room à faire

    //info user
    let userData = {
        pseudo: new_user.pseudo, 
        pin: pinRandom
    }
    jwt.sign({userData}, process.env.JWT_KEY, {expiresIn: '30 days'}, (error, token) => {
        new_user.save()
        .then(user => {    
            res.status(201);
            res.json({token}); 
        })      
        .catch(error => {
            res.status(500);
            console.log(error);
            res.json({message: "Erreur serveur."})
        })
    });
   
}


/**
 * login and pin verify en attente
 */
exports.user_login = (req, res) => {
    let {body} = req;

    //user exist
    User.findOne({pseudo: body.pseudo})

    //verif si pin existe
    .then(user => {
        let userData = {
            pseudo: user.pseudo,
            pin: body.pin
        }
        jwt.sign({userData}, process.env.JWT_KEY, {expiresIn: '30 days'}, (error, token) => {
            if(error){
              res.status(500);
              console.log(error);
              res.json({message: "Token invalide"});
            }
            else {
              res.json({token});
            }
        
  
        });
    })
    .catch(error => {
        res.status(500);
        console.log(error);
        res.json({message: "Ce compte n'existe pas"});
         //create user if not existe
    })

  }
  
  