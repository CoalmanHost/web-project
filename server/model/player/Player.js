class Player {
    id;
    handCards;
    constructor(id) {
        this.id = id;
        this.handCards = [];
    }
    AddTrade(amount) {
        this.trade += amount;
    }
    TakeTrade(amount) {
        this.trade -= amount;
    }
    AddCombat(amount) {
        this.combat += amount;
    }
    TakeCombat(amount) {
        this.combat -= amount;
    }
    Heal(amount) {
        this.authority += amount;
    }
    Damage(amount) {
        this.authority -= amount;
    }
    AddCard(card) {
        this.handCards.push(card);
    }
    PlayCard(card) {
        this.handCards.remove(card);
        card.Play();
    }
}