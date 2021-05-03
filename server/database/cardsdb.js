function getCard(cardId) {
    const Card = require(`./cards/${cardId}/card`);
    return new Card();
}
module.exports.getCard = getCard;