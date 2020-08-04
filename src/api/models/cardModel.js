const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const cardSchema = mongoose.Schema(
	{
		numberOfCarteCableSecuriteFound:{
            type: Number
        }, 
        numberOfCarteCableDesamorcageFound:{
            type: Number
        },
        carteBombeFound:{
            type: Boolean,
            default: false
        }, 
		room: {
			type: ObjectId,
			ref: 'Room'
		}
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Card', cardSchema);
