const
	express = require('express'),
    router = express.Router(),
    wrap = require('co-express');

const
    stage = process.env.STAGE || 'local',
    stageConfig = require('./../config/stage'),
    hostConfig = require('./../config/host');

const
	pwgUtil = require('./../util/data/pwg');



// Setting res.locals["total-growth-buckets"]
router.use((req, res, next) => {
    res.locals['total-growth-buckets'] = hostConfig[req.headers.host].BUCKET.GROWTH;
    next();
});


// NOTE: Always use null check, if (bucketId) => bucketId can be 0 also

// Setting bucketId from queryparams
router.use((req, res, next) => {

    let bucketId;

    // index.html request
    const bucketIdQuery = parseInt(req.query.bucketId);
    if (!isNaN(bucketIdQuery) && bucketIdQuery >= 0 && bucketIdQuery < hostConfig[req.headers.host].BUCKET.TOTAL)
        bucketId = bucketIdQuery;

    // static file requests
    if (bucketId == null) {
        const referer = req.header('Referer') || "";
        if (req.path.isStaticFileRequest() && referer.contains('bucketId')) {
            const bucketIdReferer = parseInt(referer.substring(referer.indexOf("bucketId=") + "bucketId=".length));
            if (!isNaN(bucketIdReferer) && bucketIdReferer >= 0 && bucketIdReferer < hostConfig[req.headers.host].BUCKET.TOTAL)
                bucketId = bucketIdReferer;
        }
    }

    if (bucketId != null) {
        res.locals["bucket-id"] = bucketId;
        return next('router');
    }

    next();

});


// Minor optimisation - reading from cookies in case of staticFileRequests - Not doing it for html file, trust issues
router.use((req, res, next) => {
    if (req.path.isStaticFileRequest()) {
        const bucketIdCookie = req.cookies["bucket_id"] != null ? parseInt(req.cookies["bucket_id"]) : null;
        if (bucketIdCookie != null && bucketIdCookie >= 0 && bucketIdCookie < hostConfig[req.headers.host].BUCKET.TOTAL) {
            res.locals["bucket-id"] = bucketIdCookie;
            return next('router');
        }
    }
    next();
});


// Setting bucket id for the current access token
router.use(wrap(function *(req, res, next) {

    const accessToken = res.locals["access-token"];

    // This will happen ONLY in case of static files, which is requested from other css / service worker
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
    // bucketId in string -> cookies doesn't consider 0 in integer
    res.cookie('bucket_id', bucketId + '', {
        domain: stageConfig.DOMAIN,
        path: '/',
        httpOnly: false,
        maxAge: new Date(dateToExpire) - Date.now(),
    });

    // TODO: @Depricated - Remove dependencies asap
	res.cookie('bucketId', bucketId + '', {
        domain: stageConfig.DOMAIN,
        path: '/',
        httpOnly: false,
        maxAge: new Date(dateToExpire) - Date.now(),
    });

    next();

}));

module.exports = router;
