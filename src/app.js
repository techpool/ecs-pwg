// Library imports
const
    express = require('express'),
    morgan = require('morgan'),
    cookieParser = require('cookie-parser'),
    compression = require('compression');

const
    stage = process.env.STAGE || 'local',
    Stack = require('./enum/stack'),
    Version = require('./enum/version');

const
    pipeUtil = require('./util/common/pipe');

// Prototype declarations
String.prototype.count = function(s1) { return (this.length - this.replace(new RegExp(s1,"g"), '').length)/s1.length };
String.prototype.contains = function (str, startIndex) { return -1 !== String.prototype.indexOf.call(this, str, startIndex) };
String.prototype.equalsIgnoreCase = function(str) { return this.toUpperCase() === str.toUpperCase() };
String.prototype.isStaticFileRequest = function () { const staticFileExts = [".html", ".css", ".js", ".ico", ".png", ".svg", ".jpg", ".jpeg", ".json"]; for (let i = 0; i < staticFileExts.length; i++) if (this && this.endsWith(staticFileExts[i])) return true; return false; };

// Express App
const app = express();

// gzip all responses
app.use(compression());

// trust proxy
app.enable('trust proxy');

// logging
app.use(morgan("short"));

// cookies
app.use(cookieParser());

// Health check
app.get('/health', (req, res, next) => res.status(200).send('Hi! Bye!'));

// Test app
app.get('/app/test', (req, res, next) => {
    // Returning response
    res.json({message: 'OK'});
});

// Test worker
// redis client
const redis = require('./util/common/redis')['client'];
const wrap = require('co-express');
app.get('/worker/test', wrap(function *(req, res, next) {

    // accessToken, bucketId
    const accessToken = Math.random().toString(36).substring(7) + Date.now(),
            bucketId = 0;

    // Debug Logs
    console.log(`TEST :: /worker/test :: ${accessToken} :: ${req.headers.host} :: ${bucketId}`);

    // Data
    const data = {
        accessToken: accessToken,
        host: req.headers.host,
        bucketId: bucketId,
        dateToExpire: Date.now()
    };

    // Setting original key
    yield redis.setAsync(`key|${accessToken}|${req.headers.host}`, JSON.stringify(data)).catch(() => console.error(`ERROR :: REDIS_SET_FAIL :: ${accessToken}`));

    // Setting shadow key - 10 seconds expiry
    yield redis.setexAsync(`shadow|${accessToken}|${req.headers.host}`, 10, JSON.stringify(data)).catch(() => console.error(`ERROR :: REDIS_SETEX_FAIL :: ${accessToken}`));

    // Setting Bucket Pool
    yield redis.saddAsync(`bucket|${bucketId}|${req.headers.host}`, accessToken).catch(() => console.error(`ERROR :: REDIS_SADD_FAIL :: ${accessToken}`));

    // Returning response
    return res.json({message: 'OK'});

}));

// Disabling all post, patch and delete
app.post('*', (req, res, next) => res.status(400).json({message: 'Huh! Nice try!'}));
app.patch('*', (req, res, next) => res.status(400).json({message: 'Aww! That was cute!'}));
app.delete('*', (req, res, next) => res.status(400).json({message: 'Noooooooooooooooooo!'}));

// Redirection Filter(s)
app.use(require('./filter/hostRedirection'));
app.use(require('./filter/pathRedirection'));

// Crawler Filter
app.use(require('./filter/crawler'));

// Internal developers only
app.use('/internal/stats', require('./filter/internalStats'));

// AccessToken Filter
app.use(require('./filter/accessToken'));

// Bucket Filter
app.use(require('./filter/bucket'));

// Version Filter
app.use(require('./filter/version'));

// Stack Filter
app.use(require('./filter/stack'));

/*
res.locals:
    access-token
    bucket-id
    total-growth-buckets
    version = pwa / mini
    stack = growth / product
*/

// Logging
app.use((req, res, next) => {
    console.log(`LOCALS :: ${decodeURIComponent(req.originalUrl)} :: ${res.locals['access-token']} :: ${res.locals['bucket-id']} :: ${res.locals['version']} :: ${res.locals['stack']}`);
    next();
});

// Local Environment - Send the data
app.get('*', (req, res, next) => {
    if (stage === 'local') {
        return res.json({
            accessToken: res.locals['access-token'],
            bucketId: res.locals['bucket-id'],
            version: res.locals['version'],
            stack: res.locals['stack']
        });
    }
    next();
});

// Pipe - Other environments
app.get('*', (req, res, next) => {

    // Setting headers
    req.headers['Access-Token'] = res.locals['access-token'];
    req.headers['Bucket-Id'] = res.locals['bucket-id'];
    req.headers['Total-Growth-Buckets'] = res.locals['total-growth-buckets'];

    if (res.locals['version'] === Version.PWA) {

        if (res.locals['stack'] === Stack.GROWTH) {
            pipeUtil.pipeToWebG(req, res);
        } else if (res.locals['stack'] === Stack.PRODUCT) {
            pipeUtil.pipeToWebP(req, res);
        }
    } else if (res.locals['version'] === Version.MINI) {

        if (res.locals['stack'] === Stack.GROWTH) {
            pipeUtil.pipeToMiniG(req, res);
        } else if (res.locals['stack'] === Stack.PRODUCT) {
            pipeUtil.pipeToMiniP(req, res);
        }
    }

});

module.exports = app;
