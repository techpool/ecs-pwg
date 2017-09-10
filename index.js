const
    express = require('express'),
    request = require('request'),
    async = require('async'),
    morgan = require('morgan');

const app = express();

const
    redisUtility = require('./lib/redisUtility');
const
    CONFIG = require('./config/main.js')[process.env.STAGE || 'local'],
    TRAFFIC_CONFIG = require('./config/traffic_config');

function _getBucketCollectionName(hostName) {
	return hostName + '_bucket';
};

function _getAccessTokenKeyName(hostName, accessToken) {
	return hostName + '|' + accessToken;
};

function _getShadowKeyName(originalKeyName) {
	return originalKeyName + '|shadow';
};

for (const hostName in TRAFFIC_CONFIG) {
    _getBucketStatistics(hostName, function (error, bucketStatistics) {
        if (error) {

        	const bucketName = _getBucketCollectionName(hostName);
        	const bucketObject = {};
        	for (var i = 0; i < 100; i++) {
        		bucketObject[i] = 0;
        	}

        	console.log(bucketObject);

            redisUtility.setHashMapAsArrayInRedis(bucketName, bucketObject, function (error) {
            	console.log(error);
                console.log('Created bucket in redis for hostname: ' + hostName);

                redisUtility.getAllHashMapValues(_getBucketCollectionName(hostName), function(someError, data) {
                	console.log(data);
                });
            });
        }
    });
}

app.use(morgan("short"));

// Redirection middleware for HTTP -> HTTPS
app.use(function (req, res, next) {
    next();
});

// Redirection for www.hindi.pratilipi.com
app.use(function (req, res, next) {
    next();
});

// Redirection for Invalid Domain
app.use(function (req, res, next) {
    next();
});

// Redirection for trailing slashes
app.use(function (req, res, next) {
    next();
});

// Redirection for mini domains based on User-Agent headers
app.use(function (req, res, next) {
    next();
});

// Getting the access token for the current user
app.use(function (req, res, next) {
    res.locals["access-token"] = req.headers['access_token'];
    next();
});

// Redirection for www.hindi.pratilipi.com
app.use(function (req, res, next) {
    next();
});

function _forwardRequestToMini(req, res) {
    // body...
}

// Forward to mini if it is a mini domain
app.use(function (req, res, next) {
    next();
});


// ========================================
// Traffic splitting logic
// ========================================

// Domains with predefined stack to be redirected to their particular stack
app.use(function (req, res, next) {
    // const currentHostName = req.headers.host.match(/:/g) ? req.headers.host.slice(0, req.headers.host.indexOf(":")) : req.headers.host;
    const currentHostName = req.headers.host;
    const hostConfig = TRAFFIC_CONFIG[currentHostName];

    if (!hostConfig) {
        _redirectToProduct(req, res);
        return;
    }

    if (hostConfig.STACK === "GROWTH") {
        _redirectToGrowth(req, res);
    } else if (hostConfig.STACK === "PRODUCT") {
        _redirectToProduct(req, res);
    } else {
        next();
    }
});

function _getCurrentUserStatus(accessToken, hostName, callback) {
    const redisKey = _getAccessTokenKeyName(hostName, accessToken);
    redisUtility.fetchDataFromRedis(redisKey, function (error, bucketId) {
        if (error) {
            callback(error);
            return;
        }

        if (!bucketId) {
            callback(1);
            return;
        }

        callback(null, bucketId);
    });
}

function _getBucketStatistics(hostName, callback) {
    const redisKey = _getBucketCollectionName(hostName);
    redisUtility.getAllHashMapValues(redisKey, function (error, bucketDetails) {
        if (error) {
            callback(error);
            return;
        }

        if (!bucketDetails) {
            callback(1);
            return;
        }

        callback(null, bucketDetails);
    });
}

function _incrementBucketStatisticsValue(hostName, bucketIndex, updatedBucketValue, callback) {
    const bucketName = _getBucketCollectionName(hostName);
    redisUtility.setHashMapInRedis(bucketName, bucketIndex, updatedBucketValue, callback);
}

