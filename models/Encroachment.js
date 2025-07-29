const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EncroachmentSchema = new Schema({
    tankName: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    encroachmentType: {
        type: String,
        required: true
    },
    observationDate: {
        type: Date,
        required: true
    },
    // --- ADD THIS LINE ---
    description: {
        type: String,
        required: false // Optional field
    }
}, { timestamps: true }); // timestamps adds createdAt and updatedAt fields

const Encroachment = mongoose.model('Encroachment', EncroachmentSchema);

module.exports = Encroachment;