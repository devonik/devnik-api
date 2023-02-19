'use strict';

const express = require('express');
const fs = require('fs');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.use(express.json())

//Routes
app.get('/', (req, res) => {
  res.send('Hello World');
});

//---Storage api
app.get('/storage', (req, res) => {
    const fileName = req.query ? req.query.fileName || 'storage.json' : 'storage.json' 
    const data = fs.readFileSync('./storage/' + fileName);
    res.json(JSON.parse(data))
})
app.post('/storage', (req, res) => {
    const fileName = req.query ? req.query.fileName || 'storage.json' : 'storage.json' 
    console.log("req.body",req.body)
    if(!req.body || Object.keys(req.body).length === 0) {
        res.send("Body was empty")
        return
    }
    fs.writeFileSync('./storage/' + fileName, JSON.stringify(req.body));
    res.send('Succesfully saved data to ' + fileName)
})




app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});