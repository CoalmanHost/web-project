const cache = require('../caches/cache').client;
const eventer = require('../app').eventer;
const Board = require('./board/board').board;

function toObject(json) {
    return JSON.parse(json);
}

class Game {
    id;
    gameName;
    room;
    playerIds;
    board;
    ongoing;
    constructor(room, readyCallback) {
        this.room = room;
        this.id = `${room}`.replace('room', '');
        this.gameName = `game${this.id}`;
        this.playerIds = [];
        this.pidToSocketDict = {};
        const Board = require('../model/board/board').board;
        this.board = new Board(this.id, []);
        this.ongoing = false;
        this.save(readyCallback);
    }
    getFullBoard(callback) {
        let board = JSON.parse(JSON.stringify(this.board));
        Object.setPrototypeOf(board, Board.prototype);
        board.sides = {};
        board.playerIds.forEach((pid, i) => {
            board.getSide(pid, (side) => {
                board.sides[pid] = side;
                if (i >= board.playerIds.length - 1) {
                    callback(board);
                }
            })
        });
    }
    addPlayer(playerId, callback) {
        this.playerIds.push(playerId);
        this.board.addPlayer(playerId, callback);
    }
    start(callback) {
        this.ongoing = true;
        // eventer.on('inner fight complete', (winnerId) => {
        //     this.board.getSide(winnerId, (side) => {
        //         if (side.wins >= 2) {
        //             eventer.emit('game end', this.room, winnerId);
        //             return;
        //         }
        //         eventer.emit('board update', this);
        //     })
        //
        // })
        // eventer.on('inner put card', (side, line, card) => {
        //     let board = this.board;
        //     board.saveSide(side, () => {
        //         eventer.emit('board update', this);
        //     });
        // });
        this.board.recalcTurns(() => {
            this.save(callback);
        });
    }
    json() {
        return JSON.stringify(this);
    }
    save(callback) {
        cache.set(`game${this.id}`, this.json(), (err, reply) => {
            if (callback) {
                callback();
            }
        });
    }
    static getGame(id, callback) {
        cache.get(`game${id}`, (err, reply) => {
            if (err) {
                console.log(err);
            }
            else {
                if (reply) {
                    let game = toObject(reply);
                    Object.setPrototypeOf(game, Game.prototype);
                    Object.setPrototypeOf(game.board, Board.prototype);
                    callback(game);
                    return;
                }
                callback(reply);
            }
        });
    }
}

module.exports.game = Game;