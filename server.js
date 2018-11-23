const config = require('./lib/config');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dbservices = require('./lib/dbservices');
const helpers = require('./lib/helpers'); 
const bcrypt = require('bcrypt-nodejs');
const mySmtp = require('./lib/mySmtp');
// Server settings
const PORT = config.http.port;

// Bcrypt settings
const saltRounds = 8;

const app = express();

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
    console.log(req.connection.remoteAddress.substring(req.connection.remoteAddress.lastIndexOf(':')));
    mySmtp.send.notifications.homePageVisit();
});

// Timer Route
app.get('/timer', (req, res) => {
    res.render('timer');
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

app.post('/tokens', (req,res)=> {
    console.log('RECEIVED: ', req.body);
    let emailAddr = typeof(req.body.emailAddr) == 'string' && req.body.emailAddr.trim().length > 0 ?  req.body.emailAddr.trim() : false;
    let plainTextPass =  typeof(req.body.pass) == 'string' && req.body.pass.trim().length > 0 ?  req.body.pass.trim() : false;

    if (emailAddr && plainTextPass){
        // Authenticate User
        dbservices.isPasswordMatchesEmailAddr(emailAddr, plainTextPass, (error, error_desc, result) => {
            if(result){
                // Password Matches - User Authenticated
                res.status(200).json({'Authentication':'User Authenticated'});
                // Send Token and Redirect to Dashboard
            }else{
                // Password Does not Match - Authentication Failed
                res.status(400).json({'Error':'Invalid Email Address or Password'});
            }
        });
    } else {
        res.status(400).json({'Error': 'Missing Required Fields'});
    }
});

app.post('/promocode', (req,res)=> {
    console.log(`Received:`, req.body);
    res.status(200).json({promo: 'Working'});

    // Check where this promo code leads

    // Send to where it leads
});




app.listen(PORT, ()=> {
    console.log(`Server started on port ${PORT}`);
});
