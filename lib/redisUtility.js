const redis = require('redis');

const
	STAGE = process.env.STAGE || 'local',
	CONFIG = require('./../config/main.js')[STAGE];

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

module.exports = {

	set: (key, value, callback) => {
		client.set(key, value, callback);
	},

	get: (key, callback) => {
		client.get(key, callback);
	},

	incr: (key, callback) => {
		client.incr(key, callback);
	},

	del: (key, callback) => {
		client.del(key, callback);
	},

	expire: (key, expiryInSeconds, callback) => {
		client.expire(key, expiryInSeconds, callback);
	},

	hset: (hashmapName, key, value, callback) => {
		client.hset(hashmapName, key, value, callback);
	},

	hmset: (keyName, hashMap, callback) => {
		client.hmset(keyName, hashMap, callback);
	},

	hget: (hashmapName, key, callback) => {
		client.hget(hashmapName, key, callback);
	},

	hgetall: (hashmapName, callback) => {
		client.hgetall(hashmapName, callback);
	},

	flushdb: (callback) => {
		client.flushdb(callback);
	},

	keys: (keyPattern, callback) => {
		client.keys(keyPattern, callback);
	},

	sadd: (setName, value, callback) => {
		client.sadd(setName, value, callback);
	},

	scard: (setName, callback) => {
		client.scard(setName, callback);
	},

	srem: (setName, value, callback) => {
		client.srem(setName, value, callback);
	},

	smembers: (setName, callback) => {
		client.smembers(setName, callback);
	},

	pubsubConnection: pubsub

};
