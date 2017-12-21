const
	express = require('express'),
	router  = express.Router(),
	wrap = require('co-express');

const
	dataAccessor = require('./../data/dataAccessor');

const
	stage = process.env.STAGE || 'local',
	hostConfig = require('./../config/host');


router.use((req, res, next) => {
	// TODO: AccessToken check
	if (stage === 'gamma' || stage === 'prod')
		return next('route');
});


// Get all keys
router.get('/keys', wrap(function *(req, res, next) { res.status(200).json(yield dataAccessor.getAllKeys()) }));

// Check bucket stats
// TODO: Hardcoding 100
router.get('/stats', wrap(function *(req, res, next) { res.status(200).json(yield dataAccessor.getBucketStats(req.headers.host, 100)) }));

// Check bucket stats of a particular bucket
router.get('/bucket/:bucketId', wrap(function *(req, res, next) { res.status(200).json(yield dataAccessor.getBucket(req.params.bucketId, req.headers.host)) }));

// Delete All Data
router.delete('/lets_agree_to_disagree', wrap(function *(req, res, next) { res.status(200).json({message: yield dataAccessor.clearDb()}) }));


module.exports = router;
