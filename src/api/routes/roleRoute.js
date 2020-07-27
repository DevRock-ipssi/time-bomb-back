
module.exports = (server) => {

    const roleController = require('../controllers/roleController');
  
  
  
  // server.route('/new/roles') 
  
   //.get(roleController.list_all_post_roles)
  
   //.post(roleController.create_a_role);
  

   server.route('/roles') // req.params.role_id
  
   .get(roleController.get_role)
  
   //.put(roleController.update_a_role)
  
   //.delete(roleController.delete_a_role);
  
  }