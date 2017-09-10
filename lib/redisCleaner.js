const
    async = require('async');

const
    redisUtility = require('./redisUtility');

function _getBucketCollectionName(hostName) {
    return hostName + '_bucket';
};

function _getAccessTokenKeyName(hostName, accessToken) {
    return hostName + '|' + accessToken;
};

function _getShadowKeyName(originalKeyName) {
    return originalKeyName + '|shadow';
};

function decrementBucketStatistics(hostName, bucketId, callback) {
    const bucketName = _getBucketCollectionName(hostName);
    async.waterfall([
        function (waterfallCallback) {
            redisUtility.hget(bucketName, bucketId, function (err, currentUserInBucket) {
                waterfallCallback(err, currentUserInBucket);
            });
        },

        function (currentUserInBucket, waterfallCallback) {
            const finalUsersInBucket = currentUserInBucket - 1;
            console.log('------CURRENT USERS-------');
            console.log(currentUserInBucket);
            console.log('------CURRENT USERS-------');
            console.log('------FINAL USERS-------');
            console.log(finalUsersInBucket);
            console.log('------FINAL USERS-------');
            console.log('------BUCKET ID-------');
            console.log(bucketId);
            console.log('------BUCKET ID-------');
            redisUtility.hset(bucketName, bucketId, finalUsersInBucket, waterfallCallback);
        }
    ], callback);
}

function _deleteShadowKey(keyName, callback) {
    redisUtility.del(keyName, callback);
}

function handleAccessTokenExpiry(accessTokenKey) {
    const shadowKeyName = _getShadowKeyName(accessTokenKey);
    redisUtility.get(shadowKeyName, function (redisDataFetchError, fetchedAccessTokenData) {
        if (redisDataFetchError) {
            console.log('--------------ERROR WHILE FETCHING DATA FROM REDIS---------------');
            console.log(redisDataFetchError);
            console.log('--------------ERROR WHILE FETCHING DATA FROM REDIS---------------');
        } else if (!fetchedAccessTokenData) {
            console.log('--------------NO SHADOW KEY FOUND----------------');
            console.log(accessTokenKey);
            console.log('--------------NO SHADOW KEY FOUND----------------');
        } else {
            const bucketId = fetchedAccessTokenData;
            const hostName = accessTokenKey.split('|')[0];
            decrementBucketStatistics(hostName, bucketId, function (error) {
                if (error) {
                    console.log('-------------ERROR-----------');
                    console.log(error);
                    console.log('-------------ERROR-----------');
                    return;
                }

                _deleteShadowKey(shadowKeyName, function (shadowKeyDeleteError) {
                    if (shadowKeyDeleteError) {
                        console.log('-------------SHADOW KEY DELETION ERROR-----------');
                        console.log(shadowKeyDeleteError);
                        console.log('-------------SHADOW KEY DELETION ERROR-----------');
                    }
                });
            });
        }
    });
}

redisUtility.pubsubConnection.psubscribe('*');

redisUtility.pubsubConnection.on('pmessage', function (pattern, channel, message) {
    if (channel === '__keyevent@0__:expired') {
        console.log('--------EXPIRY EVENT--------');
        console.log(pattern);
        console.log(channel);
        console.log(message);
        console.log('--------EXPIRY EVENT--------');
        handleAccessTokenExpiry(message);
    }
});

redisUtility.pubsubConnection.on('psubscribe', function () {
    console.log('Redis pubsub has subscribed successfully');
});