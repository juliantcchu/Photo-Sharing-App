"use strict";
/*
 *  Defined the Mongoose Schema and return a Model for a User
 */
/* jshint node: true */

var mongoose = require('mongoose');


var favoriteSchema = new mongoose.Schema({
    photo_id: mongoose.Schema.Types.ObjectId,    // 	The ID of the user who created the comment.
});


// create a schema
var userSchema = new mongoose.Schema({
    first_name: String, // First name of the user.
    last_name: String,  // Last name of the user.
    location: String,    // Location  of the user.
    description: String,  // A brief user description
    occupation: String,   // Occupation of the user.
    login_name: String, // login name of the user.
    password: String, 
    favorites: [favoriteSchema], 
    last_activity: String, 
    activity_details: String,
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
