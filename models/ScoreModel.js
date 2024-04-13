const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const scoreSchema = new mongoose.Schema({
    noOfProblemsSolved: {
        type: Number,
    },
    noOfContests: {
        type: Number,
    },
    contestRating: {
        type: Number,
    },
    dsScore: {
        type: Number,
    },
    algoScore: {
        type: Number,
    },
    total:{
        type: Number,
    }
});

const scoreModel = mongoose.model('Score',scoreSchema);

module.exports = {
    scoreSchema,
    scoreModel
};