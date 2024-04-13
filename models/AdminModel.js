const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const adminSchema = new mongoose.Schema({
    fullname:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String,
        required: true,
        default: "Admin"
    },
    lastLogin:{
        type: Date
    },
    isActive:{
        type: Boolean,
        required: true,
        default: true
    },
    refreshToken:{
        type: String
    }
});

const adminModel = mongoose.model('Admin',adminSchema);

module.exports = adminModel