const crypto = require('crypto');

function cryptPassword(password) {
    return crypto.createHash('md5').update(password).digest('hex');
}

module.exports.cryptPassword = cryptPassword;