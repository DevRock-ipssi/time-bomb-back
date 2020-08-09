const { verify_token ,verify_token_gameMaster  } = require('../middlewares/authCheckMiddleware');


module.exports = (server) => {

    const playingController = require('../controllers/playingController'); 
    const carteController = require('../controllers/carteController')

    server.get('/get/all-player/' , verify_token,  playingController.all_player) // list of player
    server.get('/select-player/:_id' , verify_token_gameMaster,  playingController.select_a_player) //select a player
    server.post('/select-player/:_id/card/:key' , verify_token_gameMaster, playingController.select_player_card) //slect player's card
    server.post('/distribution' , verify_token_gameMaster, carteController.distribution_of_card_end_round) //distribution of card 

}
  