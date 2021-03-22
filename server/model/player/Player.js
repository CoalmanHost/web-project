class Player {
    constructor(id) {
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
}