// Server settings
const PORT = 80;

const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(PORT, ()=> {
    console.log(`Server started on port ${PORT}`);
});