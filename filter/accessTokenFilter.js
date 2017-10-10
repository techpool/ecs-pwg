const
	express = require('express'),
	router = express.Router(),
	request = require('request');

const
	https = require( 'https' ),
	httpsAgent = new https.Agent({ keepAlive : true, rejectUnauthorized: false });

const
	TRAFFIC_CONFIG = require('./../config/traffic_config');

const
	UNEXPECTED_SERVER_EXCEPTION = { "message": "Some exception occurred at server. Please try again." };

// Getting the access token for the current user
router.use((req, res, next) => {
	// Assumption -> All static file requests shall have a valid access token
	// And some static file requests might not be having access token ( from service worker or from css )
	if (req.path.isStaticFileRequest()) {
		res.locals["access-token"] = req.cookies["access_token"] || null;
		next();
	} else {

		let targetHost =
			TRAFFIC_CONFIG[req.headers.host].VERSION === "ALPHA"
				? "https://hindi-devo.ptlp.co"
				: "https://" + req.headers.host;

		let options = { url: targetHost + '/api/user/accesstoken',
						headers: req.headers,
						method: 'GET',
						agent: httpsAgent };

		request( options, (err, response, body) => {
			if (err) {
				console.log('ACCESS_TOKEN_ERROR', error);
				res.status(500).json(UNEXPECTED_SERVER_EXCEPTION);
				return;
			}
			let accessToken, expiryDateMillis;
			try {
				accessToken = JSON.parse(body)["accessToken"];
				expiryDateMillis = JSON.parse(body)["expiryMills"];
			} catch (e) {}
			if (!accessToken) {
				console.log('ACCESS_TOKEN_ERROR', body);
				res.status(500).send(UNEXPECTED_SERVER_EXCEPTION);
				return;
			}
			let domain = process.env.STAGE === 'devo' ? '.ptlp.co' : '.pratilipi.com';
			if (TRAFFIC_CONFIG[req.headers.host]["VERSION"] === "ALPHA")
				domain = "localhost";
			res.locals["access-token"] = accessToken;
			res.cookie('access_token', accessToken, {
				domain: domain,
				path: '/',
				maxAge: new Date(expiryDateMillis) - Date.now(),
				httpOnly: false
			});
			next();
		});
	}
});

module.exports = router;
