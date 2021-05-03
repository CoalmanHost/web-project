async function socketServer(io) {
    //const redisAdapter = require('socket.io-redis');
    //io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));
    const eventer = require('../app').eventer;
    const cache = require('../caches/cache').client;
    const cfg = require('../config');
    const database = require('../database/database').DatabaseClient;
    const cardsDb = require('../database/cardsdb');
    const Game = require('../model/game').game;
    const socketsJwt = require('socketio-jwt');
    const auth = require('../logic/auth');

    function room(number) {
        return `room${number}`;
    }

    const pidToSocketDictName = 'pid-socket-table';
    const socketToPidDictName = 'socket-pid-table'

    io.on('connection', (socket) => {
        console.log( 'A user connected' );

        function putPlayerToRoom(roomNumber, socketId) {
            cache.hget(socketToPidDictName, socketId, (err, reply) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log(`Put ${reply} to socket ${socketId}`);
                if (reply) {
                    cache.rpush(room(roomNumber), reply);
                    cache.expire(room(roomNumber), cfg.cacheBurnTime);
                }
                cache.expire(socketToPidDictName, cfg.cacheBurnTime);
                cache.expire(pidToSocketDictName, cfg.cacheBurnTime);
            });
        }

        function erasePlayerFromRoom(roomNumber, socketId) {
            cache.hget(socketToPidDictName, socketId, (err, reply) => {
                if (err) {
                    console.log(err);
                    return;
                }
                if (reply) {
                    cache.lrem(room(roomNumber), 0, reply);
                    cache.expire(room(roomNumber), cfg.cacheBurnTime);
                }
                cache.expire(socketToPidDictName, cfg.cacheBurnTime);
                cache.expire(pidToSocketDictName, cfg.cacheBurnTime);
            });
        }

        function getPlayersFromRoom(roomNumber, callback) {
            cache.lrange(room(roomNumber), 0, 5, (err, reply) => {
                if (err) {
                    console.log(err);
                    return;
                }
                cache.expire(room(roomNumber), cfg.cacheBurnTime);
                callback(reply);
            })
        }

        database.getPlayerData({ name: 'Sith' }, (err, result) => {
            let payload = {_id: result._id};
            let jwt = require('jsonwebtoken');
            let token = jwt.sign(payload, auth.secret);
            socket.emit('throw token', token);
        });

        socket.on('init user', (token) => {
            console.log(`Token is ${token}`);
            auth.resolveJWT(token, (id) => {
                if (id === null) {
                    console.log('Unauthorized event!');
                    socket.emit('unauthorized event');
                    socket.disconnect(true);
                }
                else {
                    cache.hget(pidToSocketDictName, id, (err, reply) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        if (reply && socket.id === reply) {
                            console.log(`Hello player ${id} on socket ${reply}`);
                            socket.emit('user ready');
                            socket.join(room(0));
                            putPlayerToRoom(0, socket.id);
                        }
                        else {
                            if (reply && socket.id !== reply) {
                                cache.hdel(pidToSocketDictName, id);
                            }
                            database.getPlayerData({ _id : id }, (err, result) => {
                                if (err) {
                                    console.log(err);
                                    return;
                                }
                                if (result) {
                                    result._id = `${result._id}`;
                                    cache.hset(socketToPidDictName, socket.id, result._id, (err, reply) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        cache.hset(pidToSocketDictName, result._id, socket.id, (err, reply) => {
                                            if (err) {
                                                console.log(err);
                                            }
                                            console.log(`Hello player ${result._id} on socket ${socket.id}`);
                                            socket.emit('user ready');
                                            socket.join(room(0));
                                            putPlayerToRoom(0, socket.id);
                                        });
                                    });
                                }
                                else {
                                    console.log('Unauthorized event!');
                                    socket.emit('unauthorized event');
                                    socket.disconnect(true);
                                }
                            });
                        }
                    });
                }
            })
        })

        //Rooms

        socket.on('create room', (callback) => {
            let newRoomNumber = Date.now();
            let newRoom = room(newRoomNumber);
            socket.join(newRoom);
            putPlayerToRoom(newRoomNumber, socket.id);
            socket.leave(room(0));
            console.log(`Created room ${newRoomNumber}!`);
            callback(newRoomNumber);
        });

        socket.on('join room', (roomNumber, callback) => {
            cache.exists(room(roomNumber), (err, reply) => {
                if (err) {
                    console.log(err);
                    return;
                }
                if (reply == 1) {
                    socket.join(room(roomNumber));
                    putPlayerToRoom(roomNumber, socket.id);
                    socket.leave(room(0));
                    callback(roomNumber);
                }
                else socket.emit('missing room', roomNumber);
            });
        });

        socket.on('get rooms', (callback) => {
            cache.keys('room*', (err, reply) => {
                if (err) {
                    console.log(err);
                    return;
                }
                callback(reply);
            });
        });

        socket.on('leave room', (roomNumber, callback) => {
            socket.leave(room(roomNumber));
            erasePlayerFromRoom(roomNumber, socket.id);
            socket.join(room(0));
            callback(0);
        });

        socket.on('ready room', (roomNumber) => {
            let game = new Game(roomNumber);
            getPlayersFromRoom(roomNumber, (players) => {
                if (players) {
                    players.forEach((player) => {
                        game.addPlayer(player);
                    });
                    game.start();
                    io.to(game.room).emit('board update', game.board);
                }
            })
        })

        //Game

        socket.on('put card', (cardId, line) => {
            socket.rooms.forEach((room) => {
                if (room !== room(0)) {
                    Game.getGame(room.replace('room', ''), (game) => {
                        if (game) {
                            cache.hget(socketToPidDictName, socket.id, (err, pid) => {
                                if (err) {
                                    console.log(err);
                                    socket.emit('something wrong');
                                    return;
                                }
                                if (pid) {
                                    game.getBoard().getSide(pid, (side) => {
                                        if (side.ready === false) {
                                            switch (line) {
                                                case 'first':
                                                    side.putToFirstLine(cardsDb.getCard(cardId));
                                                    break;
                                                case 'second':
                                                    side.putToSecondLine(cardsDb.getCard(cardId));
                                                    break;
                                                case 'third':
                                                    side.putToThirdLine(cardsDb.getCard(cardId));
                                                    break;
                                                default:
                                                    socket.emit('something wrong');
                                                    break;
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    })
                }
            });
        });

        socket.on('get card', (cardId, callback) => {
            //socket.emit('get card', cardsDb.getCard(cardId));
            callback(cardsDb.getCard(cardId));
        });

        socket.on('turn ready', (roomNumber) => {
            Game.getGame(roomNumber, (game) => {
                cache.hget(socketToPidDictName, socket.id, (err, reply) => {
                    if (err) {
                        console.log(err);
                        socket.emit('something wrong');
                        return;
                    }
                    if (reply) {
                        game.board.getSide(reply, (side) => {
                            side.setReady();
                            game.board.saveSide(reply, () => {
                                game.save(() => {
                                    eventer.emit('board update', game);
                                });
                            });
                        });
                    }
                });
            });
        })

        eventer.on('board update', (game) => {
            game.getFullBoard((board) => {
                io.to(game.room).emit('board update', board);
                cache.expire(game.room, cfg.cacheBurnTime);
                cache.expire(game.gameName, cfg.cacheBurnTime);
                cache.expire(game.board.boardName, cfg.cacheBurnTime);
            })
        });

        eventer.on('fight complete', (room, iter, winnerId) => {
            io.to(room).emit('fight complete', iter, winnerId);
        });

        eventer.on('game end', (room, winnerId) => {
            io.to(room).emit('game end', winnerId);
        });
    });

    eventer.emit('activate module', 'Game Manager');
}

module.exports.socketServer = socketServer;