function _updateExpiryOfAccessToken(accessToken, hostName, callback) {
    const userKeyInRedis = _getAccessTokenKeyName(hostName, accessToken);
    const ttlInDays = TRAFFIC_CONFIG[hostName].TTL || 1;
    const ttlInSeconds = ttlInDays * 24 * 60 * 60;
    redisUtility.updateExpiryOfKey(userKeyInRedis, ttlInSeconds, callback);
}

function _associateUserWithABucket(accessToken, hostName, bucketId, callback) {
    const userKeyInRedis = _getAccessTokenKeyName(hostName, accessToken);
    async.waterfall([
        function (waterfallCallback) {
            redisUtility.insertDataInRedis(userKeyInRedis, bucketId, function (redisInsertionError) {
                waterfallCallback(redisInsertionError, bucketId);
            });
        },

        function (bucketId, waterfallCallback) {
            _updateExpiryOfAccessToken(accessToken, hostName, function (updateError) {
                waterfallCallback(updateError, bucketId);
            });
        },

        function (bucketId, waterfallCallback) {
            _addShadowKeyForUser(userKeyInRedis, bucketId, waterfallCallback);
        }
    ], callback);
}

function _addShadowKeyForUser(originalKeyName, bucketId, callback) {
    const shadowKeyName = _getShadowKeyName(originalKeyName);
    redisUtility.insertDataInRedis(shadowKeyName, bucketId, callback);
}

function _redirectToGrowth(req, res) {
    res.status(200).json({
        'info': 'Growth version is to be served here'
    });
}

function _redirectToProduct(req, res) {
    res.status(200).json({
        'info': 'Product version is to be served here'
    });
}

// Redirection of users who has been previously served a version
app.use(function (req, res, next) {
    const currentAccessToken = res.locals["access-token"];
    const hostName = req.headers.host;
    console.log('-------REACHED: Redirection of users who has been previously served a version----------');
    console.log(currentAccessToken);
    console.log('-------REACHED: Redirection of users who has been previously served a version----------');
    async.waterfall([
        function (waterfallCallback) {
            _getCurrentUserStatus(currentAccessToken, hostName, function (userDetailsParseError, fetchedBucketId) {
                waterfallCallback(userDetailsParseError, fetchedBucketId);
            });
        },

        function (fetchedBucketId, waterfallCallback) {
            _updateExpiryOfAccessToken(currentAccessToken, hostName, function (updateError) {
                waterfallCallback(updateError, fetchedBucketId);
            });
        },

        function (fetchedBucketId, waterfallCallback) {
            const bucketId = fetchedBucketId + 1;
            const trafficDetails = TRAFFIC_CONFIG[hostName];
            if (trafficDetails.GROWTH_PERCENTAGE && trafficDetails.GROWTH_PERCENTAGE >= bucketId) {
                waterfallCallback(null, 'REDIRECT_TO_GROWTH');
            } else {
                waterfallCallback(null, 'REDIRECT_TO_PRODUCT');
            }
        },


    ], function (error, redirectLocation) {
        if (error) {
            next();
        } else if (redirectLocation === 'REDIRECT_TO_GROWTH') {
            _redirectToGrowth(req, res);
        } else {
            _redirectToProduct(req, res);
        }
    });
});

