class GenericCard {
    constructor(name, cost, damage) {
        this.name = name;
        this.cost = cost;
        this.damage = damage;
        this.played = false;
    }
    Play() {
        if (!this.played) {
            this.played = true;
        }
    }

}

module.exports = GenericCard;