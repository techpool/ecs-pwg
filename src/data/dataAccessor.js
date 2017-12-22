const
	_           = require('lodash'),
	co          = require('co');

const
	redis = require('./../util/common/redis')['client'];

const
	bucketEntity = require('./../entity/bucket');

const
	authorServiceUtil = require('./service/author'),
	eventServiceUtil = require('./service/event'),
	pratilipiServiceUtil = require('./service/pratilipi'),
	userServiceUtil = require('./service/user');

const
	_getKey = (accessToken, host) => `key|${accessToken}|${host}`,
	_getShadowKey = (accessToken, host) => `shadow|${accessToken}|${host}`,
	_getBucketKey = (bucketId, host) => `bucket|${bucketId}|${host}`;


const DataAccessor = function() {};

DataAccessor.prototype.createOrUpdate = (accessToken, host, bucketId, ttlInDays) =>
	co(function * () {

		// Debug Logs
		console.log(`DATA_ACCESSOR :: createOrUpdate :: ${accessToken} :: ${host} :: ${bucketId} :: ${ttlInDays}`);

		// Data
		const data = new bucketEntity(accessToken, host, bucketId, Date.now() + ttlInDays*24*60*60*1000);

		// Setting original key
		yield redis.setAsync(_getKey(accessToken, host), JSON.stringify(data)).catch(() => console.error(`ERROR :: REDIS_SET_FAIL :: ${_getKey(accessToken, host)} :: ${JSON.stringify(data)}`));

		// Setting shadow key
		yield redis.setexAsync(_getShadowKey(accessToken, host), ttlInDays*24*60*60, JSON.stringify(data)).catch(() => console.error(`ERROR :: REDIS_SETEX_FAIL :: ${_getShadowKey(accessToken, host)} :: ${JSON.stringify(data)}`));

		// Setting Bucket Pool
		yield redis.saddAsync(_getBucketKey(bucketId, host), accessToken).catch(() => console.error(`ERROR :: REDIS_SADD_FAIL :: ${_getBucketKey(bucketId, host)} :: ${accessToken}`));

		// Returning data
		return data;

    });

DataAccessor.prototype.get = (accessToken, host) =>
	co(function * () {

		// Debug Logs
		console.log(`DATA_ACCESSOR :: get :: ${accessToken} :: ${host}`);

		return yield redis
			.getAsync(_getKey(accessToken, host))
			.then((data) => data ? JSON.parse(data) : null)
			.catch(() => {
				console.error(`ERROR :: REDIS_GET_FAIL :: ${_getKey(accessToken, host)}`);
				return null;
			})
		;
	});

DataAccessor.prototype.getByKey = (key) =>
	co(function * () {

		// Debug Logs
		console.log(`DATA_ACCESSOR :: getByKey :: ${key}`);

		return yield redis
			.getAsync(key)
			.catch(() => {
				console.error(`ERROR :: REDIS_GET_FAIL :: ${key}`);
				return null;
			})
		;
	});

DataAccessor.prototype.delete = (accessToken, host, bucketId) =>
	co(function * () {

		// Debug Logs
		console.log(`DATA_ACCESSOR :: delete :: ${accessToken} :: ${host} :: ${bucketId}`);

		// Deleting original key
		yield redis.delAsync(_getKey(accessToken, host)).catch(() => console.error(`ERROR :: REDIS_DEL_FAIL :: ${_getKey(accessToken, host)}`));

		// Deleting shadow key
		yield redis.delAsync(_getShadowKey(accessToken, host)).catch(() => console.error(`ERROR :: REDIS_DEL_FAIL :: ${_getShadowKey(accessToken, host)}`));

		// Removing accessToken from Bucket Pool
		yield redis.sremAsync(_getBucketKey(bucketId, host), accessToken).catch(() => console.error(`ERROR :: REDIS_SREM_FAIL :: ${_getBucketKey(bucketId, host)} :: ${accessToken}`));

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

DataAccessor.prototype.validateAccessToken = (accessToken, userAgent) =>
	userServiceUtil.validateAccessToken(accessToken, userAgent);

module.exports = new DataAccessor();
