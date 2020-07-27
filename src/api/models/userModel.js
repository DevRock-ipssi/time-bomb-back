const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userSchema = new Schema({
    pseudo: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String, 
        default: null
    }
})

module.exports = mongoose.model('User', userSchema);
