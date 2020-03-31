const config = require('./lib/server-configurations');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dbservices = require('./lib/dbservices');
const helpers = require('./lib/helpers'); 
const bcrypt = require('bcrypt-nodejs');
const ajax = require('./lib/ajax');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const http = require('http');
const https = require('https');
const taskSeqHelpers = require('./lib/task-sequence');
const sgMail = require('@sendgrid/mail');

// Set Sendgrid Api Key
sgMail.setApiKey(config.emails.sendgrid.apiKey);

// Server settings
const HTTP_PORT = config.http.port;

// Bcrypt settings
const saltRounds = 8;

// List of Tokens
const tokenList = {};

const app = express();

// Redirect all requests to https
if(config.envName != 'staging'){
    app.use ((req, res, next) => {
        if (req.secure) {
                // request was via https, so do no special handling
                next();
        } else {
                // request was via http, so redirect to https
                res.redirect('https://' + req.headers.host + req.url);
        }
    });
}

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Home Route
app.get('/', (req, res) => {
    res.render('home');

    let ipAddr = typeof(req.connection.remoteAddress) !== 'undefined' ? req.connection.remoteAddress.substring(req.connection.remoteAddress.lastIndexOf(':') + 1) : false;
    //console.log(req.connection.remoteAddress);

    if (ipAddr.length > 2) {
        ajax.getIpInfo(ipAddr, (ipInfo)=>{
            if (ipInfo.status == 'success'){
                helpers.getDbFriendlyIpData(ipInfo, (dbFriendlyIpObj) => {
                    dbservices.addHomePageVisit([dbFriendlyIpObj], (error, error_desc, returned)=> {
                        if(!error){
                            // console.log('Saved IP Information for', ipAddr);
                        }else {
                            // console.log(error_desc);
                            console.log('Failed to add home page visit for IP Address: ',ipAddr);
                        }
                    })
                });
            } else {
                console.log('Failed to get ip info for IP Address: ',ipAddr);
            }
        });
    } else if(!ipAddr) {
        console.log('Request came with IP Address that could not be identified, Here is the req.connection object', req.connection);
    }
});

// Timer Route
app.get('/tts-timer', (req, res) => {
    res.render('tts-timer');
});

// TTS Main Menu Route
app.get('/tts-main-menu', (req, res) => {
    res.render('tts-main-menu');
/*     jwt.verify(req.token, config.jwt.secret, (err, authData) => {
        if (err) {
            res.status(403).json({'Error':'Access to TTS Main menu is Forbidden'});
        } else {
            res.json({
                authData
            });
        }
    });
 */
});

app.get('/workspace-home', (req, res) => {
    res.render('workspace-home');
/*     jwt.verify(req.token, config.jwt.secret, (err, authData) => {
        if (err) {
            res.status(403).json({'Error':'Access to TTS Main menu is Forbidden'});
        } else {
            res.json({
                authData
            });
        }
    });
 */
});

// TTS Details Route
app.get('/tts-details', (req, res) => {
    res.render('tts-details');
});

// TS Details Route
app.get('/task-sequence-details', (req, res) => {
    res.render('task-sequence-details');
});

// HTTPS Requirement (Not sure why and how it works)
app.get('/.well-known/acme-challenge/EMCcyVLYM6sCWp1vV3XQ7Pqaf5mime-1lqM9MqMQpj0', (req, res) => {
    res.send('EMCcyVLYM6sCWp1vV3XQ7Pqaf5mime-1lqM9MqMQpj0.xYo7TzuMhAEAsL3f0V8kQG6vxOS4OctB1fTtuLLf5ow');
});

