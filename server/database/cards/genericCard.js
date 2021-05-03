class GenericCard {
    id;
    name;
    value;
    typeLine;
    isEffectActive;
    constructor() {
        this.id = '-';
        this.name = 'Generic';
        this.value = 0;
        this.isEffectActive = false;
    }
    json() {
        return JSON.stringify(this);
    }
}
module.exports = GenericCard;