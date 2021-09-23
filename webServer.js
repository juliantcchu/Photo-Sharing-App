"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var async = require('async');

// Load the Mongoose schema for User, Photo, Activity and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var Activity = require('./schema/activity.js');
var SchemaInfo = require('./schema/schemaInfo.js');

var express = require('express');
var app = express();

const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');

const processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');
const fs = require("fs");
// const { useRef } = require('react');
// const { SignalCellularNullSharp } = require('@material-ui/icons');
// const { callbackify } = require('util');
// XXX - Your submission should work without this line. Comment out or delete this line for tests and before submission!
// var cs142models = require('./modelData/photoApp.js').cs142models;

mongoose.connect('mongodb://localhost/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));

app.use(session({
    secret: 'Gihofiwh0w9fydwdwdw8d98698698ndw898dwn98dwdWDNWY8dnwo8DN89NWD89nW', 
    resave: false, 
    saveUninitialized: false
}));
app.use(bodyParser.json());

app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /admin/login - Return the information for User (id)
 */
app.post('/admin/login', function (request, response) {
    User.findOne({login_name: request.body.login_name}, function(err, user){
        if (err){
            response.status(400).send('error handling database');
        }
        if (!user){
            console.log('User not found.');
            response.status(400).send('Not such user');
            return;
        }
        if (user.password !== request.body.password){
            console.log('password incorrect');
            response.status(400).send('incorrect password');
            return;
        }

        user = JSON.parse(JSON.stringify(user));
        delete user.__v;
        request.session.user = user;
        updateActivity(user._id, 'logged in', null);
        response.status(200).send(JSON.stringify(user));
    });
});


app.post('/admin/logout', function (request, response) {
    updateActivity(request.session.user._id, 'logged out', null, function(err){
        if (err){
            response(400).send('logout unsuccessful');
            return;
        }
        request.session.destroy(function (err) {
            if (err){
                response(400).send('logout unsuccessful');
                return;
            }
            response.status(200).send('logout success');
        } );
    });
});

// create new account 
app.post('/user', function (request, response) {
    User.findOne({login_name: request.body.login_name}, function(err, user){
        if (err){
            response.status(400).send('error adding to database');
            return;
        }
        if (request.body.login_name === '' || typeof request.body.login_name !== 'string'){
            response.status(400).send('empty username not allowed');
        }
        if (!user){
            console.log('valid unused login_name');
            // add new user
            User.create(request.body, function(err){
                if (err){
                    response.status(400).send();
                    return;
                }
                User.findOne({login_name: request.body.login_name}, function(err, user){
                    if (err || !user){
                        response.status(400).send();
                        return
                    }
            
                    user = JSON.parse(JSON.stringify(user));
                    delete user.__v;
                    request.session.user = user;
                    response.status(200).send(JSON.stringify(user));
                    return
                });
            });
        }else{
            response.status(400).send('user already exist');
        }
    });
});

app.post('/commentsOfPhoto/:photo_id', function (request, response) {
    //add the comment in
    if (!request.session.user){
        response.status(401).send({'login_unsuccessful':true});
        console.log('user have not logged in when posting comment');
        return;
    }

    Photo.findOne({_id: request.params.photo_id}, function(err, photo){
        if (err){
            console.log('photo not found');
            response.status(400).send('photo not found');
            return;
        }
        let new_comment = {
            comment: request.body.comment.comment,
            user_id: request.session.user._id,
            date_time: (new Date()).toString()//request.body.comment.date_time
        };
        console.log(new_comment);
        photo.comments = photo.comments.concat([new_comment]);
        photo.save();
        

        User.findOne({_id: request.session.user._id}, (err, user)=>{
            if (err || !user){
                response.status(400).send();
                return;
            }
            new_comment.user = JSON.parse(JSON.stringify(user));
            delete new_comment.user.__v;
            delete new_comment.user.location;
            delete new_comment.user.description;
            delete new_comment.user.occupation;
            delete new_comment.user_id;

            updateActivity(request.session.user._id, 'commented on a photo', request.params.photo_id);
            response.status(200).send(new_comment);
        });
    })
});

function findFav(favs, photo_id){
    for (let i = 0; i < favs.length; i++){
        console.log(favs[i].photo_id, photo_id)
        console.log(favs[i].photo_id == photo_id)
        if (favs[i].photo_id == photo_id){
            return i;
        }
    }
    return null;
}

app.post('/addToFavorite', function(request, response){
    if (!request.session.user){
        response.status(401).send({'login_unsuccessful':true});
        console.log('user have not logged in when adding favorites');
        return;
    }

    // delete from to database
    User.findOne({_id: request.session.user._id}, function(err, user){
        if (err){
            console.log('error when finding user');
            response.status(400).send();
            return;
        }
        console.log('adding fav photo ' + request.body.photo_id);

        console.log('fav index: ', findFav(user.favorites, request.body.photo_id));
        if(findFav(user.favorites, request.body.photo_id) !== null){
            console.log('is already fav')
            response.status(400).send();
            return;
        }else{
            user.favorites = user.favorites.concat([{photo_id: request.body.photo_id}]);
            user.save();
            updateActivity(request.session.user._id, 'added a photo to favorites', null);
            response.status(200).send();
        }

    });

});


app.post('/removeFromFavorite', function(request, response){
    console.log('attempting to remove favorite ', request.body.photo_id);
    if (!request.session.user){
        response.status(401).send({'login_unsuccessful':true});
        console.log('user have not logged in when removing favorites');
        return;
    }

    // add to database
    User.findOne({_id: request.session.user._id}, function(err, user){
        if (err){
            console.log('error when finding user');
            response.status(400).send();
            return;
        }
        console.log('removing from user ', user._id)
        console.log('from', user.favorites);
        let ind = findFav(user.favorites, request.body.photo_id);
        console.log('ind', ind);
        user.favorites.splice(ind, 1);
        console.log('into', user.favorites);
        user.save();
        response.status(200).send();
    });
});


function updateActivity(user_id, activity, details, callback){
    let done = 0;
    // let errs = 0;
    //add to most recent activity in user
    User.findOne({_id: user_id}, function(err, user){
        if(err){
            console.log('err whern updating activity 1 ', err);
            // errs++;
            if (callback){
                callback(err);
                return;
            }
        }
        user.last_activity = activity;
        user.activity_details = details;
        user.save();
        done ++;
        if (done >=2){
            console.log('successfully updated activity');
            if(callback){
                callback();
            }
            // return errs;
        }
    });

    //add to activity list
    Activity.create({
        user_id: user_id,
        activity: activity,
        details: details, 
        //date time is automatic
    }, function(err){
        if(err){
            console.log('err whern updating activity 2 ', err);
            if (callback){
                callback(err);
            }
            // errs++;
        }
        done++;
        if (done >=2){
            console.log('successfully updated activity');
            if(callback){
                callback()
            }
            // return errs;
        }
    });
}

app.get('/getLatestActivities', function(request, response){
    if (!request.session.user){
        response.status(401).send({'login_unsuccessful':true});
        console.log('user have not logged in when showing favorites');
        return;
    }

    // requirement = null
    // if (request.body.data.user_id){
    //     requirement = {user_id: request.body.data.user_id}
    // }
    Activity.find({}).limit(5).sort({ date_time: -1 }).exec(function(err, activities){
        if (err){
            console.log('err when getting activity', err);
            response.status(400).send();
            return;
        }

        // append information for each activity. 
        activities = JSON.parse(JSON.stringify(activities));
        async.each(activities, function(activity, callback){
            User.findOne({_id: activity.user_id}, function(err, user){
                if (err){
                    callback(err);
                }
                activity.name = user.first_name + ' ' + user.last_name;
                console.log('checking if we should add details for ',activity);
                if (activity.activity === 'uploaded a photo' || activity.activity === 'commented on a photo'){
                    console.log('adding details to activity ', activity);
                    Photo.findOne({_id: activity.details}, function(err, photo){
                        if (err){
                            callback(err);
                        }
                        activity.details = {file_name: photo.file_name};
                        console.log('file name is ', activity.details);
                        callback(err);
                    })
                }else{
                    callback(err);
                }
            })
            
        }, function(err){
            if (err){
                console.log(err);
                response.status(400).send();
                return;
            }
            activities.sort((a, b) => (a.date_time > b.date_time) ? -1 : 1)
            response.status(200).send(activities);
        })
    });
})



app.get('/favoritesOfUser/:user_id', function(request, response){
    if (!request.session.user){
        response.status(401).send({'login_unsuccessful':true});
        console.log('user have not logged in when showing favorites');
        return;
    }

    // add to database
    User.findOne({_id: request.params.user_id}, function(err, user){
        let updated_favs = [];
        if (err){
            console.log('error when finding user');
            response.status(400).send();
            return;
        }
        console.log("user.favorites", user.favorites);
        async.each(user.favorites, function(fav, callback){
            console.log('fav.photo_id', fav.photo_id);
            Photo.findOne({_id: fav.photo_id}, function(err, photo){
                console.log('photo', photo);
                if (err){
                    console.log('error finding photo');
                    response.status(400).send('error');
                    return;
                }
                fav = JSON.parse(JSON.stringify(photo));
                delete fav.__v;
                async.each(fav.comments, function(com, done_callback2){
                    console.log('handling comments')
                    User.findOne({_id: com.user_id}, (err, user)=>{
                        if (user === null || err){
                            response.status(400).send();
                            console.log('error getting user '+com.user_id);
                            console.log(err)
                            return;
                        }
                        
                        com.user = JSON.parse(JSON.stringify(user));
                        delete com.user.__v;
                        delete com.user.location;
                        delete com.user.description;
                        delete com.user.occupation;
                        delete com.user_id;
                        delete com.user.login_name;
                        delete com.user.password
                        //delete com._id;
                        //delete com.user._id;
                        console.log('com.user', com.user);
                        done_callback2(err);
                    });
                }, function (err) {
                    //inner loop callback
                    console.log('inner callback running')
                    if (err) {
                        return;
                    } else {
                        delete photo.__v;
                        updated_favs.push(fav);
                        callback(err);
                    }
                });
            })
        }, function(err){
            if (err){
                console.log('error finding comments');
                response.status(400).send('error');
                return;
            }
            console.log('showing content to send', {data: updated_favs});
            response.status(200).send({favorites: updated_favs});
        });
    });
});



app.post('/photos/new', function (request, response) {
    processFormBody(request, response, function (err) {
        if (err || !request.file) {
            response.status(400).send();
            return;
        }
        // request.file has the following properties of interest
        //      fieldname      - Should be 'uploadedphoto' since that is what we sent
        //      originalname:  - The name of the file the user uploaded
        //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
        //      buffer:        - A node Buffer containing the contents of the file
        //      size:          - The size of the file in bytes
    
        // XXX - Do some validation here.
        // We need to create the file in the directory "images" under an unique name. We make
        // the original file name unique by adding a unique prefix with a timestamp.
        const timestamp = new Date().valueOf();
        const filename = 'U' +  String(timestamp) + request.file.originalname;
    
        fs.writeFile("./images/" + filename, request.file.buffer, function (err) {
          // XXX - Once you have the file written into your images directory under the name
          // filename you can create the Photo object in the database

          if (err){
              response.status(400).send('no image attached');
          }

          Photo.create({
              file_name: filename,
              date_time: (new Date()).toString(),
              user_id: request.session.user._id,
              comments: []
          }, function(err, photo){            
            if(err){
                console.log(err);
                response.status(400).send(err);
                return;
            }
            updateActivity(request.session.user._id, 'uploaded a photo', photo._id);
            response.status(200).send('works');
          })
        });
    });
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {

    if (!request.session.user){
        response.status(401).send({'login_unsuccessful':true});
        console.log('user have not logged in when getting user list');
        return;
    }

    User.find(function(err, users){
        if (err){
            console.error('Doing /user/list error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        users = JSON.parse(JSON.stringify(users));
        async.each(users, function(user, callback){
            delete user.location;
            delete user.description;
            delete user.occupation;
            delete user.__v;
            delete user.login_name;
            delete user.password;

            if (user.last_activity === 'uploaded a photo' || user.last_activity === 'commented on a photo'){
                Photo.findOne({_id: user.activity_details}, function(err, photo){
                    if (err){
                        callback(err);
                    }
                    user.activity_details = {file_name: photo.file_name};
                    callback(err);
                });
            }else{
                callback(err);
            }

                    
        }, function(){
            if (err){
                console.error('Doing /user/list error:', err);
                response.status(400).send(JSON.stringify(err));
                return;
            }
            response.status(200).send(JSON.stringify(users));
        })
    });
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    if (!request.session.user){
        response.status(401).send({'login_unsuccessful':true});
        console.log('user have not logged in when getting user information');
        return;
    }

    User.findOne({_id: request.params.id}, function(err, user){
        if (err){
            console.log('User with _id:' + request.params.id + ' not found.');
            response.status(400).send('Not found');
            return;
        }

        if (user === null){
            response.status(400).send('Not found');
            return;
        }

        user = JSON.parse(JSON.stringify(user));
        console.log('loc 12', user);
        delete user.__v;
        delete user.login_name;
        delete user.password;
        response.status(200).send(JSON.stringify(user));
    });
});


/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    console.log('attempt to get photo');
    if (!request.session.user){
        response.status(401).send({'login_unsuccessful':true});
        console.log('user have not logged in when getting user photos');
        return;
    }
    Photo.find({user_id: request.params.id}, function(err, photos){
        if (err){
            console.log('photos with user_id:' + request.params.id + ' not found.');
            response.status(400).send('Not found');
            return;
        }

        photos = JSON.parse(JSON.stringify(photos));

        //outer loop
        async.each(photos, function (photo, done_callback) {
            // inner loop
            async.each(photo.comments, function(com, done_callback2){
                User.findOne({_id: com.user_id}, (err, user)=>{
                    if (user === null || err){
                        response.status(400).send();
                        console.log('error getting user '+com.user_id);
                        console.log(err)
                        return;
                    }
                    
                    com.user = JSON.parse(JSON.stringify(user));
                    delete com.user.__v;
                    delete com.user.location;
                    delete com.user.description;
                    delete com.user.occupation;
                    delete com.user_id;
                    delete com.user.login_name;
                    delete com.user.password
                    //delete com._id;
                    //delete com.user._id;
                    console.log('com.user', com.user);
                    done_callback2(err);
                });
            }, function (err) {
                //inner loop callback
                if (err) {
                    return;
                } else {
                    delete photo.__v;
                    //delete photo.user_id;
                    done_callback(err);
                }
            });


        }, function (err) {
            //outer loop callback
            if (err) {
                response.status(500).send(JSON.stringify(err));
                return;
            } else {
                response.status(200).send(JSON.stringify(photos));
            }
        });
    });
});


var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});


