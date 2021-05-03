async function initAuth() {
    const cache = require('../caches/cache');
    const database = require('../database/database').DatabaseClient;
    const cookieParser = require('cookie-parser');
    const bodyParser = require('body-parser');
    const jwt = require('jsonwebtoken');
    const app = require('../app').app;
    const eventer = require('../app').eventer;
    const path = require('path');
    const cryptPassword = require('../logic/encrypting').cryptPassword;
    const urlencodedParser = bodyParser.urlencoded({extended: true});

    function sendStartupPage(response) {
        response.sendFile(path.join(__dirname, '../../', 'build', 'login.html'));
    }

    function resolveJWT(token, callback) {
        jwt.verify(
            token,
            tokenKey,
            (err, payload) => {
                if (err) {
                    console.log(err);
                    return;
                }
                if (payload) {
                    callback(payload._id);
                }
                else callback(null);
            }
        )
    }

    app.use(cookieParser('secret key'))
    let client = cache.client;
    let authUsers = 'authorized';
    client.del(authUsers);
    const tokenKey = '1a2b-3c4d-5e6f-7g8h';
    app.use((req, res, next) => {
        if (req.cookies.token) {
            console.log('JWT auth check: STARTED');
            jwt.verify(
                //req.headers.authorization.split(' ')[1],
                req.cookies.token,
                tokenKey,
                (err, payload) => {
                    if (err) {
                        console.log(err);
                        res.sendStatus(500);
                        return;
                    }
                    if (payload) {
                        database.getPlayerData({ _id : payload._id }, (err, result) => {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            if (result === undefined || result === null) {
                                console.log(`Have no pid ${payload._id}! Returned ${JSON.stringify(result)}`);
                                return;
                            }
                            req.user = result;
                            console.log('JWT auth check: OK');
                            next();

                        });
                        if (!req.user) {
                            console.log('JWT auth check: FAILED');
                            res.sendStatus(400);
                            //sendStartupPage(res);
                        }
                    }
                }
            )
            return;
        }
        //console.log(`User not authorized! Request method: ${req.method}`);
        next();
    })

    app.get('/login', function (request, response) {
        if (request.user) {
            response.sendStatus(200);
        }
        else {
            console.log('Unknown user found!');
            sendStartupPage(response);
        }
            /*
            client.hget(authUsers, token, (err, reply) => {
                if (err) {
                    console.log(err);
                    response.sendStatus(500);
                }
                else {
                    if (reply === null) {
                        response.sendFile(path.join(__dirname, '../../', 'build', 'login.html'));
                    }
                    else {
                        let player = JSON.parse(reply);
                        database.getPlayerData(player, function (result) {
                            if (result === undefined) {
                                console.log('USER NOT FOUND');
                            }
                            else {
                                let player = reply;
                                console.log(`USER CONNECTED ${token} | ${player}`);
                                response.sendStatus(200);
                            }
                        });
                    }
                }
            });
            */
    });
    app.post('/login', urlencodedParser, function (request, response) {
        if(!request.body) {
            response.sendStatus(400);
            return;
        }
        console.log('Attempting user authentication!');
        database.getPlayerData({ name: request.body.userName, password: cryptPassword(request.body.userPassword) }, function (err, result) {
            if (err) {
                console.log(err);
                response.sendStatus(500);
                return;
            }
            if (result === undefined || result === null) response.send('USER NOT FOUND');
            else {
                console.log(`Hello player ${result._id}.`);
                let token = request.cookies.token;
                if (token === undefined) {
                    let payload = { _id: result._id };
                    token = jwt.sign(payload, tokenKey);
                    //response.json(token);
                    response.cookie('token', token, {
                        maxAge : 3600 * 24
                    })
                    response.sendStatus(200);
                }
                else response.sendStatus(200);
                /*client.hget(authUsers, token, (err, reply) => {
                    if (err)  {
                        console.log(err);
                        response.sendStatus(500);
                    }
                    else {
                        if (reply === null) {
                            response.cookie('token', token, {
                                maxAge : 3600 * 24
                            })
                            client.hset(authUsers, token, JSON.stringify(result), (err, reply) => {
                                if (err)  {
                                    console.log(err);
                                    response.sendStatus(500);
                                }
                                else response.sendStatus(200);
                            });
                        }
                        else {
                            response.redirect('/login');
                        }
                    }
                });*/
            }
        });
    });
    eventer.emit('activate module', 'Authentication');
    module.exports.resolveJWT = resolveJWT;
    module.exports.secret = tokenKey;
}
module.exports.initAuthentication = initAuth;