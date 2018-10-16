const config = require('./lib/config');
const express = require('express');
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

// Home Route
app.get('/', (req, res) => {
    res.render('home');
});

// Timer Route
app.get('/timer', (req, res) => {
    res.render('timer');
});

app.listen(PORT, ()=> {
    console.log(`Server started on port ${PORT}`);
});