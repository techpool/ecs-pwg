const redis = require("redis");

const CONFIG = require('../config/main')[process.env.STAGE || 'local'];

const client = redis.createClient({
	host: CONFIG.REDIS_HOST,
    port: CONFIG.REDIS_PORT,
});

module.exports = {
	insertDataInRedis: function(key, stringifiedData, callback) {
		client.set(key, stringifiedData, callback);
	},

	fetchDataFromRedis: function(key, callback) {
		client.get(key, callback);
	},

	increamentKeyValue: function(key, callback) {
		client.incr(key, callback);
	},

	deleteDataInRedis: function(key, callback) {
		client.del(key, callback);
	},

	redisConnection: client
}