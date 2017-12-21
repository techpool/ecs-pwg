const
	stageConfig = require('./../../config/stage');

const
	bluebird = require('bluebird'),
	redis = require('redis');

const pubsub = redis.createClient({
	host: stageConfig.REDIS.HOST,
	port: stageConfig.REDIS.PORT,
	db: stageConfig.REDIS.DB
});

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const client = redis.createClient({
	host: stageConfig.REDIS.HOST,
	port: stageConfig.REDIS.PORT,
	db: stageConfig.REDIS.DB
});

module.exports = {client, pubsub};
