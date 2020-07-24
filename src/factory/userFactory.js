exports.createRoles = () => {

   const Role = require('../api/models/roleModel');
   let role1 = {
     name: "Moriarty",
     ref: "r",
     max: "3"
   }

   let role2 = {
    name: "Sherlock ",
    ref: "b",
    max: "5"
  }

   role1 = new Role(role1);
   role2 = new Role(role2);
   role1.save();
   role2.save();
} 

