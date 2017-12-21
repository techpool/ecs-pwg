const
	express = require('express'),
	router = express.Router();


// Supporting loadPWA=false
router.use((req, res, next) => {
    if (req.url.contains('loadPWA=false') ||
        (req.path.isStaticFileRequest() && req.header('Referer') && req.header('Referer').contains('loadPWA=false'))) {
        return pipeUtil.pipeToMini(req, res);
    }
});

module.exports = router;
