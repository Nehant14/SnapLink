// Backs a single internal document used by rangeAllocator.js to atomically
// hand out blocks of numeric IDs for short code generation.

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const counterSchema = new Schema({

    // we use a Fixed known string as the _id (e.g. 'short_code') instead of an
    // auto-generated ObjectId, so rangeAllocator.js always knows exactly
    // which document to target with findOneAndUpdate.
    _id: {
        type: String,
        required: true
    },

    // The current highest ID that has been reserved so far.
    current_max: {
        type: Number,
        required: true,
        default: 0
    }

});

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;
