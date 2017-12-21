// Library imports
const
    express = require('express'),
    morgan = require('morgan'),
	cookieParser = require('cookie-parser'),
	logger = require('morgan');

// Filter imports
const
    hostRedirectionFilter = require('./filter/hostRedirection'),
    pathRedirectionFilter = require('./filter/pathRedirection'),
    crawlerFilter = require('./filter/crawler'),
    internalStatsFilter = require('./filter/internalStats'),
    accessTokenFilter = require('./filter/accessToken'),
    forceRedirectionFilter = require('./filter/forceRedirection'),
    bucketFilter = require('./filter/bucket');


// Prototype declarations
String.prototype.contains = function (str, startIndex) { return -1 !== String.prototype.indexOf.call(this, str, startIndex) };
String.prototype.equalsIgnoreCase = function(str) { return this.toUpperCase() === str.toUpperCase() };
String.prototype.isStaticFileRequest = function () { const staticFileExts = [".html", ".css", ".js", ".ico", ".png", ".svg", ".jpg", ".jpeg", ".json"]; for (let i = 0; i < staticFileExts.length; i++) if (this && this.endsWith(staticFileExts[i])) return true; return false; };

// Express App
const app = express();

// Enable compression
// TODO: Implementation

// trust proxy
app.enable('trust proxy');

// logging
app.use(morgan("short"));

// cookies
app.use(cookieParser());

// Health check
app.get('/health', (req, res, next) => res.status(200).send('Hi! Bye!'));


// Redirection Filter(s)
app.use(hostRedirectionFilter); // Done
app.use(pathRedirectionFilter); // Done

// Crawler Filter
app.use(crawlerFilter); // Done

// Internal developers only
app.use('/internal/stats', internalStatsFilter); // Done

// AccessToken Filter
app.use(accessTokenFilter); // Done

// Force redirection
app.use(forceRedirectionFilter); // Done

// Bucket Filter - assign a bucket, be it mini or web
app.use(bucketFilter); // Done



// res.locals:
// access-token
// bucket-id
// version = pwa / mini
// stack = growth / product



// Figure out web or mini
// writer panel
// master website
// mini website
// referer
// admin
// edit-event
// edit-blog

// For all requests
// app.get('*', () => {
//     // Forward to prod-web, growth-web, prod-mini, growth-mini
//     // Headers:
//     // Access-Token, Bucket-Id, User-Agent
// });

module.exports = app;
