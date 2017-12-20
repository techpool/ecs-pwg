const
    express = require('express'),
    request = require('request'),
    async = require('async'),
    morgan = require('morgan'),
    cookieParser = require('cookie-parser'),
    URL = require('url-parse'),
    queryString = require('query-string'),
    AsyncLock = require('async-lock');

const
    app = express(),
    lock = new AsyncLock();

const
    redisUtility = require('./lib/redisUtility');

const
    CONFIG = require('./config/main.js')[process.env.STAGE || 'local'],
    TRAFFIC_CONFIG = require('./config/traffic_config');

const UNEXPECTED_SERVER_EXCEPTION = { "message": "Some exception occurred at server. Please try again." };

String.prototype.isStaticFileRequest = function () {
    var staticFileExts = [".html", ".css", ".js", ".ico", ".png", ".svg", ".jpg", ".jpeg", ".json"];
    for (var i = 0; i < staticFileExts.length; i++)
        if (this && this.endsWith(staticFileExts[i])) return true;
    return false;
};

String.prototype.contains = function (str, startIndex) {
    return -1 !== String.prototype.indexOf.call(this, str, startIndex);
};

function _getBucketCollectionName(hostName) {
    return hostName + '_bucket';
};

function _getAccessTokenKeyName(hostName, accessToken) {
    return hostName + '|' + accessToken;
};

function _getShadowKeyName(originalKeyName) {
    return originalKeyName + '|shadow';
};

app.use(morgan("short"));
app.use(cookieParser());

// Health middleware
app.get('/health', (req, res, next) => {
    console.log('Healthy!');
    res.send(Date.now() + "");
});

/*
app.get('/delete', function (req, res, next) {
    redisUtility.flushdb(function (errorInFlushing) {
        if (errorInFlushing) {
            res.status(500).json({
                error: error
            });
            return;
        }
        res.status(200).json({
            success: true
        });
    });
});
*/

app.get('/bucket/:bucketId', function (req, res, next) {
    const bucketId = req.params.bucketId;
    redisUtility.smembers(bucketId, function (error, data) {
        res.status(200).json({
            error: error,
            data: data
        });
    });
});

app.get('/keystats', function (req, res, next) {
    redisUtility.keys('*', function (err, keys) {
        res.status(200).json(keys);
    });
});

app.get('/stats', function (req, res, next) {
    var host = req.get('host');
    _getBucketStatistics(host, function (error, currentBucketStatistics) {
        res.status(200).json({
            error: error,
            bucketStats: currentBucketStatistics
        });
    });
});

app.get('/details', function (req, res, next) {
    const access_token = req.query.access_token;
    const hostName = req.headers.host;

    _getCurrentUserStatus(access_token, hostName, function (error, userDetails) {
        res.status(200).json({
            error: error,
            userDetails: userDetails
        });
    });
});

/*
 *   http -> https redirection
 *  If your app is behind a trusted proxy (e.g. an AWS ELB or a correctly configured nginx), this code should work.
 *  This assumes that you're hosting your site on 80 and 443, if not, you'll need to change the port when you redirect.
 *  This also assumes that you're terminating the SSL on the proxy. If you're doing SSL end to end use the answer from @basarat above. End to end SSL is the better solution.
 *  app.enable('trust proxy') allows express to check the X-Forwarded-Proto header.
 */
app.enable('trust proxy');
app.use((req, res, next) => {
    if (req.secure || (TRAFFIC_CONFIG[req.headers.host] && TRAFFIC_CONFIG[req.headers.host].VERSION === "ALPHA")) {
        return next();
    }
    res.redirect("https://" + req.headers.host + req.url);
});

// https://www.hindi.pratilipi.com -> https://hindi.pratilipi.com
app.use((req, res, next) => {
    var host = req.get('host');
    var redirected = false;

    if (host.startsWith("www.") && TRAFFIC_CONFIG[host.substring("www.".length)]) {
        return res.redirect(301, (req.secure ? 'https://' : 'http://') + host.substring("www.".length) + req.originalUrl);
    } else {
        next();
    }
});


// If nothing matches, redirect to pratilipi.com
app.use((req, res, next) => {
    if (TRAFFIC_CONFIG[req.headers.host] == null)
        return res.redirect(301, 'https://www.pratilipi.com/?redirect=ecs');
    else
        next();
});

