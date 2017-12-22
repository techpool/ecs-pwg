const
	express = require('express'),
	router  = express.Router(),
	wrap = require('co-express');

const
	dataAccessor = require('./../data/dataAccessor');

const
	stage = process.env.STAGE || 'local',
	hostConfig = require('./../config/host');


// Get all keys
router.get('/keys', wrap(function *(req, res, next) { res.status(200).json(yield dataAccessor.getAllKeys()) }));

// Check bucket stats
router.get('/stats', wrap(function *(req, res, next) { res.status(200).json(yield dataAccessor.getBucketStats(req.headers.host, hostConfig[req.headers.host].BUCKET.TOTAL)) }));

// Check bucket stats of a particular bucket
router.get('/bucket/:bucketId', wrap(function *(req, res, next) { res.status(200).json(yield dataAccessor.getBucket(parseInt(req.params.bucketId), req.headers.host)) }));

// Only for delete
router.use((req, res, next) => {
	// TODO: AccessToken check
	if (stage === 'gamma' || stage === 'prod')
		return next('router');
	next();
});


// Delete All Data
router.get('/lets_agree_to_disagree', wrap(function *(req, res, next) { res.status(200).json({message: yield dataAccessor.clearDb()}) }));


module.exports = router;
