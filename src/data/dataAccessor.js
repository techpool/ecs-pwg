const
	_           = require('lodash'),
	fs			= require('fs');

const
	redis = require('./../util/common/redis')['client'];

const
	bucketEntity = require('./../entity/bucket');

const
	pageService = require('./service/page'),
	authorServiceUtil = require('./service/author'),
	eventServiceUtil = require('./service/event'),
	pratilipiServiceUtil = require('./service/pratilipi'),
	userServiceUtil = require('./service/user');

const
	_getKey = (accessToken, host) => `key|${accessToken}|${host}`,
	_getShadowKey = (accessToken, host) => `shadow|${accessToken}|${host}`,
	_getBucketKey = (bucketId, host) => `bucket|${bucketId}|${host}`;


const DataAccessor = function() {};

DataAccessor.prototype.createOrUpdate = async(accessToken, host, bucketId, ttlInDays) => {

	// Debug Logs
	console.log(`DATA_ACCESSOR :: createOrUpdate :: ${accessToken} :: ${host} :: ${bucketId} :: ${ttlInDays}`);

	// Data
	const data = new bucketEntity(accessToken, host, bucketId, Date.now() + ttlInDays*24*60*60*1000);

	// Setting original key
	await redis.setAsync(_getKey(accessToken, host), JSON.stringify(data)).catch(() => console.error(`ERROR :: REDIS_SET_FAIL :: ${_getKey(accessToken, host)} :: ${JSON.stringify(data)}`));

	// Setting shadow key
	await redis.setexAsync(_getShadowKey(accessToken, host), ttlInDays*24*60*60, JSON.stringify(data)).catch(() => console.error(`ERROR :: REDIS_SETEX_FAIL :: ${_getShadowKey(accessToken, host)} :: ${JSON.stringify(data)}`));

	// Setting Bucket Pool
	await redis.saddAsync(_getBucketKey(bucketId, host), accessToken).catch(() => console.error(`ERROR :: REDIS_SADD_FAIL :: ${_getBucketKey(bucketId, host)} :: ${accessToken}`));

	// Returning data
	return data;

};

DataAccessor.prototype.get = async(accessToken, host) => {

	// Debug Logs
	console.log(`DATA_ACCESSOR :: get :: ${accessToken} :: ${host}`);

	return await redis
		.getAsync(_getKey(accessToken, host))
		.then((data) => data ? JSON.parse(data) : null)
		.catch(() => {
			console.error(`ERROR :: REDIS_GET_FAIL :: ${_getKey(accessToken, host)}`);
			return null;
		})
	;
};

DataAccessor.prototype.getByKey = async(key) => {

	// Debug Logs
	console.log(`DATA_ACCESSOR :: getByKey :: ${key}`);

	return await redis
		.getAsync(key)
		.catch(() => {
			console.error(`ERROR :: REDIS_GET_FAIL :: ${key}`);
			return null;
		})
	;
};

DataAccessor.prototype.delete = async(accessToken, host, bucketId) => {

	// Debug Logs
	console.log(`DATA_ACCESSOR :: delete :: ${accessToken} :: ${host} :: ${bucketId}`);

	// Deleting original key
	await redis.delAsync(_getKey(accessToken, host)).catch(() => console.error(`ERROR :: REDIS_DEL_FAIL :: ${_getKey(accessToken, host)}`));

	// Deleting shadow key
	await redis.delAsync(_getShadowKey(accessToken, host)).catch(() => console.error(`ERROR :: REDIS_DEL_FAIL :: ${_getShadowKey(accessToken, host)}`));

	// Removing accessToken from Bucket Pool
	await redis.sremAsync(_getBucketKey(bucketId, host), accessToken).catch(() => console.error(`ERROR :: REDIS_SREM_FAIL :: ${_getBucketKey(bucketId, host)} :: ${accessToken}`));

};

DataAccessor.prototype.getBucketStats = async(host, totalBuckets) => {
	let promiseArray = [];
	for (let bucketId = 0; bucketId < totalBuckets; bucketId++) promiseArray.push(redis.scardAsync(_getBucketKey(bucketId, host)));
	return await Promise.all(promiseArray).then(responseArray => _.extend({}, responseArray)).catch(() => null);
};

DataAccessor.prototype.getAllKeys = async() => {
	return await redis
		.keysAsync('*')
		.catch(() => {
			console.error(`ERROR :: REDIS_KEYS_FAIL`);
			return null;
		})
	;
};

DataAccessor.prototype.getBucket = async(bucketId, host) => {
	return await redis
		.smembersAsync(_getBucketKey(bucketId, host))
		.catch(() => {
			console.error(`ERROR :: REDIS_SMEMBERS_FAIL`);
			return null;
		})
	;
};

DataAccessor.prototype.clearDb = async() => {
	return await redis
		.flushdbAsync()
		.catch(() => {
			console.error(`ERROR :: REDIS_FLUSHDB_FAIL`);
			return null;
		})
	;
};

// Services
DataAccessor.prototype.validateAccessToken = (host, accessToken, userAgent) =>
	userServiceUtil.validateAccessToken(host, accessToken, userAgent);

DataAccessor.prototype.getPage = (host, path, accessToken) =>
	pageService.getPage(host, path, accessToken);

DataAccessor.prototype.getPratilipiBySlug = (host, slug, accessToken) =>
	pratilipiServiceUtil.getBySlug(host, slug, accessToken);

DataAccessor.prototype.getPratilipiById = (host, pratilipiId, accessToken) =>
	pratilipiServiceUtil.getById(host, pratilipiId, accessToken);

DataAccessor.prototype.getAuthorBySlug = (host, slug, accessToken) =>
	authorServiceUtil.getBySlug(host, slug, accessToken);

DataAccessor.prototype.getAuthorById = (host, authorId, accessToken) =>
	authorServiceUtil.getById(host, authorId, accessToken);

DataAccessor.prototype.getEventBySlug = (host, slug, accessToken) =>
	eventServiceUtil.getBySlug(host, slug, accessToken);

DataAccessor.prototype.getEventById = (host, eventId, accessToken) =>
	eventServiceUtil.getById(host, eventId, accessToken);


// Local
DataAccessor.prototype.getRobotsTxt = (stage) => 
	fs.readFileSync(`${__dirname}/robotsTxt/${stage}`);

module.exports = new DataAccessor();
