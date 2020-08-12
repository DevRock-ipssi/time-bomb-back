module.exports = (server) => {
    const userController = require('../controllers/userController');
  
    server.post('/users/init-room', userController.user_init_room)
    server.post('/users/join-room', userController.user_join_room)
    
  
}
  