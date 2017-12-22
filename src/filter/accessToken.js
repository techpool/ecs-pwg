const
	express = require('express'),
	router = express.Router(),
	wrap = require('co-express');

const
	stage = process.env.STAGE || 'local',
	stageConfig = require('./../config/stage');

const
	dataAccessor = require('./../data/dataAccessor');


// Getting (or) setting access token for the current user
router.use(wrap(function *(req, res, next) {

	// First time user => accessTokenCookie will be null
	const accessTokenCookie = req.cookies["access_token"] || null;

	// Assumption -> All static file requests shall have a valid access token cookie
	// And some static file requests might not be having access token ( from service worker or from css ) -> do nothing
	if (req.path.isStaticFileRequest()) {
		res.locals["access-token"] = accessTokenCookie;
		return next();
	}

	const accessTokenResponse = yield dataAccessor.validateAccessToken(req.headers.host, accessTokenCookie, req.headers['user-agent']).catch(() => -1);
	if (accessTokenResponse === -1)
		return res.status(500).send('Oops, something went wrong, please try again');

	const
		accessToken = accessTokenResponse.id,
		dateToExpire = accessTokenResponse.dateToExpire;

	// Setting locals
	res.locals["access-token"] = accessToken;

	// Setting cookies
	res.cookie('access_token', accessToken, {
		domain: stageConfig.DOMAIN,
		path: '/',
		maxAge: new Date(dateToExpire) - Date.now(),
		httpOnly: false
	});

	next();

}));

module.exports = router;
