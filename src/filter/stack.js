const
    hostConfig = require('./../config/host'),
    Stack = require('./../enum/stack');

const
	express = require('express'),
	router = express.Router();


router.use((req, res, next) => {

    // check for bucket_id
    const bucketId = res.locals['bucket-id'];

    // fallback to product
    if (bucketId == null) {
        res.locals['stack'] = Stack.PRODUCT;
        return next();
    }

    res.locals['stack'] = bucketId < hostConfig[req.headers.host].BUCKET.GROWTH ? Stack.GROWTH : Stack.PRODUCT;
    next();

});

module.exports = router;
