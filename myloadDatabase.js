"use strict";

/* jshint node: true */
/* global Promise */

/*
 * This Node.js program loads the CS142 Project #7 model data into Mongoose defined objects
 * in a MongoDB database. It can be run with the command:
 *     node loadDatabase.js
 * be sure to have an instance of the MongoDB running on the localhost.
 *
 * This script loads the data into the MongoDB database named 'cs142project6'.  In loads
 * into collections named User and Photos. The Comments are added in the Photos of the
 * comments. Any previous objects in those collections is discarded.
 *
 * NOTE: This scripts uses Promise abstraction for handling the async calls to
 * the database. We are not teaching Promises in CS142 so strongly suggest you don't
 * use them in your solution.
 *
 */

// Get the magic models we used in the previous projects.
var cs142models = require('./modelData/photoApp.js').cs142models;

// We use the Mongoose to define the schema stored in MongoDB.
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var async = require('async');


mongoose.connect('mongodb://localhost/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });

// Load the Mongoose schema for Use and Photo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');
var Activity = require('./schema/activity.js');

var versionString = '1.0';


User.find({}).then(function(users){
    async.each(users, function(user){
        Activity.create({
            user_id: user._id,
            activity: 'registered as user', 
            date_time: new Date()
        }, function(err){
            if (err){
                console.log(err);
            }else{
                console.log('success creating activity');
            }
        })
    }, function(){
        console.log('successfully created user activities');
        mongoose.disconnect();
    })
});