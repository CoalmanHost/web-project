function initCache() {
    const redis = require('redis');
    const eventer = require('../app').eventer;
    const cfg = require('../config');
    let client    = redis.createClient({
        port      : 6379,
        host      : 'localhost',
    });
    module.exports.client = client;
    eventer.emit('activate module', 'Cache');
    return client;
}
module.exports.init = initCache;