const
	express = require('express'),
	router  = express.Router();

const
	dataAccessor = require('./../data/dataAccessor');

const
	stage = process.env.STAGE || 'local',
	hostConfig = require('./../config/host');


// Get all keys
router.get('/keys', async(req, res, next) => res.status(200).json(await dataAccessor.getAllKeys()));

// Check bucket stats
router.get('/stats', async(req, res, next) => res.status(200).json(await dataAccessor.getBucketStats(req.headers.host, hostConfig[req.headers.host].BUCKET.TOTAL)));

// Check bucket stats of a particular bucket
router.get('/bucket/:bucketId', async(req, res, next) => res.status(200).json(await dataAccessor.getBucket(parseInt(req.params.bucketId), req.headers.host)));

// Delete All Data
router.get('/lets_agree_to_disagree', async(req, res, next) =>  {
	// TODO: AccessToken check
	if (stage === 'gamma' || stage === 'prod')
		return next('router');
	return res.status(200).json({message: await dataAccessor.clearDb()});
});


module.exports = router;
