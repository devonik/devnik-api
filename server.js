'use strict';

const path = require("path");
const express = require('express');
const fs = require('fs').promises;
const dotenv = require('dotenv');
const { downloadFile, sendSlackLog } = require('./helper')
const basicAuth = require('./auth')

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.use(express.json())

//Init env variables
dotenv.config();

//Routes
app.get('/', (req, res) => {
  res.send('Hello World');
});

//---Storage api
app.get('/storage', basicAuth, (req, res) => {
  const fileName = req.query ? req.query.fileName || 'storage.json' : 'storage.json'
  fs.readFile('./storage/' + fileName).then(data => {
    res.json(JSON.parse(data))
  })
  
})
app.post('/storage', basicAuth, (req, res) => {
  const fileName = req.query ? req.query.fileName || 'storage.json' : 'storage.json'
  if (!req.body || Object.keys(req.body).length === 0) {
    res.send("Body was empty")
    return
  }
  fs.writeFile('./storage/' + fileName, JSON.stringify(req.body)).then(data => {
    res.send('Succesfully saved data to ' + fileName)
  })
  
})

app.post("/ai/image", basicAuth, async (req, res) => {
  const { prompt, filename } = req.body;
  if(!prompt || !filename) return res.status(400).send("Please specify a prompt and a filename")


  try {
    //Check if file alraedy exists
    let fileExists = false
    await fs.readFile(path.resolve("./storage", filename)).then(data =>{
      res.writeHead(200, {'Content-Type': 'image/jpeg'})
      res.end(data) // Send the file data to the browser.
      fileExists = true
      //Empty catch cause we wanna ignore the no file or directory error
    }).catch(() => {})
    if(fileExists) return;

    const response = await fetch('https://api.freepik.com/v1/ai/text-to-image/flux-dev', {
      method: 'POST',
      headers: {
        'x-freepik-api-key': process.env.FREEPICK_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt
      }),
    });
    await new Promise(resolve => setTimeout(resolve, 10000));
    const json = await response.json();
    
    const response2 = await fetch(`https://api.freepik.com/v1/ai/text-to-image/flux-dev/${json.data.task_id}`, {
       headers: {
        'x-freepik-api-key': process.env.FREEPICK_API_KEY,
        'Content-Type': 'application/json',
      },
    })

    const json2 = await response2.json()

    if(!json2.data.generated.length) return res.status(500).send('Could not fetch the image url');

    //Send slack logs
    sendSlackLog(`Freepick - AI image url fetched: ${json2.data.generated[0]}`)
    
    await downloadFile(json2.data.generated[0], filename)

    sendSlackLog(`Freepick - AI image downloaded. Download path: ${path.resolve("./storage", filename)}`)

    await fs.readFile(path.resolve("./storage", filename)).then(data =>{
      res.writeHead(200, {'Content-Type': 'image/jpeg'})
      res.end(data) // Send the file data to the browser.
    })

  } catch (err) {
    res.send(err.message);
  }
});



app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});