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
    const cryptPassword = require('../logic/encrypting').cryptPassword;
    const utils = require('../utils');
    const auth = require('../logic/auth');

    function room(number) {
        return `room${number}`;
    }

    const pidToSocketDictName = 'pid-socket-table';
    const socketToPidDictName = 'socket-pid-table';


    function getPlayerId(socketId, callback) {
        cache.hget(socketToPidDictName, socketId, (err, reply) => {
            if (err) {
                console.log(err);
                return;
            }
            callback(reply);
        });
    }

    function getSocket(playerId, callback) {
        cache.hget(pidToSocketDictName, playerId, (err, reply) => {
            if (err) {
                console.log(err);
                return;
            }
            if (reply) {
                callback(io.sockets.sockets.get(reply));
            }
            else {
                callback(null);
            }
        });
    }

    function putPlayerToRoom(roomNumber, playerId, callback) {
        if (playerId) {
            getPlayersFromRoom(roomNumber, (pids) => {
                let isNew = true;
                pids.forEach((pid) => {
                    if (pid == playerId) {
                        isNew = false;
                    }
                });
                if (isNew === true) {
                    cache.rpush(room(roomNumber), playerId);
                    if (roomNumber != 0) {
                        console.log(`Put ${playerId} to room ${roomNumber}`);
                    }
                    cache.expire(room(roomNumber), cfg.cacheBurnTime);
                    if (callback) {
                        callback(0);
                    }
                }
                if (callback) {
                    callback(1);
                }
            });
        }
        else {
            if (callback) {
                callback(2);
            }
            cache.expire(room(roomNumber), cfg.cacheBurnTime);
        }
        cache.expire(socketToPidDictName, cfg.cacheBurnTime);
        cache.expire(pidToSocketDictName, cfg.cacheBurnTime);
    }

    function erasePlayerFromRoom(roomNumber, playerId, callback) {
        if (playerId) {
            cache.lrem(room(roomNumber), 0, playerId, (err, r) => {
                cache.expire(room(roomNumber), cfg.cacheBurnTime);
                cache.expire(socketToPidDictName, cfg.cacheBurnTime);
                cache.expire(pidToSocketDictName, cfg.cacheBurnTime);
                callback();
            });
        }
        else {
            cache.expire(socketToPidDictName, cfg.cacheBurnTime);
            cache.expire(pidToSocketDictName, cfg.cacheBurnTime);
            callback();
        }
    }

    // function putPlayerToRoom(roomNumber, socketId) {
    //     cache.hget(socketToPidDictName, socketId, (err, reply) => {
    //         if (err) {
    //             console.log(err);
    //             return;
    //         }
    //         if (reply) {
    //             getPlayersFromRoom(room(roomNumber), (pids) => {
    //                 let isNew = true;
    //                 pids.forEach((pid) => {
    //                     if (pid == reply) {
    //                         isNew = false;
    //                     }
    //                 });
    //                 if (isNew === true) {
    //                     cache.rpush(room(roomNumber), reply);
    //                     console.log(`Put ${reply} to room ${roomNumber}`);
    //                     cache.expire(room(roomNumber), cfg.cacheBurnTime);
    //                 }
    //             });
    //
    //         }
    //         cache.expire(socketToPidDictName, cfg.cacheBurnTime);
    //         cache.expire(pidToSocketDictName, cfg.cacheBurnTime);
    //     });
    // }
    //
    // function erasePlayerFromRoom(roomNumber, socketId, callback) {
    //     cache.hget(socketToPidDictName, socketId, (err, reply) => {
    //         if (err) {
    //             console.log(err);
    //             return;
    //         }
    //         if (reply) {
    //             cache.lrem(room(roomNumber), 0, reply, (err, r) => {
    //                 cache.expire(room(roomNumber), cfg.cacheBurnTime);
    //                 cache.expire(socketToPidDictName, cfg.cacheBurnTime);
    //                 cache.expire(pidToSocketDictName, cfg.cacheBurnTime);
    //                 callback();
    //             });
    //         }
    //         else {
    //             cache.expire(socketToPidDictName, cfg.cacheBurnTime);
    //             cache.expire(pidToSocketDictName, cfg.cacheBurnTime);
    //             callback();
    //         }
    //     });
    // }

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

    io.on('connection', (socket) => {
        //console.log(`Connection at socket ${socket.id}`);

        socket.on('disconnect', (reason) => {
            //console.log(`Socket ${socket.id} disconnected: ${reason}`);
            cache.hget(socketToPidDictName, socket.id, (err, pid) => {
                if (err) {
                    console.log(err);
                    return;
                }
                if (pid) {
                    cache.hdel(pidToSocketDictName, pid);
                }
            })
            cache.hdel(socketToPidDictName, socket.id);
        })

        socket.on('login', (user) => {
            database.getPlayerData({ name: user.name, password: cryptPassword(user.password) }, (err, result) => {
                if (result) {
                    let payload = {_id: result._id};
                    let jwt = require('jsonwebtoken');
                    let token = jwt.sign(payload, auth.secret);
                    console.log(`Throwing token ${token} to socket ${socket.id}`);
                    socket.emit('throw token', token);
                }
                else {
                    socket.emit('something wrong');
                }
            });

            // cache.keys('room*', (err, reply) => {
            //     reply.forEach((room) => {
            //         cache.del(room);
            //     });
            // })
            //
            // cache.keys('game*', (err, reply) => {
            //     reply.forEach((room) => {
            //         cache.del(room);
            //     });
            // })
            //
            // cache.keys('board*', (err, reply) => {
            //     reply.forEach((room) => {
            //         cache.del(room);
            //     });
            // })
        });

        socket.on('register', (user) => {
            database.addPlayer({ name: user.name, email: user.email, password: user.password }, function (err, pid) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log(`Registered new player ${user.name} with id ${pid}`);
                database.getPlayerData({ _id : pid }, (err, result) => {
                    let payload = { _id: result._id };
                    let jwt = require('jsonwebtoken');
                    let token = jwt.sign(payload, auth.secret);
                    console.log(`Throwing token ${token} to socket ${socket.id}`);
                    socket.emit('throw token', token);
                });
            });
        });

        socket.on('init user', (token, callback) => {
            //console.log(`Token is ${token}`);
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
                            // socket.join(room(0));
                            // putPlayerToRoom(0, id);
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
                                            console.log(`Hello player ${result._id} on new socket ${socket.id}`);
                                            socket.emit('user ready');
                                            // socket.join(room(0));
                                            // putPlayerToRoom(0, result._id);
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

            if (callback) {
                callback();
            }

            socket.on('get name', (pid, callback) => {
                database.getPlayerData({ _id: pid }, (err, result) => {
                    if (err) {
                        console.log(err);
                        socket.emit('something wrong');
                        return;
                    }
                    if (result) {
                        callback(result.name);
                    }
                    else {
                        callback(null);
                    }
                })
            });

            socket.on('create room', (callback) => {
                let newRoomNumber = Date.now();
                let newRoom = room(newRoomNumber);
                socket.join(newRoom);
                getPlayerId(socket.id, (pid) => {
                    if (pid) {
                        putPlayerToRoom(newRoomNumber, pid);
                        // socket.leave(room(0));
                        console.log(`Created room ${newRoomNumber}!`);
                        callback(newRoomNumber);
                    }
                    else {
                        callback(null);
                    }
                });
            });

            socket.on('join room', (roomNumber, callback) => {
                console.log(`Try to join room ${roomNumber}`);
                cache.exists(room(roomNumber), (err, reply) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    if (reply == 1) {
                        getPlayerId(socket.id, (pid) => {
                            socket.join(room(roomNumber));
                            putPlayerToRoom(roomNumber, pid, (r) => {
                                if (r === 1) {
                                    Game.getGame(roomNumber, (game) => {
                                        if (game && game.ongoing === true) {
                                            eventer.emit('board update', game);
                                        }
                                        else {
                                            // socket.leave(room(0));
                                            if (callback) {
                                                callback(roomNumber);
                                            }
                                        }
                                    });
                                }
                                if (r === 0) {
                                    // socket.leave(room(0));
                                    if (callback) {
                                        callback(roomNumber);
                                    }
                                }
                                getPlayersFromRoom(roomNumber, (pids) => {
                                    if (pids.length >= 2) {
                                        console.log(`Room ${roomNumber} is full`)
                                        // io.to(room(roomNumber)).emit('room full');
                                        pids.forEach((pid) => {
                                            getSocket(pid, (socket) => {
                                                socket.emit('room full', roomNumber);
                                            });
                                        });
                                    }
                                });
                            });
                        });
                    }
                    else socket.emit('missing room', roomNumber);
                });
            });

            socket.on('get rooms', (callback) => {
                console.log('Throwing rooms');
                cache.keys('room*', (err, reply) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    // utils.removeItemOnce(reply, 'room0');
                    callback(reply);
                });
            });

            socket.on('leave room', (roomNumber, callback) => {
                socket.leave(room(roomNumber));
                getPlayerId(socket.id, (pid) => {
                    erasePlayerFromRoom(roomNumber, pid, () => {
                        // socket.join(room(0));
                        // putPlayerToRoom(0, pid);
                        if (callback) {
                            callback();
                        }
                    });
                })
            });

            socket.on('ready room', (roomNumber, callback) => {
                console.log(`Ready room ${roomNumber}`);
                Game.getGame(roomNumber, (game) => {
                    if (game) {
                        if (callback) {
                            callback();
                        }
                        eventer.emit('board update', game);
                        return;
                    }
                    game = new Game(`room${roomNumber}`, () => {
                        getPlayersFromRoom(roomNumber, (players) => {
                            if (players) {
                                players.forEach((player, i) => {
                                    game.addPlayer(player, (side) => {
                                        for (let j = 0; j < 5; ++j) {
                                            side.putCardToHand(cardsDb.getCard('x-wing'));
                                            side.putCardToHand(cardsDb.getCard('tie-fighter'));
                                        }
                                        game.board.saveSide(side, () => {
                                            if (i >= players.length - 1) {
                                                game.start(() => {
                                                    console.log(`Starting game ${game.id}`);
                                                    if (callback) {
                                                        callback();
                                                    }
                                                    eventer.emit('board update', game)
                                                });
                                            }
                                        });
                                    });
                                });
                            }
                        })
                    });
                })
            })

            //Game

            socket.on('put card', (roomNumber, cardId, line) => {
                console.log(`Try to put card ${cardId} to ${line} in room ${roomNumber}`);
                Game.getGame(roomNumber, (game) => {
                    if (game) {
                        cache.hget(socketToPidDictName, socket.id, (err, pid) => {
                            if (err) {
                                console.log(err);
                                socket.emit('something wrong');
                                return;
                            }
                            if (pid) {
                                game.board.getSide(pid, (side) => {
                                    if (side.ready === false) {
                                        console.log(`Card ${cardId} put to ${side.playerId}'s side`);
                                        switch (line) {
                                            case 'first':
                                                side.putToFirstLine(cardsDb.getCard(cardId), () => {
                                                    game.board.saveSide(side, () => {
                                                        eventer.emit('board update', game);
                                                    });
                                                });
                                                break;
                                            case 'second':
                                                side.putToSecondLine(cardsDb.getCard(cardId),() => {
                                                    game.board.saveSide(side, () => {
                                                        eventer.emit('board update', game);
                                                    });
                                                });
                                                break;
                                            case 'third':
                                                side.putToThirdLine(cardsDb.getCard(cardId), () => {
                                                    game.board.saveSide(side, () => {
                                                        eventer.emit('board update', game);
                                                    });
                                                });
                                                break;
                                            default:
                                                socket.emit('something wrong');
                                                break;
                                        }
                                    }
                                    // game.board.saveSide(side, () => {
                                    //     eventer.emit('board update', game);
                                    // });
                                });
                            }
                        });
                    }
                })
            });

            socket.on('get card', (cardId, callback) => {
                //socket.emit('get card', cardsDb.getCard(cardId));
                callback(cardsDb.getCard(cardId));
            });

            socket.on('turn end', (roomNumber) => {
                console.log(`Try end of turn in room ${roomNumber}`);
                Game.getGame(roomNumber, (game) => {
                    cache.hget(socketToPidDictName, socket.id, (err, reply) => {
                        if (err) {
                            console.log(err);
                            socket.emit('something wrong');
                            return;
                        }
                        if (reply) {
                            game.board.getSide(reply, (side) => {
                                game.board.saveSide(side, () => {
                                    game.board.recalcTurns(() => {
                                        console.log(`End of turn of ${reply}`);
                                        eventer.emit('board update', game);
                                    });
                                });
                            });
                        }
                    });
                });
            });

            socket.on('fight ready', (roomNumber) => {
                Game.getGame(roomNumber, (game) => {
                    cache.hget(socketToPidDictName, socket.id, (err, reply) => {
                        if (err) {
                            console.log(err);
                            socket.emit('something wrong');
                            return;
                        }
                        if (reply) {
                            eventer.emit('fight ready', game, reply);
                        }
                    });
                });
            })
        })
    });

    eventer.on('fight ready', (game, pid) => {
        console.log(`Try ready player ${pid} to fight on board ${game.id}`);
        game.board.getSide(pid, (side) => {
            side.setReady();
            game.board.saveSide(side, () => {
                let isFighting = true;
                game.getFullBoard((board) => {
                    for (let pid in board.sides) {
                        console.log(`Is ${pid} ready?`);
                        let side = board.sides[pid];
                        if (side.ready === false) {
                            isFighting = false;
                        }
                    }
                    if (isFighting === true) {
                        console.log(`Fight between ${board.playerIds[0]} and ${board.playerIds[0]} on board ${game.id}`);
                        game.board.fight(board.playerIds[0], board.playerIds[1], (winnerId) => {
                            if (winnerId) {
                                game.board.getSide(winnerId, (side) => {
                                    if (side.wins >= 2) {
                                        eventer.emit('game end', game.room, winnerId);
                                        return;
                                    }
                                    game.board.recalcTurns(() => {
                                        eventer.emit('board update', game);
                                    })
                                })
                            }
                            else {
                                game.board.recalcTurns(() => {
                                    eventer.emit('board update', game);
                                })
                            }
                        });
                    }
                    else {
                        game.board.recalcTurns(() => {
                            console.log(`Player ${pid} ready to fight`);
                            eventer.emit('board update', game);
                        });
                    }
                });
            });
        });
    })

    eventer.on('board update', (game) => {
        console.log(`Updated board ${game.id}`);
        game.save(() => {
            game.getFullBoard((board) => {
                getPlayersFromRoom(game.id, (pids) => {
                    pids.forEach((pid) => {
                        cache.hget(pidToSocketDictName, pid, (err, reply) => {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            if (reply) {
                                io.sockets.sockets.get(reply).emit('board update', board, pid);
                            }
                        })
                    });
                });
                cache.expire(game.room, cfg.cacheBurnTime);
                cache.expire(game.gameName, cfg.cacheBurnTime);
                cache.expire(game.board.boardName, cfg.cacheBurnTime);
            })
        });
    });

    eventer.on('fight complete', (room, iter, winnerId) => {
        io.to(room).emit('fight complete', iter, winnerId);
    });

    eventer.on('game end', (room, winnerId) => {
        let roomNumber = `${room}`.replace('room', '');
        console.log(`Complete game in room ${roomNumber}. ${winnerId} has won`);
        getPlayersFromRoom(roomNumber, (pids) => {
            let otherPids = pids.slice();
            otherPids.forEach((pid, i) => {
                erasePlayerFromRoom(roomNumber, pid, () => {
                    getSocket(pid, (socket) => {
                        console.log(`Emitting end game to player ${pid}`);
                        socket.emit('game end', winnerId);
                    });
                });
            });
        });
    });
    eventer.emit('activate module', 'Game Manager');
}

module.exports.socketServer = socketServer;