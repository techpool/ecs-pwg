const redis = require("redis");

const CONFIG = require('../config/main')[process.env.STAGE || 'local'];

const client = redis.createClient({
    host: CONFIG.REDIS_HOST,
    port: CONFIG.REDIS_PORT,
});

const pubsub = redis.createClient({
    host: CONFIG.REDIS_HOST,
    port: CONFIG.REDIS_PORT,
})

// client.config('get', 'notify-keyspace-events', function (err, conf) {
//     if (err) {
//         console.log(err);
//     }

//     // [ 'notify-keyspace-events', <value> ]
//     // We are only subscribing to Keyevent events and Expired events
//     // Refer to this: https://redis.io/topics/notifications
//     if (conf[1].indexOf(CONFIG.REDIS_NOTIFY_EVENTS) < 0) {
//         client.config('set', 'notify-keyspace-events', conf[1] + CONFIG.REDIS_NOTIFY_EVENTS, function (err) {
//             if (err) {
//                 console.log(err);
//             }
//         });
//     }
// });
client.set('abc', 1, function() {
    client.expire('abc', 1, function() {});
});

module.exports = {
    set: function (key, stringifiedData, callback) {
        client.set(key, stringifiedData, callback);
    },

    get: function (key, callback) {
        client.get(key, callback);
    },

    incr: function (key, callback) {
        client.incr(key, callback);
    },

    del: function (key, callback) {
        client.del(key, callback);
    },

    expire: function (key, expiryInSeconds, callback) {
        client.expire(key, expiryInSeconds, callback);
    },

    hset: function (hashmapName, key, value, callback) {
        client.hset(hashmapName, key, value, callback);
    },

    hmset: function (keyName, hashMap, callback) {
        client.hmset(keyName, hashMap, callback);
    },

    hget: function (hashmapName, key, callback) {
        client.hget(hashmapName, key, callback);
    },

    hgetall: function(hashmapName, callback) {
    	client.hgetall(hashmapName, callback);	
    },

    flushdb: function(callback) {
        client.flushdb(callback);
    },

    pubsubConnection: pubsub
}