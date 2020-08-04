const { verify_token ,verify_token_gameMaster  } = require('../middlewares/authCheckMiddleware');


module.exports = (server) => {

    const playingController = require('../controllers/playingController'); 

    server.get('/get/all-player/' , verify_token,  playingController.all_player)
    server.get('/select-player/:_id' , verify_token_gameMaster,  playingController.select_a_player)
    server.post('/select-player/:_id/card/:key' , verify_token_gameMaster, playingController.select_player_card) // en cours
}
  