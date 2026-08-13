const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    // bcrypt hash, never the raw password
    passwordHash: {
        type: String,
        required: true
    },

    name: {
        type: String,
        trim: true,
        default: null
    }

}, {
    timestamps: { createdAt: 'created_at', updatedAt: false }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
