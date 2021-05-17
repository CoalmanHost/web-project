function initBoard(number) {
    const cache = require('../../caches/cache').client;
    const eventer = require('../../app').eventer;
    let board = `board${number}`;
    cache.hset(board, );
}

function removeCard(arr, cardId) {
    let index = -1;
    arr.forEach((card, i) => {
        if (index === -1) {
            if (card.id === cardId) {
                index = i;
                arr.splice(i, 1);
            }
        }
    });
}

const cache = require('../../caches/cache').client;
const eventer = require('../../app').eventer;
const utils = require('../../utils');

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
        this.firstLine = [];
        this.secondLine = [];
        this.thirdLine = [];
        this.attackPower = 0;
        this.handCards = [];
        this.wins = 0;
        this.ready = false;
    }

    getAllCardsOnSide() {
        return this.firstLine.concat(this.secondLine).concat(this.thirdLine);
    }

    putCardToHand(card) {
        this.handCards.push(card);
    }

    putCard(card, callback) {
        Object.setPrototypeOf(this.handCards, Array.prototype);
        removeCard(this.handCards, card.id);
        this.attackPower += card.value;
        callback();
        // card.attachEffect()
        // this.effects(() => {
        //     eventer.emit('effects applied', );
        // });
    }



    putToFirstLine(card, callback) {
        Object.setPrototypeOf(this.firstLine, Array.prototype);
        this.firstLine.push(card);
        this.putCard(card, callback);
        //eventer.emit('inner put card', this, 'first', card);
    }

    putToSecondLine(card, callback) {
        Object.setPrototypeOf(this.secondLine, Array.prototype);
        this.secondLine.push(card);
        this.putCard(card, callback);
        //eventer.emit('inner put card', this, 'second', card);
    }

    putToThirdLine(card, callback) {
        Object.setPrototypeOf(this.thirdLine, Array.prototype);
        this.thirdLine.push(card);
        this.putCard(card, callback);
        //eventer.emit('inner put card', this, 'third', card);
    }

    setReady() {
        this.ready = true;
    }

    clear() {
        this.firstLine = [];
        this.secondLine = [];
        this.thirdLine = [];
    }

    json() {
        return JSON.stringify(this);
    }
}

class Board {
    id;
    playerIds;
    playersTurn;
    turnNumber;
    boardName;
    constructor(number, playerIds) {
        this.id = number;
        this.boardName = `board${number}`;
        this.playerIds = playerIds;
        this.playersTurn = {};
        this.turnNumber = 0;
    }

    addPlayer(playerId, callback) {
        let playerSide = new BoardSide(playerId);
        this.playerIds.push(playerId);
        cache.hset(this.boardName, playerId, playerSide.json(), (err, reply) => {
            this.getSide(playerId, (side) => {
                callback(side);
            });
        });
    }

    recalcTurns(callback) {
        console.log('Turns recalc!');
        this.playerIds.forEach((pid, i) => {
            this.getSide(pid, (side) => {
                if (side.ready === true && this.turnNumber === i) {
                    this.turnNumber += 1;
                }
                console.log(`Turn calc for ${pid} index ${i} turn number ${this.turnNumber}`);
                this.playersTurn[pid] = i === this.turnNumber;
                if (i >= this.playerIds.length - 1) {
                    this.turnNumber += 1;
                    if (this.turnNumber >= this.playerIds.length) {
                        this.turnNumber = 0;
                    }
                    callback();
                }
            })
        });
    }

    getSide(playerId, callback) {
        cache.hget(this.boardName, playerId, (err, reply) => {
            if (err) {
                console.log(err);
            }
            else {
                let side = toObject(reply);
                Object.setPrototypeOf(side, BoardSide.prototype);
                callback(side);
            }
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

    save(callback) {
        eventer.on('inner side save', (i, all) => {
            if (i >= all) {
                callback();
            }
        })
        this.playerIds.forEach()
    }

    fight(leftId, rightId, callback) {
        this.getSide(leftId, (leftSide) => {
           this.getSide(rightId, (rightSide) => {
               let value = leftSide.attackPower - rightSide.attackPower;
               let winnerId = leftId;
               let winnerSide = leftSide;
               leftSide.ready = false;
               rightSide.ready = false;
               leftSide.attackPower = 0;
               rightSide.attackPower = 0;
               leftSide.clear();
               rightSide.clear();
               if (value === 0) {
                   this.saveSide(leftSide, () => {
                       this.saveSide(rightSide, () => {
                           callback(null);
                       });
                   });
                   return;
               }
               if (value < 0) {
                   winnerId = rightId;
                   winnerSide = rightSide;
               }
               winnerSide.wins += 1;
               this.saveSide(winnerSide, () => {
                   this.saveSide(leftSide, () => {
                       this.saveSide(rightSide, () => {
                           callback(winnerId);
                       });
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