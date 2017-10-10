const
	express = require('express'),
	router = express.Router(),
	pwgUtil = require('./../lib/pwgUtil');

const
	STAGE = process.env.STAGE || 'local',
	CONFIG = require('./../config/main.js')[STAGE];

// Middleware -> Delete All Data
router.get('/delete', (req, res, next) => {
	// TODO: AccessToken check in gamma and prod
	if (STAGE === 'local' || STAGE === 'devo') {
		pwgUtil.clearAllData( (err) => {
			if (err) {
				res.status(500).json({
					error: err
				});
				return;
			}
			res.status(200).json({
				success: true
			});
		});
	} else {
		next();
	}
});

// Middleware -> Check bucket stats of a particular bucket
router.get('/bucket/:bucketId', (req, res, next) => {
	// TODO: AccessToken check in gamma and prod
	if (STAGE === 'local' || STAGE === 'devo') {
		const bucketId = req.params.bucketId;
		pwgUtil.getBucketDetails(bucketId, (err, data) => {
			if (err) {
				res.status(500).json({
					error: err
				});
				return;
			}
			res.status(200).json({
				data: data
			});
		});
	} else {
		next();
	}
});

// Middleware -> Get all keys
router.get('/keystats', (req, res, next) => {
	// TODO: AccessToken check in gamma and prod
	if (STAGE === 'local' || STAGE === 'devo') {
		pwgUtil.getAllKeys( (err, keys) => {
			if (err) {
				res.status(500).json({
					error: err
				});
				return;
			}
			res.status(200).json({
				keys: keys
			});
		});
	} else {
		next();
	}
});

// Middleware -> Check bucket stats
router.get('/bucketstats', (req, res, next) => {
	// TODO: AccessToken check in gamma and prod
	if (STAGE === 'local' || STAGE === 'devo') {
		let host = req.get('host');
		pwgUtil.getBucketStatistics(host, (err, currentBucketStatistics) => {
			if (err) {
				res.status(500).json({
					error: err
				});
				return;
			}
			res.status(200).json({
				bucketStats: currentBucketStatistics
			});
		});
	} else {
		next();
	}
});

module.exports = router;