// AJAX Requests from Client-Side
app.post('/users', (req, res) => {
    let func = typeof(req.query.func) == 'string' && req.query.func.trim().length > 0 ? req.query.func.trim() : false;
    // Create User
    if (func == 'createUser'){
        // Object that holds user information
        let newUser = {};

        // Get all the user information
        // TODO: Validate this information (e.g. Make sure an email is valid, password conditions etc...)
        newUser.fName = typeof(req.body.fName) == 'string' && req.body.fName.trim().length > 0 ? req.body.fName.trim() : false;
        newUser.lName = typeof(req.body.lName) == 'string' && req.body.lName.trim().length > 0 ? req.body.lName.trim() : false;
        newUser.emailAddr = typeof(req.body.emailAddr) == 'string' && req.body.emailAddr.trim().length > 0 ? req.body.emailAddr.trim() : false;
        newUser.pass = typeof(req.body.pass) == 'string' && req.body.pass.length > 0 ? req.body.pass : false;
        newUser.passConf = typeof(req.body.passConf) == 'string' && req.body.passConf.length > 0 ? req.body.passConf : false;
        newUser.tosAgreement = typeof(req.body.tosAgreement) == 'boolean' ?  true : false;

        // Make sure everything is correct
        // Array to store all invalid fields to send to client to display to the user
        let invalid = helpers.checkForKeysWithFalseValues(newUser);

        if (invalid.length == 0){
            // Add user to DB if doesn't already exist (email addr)
            dbservices.userExists(newUser.emailAddr, (error, error_desc,returned)=>{
                if (error) {
                    console.log('Error checking if user exists');
                    res.status(500);
                } else {
                    if (returned == true){
                        // User Already Exists
                        console.log('Unable to add user, an email is already associated with an existing account');
                        res.status(409).send();
                    } else {
                        // User Does not already exist, can be added

                        // Hash & Salt password
                        var salt = bcrypt.genSaltSync(saltRounds);
                        var hashedPass = bcrypt.hashSync(newUser.pass, salt);

                        newUser.salt = salt;
                        newUser.hashedPass = hashedPass;

                        dbservices.addNewUser(newUser, (error, error_desc, returned)=> {
                            if (!error){
                                
                                // Redirect to user dashboard
                                res.status(200).send();
                                console.log('Successfully added:', newUser.emailAddr);
                            }else {
                                console.log(error_desc);
                                res.status(500).send();
                            }
                        });
                    }
                }
            });
        } else {
            res.status(400).json({
                'error':'Missing Required Fields',
                'missingFields': invalid
            });
        }
    // No func or func doesn't exist
    } else {
        res.status(400);
    }
});

app.post('/auth', (req,res)=> {
    let func = typeof(req.query.func) == 'string' && req.query.func.trim().length > 0 ? req.query.func.trim() : false;
    // Sing in
    if (func == 'signIn'){
        let emailAddr = typeof(req.body.emailAddr) == 'string' && req.body.emailAddr.trim().length > 0 ?  req.body.emailAddr.trim() : false;
        let plainTextPass =  typeof(req.body.pass) == 'string' && req.body.pass.trim().length > 0 ?  req.body.pass.trim() : false;

        if (emailAddr && plainTextPass){
            // Authenticate User
            dbservices.checkPassAndReturnUserInfo(emailAddr, plainTextPass, (error, error_desc, userId) => {
                if(userId){
                    /* // Password Matches - User Authenticated
                    res.status(200).json({'Authentication':'User Authenticated'}); */
                    
                    let userInfo = {
                        user_id: userId
                    }
                    // Generate Tokens
                    const access_token = jwt.sign(userInfo, config.jwt.secret, { expiresIn: config.jwt.tokenLife } , (jwt_err, access_token)=> {
                        if(!jwt_err){
                            res.status(200).json({auth:{
                                access_token
                            }});
                        } else {
                            // console.log("JWT error",jwt_err);
                            res.status(500).json({'Error':'Could not sign jwt'});
                        }
                    });
                }else{
                    // Password Does not Match - Authentication Failed
                    res.status(401).json({'Error':'Invalid Email Address or Password'});
                    console.log('Error: ', error_desc);
                }
            });
        } else {
            res.status(400).json({'Error': 'Missing Required Fields'});
        }
    } else if (func == 'makeSureUserIsAuthorized'){
        let access_token = req.header('access_token');

        jwt.verify(access_token, config.jwt.secret, (err, authData) => {

            if (err) {
                res.status(403).send();
            } else {
                res.status(200).send();
            }
        });
    } else {
        res.status(400).json({'Error': 'Unknown function'});
    }
});