// Middleware to handle new users whose access token has not been saved in redis
app.use(function (req, res, next) {
    const currentAccessToken = res.locals["access-token"];
    const hostName = req.headers.host;

    console.log('-------REACHED: Middleware to handle new users whose access token has not been saved in redis----------');
    console.log(currentAccessToken);
    console.log('-------REACHED: Middleware to handle new users whose access token has not been saved in redis----------');

    async.waterfall([

        function (waterfallCallback) {
            _getBucketStatistics(hostName, function (bucketDetailsFetchError, fetchedBucketDetails) {
                if ( bucketDetailsFetchError || !fetchedBucketDetails ) {
                    waterfallCallback(bucketDetailsFetchError || 'No bucket has been setup for this domain');
                } else {
                    console.log(fetchedBucketDetails);
                    waterfallCallback(null, fetchedBucketDetails);
                }
            });
        },

        function (fetchedBucketDetailsObj, waterfallCallback) {
        	var fetchedBucketDetails = Object.keys( fetchedBucketDetailsObj ).map(function ( key ) { return fetchedBucketDetailsObj[key]; });
            const valueOfBucketWithMinimumUsers = Math.min.apply(null, fetchedBucketDetails);

            console.log('---------VALUE OF BUCKET WITH MINIMUM USERS----------');
            console.log(valueOfBucketWithMinimumUsers);
            console.log('---------VALUE OF BUCKET WITH MINIMUM USERS----------');

            const updatedValueOfBucket = valueOfBucketWithMinimumUsers + 1;
            const indexOfBucketWithMinimumUsers = fetchedBucketDetails.indexOf(String(valueOfBucketWithMinimumUsers));

            console.log('---------INDEX OF BUCKET WITH MINIMUM USERS----------');
            console.log(indexOfBucketWithMinimumUsers);
            console.log('---------INDEX OF BUCKET WITH MINIMUM USERS----------');
            _incrementBucketStatisticsValue(hostName, indexOfBucketWithMinimumUsers, updatedValueOfBucket, function (bucketStatisticsUpdateError) {
                if (bucketStatisticsUpdateError) {
                    waterfallCallback(bucketStatisticsUpdateError);
                } else {
                    waterfallCallback(null, indexOfBucketWithMinimumUsers);
                }
            });
        },

        function (indexOfBucketWithMinimumUsers, waterfallCallback) {
            _associateUserWithABucket(currentAccessToken, hostName, indexOfBucketWithMinimumUsers, function (userAssociationError) {
                if (userAssociationError) {
                    waterfallCallback(userAssociationError);
                } else {
                    waterfallCallback(null, indexOfBucketWithMinimumUsers);
                }
            });
        },

        function (indexOfBucketWithMinimumUsers, waterfallCallback) {
            const bucketId = indexOfBucketWithMinimumUsers + 1;
            const trafficDetails = TRAFFIC_CONFIG[hostName];
            if (trafficDetails.GROWTH_PERCENTAGE && trafficDetails.GROWTH_PERCENTAGE >= bucketId) {
                waterfallCallback(null, 'REDIRECT_TO_GROWTH');
            } else {
                waterfallCallback(null, 'REDIRECT_TO_PRODUCT');
            }
        }
    ], function (error, redirectLocation) {
        if (error) {
            console.log('--------------ERROR-------------');
            console.log(error);
            console.log('--------------ERROR-------------');
            _redirectToProduct(req, res);
        } else if (redirectLocation === 'REDIRECT_TO_GROWTH') {
            _redirectToGrowth(req, res);
        } else {
            _redirectToProduct(req, res);
        }
    });
});

function decrementBucketStatistics(hostName, bucketId, callback) {
	const bucketName = _getBucketCollectionName(hostName);
    async.waterfall([
        function (waterfallCallback) {
            redisUtility.getHashMapInRedis(bucketName, bucketId, function (err, currentUserInBucket) {
                waterfallCallback(err, currentUserInBucket);
            });
        },

        function(currentUserInBucket, waterfallCallback) {
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
        	redisUtility.setHashMapInRedis(bucketName, bucketId, finalUsersInBucket, waterfallCallback);
        }
    ], callback);
}

function _deleteShadowKey(keyName, callback) {
	redisUtility.deleteDataInRedis(keyName, callback);
}

function handleAccessTokenExpiry(accessTokenKey) {
    const shadowKeyName = _getShadowKeyName(accessTokenKey);
    redisUtility.fetchDataFromRedis(shadowKeyName, function (redisDataFetchError, fetchedAccessTokenData) {
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
            decrementBucketStatistics(hostName, bucketId, function(error) {
            	if (error) {
            		console.log('-------------ERROR-----------');
            		console.log(error);
            		console.log('-------------ERROR-----------');
            		return;
            	}

            	_deleteShadowKey(shadowKeyName, function(shadowKeyDeleteError) {
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

app.listen(CONFIG.SERVICE_PORT, function (error) {
    if (error) {
        console.log('---------------SERVER STARTUP ERROR---------------');
        console.log(error);
        console.log('---------------SERVER STARTUP ERROR---------------');
        return;
    }

    console.log('Server is listening on port: ', CONFIG.SERVICE_PORT);
});