const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const {scoreSchema} = require('./ScoreModel');

const profileSchema = new mongoose.Schema({
    hackerrank: {
        username: {
            type: String,
        },
        lastUpdated: Date,
        scores: scoreSchema,        
    },
    leetcode: {
        username: {
            type: String,
        },
        lastUpdated: Date,
        scores: scoreSchema,       
    },
    codechef: {
        username: {
            type: String,
        },
        lastUpdated: Date,
        scores: scoreSchema,       
    },
    codeforces: {
        username: {
            type: String,
        },
        lastUpdated: Date,
        scores: scoreSchema,        
    },
    interviewbit: {
        username: {
            type: String,
        },
        lastUpdated: Date,
        scores: scoreSchema,       
    },
    spoj: {
        username: {
            type: String,
        },
        lastUpdated: Date,
        scores: scoreSchema,       
    }
});

const profileModel = mongoose.model('Profile',profileSchema);

module.exports = {
    profileSchema,
    profileModel
};