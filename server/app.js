const database = require('./mongodb/database.js').DatabaseClient;
const caches = require('./caches/cache.js')
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const rm = require('./logic/roommanager.js');
const cache = require('./caches/cache');
const auth = require('./logic/auth');
const port = require('./config').port;

const app = express();

app.use(express.static(path.join(__dirname, '../','build')))

const urlencodedParser = bodyParser.urlencoded({extended: true});

app.get('/', function (request, response) {
   response.sendFile(path.join(__dirname, '../', 'build', 'index.html'));
});

app.get('/register', function (request, response) {
    response.sendFile(path.join(__dirname, '../', 'build', 'register-page.html'));
});

app.post('/register', urlencodedParser, function (request, response) {
    if(!request.body) return response.sendStatus(400);
    console.log(`Registering new player with name ${request.body.userName}`);
    let pid = database.addPlayer({name: request.body.userName, email: request.body.userEmail, password: request.body.userPassword }, function (pid) {
        console.log(`Successfully registered player ${request.body.userName} with id ${pid}`);
        response.send(`Your id is ${pid}`);
    });
});

app.get('/testreg', function (request, response) {
    let pid = database.addPlayer({ name: 'CoalmanHost', password: '123456', email: 'bakush2108@gmail.com'});
    response.send(`<h1>${pid}<h1>`);
});

module.exports = app;
cache.init();
auth();
var server = app.listen(port);
const io = require('socket.io')(server);
rm.socketServer(io);