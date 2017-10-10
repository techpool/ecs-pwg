const
	async = require('async'),
	request = require('request');

const
	redisUtility = require('./redisUtility');

const
	TRAFFIC_CONFIG = require('./../config/traffic_config');

const
	_getBucketName = (hostName, bucketId) => hostName + '_bucket' + '_' + bucketId,
	_getAccessTokenKeyName = (hostName, accessToken) => hostName + '|' + accessToken,
	_getShadowKeyName = (originalKeyName) => originalKeyName + '|shadow';

const pwgUtil = {

	clearAllData: (callback) => {
		redisUtility.flushdb(callback);
	},

	getBucketDetails: (bucketId, callback) => {
		redisUtility.smembers(bucketId, callback);
	},

	getAllKeys: (callback) => {
		redisUtility.keys('*', callback);
	},

	getBucketStatistics: (hostName, callback) => {
		const objectWithCount = {};
		async.eachOf( new Array(100), (eachElement, index, iterateNext) => {
			redisUtility.scard( _getBucketName(hostName, index), (error, countOfUsers) => {
				objectWithCount[index] = countOfUsers || 0;
				iterateNext();
			});
		}, (error) => {
			callback(error, objectWithCount);
		});
	},

	getCurrentUserStatus: (accessToken, hostName, callback) => {
		redisUtility.get( _getAccessTokenKeyName(hostName, accessToken), (error, bucketId) => {
			if (error) {
				callback(error);
			} else if (!bucketId) {
				callback(1);
			} else {
				callback(null, Number(bucketId));
			}
		});
	},

	addAccessTokenToBucket: (hostName, bucketIndex, accessToken, callback) => {
		redisUtility.sadd( _getBucketName(hostName) + '_' + bucketIndex, accessToken, callback );
	},

	updateExpiryOfAccessToken: (accessToken, hostName, callback) => {
		const userKeyInRedis = _getAccessTokenKeyName(hostName, accessToken);
		const ttlInDays = TRAFFIC_CONFIG[hostName].TTL || 4; // Taking 4 days as default
		const ttlInSeconds = ttlInDays * 24 * 60 * 60;
		redisUtility.expire(userKeyInRedis, ttlInSeconds, callback);
	},

	associateUserWithABucket: (accessToken, hostName, bucketId, callback) => {
		const userKeyInRedis = _getAccessTokenKeyName(hostName, accessToken);
		async.waterfall([
			(waterfallCallback) => {
				redisUtility.set(userKeyInRedis, bucketId, (redisInsertionError) => {
					waterfallCallback(redisInsertionError, bucketId);
				});
			},
			(bucketId, waterfallCallback) => {
				pwgUtil.updateExpiryOfAccessToken(accessToken, hostName, (updateError) => {
					waterfallCallback(updateError, bucketId);
				});
			},
			(bucketId, waterfallCallback) => {
				redisUtility.set(_getShadowKeyName(userKeyInRedis), bucketId, waterfallCallback);
			}
		], callback );
	},

	incrementBucketStatisticsValue: (hostName, bucketIndex, accessToken, callback) => {
        redisUtility.sadd(_getBucketName(hostName, bucketIndex), accessToken, callback);
    }

};

module.exports = pwgUtil;
