const database = require('./mongodb/database.js');
const caches = require('./caches/cache.js')
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

app.use(express.static(path.join(__dirname, '../','build')))

const urlencodedParser = bodyParser.urlencoded();

app.get('/', function (request, response) {
   response.sendFile(path.join(__dirname, '../', 'build', 'index.html'));
});

app.get('/login', function (request, response) {
    response.sendFile(path.join(__dirname, '../', 'build', 'login.html'));
});

app.get('/register', function (request, response) {
    response.sendFile(path.join(__dirname, '../', 'build', 'register-page.html'));
});

app.post('/login', urlencodedParser, function (request, response) {
    if(!request.body) return response.sendStatus(400);
    console.log(`Incoming player ${JSON.stringify(request.body)}`);
    let res = database.getPlayerData(request.body.userName, request.body.userPassword);
    console.log(res);
    //caches.playerWelcome(database.getPlayerData(request.body.userName, request.body.userPassword)._id);
    //response.send(caches.getConnectedPlayersTokens());
    response.send(`<p>${JSON.stringify({result: res})}</p>`);
});

app.post('/register', urlencodedParser, function (request, response) {
    if(!request.body) return response.sendStatus(400);
    let pid = database.addPlayer({name: request.body.userName, email: request.body.userEmail, password: request.body.userPassword } );
    response.send(pid);
});

app.get('/testreg', function (request, response) {
    let pid = database.addPlayer({ name: 'CoalmanHost', password: '123456', email: 'bakush2108@gmail.com'});
    response.send(`<h1>${pid}<h1>`);
});

app.listen(4000);