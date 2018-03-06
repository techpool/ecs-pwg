// Prototype declarations
String.prototype.count = function(s1) { return (this.length - this.replace(new RegExp(s1,"g"), '').length)/s1.length };
String.prototype.contains = function (str, startIndex) { return -1 !== String.prototype.indexOf.call(this, str, startIndex) };
String.prototype.equalsIgnoreCase = function(str) { return this.toUpperCase() === str.toUpperCase() };
String.prototype.isStaticFileRequest = function () { const staticFileExts = [".html", ".css", ".js", ".ico", ".png", ".svg", ".jpg", ".jpeg", ".json", ".map"]; for (let i = 0; i < staticFileExts.length; i++) if (this && this.endsWith(staticFileExts[i])) return true; return false; };

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
    accessTokenFilter = require('./filter/accessToken'),
    hostRedirectionFilter = require('./filter/hostRedirection'),
    pathRedirectionFilter = require('./filter/pathRedirection'),
    resourceFilter = require('./filter/resource'),
    bucketFilter = require('./filter/bucket'),
    versionFilter= require('./filter/version'),
    stackFilter = require('./filter/stack');

// Routers
const
    internalStatsRouter = require('./router/internalStats'),
    pocRouter = require('./router/poc'),
    crawlerRouter = require('./router/crawler');

// Utils
const
    pipeUtil = require('./util/common/pipe');

// Express App
const app = express();

// Health check For Ecs
app.get('/health', (req, res, next) => res.status(200).send('Hi! Bye!'));

// Internal developers
app.use('/internal/stats', internalStatsRouter);

// Poc
if (stage === 'local' || stage === 'devo') app.use('/poc', pocRouter);

// Users
// trust proxy
app.enable('trust proxy');

// logging
app.use(morgan("short"));

// cookies
app.use(cookieParser());

// prerender
// app.use(require('prerender-node'));

// Disabling all post, patch and delete
app.post('*', (req, res, next) => res.status(400).json({message: 'Huh! Nice try!'}));
app.patch('*', (req, res, next) => res.status(400).json({message: 'Aww! That was cute!'}));
app.delete('*', (req, res, next) => res.status(400).json({message: 'Noooooooooooooooooo!'}));

// AccessToken Filter
app.use(accessTokenFilter);

// Redirection Filter(s)
app.use(hostRedirectionFilter);
app.use(pathRedirectionFilter);
app.use(resourceFilter);

// Crawlers
app.use(crawlerRouter);

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


// Pipe request to response
app.get('*', (req, res, next) => {

    // Logging
    console.log(`DEBUG :: ${decodeURIComponent(req.originalUrl)} :: ${req.headers['user-agent']} :: ${res.locals['access-token']} :: ${res.locals['bucket-id']} :: ${res.locals['total-growth-buckets']} :: ${res.locals['version']} :: ${res.locals['stack']}`);

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
