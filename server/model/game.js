const cache = require('../caches/cache').client;
const eventer = require('../app').eventer;

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
    constructor(room) {
        this.room = room;
        this.id = room.replace('room', '');
        this.gameName = `game${this.id}`;
        this.playerIds = [];
        this.pidToSocketDict = {};
        const Board = require('../model/board/board').board;
        this.boardId = new Board(this.id, this.playerIds);
        this.ongoing = false;
        this.save();
    }
    getFullBoard(callback) {
        let board = this.board;
        let counter = 0;
        board.playerIds.forEach((pid) => {
            board.getSide(pid, (side) => {
                board.sides.push(side);
                counter += 1;
            })
        });
        while (counter != board.playerIds.length) {}
        callback(board);
    }
    addPlayer(playerId) {
        this.playerIds.push(playerId);
    }
    start() {
        this.ongoing = true;
        eventer.on('inner fight complete', (winnerId) => {
            this.board.getSide(winnerId, (side) => {
                if (side.wins >= 2) {
                    eventer.emit('game end', this.room, winnerId);
                    return;
                }
                eventer.emit('fight complete', this.room, winnerId);
            })

        })
        eventer.on('inner put card', (line, card) => {
            eventer.emit('board update', this);
        });
        eventer.on('board update', (board) => {
            this.save();
        })
        this.save();
    }
    json() {
        return JSON.stringify(this);
    }
    save(callback) {
        cache.set(`game${this.id}`, this.json(), (err, reply) => {
            callback();
        });
    }
    static getGame(id, callback) {
        cache.get(this.gameName, (err, reply) => {
            if (err) {
                console.log(err);
            }
            else callback(toObject(reply));
        });
    }
}

module.exports.game = Game;