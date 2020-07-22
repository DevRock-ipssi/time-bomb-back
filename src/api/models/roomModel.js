const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const roomSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: true
		},
		numberOfRounds: {
			type: Number,
			max: 8,
			min: 4
		},
		numberOfPlayers: {
			type: Number,
			max: 8,
			min: 4
		},
        gameMasterName: {
            type: String,
			required: true
        },

        players: {
            type: Array,
            default: []
        }
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);
