const
	express = require('express'),
	router = express.Router(),
	wrap = require('co-express');

const
	stage = process.env.STAGE || 'local',
	stageConfig = require('./../config/stage');

const
	userServiceUtil = require('./../data/service/user');



// Setting res.locals["access-token"]
router.use((req, res, next) => {
	res.locals["access-token"] = req.cookies["access_token"] || null;
	next();
});


// Getting (or) setting access token for the current user
router.use(wrap(function *(req, res, next) {

	// Assumption -> All static file requests shall have a valid access token
	// And some static file requests might not be having access token ( from service worker or from css )
	if (req.path.isStaticFileRequest())
		return next();

	const accessTokenResponse = yield userServiceUtil.validateAccessToken(res.locals["access-token"], req.headers['user-agent']).catch(() => -1);
	if (accessTokenResponse === -1)
		return res.status(500).send('Oops, something went wrong, please try again');

	const
		accessToken = accessTokenResponse.id,
		expiryDateMillis = accessTokenResponse.dateToExpire;

	// Setting locals
	res.locals["access-token"] = accessToken;

	// Setting cookies
	res.cookie('access_token', accessToken, {
		domain: stageConfig.DOMAIN,
		path: '/',
		maxAge: new Date(expiryDateMillis) - Date.now(),
		httpOnly: false
	});

	next();

}));

module.exports = router;
