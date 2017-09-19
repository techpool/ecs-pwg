const redis = require("redis");

const CONFIG = require('../config/main')[process.env.STAGE || 'local'];

const client = redis.createClient({
    host: CONFIG.REDIS_HOST,
    port: CONFIG.REDIS_PORT,
    db: CONFIG.REDIS_DB
});

const pubsub = redis.createClient({
    host: CONFIG.REDIS_HOST,
    port: CONFIG.REDIS_PORT,
    db: CONFIG.REDIS_DB
});

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

    keys: function(keyPattern, callback) {
        client.keys(keyPattern, callback);
    },
    
    sadd: function(setName, value, callback) {
        client.sadd(setName, value, callback);
    },

    scard: function(setName, callback) {
        client.scard(setName, callback);
    },

    srem: function(setName, value, callback) {
        client.srem(setName, value, callback);
    },

    smembers: function(setName, callback) {
        client.smembers(setName, callback);
    },

    pubsubConnection: pubsub
}
