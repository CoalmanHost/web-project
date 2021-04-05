function initCache() {
    const redis = require('redis');
    let client    = redis.createClient({
        port      : 6379,
        host      : 'localhost',
    });
    module.exports.client = client;
    return client;
}
module.exports.init = initCache;