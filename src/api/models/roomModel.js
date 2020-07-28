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
			default : 4
		},
		numberOfPlayers: {
			type: Number,
			default : 8
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
        waiting: {
            type: Boolean,
            required: true,
            default: true
        }
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);
