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
 * cette methode permet de renvoyer un tab contenant les rôles distribués selon le nombre de joueur
 *  la route : http://localhost:3000/roles 
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
      let tabRef = [];
      let tabRole = [];
      let indices = [];
      let joueur = 7; // ici on met le nombre de joueur
      let element = 'Moriarty';

      function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
      }
      
      tabRef.push(role[0]['name'], role[1]['name']);

      //faire la distribution avec random selon le nombre de joueur
      for (let i = 0; i < joueur; i++) {
        let tabtemp = tabRef.slice(0);
        
            var role = tabtemp[Math.floor(Math.random()*tabtemp.length)];
        
            tabRole.push(role);
        }



      //traitement du cas ou l'ensemble des elements distribués par random est "sherlock"
      for (let i in tabRole){
  
        if (tabRole[i] == tabRole[1]){
          if (joueur == 4){	
            tabRole[getRandomInt(3)] = "Moriarty";
          }
          else if ((joueur == 5 || joueur == 6 )&& tabRole[0] == "Moriarty" ){	
            tabRole[getRandomInt(4)] = "Moriarty";
            //tabRole[3] = "Moriarty";
          }
          else if ((joueur == 5 || joueur == 6 )&& tabRole[0] != "Moriarty" ){	
            tabRole[getRandomInt(4)] = "Moriarty";
            tabRole[getRandomInt(4)] = "Moriarty";
          }
      
          else if ((joueur == 7 || joueur == 8) && tabRole[0] == "Moriarty"){	
            //tabRole[1] = "Moriarty";
            tabRole[getRandomInt(6)] = "Moriarty";
            tabRole[getRandomInt(6)] = "Moriarty";
          }
          else if ((joueur == 7 || joueur == 8 )&& tabRole[0] != "Moriarty" ){	
            tabRole[getRandomInt(6)] = "Moriarty";
            tabRole[getRandomInt(6)] = "Moriarty";
            tabRole[getRandomInt(6)] = "Moriarty";
          }
      
        }
      }


      // traitement du cas ou on a plusieurs Moriarty
      var idx = tabRole.indexOf(element);
      while (idx != -1) {
        indices.push(idx);
        idx = tabRole.indexOf(element, idx + 1);
      }
      //document.write(indices);
      if (indices.length > 0){
        for (let i in indices) {
          if(i != 0 && joueur == 4){	
            tabRole[indices[i]] = "Sherlock";
            
          } 
          if ((joueur == 5 || joueur == 6 )&& (i!=0 && i!=1) ){	
            tabRole[indices[i]] = "Sherlock";
            }

          if ((joueur == 5 || joueur == 6 )&& (i!=0 && i!=1 && i!=2) ){	
            tabRole[indices[i]] = "Sherlock";
          }
          if ((joueur == 7 || joueur == 8 )&& (i!=0 && i!=1 && i!=2 ) ){	
            tabRole[indices[i]] = "Sherlock";
          }
          
        }
      }
      console.log(tabRole);
      res.json(tabRole);

    }

  })

}

 