// Redirection for trailing slash
app.use((req, res, next) => {
    if (req.path !== "/" && req.originalUrl.endsWith("/"))
        return res.redirect(301, (req.secure ? 'https://' : 'http://') + req.get('host') + req.originalUrl.slice(0, -1));
    else
        return next();
});

// Redirections
app.use((req, res, next) => {
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
app.use((req, res, next) => {
    if (req.path === "/api.pratilipi/pratilipi/resource")
        return res.redirect(301, (req.secure ? 'https://' : 'http://') + req.get('host') + "/api/pratilipi/content/image" + "?" + req.url.split('?')[1]);
    else
        next();
});

// Crawling Urls like robots.txt, sitemap
app.get('/*', (req, res, next) => {
    if (process.env.STAGE === "prod") {
        if (req.path === '/sitemap' || req.path === '/robots.txt') {
            var APPENGINE_ENDPOINT;
            switch (process.env.STAGE) {
                case "devo":
                    APPENGINE_ENDPOINT = "https://devo-pratilipi.appspot.com";
                    break;
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
            var url = APPENGINE_ENDPOINT + req.url;
            request.get({
                uri: url,
                method: req.method,
                qs: req.query,
                headers: req.headers,
                followAllRedirects: false,
                followRedirect: false,
                jar: true
            }).on('response',
                function (response) {
                    res.writeHead(response.statusCode, response.headers);
                }
            ).pipe(res);
        } else {
            next();
        }
    } else {
        next();
    }
});


// Crawlers - only for prod and gamma env
app.get('/*', (req, res, next) => {

    if (process.env.STAGE === "prod" || process.env.STAGE === "gamma") {

        var userAgent = req.get('User-Agent');
        var isCrawler = false;

        if (!userAgent) {
            // Do Nothing

        } else if (userAgent.contains("Googlebot")) { // Googlebot/2.1; || Googlebot-News || Googlebot-Image/1.0 || Googlebot-Video/1.0
            isCrawler = true;

        } else if (userAgent === "Google (+https://developers.google.com/+/web/snippet/)") { // Google+
            isCrawler = true;

        } else if (userAgent.contains("Bingbot")) { // Microsoft Bing
            isCrawler = true;

        } else if (userAgent.contains("Slurp")) { // Yahoo
            isCrawler = true;

        } else if (userAgent.contains("DuckDuckBot")) { // DuckDuckGo
            isCrawler = true;

        } else if (userAgent.contains("Baiduspider")) { // Baidu - China
            isCrawler = true;

        } else if (userAgent.contains("YandexBot")) { // Yandex - Russia
            isCrawler = true;

        } else if (userAgent.contains("Exabot")) { // ExaLead - France
            isCrawler = true;

        } else if (userAgent === "facebot" ||
            userAgent.startsWith("facebookexternalhit/1.0") ||
            userAgent.startsWith("facebookexternalhit/1.1")) { // Facebook Scraping requests
            isCrawler = true;

        } else if (userAgent.startsWith("WhatsApp")) { // Whatsapp
            isCrawler = true;

        } else if (userAgent.startsWith("ia_archiver")) { // Alexa Crawler
            isCrawler = true;
        }

        if (isCrawler) {
            // TODO: Remove hack for crawlers
            req.headers[ "Access-Token" ] = "5deb8b92-f406-4a5c-ad8b-db2417461b70";
            _redirectToMini(req, res);
        } else {
            next();
        }
    } else {
        next();
    }
});

// Redirection for mini domains based on User-Agent headers
app.use(function (req, res, next) {
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

// Getting the access token for the current user
app.use((req, res, next) => {

    // Assumption -> All static file requests shall have a valid access token
    // And some static file requests might not be having access token ( from service worker or from css )
    if (req.path.isStaticFileRequest()) {
        next();
    } else {
        var options = { url: "https://" + req.headers.host + "/api/user/accesstoken",
                      headers: req.headers,
                      method: 'GET' };
		console.log( "options: " + JSON.stringify(options) );
        request( options, (error, response, body) => {
            if (error) {
		console.log(`Error: ${JSON.stringify(error,null,4)}`);
                res.status(500).send(UNEXPECTED_SERVER_EXCEPTION);
            } else {
                var accessToken, expiryDateMillis;
                try {
                    accessToken = JSON.parse(body)["accessToken"];
                    expiryDateMillis = JSON.parse(body)["expiryMills"];
                } catch (e) {}
                if (!accessToken) {
		    console.log(`Error: accessToken ${body}`);
                    res.status(500).send(UNEXPECTED_SERVER_EXCEPTION);
                    return;
                }
                var domain = process.env.STAGE === 'devo' ? '.ptlp.co' : '.pratilipi.com';
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
            }
        });
    }
});

// Middleware - redirection to mini
app.get('/*', (req, res, next) => {

    var web = TRAFFIC_CONFIG[req.headers.host];
    var forwardToMini = false;

    // Serving mini website
    if (web.BASIC_VERSION) {
        forwardToMini = true;

        // Master website: www.pratilipi.com
    } else if (web.VERSION === "ALL_LANGUAGE" || web.VERSION === "GAMMA_ALL_LANGUAGE") {
        forwardToMini = true;

        // Other urls where PWA is not supported
    } else if (req.path === '/pratilipi-write' ||
        req.path === '/write' ||
        req.path.startsWith('/admin/') ||
        req.path === '/edit-event' ||
        req.path === '/edit-blog' ||
        req.url.contains('loadPWA=false')) {
        forwardToMini = true;
    }

    // static files
    var referer = req.header('Referer') != null ? req.header('Referer') : "";
    if (req.path.isStaticFileRequest() &&
        (referer.contains('/pratilipi-write') ||
            referer.contains('/write') ||
            referer.contains('/admin') ||
            referer.contains('/edit-event') ||
            referer.contains('/edit-blog') ||
            referer.contains('loadPWA=false'))) {
        forwardToMini = true;
    }

    if (forwardToMini) {
        res.locals["redirection"] = 'MINI';
    }

    next();

});


// Middleware to serve static files
app.use(function (req, res, next) {

    if (!req.path.isStaticFileRequest()) {
        next();
        return;
    }

    if (res.locals && res.locals["redirection"]) { // static files for mini already set
        next();
        return;
    }

    // 1. if 'stack' in referer
    // 2. if 'stack' in config
    // 3. access_token != null && access_token in redis
    // 4. fallback to product

    // 'stack' in referer
    const referer = req.headers['referer'] != null ? req.headers['referer'] : "";
    const url = new URL(referer);
    const forcedStack = queryString.parse(url.query).stack;
    console.log('Forced Stack: ', forcedStack);
    if (forcedStack && (forcedStack === "GROWTH" || forcedStack === "PRODUCT")) {
        res.locals["redirection"] = forcedStack;
        next();
        return;
    }

    // 'stack' in config
    const hostConfig = TRAFFIC_CONFIG[req.headers.host];
    if (hostConfig.STACK === "GROWTH" || hostConfig.STACK === "PRODUCT") {
        res.locals["redirection"] = hostConfig.STACK;
        next();
        return;
    }

    // access_token != null && access_token in redis
    const accessToken = req.cookies["access_token"];
    if (accessToken) {
        _isUserInRedis(accessToken, req.headers.host, function (isPresent) {
            if (isPresent) {
                next(); // stack will be figured out in the next middleware, just passing it upon
            } else {
                res.locals["redirection"] = "PRODUCT"; // fallback to PRODUCT
                next();
            }
        });
        return;
    }

    // fallback to PRODUCT
    res.locals["redirection"] = "PRODUCT";
    next();

});

// Middleware to do forced loading of any stack on any domain
app.use(function (req, res, next) {

    if (res.locals && res.locals["redirection"]) {
        next();
        return;
    }

    let forcedStack = req.query.stack;

    if (forcedStack === "GROWTH" || forcedStack === "PRODUCT")
        res.locals["redirection"] = forcedStack;

    next();

});

// Domains with predefined stack to be redirected to their particular stack
app.use(function (req, res, next) {

    if (res.locals && res.locals["redirection"]) {
        next();
        return;
    }

    const hostConfig = TRAFFIC_CONFIG[req.headers.host];

    if (hostConfig.STACK === "GROWTH" || hostConfig.STACK === "PRODUCT")
        res.locals["redirection"] = hostConfig.STACK;

    next();

});


// ========================================
// Traffic splitting logic
// ========================================

function _isUserInRedis(accessToken, hostName, callback) {
    const redisKey = _getAccessTokenKeyName(hostName, accessToken);
    redisUtility.get(redisKey, function (error, bucketId) {
        callback(!error && bucketId != null);
    });
}

function _getCurrentUserStatus(accessToken, hostName, callback) {
    const redisKey = _getAccessTokenKeyName(hostName, accessToken);
    redisUtility.get(redisKey, function (error, bucketId) {
        if (error) {
            callback(error);
            return;
        }

        if (!bucketId) {
            callback(1);
            return;
        }

        callback(null, Number(bucketId));
    });
}

function _getBucketStatistics(hostName, callback) {

    const redisKey = _getBucketCollectionName(hostName);
    const arrayOf100Elements = new Array(100);
    const objectWithCount = {};
    async.eachOf(arrayOf100Elements, function (eachElement, bucketId, iterateNext) {
        redisUtility.scard(redisKey + '_' + bucketId, function (error, countOfUsers) {
            objectWithCount[bucketId] = countOfUsers || 0;
            iterateNext();
        });
    }, function (error) {
        callback(error, objectWithCount);
    });

}

function _incrementBucketStatisticsValue(hostName, bucketIndex, accessToken, callback) {
    const bucketName = _getBucketCollectionName(hostName);
    redisUtility.sadd(bucketName + '_' + bucketIndex, accessToken, callback);
}

function _updateExpiryOfAccessToken(accessToken, hostName, callback) {
    const userKeyInRedis = _getAccessTokenKeyName(hostName, accessToken);
    const ttlInDays = TRAFFIC_CONFIG[hostName].TTL || 1;
    const ttlInSeconds = ttlInDays * 24 * 60 * 60;
    redisUtility.expire(userKeyInRedis, ttlInSeconds, callback);
}

function _associateUserWithABucket(accessToken, hostName, bucketId, callback) {
    const userKeyInRedis = _getAccessTokenKeyName(hostName, accessToken);
    async.waterfall([
        function (waterfallCallback) {
            redisUtility.set(userKeyInRedis, bucketId, function (redisInsertionError) {
                waterfallCallback(redisInsertionError, bucketId);
            });
        },

        function (bucketId, waterfallCallback) {
            _updateExpiryOfAccessToken(accessToken, hostName, function (updateError) {
                waterfallCallback(updateError, bucketId);
            });
        },

        // _addShadowKeyForUser
        function (bucketId, waterfallCallback) {
            redisUtility.set(_getShadowKeyName(userKeyInRedis), bucketId, waterfallCallback);
        }
    ], callback);
}

// hacky middleware to check for files requested by service workers
app.use(function (req, res, next) {
    const referer = req.header('Referer') != null ? req.header('Referer') : "";
    const url = new URL(referer);
    console.log('Parsed URL: ', JSON.stringify(url));
    if (url && url.pathname.startsWith('/pwa-sw-') && url.pathname.endsWith('.js')) {
        console.log('Referer for redirection: ', referer);
        res.locals["redirection"] = "PRODUCT";
    }
    next();
});

// Redirection of users who has been previously served a version
app.use(function (req, res, next) {

    if (res.locals && res.locals["redirection"]) {
        next();
        return;
    }

    const currentAccessToken = res.locals["access-token"] || req.cookies["access_token"];
    const hostName = req.headers.host;

    async.waterfall([
        function (waterfallCallback) {
            _getCurrentUserStatus(currentAccessToken, hostName, function (userDetailsParseError, fetchedBucketId) {
                console.log('----------ACCESS TOKEN DETAILS-------------');
                console.log('Access Token: ', currentAccessToken);
                console.log('Bucket ID: ', fetchedBucketId);
                console.log('Any ERROR: ', JSON.stringify(userDetailsParseError));
                console.log('----------ACCESS TOKEN DETAILS-------------');
                waterfallCallback(userDetailsParseError, fetchedBucketId);
            });
        },

        function (fetchedBucketId, waterfallCallback) {
            _updateExpiryOfAccessToken(currentAccessToken, hostName, function (updateError) {
                waterfallCallback(updateError, fetchedBucketId);
            });
        },

        function (fetchedBucketId, waterfallCallback) {
            const trafficDetails = TRAFFIC_CONFIG[hostName];
            console.log('674:fetchedBucketId: ', fetchedBucketId);
	    res.locals["bucketId"] = fetchedBucketId;
            if (trafficDetails.GROWTH_PERCENTAGE && trafficDetails.GROWTH_PERCENTAGE > fetchedBucketId) {
                waterfallCallback(null, 'REDIRECT_TO_GROWTH');
            } else {
                waterfallCallback(null, 'REDIRECT_TO_PRODUCT');
            }
        },

    ], function (error, redirectLocation) {
        if (error) {
            console.log('------------ERROR SOMEWHERE------------');
            console.log(JSON.stringify(error));
            console.log('------------ERROR SOMEWHERE------------');
        } else if (redirectLocation === 'REDIRECT_TO_GROWTH') {
            res.locals["redirection"] = "GROWTH";
        } else {
            res.locals["redirection"] = "PRODUCT";
        }
        next();
    });
});

// Middleware to handle new users whose access token has not been saved in redis
app.use(function (req, res, next) {

    if (res.locals && res.locals["redirection"]) {
        next();
        return;
    }

    const currentAccessToken = res.locals["access-token"] || req.cookies["access_token"];
    const hostName = req.headers.host;

    async.waterfall([
        function (waterfallCallback) {
            _getBucketStatistics(hostName, function (bucketDetailsFetchError, fetchedBucketDetails) {
                if (bucketDetailsFetchError) {
                    waterfallCallback(bucketDetailsFetchError || 'No bucket has been setup for this domain');
                } else {
                    waterfallCallback(null, fetchedBucketDetails);
                }
            });
        },

        function (fetchedBucketDetailsObj, waterfallCallback) {
            var fetchedBucketDetails = Object.keys(fetchedBucketDetailsObj).map(function (key) { return Number(fetchedBucketDetailsObj[key]); });

            console.log("fetchedBucketDetails", JSON.stringify(fetchedBucketDetails));
            console.log("typeof(fetchedBucketDetails[0])", typeof (fetchedBucketDetails[0]));

            const valueOfBucketWithMinimumUsers = Math.min.apply(null, fetchedBucketDetails);


            const updatedValueOfBucket = valueOfBucketWithMinimumUsers + 1;
            const indexOfBucketWithMinimumUsers = fetchedBucketDetails.indexOf(valueOfBucketWithMinimumUsers);


            console.log('-------------BUCKET BEFORE WRITING------------');
            console.log("Bucket ID: ", indexOfBucketWithMinimumUsers);
            console.log("Bucket Value: ", updatedValueOfBucket);
            console.log("Path: ", req.path);
            console.log("Cookies: ", req.cookies["access_token"]);
            console.log('-------------BUCKET BEFORE WRITING------------');

            _incrementBucketStatisticsValue(hostName, indexOfBucketWithMinimumUsers, currentAccessToken, function (bucketStatisticsUpdateError) {
                if (bucketStatisticsUpdateError) {
                    waterfallCallback(bucketStatisticsUpdateError);
                } else {
                    waterfallCallback(null, indexOfBucketWithMinimumUsers);
                }
            });
        },

        function (indexOfBucketWithMinimumUsers, waterfallCallback) {
            _associateUserWithABucket(currentAccessToken, hostName, indexOfBucketWithMinimumUsers, function (userAssociationError) {
                if (userAssociationError) {
                    waterfallCallback(userAssociationError);
                } else {
                    waterfallCallback(null, indexOfBucketWithMinimumUsers);
                }
            });
        },

        function (indexOfBucketWithMinimumUsers, waterfallCallback) {
            const bucketId = indexOfBucketWithMinimumUsers + 1;
            const trafficDetails = TRAFFIC_CONFIG[hostName];
	    res.locals["bucketId"] = indexOfBucketWithMinimumUsers;
            if (trafficDetails.GROWTH_PERCENTAGE && trafficDetails.GROWTH_PERCENTAGE >= bucketId) {
                waterfallCallback(null, 'REDIRECT_TO_GROWTH');
            } else {
                waterfallCallback(null, 'REDIRECT_TO_PRODUCT');
            }
        }
    ], function (error, redirectLocation) {
        if (error) {
            res.locals["redirection"] = "PRODUCT";
            next();
        } else if (redirectLocation === 'REDIRECT_TO_GROWTH') {
            res.locals["redirection"] = "GROWTH";
            next();
        } else {
            res.locals["redirection"] = "PRODUCT";
            next();
        }
    });
});

// Middleware to set the bucket ID cookie
app.use(function (req, res, next) {
    const bucketId = res.locals["bucketId"];
    if (!bucketId) {
    	next();
	return;
    }
    const domain = process.env.STAGE === 'devo' ? '.ptlp.co' : '.pratilipi.com';
    if (TRAFFIC_CONFIG[req.headers.host]["VERSION"] === "ALPHA")
    	domain = "localhost";
	
    const ttlInDays = TRAFFIC_CONFIG[req.headers.host].TTL || 1;
    const ttlInMilliSeconds = ttlInDays * 24 * 60 * 60 * 1000;
    res.cookie('bucketId', bucketId, {
	domain: domain,
	path: '/',
	httpOnly: false,
	maxAge: ttlInMilliSeconds,
    });
    next();
});

// Middleware to set bucket ID as headers
app.use(function (req, res, next) {
    const bucketId = res.locals["bucketId"];
    
    if (!bucketId) {
	next();
	return;
    }
	
    req.headers["bucket-id"] = bucketId;
    req.headers["total-growth-buckets"] = TRAFFIC_CONFIG[req.headers.host].GROWTH_PERCENTAGE;
    next();
});

app.use(function (req, res, next) {

    console.log('---------REDIRECTION LOGIC-----------');
    console.log('Path: ', req.path);
    console.log('URL: ', req.url);
    console.log('Cookie: ', req.cookies['access_token']);
    console.log('REDIRECT TO: ', res.locals.redirection);
    console.log('---------REDIRECTION LOGIC-----------');
    if (res.locals["redirection"] === "GROWTH") {
        _redirectToGrowth(req, res);
    } else if (res.locals["redirection"] === "MINI") {
        _redirectToMini(req, res);
    } else {
        _redirectToProduct(req, res);
    }
});

app.listen(CONFIG.SERVICE_PORT, function (error) {
    if (error) {
        return;
    }
});

function __redirect(req, res, port) {
    request.get({
        uri: CONFIG.PWG_LOAD_BALANCER + ':' + port + req.path,
        method: req.method,
        qs: req.query,
        headers: req.headers,
        followAllRedirects: false,
        followRedirect: false,
        jar: true
    }).on('response',
        function (response) {
            console.log(`PWG_DEBUG :: port ${port} :: ${response.statusCode}`);
            res.writeHead(response.statusCode, response.headers);
        }
    ).pipe(res);
}

function _redirectToGrowth(req, res) {
    __redirect(req, res, 8081);
}

function _redirectToProduct(req, res) {
    __redirect(req, res, 8080);
}

function _redirectToMini(req, res) {
    __redirect(req, res, 81);
}





function _decrementBucketStatistics(hostName, bucketId, accessToken, callback) {
    const bucketName = _getBucketCollectionName(hostName);
    redisUtility.srem(bucketName + '_' + bucketId, accessToken, callback);
}

function _deleteShadowKey(keyName, callback) {
    redisUtility.del(keyName, callback);
}

function handleAccessTokenExpiry(accessTokenKey) {
    const shadowKeyName = _getShadowKeyName(accessTokenKey);
    redisUtility.get(shadowKeyName, function (redisDataFetchError, fetchedAccessTokenData) {
        if (redisDataFetchError) {
            console.log('--------------ERROR WHILE FETCHING DATA FROM REDIS---------------');
            console.log(redisDataFetchError);
            console.log('--------------ERROR WHILE FETCHING DATA FROM REDIS---------------');
        } else if (!fetchedAccessTokenData) {
            console.log('--------------NO SHADOW KEY FOUND----------------');
            console.log(accessTokenKey);
            console.log('--------------NO SHADOW KEY FOUND----------------');
        } else {
            const bucketId = fetchedAccessTokenData;
            const hostName = accessTokenKey.split('|')[0];

            _decrementBucketStatistics(hostName, bucketId, accessTokenKey.split('|')[1], function (error) {
                if (error) {
                    console.log('-------------ERROR-----------');
                    console.log(error);
                    console.log('-------------ERROR-----------');
                    return;
                }
                decrementBucketStatistics(hostName, bucketId, function (error) {
                    if (error) {
                        console.log('-------------ERROR-----------');
                        console.log(error);
                        console.log('-------------ERROR-----------');
                        return;
                    }
                });
            });
        }
    });
}

redisUtility.pubsubConnection.psubscribe('*');

redisUtility.pubsubConnection.on('pmessage', function (pattern, channel, message) {
	if (channel === `__keyevent@${CONFIG.REDIS_DB}__:expired`) {
        console.log('--------EXPIRY EVENT--------');
        console.log(pattern);
        console.log(channel);
        console.log(message);
        console.log('--------EXPIRY EVENT--------');
        handleAccessTokenExpiry(message);
    }
});

redisUtility.pubsubConnection.on('psubscribe', function () {
    console.log('Redis pubsub has subscribed successfully');
});
