// Library imports
const
    express = require('express'),
    morgan = require('morgan'),
    cookieParser = require('cookie-parser');

// Stage, Stack and Version
const
    stage = process.env.STAGE || 'local',
    Stack = require('./enum/stack'),
    Version = require('./enum/version');

// Filters - Declare it here, and use it henceforth (performance improvisation)
const
    hostRedirectionFilter = require('./filter/hostRedirection'),
    pathRedirectionFilter = require('./filter/pathRedirection'),
    crawlerFilter = require('./filter/crawler'),
    internalStatsFilter = require('./filter/internalStats'),
    accessTokenFilter = require('./filter/accessToken'),
    bucketFilter = require('./filter/bucket'),
    versionFilter= require('./filter/version'),
    stackFilter = require('./filter/stack');

// Utils
const
    pipeUtil = require('./util/common/pipe');



// Prototype declarations
String.prototype.count = function(s1) { return (this.length - this.replace(new RegExp(s1,"g"), '').length)/s1.length };
String.prototype.contains = function (str, startIndex) { return -1 !== String.prototype.indexOf.call(this, str, startIndex) };
String.prototype.equalsIgnoreCase = function(str) { return this.toUpperCase() === str.toUpperCase() };
String.prototype.isStaticFileRequest = function () { const staticFileExts = [".html", ".css", ".js", ".ico", ".png", ".svg", ".jpg", ".jpeg", ".json", ".map"]; for (let i = 0; i < staticFileExts.length; i++) if (this && this.endsWith(staticFileExts[i])) return true; return false; };

// Express App
const app = express();

// trust proxy
app.enable('trust proxy');

// logging
app.use(morgan("short"));

// cookies
app.use(cookieParser());

// Health check
app.get('/health', (req, res, next) => res.status(200).send('Hi! Bye!'));

// Disabling all post, patch and delete
app.post('*', (req, res, next) => res.status(400).json({message: 'Huh! Nice try!'}));
app.patch('*', (req, res, next) => res.status(400).json({message: 'Aww! That was cute!'}));
app.delete('*', (req, res, next) => res.status(400).json({message: 'Noooooooooooooooooo!'}));



/* ----------------------- POC ----------------------- */
app.get('/poc1', (req, res, next) => {
	let len = req.query.len ? parseInt(req.query.len) : 1;
	if (len > 1000000) len = 1000000;
	let message = "";
	for(let i = 0; i < len; i++) message += "a";
	res.send(message);
});

const httpUtil = require('./util/common/http');
app.get('/poc2', (req, res, next) => {
	httpUtil.get('https://android.pratilipi.com/init?language=HINDI').then((data) => res.json(data)).catch((err) => res.json({message: 'call failed.'}));
});

app.get('/poc3', (req, res, next) => {
	res.json({message: 'OK'});
});

app.get('/poc4', (req, res, next) => {
    // len
    let len = req.query.len ? parseInt(req.query.len) : 1;
    if (len > 1000000) len = 1000000;

    // message
    let message = "This is a sample log...";
    if (req.query.message) message = req.query.message;
    try {
        message = JSON.parse(decodeURIComponent(message));
    } catch(e) {
        // do nothing
        console.log('could not parse json');
    }

    // stringify
    let stringify = false;
    if (req.query.stringify === "true") stringify = true;
    if (stringify && typeof(message) === 'object') message = JSON.stringify(message);

    // time it
    let x = Date.now();
	for(let i = 0; i < len; i++) console.log(message);
	let y = Date.now();
	console.log(`Time taken to print ${len} logs = ${y-x} ms`);
    res.json({time: `${y-x} ms`, len: `${len}`});

});
/* ----------------------- POC ----------------------- */



// Redirection Filter(s)
app.use(hostRedirectionFilter);
app.use(pathRedirectionFilter);

// Crawler Filter
app.use(crawlerFilter);

// Internal developers only
app.use('/internal/stats', internalStatsFilter);

// AccessToken Filter
app.use(accessTokenFilter);

// Bucket Filter
app.use(bucketFilter);

// Version Filter
app.use(versionFilter);

// Stack Filter
app.use(stackFilter);

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
    console.log(`DEBUG :: ${decodeURIComponent(req.originalUrl)} :: ${req.headers['user-agent']} :: ${res.locals['access-token']} :: ${res.locals['bucket-id']} :: ${res.locals['total-growth-buckets']} :: ${res.locals['version']} :: ${res.locals['stack']}`);
    next();
});

// Pipe request to response
app.get('*', (req, res, next) => {

    // Local Environment - Send the data
    if (stage === 'local') {
        return res.json({
            accessToken: res.locals['access-token'],
            bucketId: res.locals['bucket-id'],
            version: res.locals['version'],
            stack: res.locals['stack']
        });
    }

    // Setting headers
    req.headers['Access-Token'] = res.locals['access-token'];
    req.headers['Bucket-Id'] = res.locals['bucket-id'];
    req.headers['Total-Growth-Buckets'] = res.locals['total-growth-buckets'];
    req.headers['Version'] = res.locals['version'];
    req.headers['Stack'] = res.locals['stack'];

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
