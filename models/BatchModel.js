const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const {userSchema} = require('./UserModel');

const batchSchema = new mongoose.Schema({
    batchname: {
        type: String,
        required: true
    },
    batchstatus: {
        type: String,
        default: "active",
        required: true
    },
    users: [userSchema]
});

const batchModel = mongoose.model('Batch', batchSchema);

module.exports = batchModel


