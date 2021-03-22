import GenericCard from '../GenericCard.js';

class GenericBaseCard extends GenericCard {
    constructor() {
        super();
    }
    GetDurability() {
        return 1;
    }
}