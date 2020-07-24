
const mongoose = require('mongoose');

const Schema = mongoose.Schema;



let roleSchema = new Schema({

  name: {

    type: String,
    unique: true

  },
  ref: {

    type: String,
    unique: true

  },
  max: {

    type: Number

  },


});



module.exports = mongoose.model('Role', roleSchema);