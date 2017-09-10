const
    express = require('express'),
    request = require('request'),
    async = require('async'),
    morgan = require('morgan'),
    cookieParser = require('cookie-parser');

const app = express();

const
    redisUtility = require('./lib/redisUtility'),
    redisCleaner = require('./lib/redisCleaner');

const
    CONFIG = require('./config/main.js')[process.env.STAGE || 'local'],
    TRAFFIC_CONFIG = require('./config/traffic_config');

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

const UNEXPECTED_SERVER_EXCEPTION = { "message": "Some exception occurred at server. Please try again." };

String.prototype.isStaticFileRequest = function () {
    var staticFileExts = [".html", ".css", ".js", ".ico", ".png", ".svg", ".jpg", ".jpeg"];
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

for (const hostName in TRAFFIC_CONFIG) {
    _getBucketStatistics(hostName, function (error, bucketStatistics) {
        if (error) {

            const bucketName = _getBucketCollectionName(hostName);
            const bucketObject = {};
            for (var i = 0; i < 100; i++) {
                bucketObject[i] = 0;
            }

            console.log(bucketObject);

            redisUtility.hmset(bucketName, bucketObject, function (error) {
                console.log(error);
                console.log('Created bucket in redis for hostname: ' + hostName);

                redisUtility.hgetall(_getBucketCollectionName(hostName), function (someError, data) {
                    console.log(data);
                });
            });
        }
    });
}

app.use(morgan("short"));
app.use(cookieParser());

// Health middleware
app.get('/health', (req, res, next) => {
    console.log("Healthy!");
    res.send(Date.now() + "");
});

/*
 *   http -> https redirection
 *	If your app is behind a trusted proxy (e.g. an AWS ELB or a correctly configured nginx), this code should work.
 *	This assumes that you're hosting your site on 80 and 443, if not, you'll need to change the port when you redirect.
 *	This also assumes that you're terminating the SSL on the proxy. If you're doing SSL end to end use the answer from @basarat above. End to end SSL is the better solution.
 *	app.enable('trust proxy') allows express to check the X-Forwarded-Proto header.
 */
app.enable('trust proxy');
app.use((req, res, next) => {
    if (req.secure || TRAFFIC_CONFIG[req.headers.host].VERSION === "ALPHA") {
        return next();
    }
    res.redirect("https://" + req.headers.host + req.url);
});

// https://www.hindi.pratilipi.com -> https://hindi.pratilipi.com
app.use((req, res, next) => {
    var host = req.get('host');
    var redirected = false;

    if (TRAFFIC_CONFIG[host.substring("www.".length)]) {
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

// Redirection for mini domains based on User-Agent headers
app.use(function (req, res, next) {
    var web = TRAFFIC_CONFIG[req.headers.host]
    if (req.headers.host !== web.BASIC_DOMAIN && process.env.STAGE === "prod") {

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
            // 		var userAgentSubStr = userAgent.substring( userAgent.indexOf( "Version" ) + 8 );
            // 		var version = parseInt( userAgentSubStr.substring( 0, userAgentSubStr.indexOf( "." ) ) );
            // 		basicBrowser = version < 8;
            // } else {
            // 		var userAgentSubStr = userAgent.substring( userAgent.indexOf( "Safari" ) + 7 );
            // 		var version = parseInt( userAgentSubStr.substring( 0, userAgentSubStr.indexOf( "." ) ) );
            // 		basicBrowser = version < 538 || version > 620;
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
            console.log("UNKNOWN_USER_AGENT :: " + userAgent);
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
    if (req.path.isStaticFileRequest()) {
        next();
    } else {
        var accessToken = req.cookies["access_token"];
        var url = APPENGINE_ENDPOINT + "/ecs/accesstoken";
        if (accessToken) url += "?accessToken=" + accessToken;
        request(url, (error, response, body) => {
            if (error) {
                console.log('ACCESS_TOKEN_ERROR :: ', error);
                res.status(500).send(UNEXPECTED_SERVER_EXCEPTION);
            } else {
                try { accessToken = JSON.parse(body)["accessToken"]; } catch (e) {}
                if (!accessToken) {
                    console.log('ACCESS_TOKEN_CALL_ERROR');
                    res.status(500).send(UNEXPECTED_SERVER_EXCEPTION);
                } else {
                    var domain = process.env.STAGE === 'devo' ? '.ptlp.co' : '.pratilipi.com';
                    if (TRAFFIC_CONFIG[req.headers.host]["VERSION"] === "ALPHA")
                        domain = "localhost";
                    res.locals["access-token"] = accessToken;
                    res.cookie('access_token', accessToken, {
                        domain: domain,
                        path: '/',
                        maxAge: 30 * 24 * 3600000, // 30 days
                        httpOnly: false
                    });
                    next();
                }
            }
        });

    }
});

// Serving mini website
app.get('/*', (req, res, next) => {
    var web = TRAFFIC_CONFIG[req.headers.host];
    if (req.headers.host === web.BASIC_DOMAIN) {
        res.locals["redirection"] = 'MINI';
        next();
    } else {
        next();
    }
});

// Master website: www.pratilipi.com
app.get('/*', (req, res, next) => {
    var web = TRAFFIC_CONFIG[req.headers.host];
    if (web.VERSION === "ALL_LANGUAGE" || web.VERSION === "GAMMA_ALL_LANGUAGE") {
        res.locals["redirection"] = 'MINI';
    	next();
    } else {
        next();
    }
});

// Other urls where PWA is not supported
app.get('/*', (req, res, next) => {

    var forwardToMini = false;
    if (req.path === '/pratilipi-write' ||
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


// ========================================
// Traffic splitting logic
// ========================================

// Domains with predefined stack to be redirected to their particular stack
app.use(function (req, res, next) {
    // const currentHostName = req.headers.host.match(/:/g) ? req.headers.host.slice(0, req.headers.host.indexOf(":")) : req.headers.host;
    const currentHostName = req.headers.host;
    const hostConfig = TRAFFIC_CONFIG[currentHostName];

    if (!hostConfig) {
        res.locals["redirection"] = "PRODUCT";
        next();
        return;
    }

    if (hostConfig.STACK === "GROWTH") {
        res.locals["redirection"] = "GROWTH";
        next();
    } else if (hostConfig.STACK === "PRODUCT") {
        res.locals["redirection"] = "PRODUCT";
        next();
    } else {
        next();
    }
});

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

        callback(null, bucketId);
    });
}

function _getBucketStatistics(hostName, callback) {
    const redisKey = _getBucketCollectionName(hostName);
    redisUtility.hgetall(redisKey, function (error, bucketDetails) {
        if (error) {
            callback(error);
            return;
        }

        if (!bucketDetails) {
            callback(1);
            return;
        }

        callback(null, bucketDetails);
    });
}

function _incrementBucketStatisticsValue(hostName, bucketIndex, updatedBucketValue, callback) {
    const bucketName = _getBucketCollectionName(hostName);
    redisUtility.hset(bucketName, bucketIndex, updatedBucketValue, callback);
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

        function (bucketId, waterfallCallback) {
            _addShadowKeyForUser(userKeyInRedis, bucketId, waterfallCallback);
        }
    ], callback);
}

function _addShadowKeyForUser(originalKeyName, bucketId, callback) {
    const shadowKeyName = _getShadowKeyName(originalKeyName);
    redisUtility.set(shadowKeyName, bucketId, callback);
}

function _redirectToGrowth(req, res) {
    res.status(200).json({
        'info': 'Growth version is to be served here'
    });
}

function _redirectToProduct(req, res) {
    res.status(200).json({
        'info': 'Product version is to be served here'
    });
}

// Redirection of users who has been previously served a version
app.use(function (req, res, next) {

    if (
        res.locals["redirection"] &&
        (
            res.locals["redirection"] === "GROWTH" ||
            res.locals["redirection"] === "PRODUCT" ||
            res.locals["redirection"] === "MINI")
    ) {
        next();
        return;
    }


    const currentAccessToken = res.locals["access-token"];
    const hostName = req.headers.host;
    console.log('-------REACHED: Redirection of users who has been previously served a version----------');
    console.log(currentAccessToken);
    console.log('-------REACHED: Redirection of users who has been previously served a version----------');
    async.waterfall([
        function (waterfallCallback) {
            _getCurrentUserStatus(currentAccessToken, hostName, function (userDetailsParseError, fetchedBucketId) {
                waterfallCallback(userDetailsParseError, fetchedBucketId);
            });
        },

        function (fetchedBucketId, waterfallCallback) {
            _updateExpiryOfAccessToken(currentAccessToken, hostName, function (updateError) {
                waterfallCallback(updateError, fetchedBucketId);
            });
        },

        function (fetchedBucketId, waterfallCallback) {
            const bucketId = fetchedBucketId + 1;
            const trafficDetails = TRAFFIC_CONFIG[hostName];
            if (trafficDetails.GROWTH_PERCENTAGE && trafficDetails.GROWTH_PERCENTAGE >= bucketId) {
                waterfallCallback(null, 'REDIRECT_TO_GROWTH');
            } else {
                waterfallCallback(null, 'REDIRECT_TO_PRODUCT');
            }
        },


    ], function (error, redirectLocation) {
        if (error) {
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

// Middleware to handle new users whose access token has not been saved in redis
app.use(function (req, res, next) {

    if (
        res.locals["redirection"] &&
        (res.locals["redirection"] === "GROWTH" ||
            res.locals["redirection"] === "PRODUCT" ||
            res.locals["redirection"] === "MINI"
        )
    ) {
        return;
    }

    const currentAccessToken = res.locals["access-token"];
    const hostName = req.headers.host;

    console.log('-------REACHED: Middleware to handle new users whose access token has not been saved in redis----------');
    console.log(currentAccessToken);
    console.log('-------REACHED: Middleware to handle new users whose access token has not been saved in redis----------');

    async.waterfall([

        function (waterfallCallback) {
            _getBucketStatistics(hostName, function (bucketDetailsFetchError, fetchedBucketDetails) {
                if (bucketDetailsFetchError || !fetchedBucketDetails) {
                    waterfallCallback(bucketDetailsFetchError || 'No bucket has been setup for this domain');
                } else {
                    console.log(fetchedBucketDetails);
                    waterfallCallback(null, fetchedBucketDetails);
                }
            });
        },

        function (fetchedBucketDetailsObj, waterfallCallback) {
            var fetchedBucketDetails = Object.keys(fetchedBucketDetailsObj).map(function (key) { return fetchedBucketDetailsObj[key]; });
            const valueOfBucketWithMinimumUsers = Math.min.apply(null, fetchedBucketDetails);

            console.log('---------VALUE OF BUCKET WITH MINIMUM USERS----------');
            console.log(valueOfBucketWithMinimumUsers);
            console.log('---------VALUE OF BUCKET WITH MINIMUM USERS----------');

            const updatedValueOfBucket = valueOfBucketWithMinimumUsers + 1;
            const indexOfBucketWithMinimumUsers = fetchedBucketDetails.indexOf(String(valueOfBucketWithMinimumUsers));

            console.log('---------INDEX OF BUCKET WITH MINIMUM USERS----------');
            console.log(indexOfBucketWithMinimumUsers);
            console.log('---------INDEX OF BUCKET WITH MINIMUM USERS----------');
            _incrementBucketStatisticsValue(hostName, indexOfBucketWithMinimumUsers, updatedValueOfBucket, function (bucketStatisticsUpdateError) {
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
            if (trafficDetails.GROWTH_PERCENTAGE && trafficDetails.GROWTH_PERCENTAGE >= bucketId) {
                waterfallCallback(null, 'REDIRECT_TO_GROWTH');
            } else {
                waterfallCallback(null, 'REDIRECT_TO_PRODUCT');
            }
        }
    ], function (error, redirectLocation) {
        if (error) {
            console.log('--------------ERROR-------------');
            console.log(error);
            console.log('--------------ERROR-------------');
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

app.use(function (req, res, next) {
    if (res.locals["redirection"] === "GROWTH") {
        _redirectToGrowth(req, res);
    } else {
        _redirectToProduct(req, res);
    }
});

app.listen(CONFIG.SERVICE_PORT, function (error) {
    if (error) {
        console.log('---------------SERVER STARTUP ERROR---------------');
        console.log(error);
        console.log('---------------SERVER STARTUP ERROR---------------');
        return;
    }

    console.log('Server is listening on port: ', CONFIG.SERVICE_PORT);
});