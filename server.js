const
	express = require('express'),
	request = require('request'),
	async = require('async'),
	morgan = require('morgan'),
	cookieParser = require('cookie-parser'),
	URL = require('url-parse'),
	queryString = require('query-string');

const
	pwgUtil = require('./lib/pwgUtil'),
	redisRouter = require('./router/redisRouter'),
	httpsFilter = require('./filter/httpsFilter'),
	gcpFilter = require('./filter/gcpFilter'),
	accessTokenFilter = require('./filter/accessTokenFilter');

const
	STAGE = process.env.STAGE || 'local',
	CONFIG = require('./config/main.js')[STAGE],
	TRAFFIC_CONFIG = require('./config/traffic_config');

const
	INSUFFICIENT_ACCESS_EXCEPTION = { "message": "Insufficient privilege for this action!" },
	UNEXPECTED_SERVER_EXCEPTION = { "message": "Some exception occurred at server. Please try again." };


// String prototypes
String.prototype.isStaticFileRequest = function () {
	let staticFileExts = [".html", ".css", ".js", ".ico", ".png", ".svg", ".jpg", ".jpeg", ".json"];
	for (let i = 0; i < staticFileExts.length; i++)
		if (this && this.split("?")[0].endsWith(staticFileExts[i])) return true;
	return false;
};

String.prototype.contains = function (str, startIndex) {
	return -1 !== String.prototype.indexOf.call(this, str, startIndex);
};


// Express App
const app = express();

// trust proxy
app.enable('trust proxy');

// logging
app.use(morgan("short"));

// cookies
app.use(cookieParser());

// Middleware -> Health check
app.get('/health', (req, res, next) => {
	console.log( "Healthy" );
	res.send( "PWG is healthy => " + Date.now() );
});

// Router
app.use('/stats/redis', redisRouter);

// Filter
app.use(httpsFilter);
app.use(gcpFilter);
app.use(accessTokenFilter);

// Redirection of users who has been previously served a version
app.use( (req, res, next) => {

	const accessToken = res.locals["access-token"];
	const hostName = req.headers.host;

	async.waterfall([
		(waterfallCallback) => {
			console.log("1");
			pwgUtil.getCurrentUserStatus(accessToken, hostName,
				(userDetailsParseError, fetchedBucketId) => {
					waterfallCallback(userDetailsParseError, fetchedBucketId);
			});
		},

		(fetchedBucketId, waterfallCallback) => {
			console.log("2");
			pwgUtil.updateExpiryOfAccessToken(accessToken, hostName,
				(updateError) => {
					waterfallCallback(updateError, fetchedBucketId);
			});
		},

		(fetchedBucketId, waterfallCallback) => {
			console.log("3");
			const trafficDetails = TRAFFIC_CONFIG[hostName];
			if (trafficDetails.GROWTH_PERCENTAGE && trafficDetails.GROWTH_PERCENTAGE > fetchedBucketId) {
				res.locals["redirection"] = "GROWTH";
			} else {
				res.locals["redirection"] = "PRODUCT";
			}
			waterfallCallback();
		},

	], (err, redirectLocation) => {
		console.log("4");
		next();
	});
});

// Middleware to handle new users whose access token has not been saved in redis
app.use( (req, res, next) => {

	if (res.locals && res.locals["redirection"]) {
		next();
		return;
	}

	const accessToken = res.locals["access-token"];
	const hostName = req.headers.host;

	async.waterfall([
		(waterfallCallback) => {
			pwgUtil.getBucketStatistics(hostName, (err, fetchedBucketDetails) => {
				if (err) {
					waterfallCallback(bucketDetailsFetchError);
					return;
				}
				waterfallCallback(null, fetchedBucketDetails);
			});
		},

		(fetchedBucketDetailsObj, waterfallCallback) => {
			const fetchedBucketDetails = Object
										.keys(fetchedBucketDetailsObj)
										.map((key) => Number(fetchedBucketDetailsObj[key]));

			const valueOfBucketWithMinimumUsers = Math.min.apply(null, fetchedBucketDetails);
			const indexOfBucketWithMinimumUsers = fetchedBucketDetails.indexOf(valueOfBucketWithMinimumUsers);

			pwgUtil.incrementBucketStatisticsValue(hostName, indexOfBucketWithMinimumUsers, accessToken,
				(bucketStatisticsUpdateError) => {
					if (bucketStatisticsUpdateError) {
						waterfallCallback(bucketStatisticsUpdateError);
					} else {
						waterfallCallback(null, indexOfBucketWithMinimumUsers);
					}
			});
		},

		(indexOfBucketWithMinimumUsers, waterfallCallback) => {
			pwgUtil.associateUserWithABucket(accessToken, hostName, indexOfBucketWithMinimumUsers,
				(userAssociationError) => {
					if (userAssociationError) {
						waterfallCallback(userAssociationError);
					} else {
						waterfallCallback(null, indexOfBucketWithMinimumUsers);
					}
			});
		},

		(indexOfBucketWithMinimumUsers, waterfallCallback) => {
			const bucketId = indexOfBucketWithMinimumUsers + 1;
			const trafficDetails = TRAFFIC_CONFIG[hostName];
			if (trafficDetails.GROWTH_PERCENTAGE && trafficDetails.GROWTH_PERCENTAGE >= bucketId) {
				res.locals["redirection"] = "GROWTH";
			} else {
				res.locals["redirection"] = "PRODUCT";
			}
			waterfallCallback();
		}
	], (err, redirectLocation) => {
		if (err) {
			console.error("ASSOCIATE_USER_ERROR", err);
			res.status(500).json(UNEXPECTED_SERVER_EXCEPTION);
			return;
		}
		next();
	});
});

app.get('*', (req, res, next) => {
	res.send(res.locals["redirection"]);
});

// Start server
app.listen(CONFIG.SERVICE_PORT, (err) => {
	if (err) {
		console.error( "Error running on port: " + CONFIG.SERVICE_PORT );
		return;
	}
	console.log( "Server running on port: " + CONFIG.SERVICE_PORT );
});
