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

	this._allocateBucketToUser = (accessToken, host) =>
		co(function * () {

			const bucketStats = yield dataAccessor.getBucketStats(host, hostConfig[host].BUCKET.TOTAL);

			let bucketId;
			if (bucketStats) {
				const 
					bucketStatsArray = Object.keys(bucketStats).map(key => bucketStats[key]),
					valueOfBucketWithMinimumUsers = Math.min.apply(null, bucketStatsArray),
					indexOfBucketWithMinimumUsers = bucketStatsArray.indexOf(valueOfBucketWithMinimumUsers);
				bucketId = indexOfBucketWithMinimumUsers;
			} else {
				bucketId = Math.floor(Math.random() * hostConfig[host].BUCKET.TOTAL);
			}	

			return yield dataAccessor.createOrUpdate(accessToken, host, bucketId, hostConfig[host].TTL_DAYS);

		});	


	// Public functions
	this.getBucket = (accessToken, host) =>
		co(function * () {

			// get user access token
			const bucket = yield dataAccessor.get(accessToken, host);

			// If user is new, allot a bucket to the user
			if (bucket == null)
				return self._allocateBucketToUser(accessToken, host);

			// isBucketValid
			let isBucketValid = true;

			// If user already is alloted with a bucket, but expired (and not evicted for some reason)
			const dateToExpire = bucket.dateToExpire;
			if (new Date(dateToExpire).getTime() < Date.now())
				isBucketValid = false;

			// If user already is alloted with a bucket, bucket doens't exist now (reduced number of buckets from x to x-1)
			const bucketId = bucket.bucketId;
			if (bucketId >= hostConfig[bucket.host].BUCKET.TOTAL) // mind it, 0 indexing
				isBucketValid = false;

			if (!isBucketValid) {
				// Delete synchronously -> Can't be async, it will delete the original key also
				yield dataAccessor.delete(bucket.accessToken, bucket.host, bucket.bucketId).catch(() => console.error(`ERROR: DELETE_EXPIRED :: ${accessToken} :: ${host}`));
				// Create a new allocation to the user
				return self._allocateBucketToUser(accessToken, host);
			}

			// If user already is alloted with a bucket, and has a valid access token, only update the expiry of the bucket
			return dataAccessor.createOrUpdate(bucket.accessToken, bucket.host, bucket.bucketId, hostConfig[bucket.host].TTL_DAYS);

		});

	this.deleteBucketAllocation = (key) =>
		co(function * () {
			const bucket = yield dataAccessor.getByKey(key).then(bucket => bucket ? JSON.parse(bucket) : null);
			if (bucket)
				return yield dataAccessor.delete(bucket.accessToken, bucket.host, bucket.bucketId);
			return null;
		});

};
	

module.exports = new PwgUtil();
