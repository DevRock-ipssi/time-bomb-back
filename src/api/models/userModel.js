const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userSchema = new Schema({
    pseudo: {
        type: String,
        required: true,
        unique: true
    },
/*     isGameMaster: {
        type: Boolean,
        default: false
    } */
    role: {
        type: String, 
        default: null
    }
})

module.exports = mongoose.model('User', userSchema);
