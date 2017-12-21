const
	_           = require('lodash'),
	co          = require('co');

const
	redis = require('./../util/common/redis')['client'];

const
	_getKey = (accessToken, host) => `key|${accessToken}|${host}`,
	_getShadowKey = (accessToken, host) => `shadow|${accessToken}|${host}`,
	_getBucketKey = (bucketId, host) => `bucket|${bucketId}|${host}`,
	_getBucketValue = (accessToken, host) => `${accessToken}|${host}`;


const DataAccessor = function() {};

DataAccessor.prototype.createOrUpdate = (accessToken, host, ttlInDays, bucketId) =>
	co(function * () {

		// Data
		const data = {
			accessToken: accessToken,
			host: host,
			bucketId: bucketId,
			dateToExpire: Date.now() + ttlInDays*24*60*60*1000
		};

		// Setting original key
		yield redis.setAsync(_getKey(accessToken, host), JSON.stringify(data)).catch(() => console.error(`ERROR :: REDIS_SET_FAIL :: ${_getKey(accessToken, host)} :: ${JSON.stringify(data)}`));

		// Setting shadow key
		yield redis.setexAsync(_getShadowKey(accessToken, host), ttlInDays*24*60*60, JSON.stringify(data)).catch(() => console.error(`ERROR :: REDIS_SETEX_FAIL :: ${_getShadowKey(accessToken, host)} :: ${JSON.stringify(data)}`));

		// Setting Bucket Pool
		yield redis.saddAsync(_getBucketKey(bucketId, host), _getBucketValue(accessToken, host)).catch(() => console.error(`ERROR :: REDIS_SADD_FAIL :: ${_getBucketKey(bucketId, host)} :: ${_getBucketValue(accessToken, host)}`));

    });

DataAccessor.prototype.get = (accessToken, host) =>
	co(function * () {
		return yield redis
			.getAsync(_getKey(accessToken, host))
			.then((data) => data ? JSON.parse(data) : null)
			.catch(() => {
				console.error(`ERROR :: REDIS_GET_FAIL :: ${_getKey(accessToken, host)}`);
				return null;
			})
		;
	});

DataAccessor.prototype.delete = (accessToken, host, bucketId) =>
	co(function * () {

		// Deleting original key
		yield redis.delAsync(_getKey(accessToken, host)).catch(() => console.error(`ERROR :: REDIS_DEL_FAIL :: ${_getKey(accessToken, host)}`));

		// Deleting shadow key
		yield redis.delAsync(_getShadowKey(accessToken, host)).catch(() => console.error(`ERROR :: REDIS_DEL_FAIL :: ${_getShadowKey(accessToken, host)}`));

		// Removing accessToken from Bucket Pool
		yield redis.sremAsync(_getBucketKey(bucketId, host), _getBucketValue(accessToken, host)).catch(() => console.error(`ERROR :: REDIS_SREM_FAIL :: ${_getBucketKey(bucketId, host)} :: ${_getBucketValue(accessToken, host)}`));

	});

DataAccessor.prototype.getBucketStats = (host, totalBuckets) =>
	co(function * () {
		let promiseArray = [];
		for (let bucketId = 0; bucketId < totalBuckets; bucketId++) promiseArray.push(redis.scardAsync(_getBucketKey(bucketId, host)));
		return yield Promise.all(promiseArray).then(responseArray => _.extend({}, responseArray)).catch(() => null);
	});

DataAccessor.prototype.getAllKeys = () =>
	co(function * () {
		return yield redis
			.keysAsync('*')
			.catch(() => {
				console.error(`ERROR :: REDIS_KEYS_FAIL`);
				return null;
			})
		;
	});

DataAccessor.prototype.getBucket = (bucketId, host) =>
	co(function * () {
		return yield redis
			.smembersAsync(_getBucketKey(bucketId, host))
			.catch(() => {
				console.error(`ERROR :: REDIS_SMEMBERS_FAIL`);
				return null;
			})
		;
	});

DataAccessor.prototype.clearDb = () =>
	co(function * () {
		return yield redis
			.flushdbAsync()
			.catch(() => {
				console.error(`ERROR :: REDIS_FLUSHDB_FAIL`);
				return null;
			})
		;
	});

module.exports = new DataAccessor();
