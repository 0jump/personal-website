const config = require('./lib/config');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dbservices = require('./lib/dbservices');
const helpers = require('./lib/helpers'); 

// Server settings
const PORT = config.http.port;

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
        invalid = helpers.checkForKeysWithFalseValues(newUser);

        if (invalid.length == 0){
            // Add user to DB if doesn't already exist (email addr)
            dbservices.addNewUser(newUser);

            // If everything is good, send User a confirmation email

            // Redirect to user dashboard
            res.status(200);
            
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
    res.send();
});




app.listen(PORT, ()=> {
    console.log(`Server started on port ${PORT}`);
});