app.post('/promocode', (req,res)=> {
    console.log(`Received:`, req.body);
    res.status(200).json({promo: 'Working'});

    // Check where this promo code leads

    // Send to where it leads
});

app.post('/send-debug-email', (req,res)=> {
    console.log(`Received:`, req.body);
    let emailSubject = typeof(req.body.emailSubject) == 'string' && req.body.emailSubject.trim().length > 0 ?  req.body.emailSubject.trim() : "No Subject";
    let emailText = typeof(req.body.emailText) == 'string' && req.body.emailText.trim().length > 0 ?  req.body.emailText.trim() : "No Text";
    const msg = {
    to: 'pytrickdollar@gmail.com',
    from: 'GA Notifications <notifications@gerardantoun.com>',
    subject: `GA - ${emailSubject}`,
    text: emailText,
    html: emailText,
    };
    sgMail.send(msg, (error, result) => {
        
        if(error){
            res.status(500).json({email: 'Not Sent'});
        }else{
            console.log('Email Sent');
            console.log('result: ', result);
            res.status(200).json({email: 'Sent'});
        }
    });
    
});

app.post('/tasks',(req,res) => {
    let func = typeof(req.query.func) == 'string' && req.query.func.trim().length > 0 ? req.query.func.trim() : false;
    
    if (func){
        let access_token = req.header('access_token');
        if (typeof access_token == 'string' && access_token.length > 0){
            if (func == 'getTaskWithChildrenDeepAsArray'){
                jwt.verify(access_token, config.jwt.secret, (err, authData) => {
                    if (err) {
                        res.status(403).send();
                    } else {
                        let taskToGetWithChildrenId = typeof(req.body.task_id) == 'string' ? req.body.task_id : false;
                        // Get Task With Children (Deep) From Database as an array with no hierarchy
                        dbservices.getTaskWithChildrenDeepAsArray(authData.user_id, taskToGetWithChildrenId, (error_type, error_desc, taskAndChildrenArray) => {
                            if(!error_type){
                                res.status(200).json({"task_and_children_array" :taskAndChildrenArray});
                            }
                        });
                    }
                });
            } else if(func=="createNewRootTaskForUser"){
                jwt.verify(access_token, config.jwt.secret, (err, authData) => {
                    if (err) {
                        res.status(403).send();
                    } else {
                        
                        // Create Root Task And one Child Task (Both empty)
                        let datetime = moment.utc().format('YYYY-MM-DD HH:mm:ss');

                        let emptyRootTaskObj = {
                            title: '',
                            parent_id: null,
                            previous_sibling_id: null,
                            next_sibling_id: null,
                            creator_user_id: authData.user_id,
                            date_created: datetime,
                            is_deleted: 0,
                        }
                        
                        dbservices.addNewTaskWithoutTouchingAnyOtherTasks(authData.user_id, emptyRootTaskObj, (err_type, err_desc, newRootTaskId)=> {
                            if(!err_type){
                                let emptyRootChildTaskObj = {
                                    title: '',
                                    parent_id: newRootTaskId,
                                    previous_sibling_id: null,
                                    next_sibling_id: null,
                                    creator_user_id: authData.user_id,
                                    date_created: datetime,
                                    is_deleted: 0,
                                }
                                dbservices.addNewTaskWithoutTouchingAnyOtherTasks(authData.user_id, emptyRootChildTaskObj, (err_type, err_desc, newRootChildTaskId)=> {

                                    if(!err_type){
                                        
                                        res.status(200).json({"task_id": newRootTaskId});
                                    }else{
                                        res.status(500).json({"Error": "Could not create child Task"});
                                    }
                                })
                            }else{
                                res.status(500);
                            }
                        });
                    }
                });
            }else if(func=="createNewTaskForUser"){

                jwt.verify(access_token, config.jwt.secret, (err, authData) => {
                    if (err) {
                        res.status(403).send();
                    } else {
                        let neededItems = req.body;
                        let neededItemsKeysArray = Object.keys(neededItems);
                        
                        let datetime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
                        
                        let emptyTaskObj = {
                            title: '',
                            parent_id: req.body.parent_id,
                            creator_user_id: authData.user_id,
                            date_created: datetime,
                            is_deleted: 0,
                        }
                        if(neededItemsKeysArray.includes("next_sibling_id")){
                            // Incoming task should be before "next_sibling_id"
                            emptyTaskObj.next_sibling_id = neededItems.next_sibling_id;
                        }else if(neededItemsKeysArray.includes("previous_sibling_id")){
                            // Incoming task should be after "previous_sibling_id"
                            emptyTaskObj.previous_sibling_id = neededItems.previous_sibling_id;
                        }
                        //console.log('emptyTaskObj: ', emptyTaskObj);
                        dbservices.addNewTaskAndChangeNextAndPreviousTasks(authData.user_id, emptyTaskObj, (err_type, err_desc, newTaskAndChangesToImplement)=> {
                            if(!err_type){
                                res.status(200).json(newTaskAndChangesToImplement);
                            }else{
                                res.status(500).json({"error": "invalid input parent id of new task does not match its next sibling's parent's id"});
                            }
                        });
                    }
                });
            }else if(func=="deleteTaskForUser"){
                jwt.verify(access_token, config.jwt.secret, (err, authData) => {
                    if (err) {
                        res.status(403).send();
                    } else {
                        let taskToDelId = req.body.task_id;
                        
                        let datetime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    
                        //console.log('emptyTaskObj: ', emptyTaskObj);
                        dbservices.deleteTaskAndChangeNextAndPreviousTasks(authData.user_id, taskToDelId, (err_type, err_desc, deletedTaskIdAndChangesToImplement)=> {
                            if(!err_type){
                                res.status(200).json(deletedTaskIdAndChangesToImplement);
                            }else{
                                res.status(500);
                            }
                        });
                    }
                });
            }
        } else {
            res.status(403).send();
        }
    }else{
        res.status(400).json({'Error': 'Missing Required Fields'});
    }
});
app.post('/tts',(req,res) => {
    let func = typeof(req.query.func) == 'string' && req.query.func.trim().length > 0 ? req.query.func.trim() : false;
    
    if (func){
        let access_token = req.header('access_token');
        if (typeof access_token == 'string' && access_token.length > 0){
            if (func == 'createNewTts'){
                jwt.verify(access_token, config.jwt.secret, (err, authData) => {
                    if (err) {
                        res.status(403).send();
                    } else {
                        let datetime = moment.utc().format('YYYY-MM-DD HH:mm:ss');

                        let emptyTtsObj = {
                            title: '',
                            description: '',
                            duration: 0,
                            date_created: datetime,
                            creator_user_id: authData.user_id
                        }
        
                        // Save in Database
                        dbservices.addNewTts(emptyTtsObj, (error_type, error_desc, newTtsId)=> {
                            // TODO: Check for errors
                            res.status(200).json({'tts_id':newTtsId});
                        });
                    }
                });
                



            }else if (func == 'getAllTts') {
                jwt.verify(access_token, config.jwt.secret, (err, authData) => {
                    if (err) {
                        res.status(403).send();
                    } else {
                        dbservices.getAllTts(authData.user_id, (error, error_desc, returned)=>{
                            if(!error){
                                res.status(200).json(returned);
                            } else{
                                res.status(500).send();
                            }
                        });
                    }
                });
            }else if (func == 'addNewTtsTask') {
                jwt.verify(access_token, config.jwt.secret, (err, authData) => {
                    if (err) {
                        res.status(403).send();
                    } else {
                        let newTtsTaskObj = typeof(req.body.tts_task) == 'object' ? req.body.tts_task : false;
                        if (newTtsTaskObj){
                            dbservices.addNewTtsTask(newTtsTaskObj, authData.user_id, (error, error_desc, newTtsTaskObjWithId)=>{
                                if(!error){
                                    if (newTtsTaskObj.duration > 0){
                                        // Get All All other Tasks
                                        dbservices.getAllTasksForTtsInOrder(authData.user_id, (error, error_desc, ttsTasksArray) => {
                                            if(!error){
                                                // Compute the new length of the whole task sequence
                                                let newTtsDurationInMs = taskSeqHelpers.computeDurationOfTaskSequence(ttsTasksArray);

                                                // Save the new length of the task sequence
                                                dbservices.updateTtsDuration(newTtsTaskObj.ttsId ,newTtsDurationInMs, (error, error_desc, isUpdated)=> {
                                                    if(!error){
                                                        res.status(200).json({'tts_task':newTtsTaskObjWithId});
                                                    }else{
                                                        console.log(error, error_desc);
                                                        res.status(500).send();
                                                    }
                                                });
                                            }else{
                                                console.log(error, error_desc);
                                                res.status(500).send();
                                            }
                                        })
                                    } else{
                                        // If new task duration is 0 do not compute new TTS duration (so we avoid multiple unnecessary MySQL server calls)
                                        res.status(200).json({'tts_task':newTtsTaskObjWithId});
                                    }
                                } else{
                                    res.status(500).send();
                                }
                            });
                        } else{ 
                            res.status(400).json({'Error':'Missing TTS Task'});
                        }
                    }
                });
            }else if (func == 'getAllTasksForTtsInOrder' || func == 'getTtsTitleAndAllTasksForTtsInOrder' || func == 'getTtsInfo') {
                jwt.verify(access_token, config.jwt.secret, (err, authData) => {
                    if (err) {
                        res.status(403).send();
                    } else {
                        let ttsId = typeof(req.body.tts_id) == 'string' ? req.body.tts_id : false;
                        // Check if user has access to this tts
                        if (ttsId){
                            dbservices.getTts(ttsId, authData.user_id, (error_type, error_desc, ttsObj) => {
                                if(!error_type){
                                    if(ttsObj){
                                        // The User ID is indeed linked to this TTS
                                        
                                        if (func == 'getTtsInfo'){
                                            res.status(200).json({
                                                'tts_obj': ttsObj
                                            });   
                                        }
                                        
                                        dbservices.getAllTasksForTtsInOrder(ttsId, (error_type, error_desc, ttsTasksArray)=> {
                                            if(!error_type){
                                                switch(func) {
                                                    case 'getAllTasksForTtsInOrder':
                                                        res.status(200).json({'tts_tasks_array': ttsTasksArray});
                                                        break;
                                                    case 'getTtsTitleAndAllTasksForTtsInOrder':
                                                        
                                                        res.status(200).json({
                                                            'tts_tasks_array': ttsTasksArray,
                                                            'tts_title': ttsObj.title
                                                        });
                                                        break;           
                                                }
                                                
                                            }else{
                                                console.log(error_desc);
                                                res.status(500).json({"Error":'Could not get TTS Tasks'});
                                            }
                                        });
                                    } else {
                                        res.status(403).json({'Error': 'You cannot access this TTS'});
                                    }
                                } else {
                                    console.log(error_desc)
                                    res.status(500).send();
                                }
                            });
                        } else{
                            res.status(400).json({'Error':"Missing TTS id"});
                        }
                    }
                });
            }else if (func == 'deleteTtsTask') {
                jwt.verify(access_token, config.jwt.secret, (err, authData) => {
                    if (err) {
                        res.status(403).send();
                    } else {
                        let needed = {};
                        needed.ttsId = typeof(req.body.tts_id) == 'string' ? req.body.tts_id : false;
                        needed.ttsTaskId = typeof(req.body.tts_task_id) == 'string' ? req.body.tts_task_id : false;
                        let invalid = helpers.checkForKeysWithFalseValues(needed);
                        
                        if (invalid.length > 0) {
                            res.status(400).json({'Missing':invalid});
                        } else {
                            // Check if user has access to this tts
                            dbservices.getTts(needed.ttsId, authData.user_id, (error_type, error_desc, ttsObj) => {
                                if(!error_type){
                                    if(ttsObj){
                                        // The User ID is indeed linked to this TTS
                                        dbservices.deleteTtsTask(needed.ttsTaskId, (error_type, error_desc, isDone)=> {
                                            if(!error_type){
                                                // Get All Remaining Tasks
                                                dbservices.getAllTasksForTtsInOrder(needed.ttsId, (error_type, error_desc, ttsTasksArray)=> {
                                                    if(!error_type){
                                                        // Compute new TTS Duration
                                                        let newTtsDurationInMs = taskSeqHelpers.computeDurationOfTaskSequence(ttsTasksArray);
                                                        
                                                        // Update to new TTS Duration
                                                        dbservices.updateTtsDuration(needed.ttsId, newTtsDurationInMs, (error_type, errpr_type, isUpdated)=> {
                                                            if(!error_type){
                                                                res.status(200).send();
                                                            }else{
                                                                console.log(error_desc);
                                                                res.status(500).send();
                                                            }
                                                        });
                                                    }else{
                                                        console.log(error_desc);
                                                        res.status(500).send();
                                                    }
                                                });
                                            }else{
                                                console.log(error_desc);
                                                res.status(500).json({"Error":'Could not delete TTS Task'});
                                            }
                                        });
                                    } else {
                                        res.status(403).json({'Error': 'You cannot access this TTS'});
                                    }
                                } else {
                                    console.log(error_desc)
                                    res.status(500).send();
                                }
                            });
                        }
                    }
                });
            }else if (func == 'updateTtsTask') {
                jwt.verify(access_token, config.jwt.secret, (err, authData) => {
                    if (err) {
                        
                        res.status(403).send();
                    } else {
                        let needed = {};
                        needed.ttsId = typeof(req.body.tts_id) == 'string' ? req.body.tts_id : false;
                        needed.ttsTask = typeof(req.body.tts_task) == 'object' ? req.body.tts_task : false;
                        let invalid = helpers.checkForKeysWithFalseValues(needed);
                        
                        if (invalid.length > 0) {
                            res.status(400).json({'Missing':invalid});
                        } else {
                            // Check if user has access to this tts
                            dbservices.getTts(needed.ttsId, authData.user_id, (error_type, error_desc, ttsObj) => {
                                if(!error_type){
                                    if(ttsObj){
                                        // The User ID is indeed linked to this TTS
                                        dbservices.updateTtsTask(needed.ttsTask, (error_type, error_desc, isDone)=> {
                                            if(!error_type){
                                                // Get All Tasks to compute their new duration
                                                dbservices.getAllTasksForTtsInOrder(needed.ttsId, (error_type, error_desc, ttsTasksArray) => {
                                                    if (!error_type) {
                                                        // Compute new TTS Duration
                                                        let newTtsDurationInMs = taskSeqHelpers.computeDurationOfTaskSequence(ttsTasksArray);

                                                        // Update to new TTS Duration
                                                        dbservices.updateTtsDuration(needed.ttsId, newTtsDurationInMs, (error_type, errpr_type, isUpdated) => {
                                                            if (!error_type) {
                                                                res.status(200).send();
                                                            } else {
                                                                console.log(error_desc);
                                                                res.status(500).send();
                                                            }
                                                        });
                                                    } else {
                                                        console.log(error_desc);
                                                        res.status(500).send();
                                                    }
                                                });                                                
                                                
                                            }else{
                                                console.log(error_desc);
                                                res.status(500).json({"Error":'Could not update TTS Task'});
                                            }
                                        });
                                    } else {
                                        res.status(403).json({'Error': 'You cannot access this TTS'});
                                    }
                                } else {
                                    console.log(error_desc)
                                    res.status(500).send();
                                }
                            });
                        }
                    }
                });
            }else if (func == 'updateTtsTitle') {
                jwt.verify(access_token, config.jwt.secret, (err, authData) => {
                    if (err) {
                        res.status(403).send();
                    } else {
                        let needed = {};
                        needed.ttsId = typeof(req.body.tts_id) == 'string' ? req.body.tts_id : false;
                        needed.ttsTitle = typeof(req.body.tts_title) == 'string' ? req.body.tts_title : false;
                        let invalid = helpers.checkForKeysWithFalseValues(needed);
                        
                        if (invalid.length > 0) {
                            res.status(400).json({'Missing':invalid});
                        } else {
                            // Check if user has access to this tts
                            dbservices.getTts(needed.ttsId, authData.user_id, (error_type, error_desc, ttsObj) => {
                                if(!error_type){
                                    if(ttsObj){
                                        // The User ID is indeed linked to this TTS
                                        dbservices.updateTtsTitle(needed.ttsId, needed.ttsTitle, (error_type, error_desc, isDone)=> {
                                            if(!error_type){
                                                res.status(200).send();
                                            }else{
                                                console.log(error_desc);
                                                res.status(500).json({"Error":'Could not update TTS Title'});
                                            }
                                        });
                                    } else {
                                        res.status(403).json({'Error': 'You cannot access this TTS'});
                                    }
                                } else {
                                    console.log(error_desc)
                                    res.status(500).send();
                                }
                            });
                        }
                    }
                });
            }else if (func == 'deleteTtsAndTtsTasks'){
                jwt.verify(access_token, config.jwt.secret, (err, authData) => {
                    if (err) {
                        res.status(403).send();
                    } else {
                        let needed = {};
                        needed.ttsId = typeof(req.body.tts_id) == 'string' ? req.body.tts_id : false;
                        let invalid = helpers.checkForKeysWithFalseValues(needed);
                        
                        if (invalid.length > 0) {
                            res.status(400).json({'Missing':invalid});
                        } else {
                            // Check if user has access to this tts
                            dbservices.getTts(needed.ttsId, authData.user_id, (error_type, error_desc, ttsObj) => {
                                if(!error_type){
                                    if(ttsObj){
                                        // The User ID is indeed linked to this TTS
                                        dbservices.deleteTtsAndTtsTasks(needed.ttsId, authData.user_id, (error_type, error_desc, isDone)=> {
                                            if(!error_type){
                                                res.status(200).send();
                                            }else{
                                                console.log(error_desc);
                                                res.status(500).json({"Error":'Could not Delete TTS and All TTS Tasks'});
                                            }
                                        });
                                    } else {
                                        res.status(403).json({'Error': 'You cannot access this TTS'});
                                    }
                                } else {
                                    console.log(error_desc)
                                    res.status(500).send();
                                }
                            });
                        }
                    }
                });
            }
        } else {
            res.status(403).send();
        }
    } else{
        res.status(400).json({'Error': 'Missing Required Fields'});
    }
});

// Starting both http & https servers
const httpServer = http.createServer(app);

httpServer.listen(HTTP_PORT, () => {
	console.log('HTTP Server running on port', HTTP_PORT);
});

if(config.envName != 'staging'){
    
    const httpsServer = https.createServer(config.https.credentials, app);

    httpsServer.listen(443, () => {
        console.log('HTTPS Server running on port 443');
    });
    
}



/* 
app.listen(PORT, ()=> {
    
    console.log(`Server started on port ${PORT}`);
}); */

