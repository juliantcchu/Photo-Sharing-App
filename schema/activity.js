"use strict";
/*
 *  Defined the Mongoose Schema and return a Model for a User
 */
/* jshint node: true */

var mongoose = require('mongoose');

// create a schema
var activitySchema = new mongoose.Schema({
    user_id: String, // user_id of the user.
    activity: String,
    date_time: {type: Date, default:Date.now},
    details: String
});

// the schema is useless so far
// we need to create a model using it
var Activity = mongoose.model('Activity', activitySchema);

// make this available to our users in our Node applications
module.exports = Activity;
