
class Card extends require('../genericCard') {
    name;
    value;
    constructor() {
        super();
        this.id = 'x-wing';
        this.name = 'X-Wing';
        this.typeLine = 'first';
        this.value = 2;
    }
}
module.exports = Card;