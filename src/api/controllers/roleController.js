const Role = require('../models/roleModel');

exports.create_a_role = (req, res) => {

    let new_role = new Role(req.body);
  
    new_role.save((error, post) => {
  
      if(error){
  
        res.status(500);
  
        console.log(error);
  
        res.json({message: "Erreur serveur."})
  
      }
  
      else{
  
        res.status(201);
  
        res.json(post);
  
      }
  
    })
  
  }
  
  
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */

exports.get_role = (req, res) => {


  Role.find({},(error, role) => {

    if(error){

      res.status(500);

      console.log(error);

      res.json({message: "Erreur serveur."})

    }

    else{

      res.status(200);
      //console.log(role[0]['name'])
      res.json(role)

    }

  })

}

 
