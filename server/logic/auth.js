function initAuth() {
    const cache = require('../caches/cache');
    const database = require('../mongodb/database').DatabaseClient;
    const cookieParser = require('cookie-parser');
    const bodyParser = require('body-parser');
    const jwt = require('jsonwebtoken');
    const app = require('../app');
    const path = require('path');
    const cryptPassword = require('../logic/encrypting').cryptPassword;
    const urlencodedParser = bodyParser.urlencoded({extended: true});

    app.use(cookieParser('secret key'))
    let client = cache.client;
    let authUsers = 'authorized';
    client.del(authUsers);
    const tokenKey = '1a2b-3c4d-5e6f-7g8h';
    app.use((req, res, next) => {
        if (req.headers.authorization) {
            jwt.verify(
                req.headers.authorization.split(' ')[1],
                tokenKey,
                (err, payload) => {
                    if (err) next()
                    else if (payload) {
                        database.getPlayerData({ _id : payload.id }, (res) => {
                            if (res === undefined) console.log(`Have no pid ${payload.id}`);
                            else {
                                req.user = res;
                                next();
                            }

                        });
                        if (!req.user) next();
                    }
                }
            )
        }

        next();
    })

    app.get('/login', function (request, response) {
        let token = request.cookies.token;
        if (token === undefined) {
            response.sendFile(path.join(__dirname, '../../', 'build', 'login.html'));
        }
        else {
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
        }
    });
    app.post('/login', urlencodedParser, function (request, response) {
        if(!request.body) return response.sendStatus(400);
        console.log(`Incoming player ${JSON.stringify(request.body)}`);
        database.getPlayerData({ name: request.body.userName, password: cryptPassword(request.body.userPassword) }, function (result) {
            if (result === undefined) response.send('USER NOT FOUND');
            else {
                console.log(`Hello player ${JSON.stringify(result)}`);
                let token = request.cookies.token;
                if (token === undefined) {
                    token = jwt.sign(result, tokenKey);
                }
                client.hget(authUsers, token, (err, reply) => {
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
                });
            }
        });
    });
}
module.exports = initAuth;