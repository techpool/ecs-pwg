const
	express = require('express'),
	router = express.Router();

const
	STAGE = process.env.STAGE || 'local',
	CONFIG = require('./../config/main.js')[STAGE],
	TRAFFIC_CONFIG = require('./../config/traffic_config');


/*
 *   http -> https redirection
 *  If your app is behind a trusted proxy (e.g. an AWS ELB or a correctly configured nginx), this code should work.
 *  This assumes that you're hosting your site on 80 and 443, if not, you'll need to change the port when you redirect.
 *  This also assumes that you're terminating the SSL on the proxy. If you're doing SSL end to end use the answer from @basarat above. End to end SSL is the better solution.
 *  app.enable('trust proxy') allows express to check the X-Forwarded-Proto header.
 */

// req.secure
router.use((req, res, next) => {
	let host = req.get('host');
	if (req.secure || (TRAFFIC_CONFIG[host] && TRAFFIC_CONFIG[host].VERSION === "ALPHA")) {
		return next();
	}
	res.redirect('https://' + req.headers.host + req.url);
});

// https://www.hindi.pratilipi.com -> https://hindi.pratilipi.com
router.use((req, res, next) => {
	let host = req.get('host');
	if (host.startsWith('www.') && TRAFFIC_CONFIG[host.substring('www.'.length)]) {
		return res.redirect(301, (req.secure ? 'https://' : 'http://') + host.substring('www.'.length) + req.originalUrl);
	} else {
		next();
	}
});

// If nothing matches, redirect to pratilipi.com
router.use((req, res, next) => {
	if (!TRAFFIC_CONFIG[req.headers.host])
		return res.redirect(301, 'https://www.pratilipi.com/?redirect=ecs');
	else
		next();
});

// Removal of trailing slash
router.use((req, res, next) => {
	if (req.path !== "/" && req.originalUrl.endsWith("/"))
		return res.redirect(301, (req.secure ? 'https://' : 'http://') + req.get('host') + req.originalUrl.slice(0, -1));
	else
		return next();
});

// Redirections
router.use((req, res, next) => {
	var redirections = {};
	redirections["/theme.pratilipi/logo.png"] = "/logo.png";
	redirections["/apple-touch-icon.png"] = "/favicon.ico";
	redirections["/apple-touch-icon-120x120.png"] = "/favicon.ico";
	redirections["/apple-touch-icon-precomposed.png"] = "/favicon.ico";
	redirections["/apple-touch-icon-120x120-precomposed.png"] = "/favicon.ico";
	redirections["/about"] = "/about/pratilipi";
	redirections["/career"] = "/work-with-us";
	redirections["/authors"] = "/admin/authors";
	redirections["/email-templates"] = "/admin/email-templates";
	redirections["/batch-process"] = "/admin/batch-process";
	redirections["/resetpassword"] = "/forgot-password";

	if (redirections[req.path])
		return res.redirect(301, (req.secure ? 'https://' : 'http://') + req.get('host') + redirections[req.path]);
	else
		next();
});

// Redirecting to new Pratilipi content image url
router.use((req, res, next) => {
	if (req.path === "/api.pratilipi/pratilipi/resource")
		return res.redirect(301, (req.secure ? 'https://' : 'http://') + req.get('host') + "/api/pratilipi/content/image" + "?" + req.url.split('?')[1]);
	else
		next();
});

// Redirection for mini domains based on User-Agent headers
router.use(function (req, res, next) {
	var web = TRAFFIC_CONFIG[req.headers.host]
	if (!web.BASIC_VERSION && process.env.STAGE === "prod") {

		var userAgent = req.get('User-Agent');
		var basicBrowser = false;

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

			var userAgentSubStr = userAgent.substring(userAgent.indexOf("OPR") + 4);
			var version = parseInt(userAgentSubStr.substring(0, userAgentSubStr.indexOf(".")));
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

			var userAgentSubStr = userAgent.substring(userAgent.indexOf("Chrome") + 7);
			var version = parseInt(userAgentSubStr.substring(0, userAgentSubStr.indexOf(".")));
			basicBrowser = version < 35;

		} else if (userAgent.contains("Safari")) { // Apple Safari

			// Apple Safari on Microsoft Windows 8.1
			//   Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2

			// if( userAgent.contains( "Version" ) ) {
			//      var userAgentSubStr = userAgent.substring( userAgent.indexOf( "Version" ) + 8 );
			//      var version = parseInt( userAgentSubStr.substring( 0, userAgentSubStr.indexOf( "." ) ) );
			//      basicBrowser = version < 8;
			// } else {
			//      var userAgentSubStr = userAgent.substring( userAgent.indexOf( "Safari" ) + 7 );
			//      var version = parseInt( userAgentSubStr.substring( 0, userAgentSubStr.indexOf( "." ) ) );
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

			var userAgentSubStr = userAgent.substring(userAgent.indexOf("Firefox") + 8);
			var version = parseInt(userAgentSubStr.substring(0, userAgentSubStr.indexOf(".")));
			// basicBrowser = version < 28;
			basicBrowser = false;

		} else {
			basicBrowser = true;

		}

		if (basicBrowser) {
			return res.redirect(307, (req.secure ? 'https://' : 'http://') + web.BASIC_DOMAIN + req.url);
		} else {
			next();
		}
	} else {
		next();
	}
});

module.exports = router;
