const Bucket = function(accessToken, host, bucketId, dateToExpire) {
	return {
        accessToken: accessToken,
        host: host,
        bucketId: bucketId,
        dateToExpire: dateToExpire
	};
};

module.exports = Bucket;
