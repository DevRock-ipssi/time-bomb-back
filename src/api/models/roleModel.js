
const mongoose = require('mongoose');

const Schema = mongoose.Schema;



let roleSchema = new Schema({

  name: {

    type: String,

    required: "Le nom est requis"

  },

  max: {

    type: Number

  },


});



module.exports = mongoose.model('Role', roleSchema);