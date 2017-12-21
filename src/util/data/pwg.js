const
	_           = require('lodash'),
	co          = require('co');

const
	stackEnum = require('./../../enum/stack'),
	versionEnum = require('./../../enum/version');

const
	hostConfig = require('./../../config/host');

const
	dataAccessor = require('./../../data/dataAccessor');


const PwgUtil = function() {

	const self = this;

	this._allocateBucket = (accessToken, host) =>
		co(function * () {

			const 
				bucketStats = yield dataAccessor.getBucketStats(host, hostConfig[host].BUCKET.TOTAL),
				bucketStatsArray = Object.keys(bucketStats).map(key => bucketStats[key]);

			const 
				valueOfBucketWithMinimumUsers = Math.min.apply(null, bucketStatsArray),
				indexOfBucketWithMinimumUsers = bucketStatsArray.indexOf(valueOfBucketWithMinimumUsers);

			yield dataAccessor.createOrUpdate(accessToken, host, hostConfig[host].TTL_IN_DAYS, indexOfBucketWithMinimumUsers);

		});	


	// Public functions
	this.getBucket = (accessToken, host) =>
		co(function * () {

			// get user access token
			const bucket = yield dataAccessor.get(accessToken, host);

			// If user is new, allot a bucket to the user
			if (bucket == null)
				return self._allocateBucket(accessToken, host);

			// If user already is alloted with a bucket, but expired (and not evicted for some reason)
			const dateToExpire = bucket.dateToExpire;
			if (new Date(dateToExpire).getTime() < Date.now()) {
				// Delete asynchronously
				dataAccessor.delete(bucket.accessToken, bucket.host, bucket.bucketId).catch(() => console.error(`ERROR: DELETE_EXPIRED :: ${accessToken} :: ${host}`));
				// Create a new allocation to the user
				return self._allocateBucket(accessToken, host);
			}

			// If user already is alloted with a bucket, and has a valid access token, only update the expiry of the bucket
			return dataAccessor.createOrUpdate(bucket.accessToken, bucket.host, hostConfig[bucket.host].TTL_IN_DAYS, bucket.bucketId);

		});

};
	

module.exports = new PwgUtil();
