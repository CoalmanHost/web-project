const database = require('./database/database.js').DatabaseClient;
const caches = require('./caches/cache.js')
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const rm = require('./logic/gamemanager.js');
const cache = require('./caches/cache');
const auth = require('./logic/auth');
const port = require('./config').port;
const events = require('events');

class AppEventer extends events {}

const eventer = new AppEventer();

const app = express();

app.use(express.static(path.join(__dirname, '../','build')))

const urlencodedParser = bodyParser.urlencoded({extended: true});

Array.prototype.remove = function() {
    let what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

app.get('/', function (request, response) {
   response.sendFile(path.join(__dirname, '../', 'build', 'index.html'));
});

app.get('/register', function (request, response) {
    response.sendFile(path.join(__dirname, '../', 'build', 'register-page.html'));
});

app.post('/register', urlencodedParser, function (request, response) {
    if(!request.body) return response.sendStatus(400);
    console.log(`Registering new player with name ${request.body.userName}`);
    let pid = database.addPlayer({name: request.body.userName, email: request.body.userEmail, password: request.body.userPassword }, function (err, pid) {
        if (err) {
            console.log(err);
            response.sendStatus(500);
        }
        else {
            console.log(`Successfully registered player ${request.body.userName} with id ${pid}`);
            response.send(`Your id is ${pid}`);
        }
    });
});

app.get('/testreg', function (request, response) {
    let pid = database.addPlayer({ name: 'CoalmanHost', password: '123456', email: 'bakush2108@gmail.com'});
    response.send(`<h1>${pid}<h1>`);
});

let activeModulesCount = 0;
let modulesCount = 3;

eventer.on('activate module', (moduleName) => {
    console.log(`${moduleName} initialized.`);
    activeModulesCount++;
    if (activeModulesCount >= modulesCount)
        console.log('Whole ready!');
});

module.exports.eventer = eventer;
module.exports.app = app;
cache.init();
auth.initAuthentication();
var server = app.listen(port);
const io = require('socket.io')(server, {
    origin: "http://webproject.host1712.keenetic.link/",
    methods: ["GET", "POST"],
    credentials: true
});
rm.socketServer(io);

// cache.client.keys('room*', (err, reply) => {
//     reply.forEach((room) => {
//        cache.client.del(room);
//     });
// })