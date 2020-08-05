const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const roomSchema = mongoose.Schema(
	{
		numberOfRounds: {
			type: Number,
			default : 4
		},
		numberOfPlayers: {
			type: Number,
			default : 8
		},
		numberOfCardsToReturn: {
			type: Number,
			default: 1
		},
		gameMaster: {
			type: ObjectId,
			ref: 'User'
		},

		players: {
			type: Array,
			default: []
		},
		pin: {
			type: String,
			required: true,
			unique: true
		}, 
        numberOfCarteCableDesamorcageFound:{
			type: Number ,
			default: 0
        },
        carteBombeFound:{
            type: Boolean,
            default: false
        }, 
        waiting: {
            type: Boolean,
            required: true,
            default: true
        }
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);
