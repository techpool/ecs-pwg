const
	express = require('express'),
	router = express.Router(),
	request = require('request');

const
	STAGE = process.env.STAGE || 'local';

// Crawling Urls like robots.txt, sitemap
router.get(['/sitemap', '/robots.txt'], (req, res, next) => {
	let APPENGINE_ENDPOINT;
	switch (STAGE) {
		case "gamma":
			APPENGINE_ENDPOINT = "https://gae-gamma.pratilipi.com";
			break;
		case "prod":
			APPENGINE_ENDPOINT = "https://gae-prod.pratilipi.com";
			break;
		default:
			APPENGINE_ENDPOINT = "https://devo-pratilipi.appspot.com";
			break;
	}
	let options = {
		url: APPENGINE_ENDPOINT + req.url,
		headers: { 'ECS-HostName': req.get('host').split(':')[0] }
	};
	req.pipe(request(options)).pipe(res);
});

module.exports = router;
