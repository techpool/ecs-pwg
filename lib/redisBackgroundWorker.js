const
	redisUtility = require('./lib/redisUtility');

redisUtility.pubsubConnection.psubscribe('*');

redisUtility.pubsubConnection.on('pmessage', (pattern, channel, message) => {
	if (channel === '__keyevent@0__:expired') {
		console.log('--------EXPIRY EVENT--------');
		console.log(pattern);
		console.log(channel);
		console.log(message);
		console.log('--------EXPIRY EVENT--------');
		_handleAccessTokenExpiry(message);
	}
});

redisUtility.pubsubConnection.on('psubscribe', (err) => {
	if (err) {
		console.error( "Redis pubsub psubscribe failed!" );
		return;
	}
	console.log( "Redis pubsub has subscribed successfully" );
});




function _handleAccessTokenExpiry(accessTokenKey) {
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
			_decrementBucketStatistics(hostName, bucketId, accessTokenKey.split('|')[1], function (error) {
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

