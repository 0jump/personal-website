// Server settings
const PORT = 80;

const express = require('express');

const app = express();

app.get('/', (req, res) => {
    console.log('req: home');
    res.send('Bism illah');
});

app.listen(PORT, ()=> {
    console.log(`Server started on port ${PORT}`);
});