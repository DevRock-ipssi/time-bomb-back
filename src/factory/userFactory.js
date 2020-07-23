/* exports.createRoles = () => {

   const Role = require('../api/models/roleModel');
   let role1 = {
     name: "Moriarty",
     max: "3"
   }

   let role2 = {
    name: "Sherlock ",
    max: "5"
  }

   role1 = new Role(role1);
   role2 = new Role(role2);
   role1.save();
   role2.save();
} */

exports.createRoles = () => {

    const Role = require('../api/models/roleModel');
  
    let roleData = [
      {
        name: "Sherlock ",
        max: "5"
      },
      {
        name: "Moriarty",
        max: "3"
      }
    ]
  
    Role.insertMany(roleData);
  }