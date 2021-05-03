function initBoard(number) {
    const cache = require('../../caches/cache').client;
    const eventer = require('../../app').eventer;
    let board = `board${number}`;
    cache.hset(board, );
}

const cache = require('../../caches/cache').client;
const eventer = require('../../app').eventer;

function toObject(json) {
    return JSON.parse(json);
}

class BoardLine {
    cards;
    constructor() {
        this.cards = [];
    }
    putCard(card) {
        this.cards.push(card);
    }
    getCards() {
        return this.cards;
    }
    json() {
        return JSON.stringify(this);
    }
}

class BoardSide {
    playerId;
    handCards;
    firstLine;
    secondLine;
    thirdLine;
    attackPower;
    ready;
    wins;

    constructor(playerId) {
        this.playerId = playerId;
        this.firstLine = new BoardLine();
        this.secondLine = new BoardLine();
        this.thirdLine = new BoardLine();
        this.wins = 0;
        this.ready = false;
    }

    getAllCardsOnSide() {
        return this.firstLine.concat(this.secondLine).concat(this.thirdLine);
    }

    putCard(card) {
        this.handCards.remove(card);
        this.attackPower += card.attackPower;
        card.attachEffect()
        this.effects(() => {
            eventer.emit('effects applied', );
        });
    }



    putToFirstLine(card) {
        this.firstLine.push(card);
        this.putCard(card);
        eventer.emit('inner put card', 'first', card);
    }

    putToSecondLine(card) {
        this.secondLine.push(card);
        this.putCard(card);
        eventer.emit('inner put card', 'second', card);
    }

    putToThirdLine(card) {
        this.thirdLine.push(card);
        this.putCard(card);
        eventer.emit('inner put card', 'third', card);
    }

    setReady() {
        this.ready = true;
    }

    clear() {
        this.firstLine = new BoardLine();
        this.secondLine = new BoardLine();
        this.thirdLine = new BoardLine();
    }

    json() {
        return JSON.stringify(this);
    }
}

class Board {
    id;
    playerIds;
    boardName;
    constructor(number, playerIds) {
        this.id = number;
        this.boardName = `board${number}`;
        this.playerIds = playerIds;
    }
    addPlayer(playerId) {
        let playerSide = new BoardSide(playerId);
        this.playerIds.push(playerId);
        cache.hset(this.boardName, playerId, playerSide.json());
    }
    getPlayerSide(playerId) {
        return toObject(this.cache.hget(this.boardName, playerId));
    }

    getSide(playerId, callback) {
        cache.hget(this.boardName, playerId, (err, reply) => {
            if (err) {
                console.log(err);
            }
            else callback(toObject(reply));
        });
    }

    saveSide(side, callback) {
        cache.hset(this.boardName, side.playerId, side.json(), (err, reply) => {
            if (err) {
                console.log(err);
                callback(false);
                return;
            }
            callback(true);
        });
    }
    fight(leftId, rightId) {
        this.getSide(leftId, (leftSide) => {
           this.getSide(rightId, (rightSide) => {
               leftSide.ready = false;
               rightSide.ready = false;
               let value = leftSide.attackPower - rightSide.attackPower;
               let winnerId = leftId;
               if (value === 0) {
                   this.saveSide(leftSide, (err, reply) => {
                       this.saveSide(rightSide, (err, reply))
                       eventer.emit('inner fight complete', null);
                   });
                   return;
               }
               if (value < 0) {
                   winnerId = rightId;
               }
               this.getSide(winnerId, (side) => {
                   side.wins += 1;
                   this.saveSide(leftSide, (err, reply) => {
                       this.saveSide(rightSide, (err, reply))
                           eventer.emit('inner fight complete', winnerId);
                   });
               });
           });
        });
    }
    getEventer() {
        return eventer;
    }
    // effects(callback) {
    //     this.playerIds.forEach((pid) => {
    //        this.getSide(pid, (side) => {
    //            let allCardsCount = side.getAllCardsOnSide().length;
    //            let counter = 0;
    //            side.getAllCardsOnSide().forEach((card) => {
    //                if (card.effect && card.isEffectActive === false) {
    //                    card.effect(side, side.playerId, () => {
    //                        counter += 1;
    //                        if (counter >= allCardsCount) {
    //                            eventer.emit('board update');
    //                            callback();
    //                        }
    //                    });
    //                }
    //            })
    //        })
    //     });
    // }
}

module.exports.board = Board;