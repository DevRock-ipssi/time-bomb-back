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
		}
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);
