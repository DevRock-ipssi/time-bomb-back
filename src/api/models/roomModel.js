const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const roomSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: true
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

		players: [
			{
				type: ObjectId,
				ref: 'User'
			}
		],
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
