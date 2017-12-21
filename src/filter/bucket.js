const
	express = require('express'),
    router = express.Router(),
    wrap = require('co-express');

const
	stage = process.env.STAGE || 'local';

const
	pwgUtil = require('./../util/data/pwg');


// Setting res.locals["bucket-id"] from query
router.use((req, res, next) => {
    const bucketId = Number(req.query.bucketId);
    if (!isNaN(bucketId) && bucketId >= 0 && bucketId < 100)
        res.locals["bucket-id"] = bucketId;
	next('route');
});


// Setting bucket id for the current access token
router.use(wrap(function *(req, res, next) {

    const accessToken = res.locals["access-token"];
    if (accessToken == null) {
        res.locals["bucket-id"] = null;
        return next();
    }

    const 
        bucketResponse = yield pwgUtil.getBucket(accessToken, req.headers.host),
        bucketId = bucketResponse['bucketId'],
        dateToExpire = bucketResponse['dateToExpire'];

    // Setting locals
    res.locals["bucket-id"] = bucketId;

    // Setting cookies
    res.cookie('bucket_id', bucketId + '', {
        domain: stageConfig.DOMAIN,
        path: '/',
        httpOnly: false,
        maxAge: new Date(dateToExpire) - Date.now(),
    });

    // TODO: @Depricated - Remove dependencies soon
	res.cookie('bucketId', bucketId + '', {
        domain: stageConfig.DOMAIN,
        path: '/',
        httpOnly: false,
        maxAge: new Date(dateToExpire) - Date.now(),
    });

}));

module.exports = router;
