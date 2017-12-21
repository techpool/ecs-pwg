const
	express = require('express'),
	router = express.Router(),
	wrap = require('co-express');

const
	stage = process.env.STAGE || 'local',
	stageConfig = require('./../config/stage');

const
	userServiceUtil = require('./../data/service/user');


// Getting (or) setting access token for the current user
router.use(wrap(function *(req, res, next) {

	// First time user => accessTokenCookie will be null
	const accessTokenCookie = req.cookies["access_token"] || null;

	// Assumption -> All static file requests shall have a valid access token
	// And some static file requests might not be having access token ( from service worker or from css )
	if (req.path.isStaticFileRequest()) {
		res.locals["access-token"] = accessTokenCookie;
		return next();
	}

	const accessTokenResponse = yield userServiceUtil.validateAccessToken(accessTokenCookie, req.headers['user-agent']).catch(() => -1);
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
