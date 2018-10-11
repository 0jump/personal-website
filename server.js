// Server settings
const PORT = 80;

const express = require('express');
const path = require('path');

const app = express();

// Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('home');
});



app.listen(PORT, ()=> {
    console.log(`Server started on port ${PORT}`);
});