const config = require('./lib/config');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dbservices = require('./lib/dbservices');

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
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

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
    
});

app.listen(PORT, ()=> {
    console.log(`Server started on port ${PORT}`);
});