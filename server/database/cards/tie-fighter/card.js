class Card extends require('../genericCard') {
    name;
    value;
    constructor() {
        super();
        this.id = 'tie-fighter';
        this.name = 'TIE Fighter';
        this.typeLine = 'first';
        this.value = 2;
    }
    effect(board, masterPlayerId) {
        board.getSide(masterPlayerId, (side) => {
            for (let i = 0; i < side.firstLine.length; i++) {
                if (this.name === side.firstLine[i].name && this !== side.firstLine[i]) {
                    this.value += 1;
                    break;
                }
            }
            this.isEffectActive = true;
        })
    }
    attachEffect(board, masterPlayerId) {
        board.getEventer().on('inner put card', this.effect);
    }
    detachEffect(board) {
        board.getEventer().removeListener('inner put card', this.effect);
    }
}
module.exports = Card;