function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}

var pinstances = [];

class Caches {
    static playerWelcome(pid) {
        let token = getRandomInt(Number.MIN_VALUE, Number.MAX_VALUE);
        let pass = false;
        while (!pass) {
            this.pinstances.forEach(pair => pass = pass && pair.token != token);
            token = getRandomInt(Number.MIN_VALUE, Number.MAX_VALUE);
        }
        pinstances.push({token: token, pid: pid})
        return token;
    }
    static getConnectedPlayersTokens() {
        return pinstances;
    }
}

module.exports = Caches;