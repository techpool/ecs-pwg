const
	express = require('express'),
	router = express.Router();

const
	stage = process.env.STAGE || 'local',
	hostConfig = require('./../config/host'),
	hostRedirectionConfig = require('./../config/hostRedirection');


/*
 *   http -> https redirection
 *  If your app is behind a trusted proxy (e.g. an AWS ELB or a correctly configured nginx), this code should work.
 *  This assumes that you're hosting your site on 80 and 443, if not, you'll need to change the port when you redirect.
 *  This also assumes that you're terminating the SSL on the proxy. If you're doing SSL end to end use the answer from @basarat above. End to end SSL is the better solution.
 *  app.enable('trust proxy') allows express to check the X-Forwarded-Proto header.
 */

// http to https redirection
router.use((req, res, next) => {
	// https exception in localhost
	if (req.headers.host.split(':')[0] === 'localhost')
		return next();
	if (req.secure)
		return next();
	return res.redirect(301, 'https://' + req.headers.host + req.originalUrl);
});


// https://www.hindi.pratilipi.com -> https://hindi.pratilipi.com
router.use((req, res, next) => {
	if (req.headers.host.startsWith('www.') && hostConfig[req.headers.host.substring('www.'.length)])
		return res.redirect(301, (req.secure ? 'https://' : 'http://') + req.headers.host.substring('www.'.length) + req.originalUrl);
	return next();
});


// If nothing matches, redirect to pratilipi.com
router.use((req, res, next) => {
	if (!hostConfig[req.headers.host])
		return res.redirect(301, (req.secure ? 'https://' : 'http://') + 'www.pratilipi.com/?redirect=ecs');
	return next();
});


// Redirection to mini website based on User-Agent headers
router.use((req, res, next) => {

	const redirectHost = hostRedirectionConfig[req.headers.host];
	if (!redirectHost)
		return next();

	// basicBrowser is false by default
	const userAgent = req.get('User-Agent');
	let basicBrowser = false;

	if (userAgent == null || userAgent.trim() === "") {
		basicBrowser = true;

	} else if (userAgent.contains("UCBrowser") || userAgent.contains("UCWEB")) { // UCBrowser

		// UCBrowser on Android 4.3
		// "Mozilla/5.0 (Linux; U; Android 4.3; en-US; GT-I9300 Build/JSS15J) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 UCBrowser/10.0.1.512 U3/0.8.0 Mobile Safari/533.1"

		basicBrowser = true; // Extreme mode

	} else if (userAgent.contains("Opera Mobi")) { // Opera Classic

		// Opera Classic on Android 4.3
		//  "Opera/9.80 (Android 4.3; Linux; Opera Mobi/ADR-1411061201) Presto/2.11.355 Version/12.10"

		basicBrowser = true; // Not sure whether Polymer 1.0 is supported or not

	} else if (userAgent.contains("Opera Mini")) { // Opera Mini

		// Opera Mini on Android 4.3
		//  "Opera/9.80 (Android; Opera Mini/7.6.40077/35.5706; U; en) Presto/2.8.119 Version/11.10"

		basicBrowser = true; // Extreme mode

	} else if (userAgent.contains("Trident/7") && userAgent.contains("rv:11")) { // Microsoft Internet Explorer 11

		// Microsoft Internet Explorer 11 on Microsoft Windows 8.1
		//  "Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; Touch; LCJB; rv:11.0) like Gecko"

		basicBrowser = true;

	} else if (userAgent.contains("OPR")) { // Opera

		// Opera on Microsoft Windows 8.1
		//   "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36 OPR/26.0.1656.24"
		// Opera on Android 4.3
		//   "Mozilla/5.0 (Linux; Android 4.3; GT-I9300 Build/JSS15J) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.102 Mobile Safari/537.36 OPR/25.0.1619.84037"

		const
			userAgentSubStr = userAgent.substring(userAgent.indexOf("OPR") + 4),
			version = parseInt(userAgentSubStr.substring(0, userAgentSubStr.indexOf(".")));
		// basicBrowser = version < 20;
		basicBrowser = false;

	} else if (userAgent.contains("Edge")) {

		// Microsoft Edge browser on Windows 10
		// Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393

		basicBrowser = false;

	} else if (userAgent.contains("Chrome") && !userAgent.contains("(Chrome)")) { // Google Chrome

		// Google Chrome on Microsoft Windows 8.1
		//   "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36"
		// Google Chrome on Android 4.3
		//   "Mozilla/5.0 (Linux; Android 4.3; GT-I9300 Build/JSS15J) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.59 Mobile Safari/537.36"

		const 
			userAgentSubStr = userAgent.substring(userAgent.indexOf("Chrome") + 7),
			version = parseInt(userAgentSubStr.substring(0, userAgentSubStr.indexOf(".")));
		basicBrowser = version < 35;

	} else if (userAgent.contains("Safari")) { // Apple Safari

		// Apple Safari on Microsoft Windows 8.1
		//   Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2

		// if( userAgent.contains( "Version" ) ) {
		//      let userAgentSubStr = userAgent.substring( userAgent.indexOf( "Version" ) + 8 );
		//      let version = parseInt( userAgentSubStr.substring( 0, userAgentSubStr.indexOf( "." ) ) );
		//      basicBrowser = version < 8;
		// } else {
		//      let userAgentSubStr = userAgent.substring( userAgent.indexOf( "Safari" ) + 7 );
		//      let version = parseInt( userAgentSubStr.substring( 0, userAgentSubStr.indexOf( "." ) ) );
		//      basicBrowser = version < 538 || version > 620;
		// }

		basicBrowser = false;

	} else if (userAgent.contains("Firefox")) { // Mozilla Firefox

		// Mozilla Firefox on Microsoft 8.1
		//   "Mozilla/5.0 (Windows NT 6.3; WOW64; rv:33.0) Gecko/20100101 Firefox/33.0 AlexaToolbar/alxf-2.21"
		// Mozilla Firefox on Android 4.3
		//   "Mozilla/5.0 (Android; Mobile; rv:33.0) Gecko/33.0 Firefox/33.0"
		// Mozilla Firefox on Linux
		//   "Mozilla/5.0 (X11; Linux x86_64; rv:10.0) Gecko/20100101 Firefox/10.0 (Chrome)"

		const 
			userAgentSubStr = userAgent.substring(userAgent.indexOf("Firefox") + 8),
			version = parseInt(userAgentSubStr.substring(0, userAgentSubStr.indexOf(".")));
		// basicBrowser = version < 28;
		basicBrowser = false;

	}


	if (basicBrowser)
		return res.redirect(307, (req.secure ? 'https://' : 'http://') + redirectHost + req.originalUrl);

	return next();

});

module.exports = router;
