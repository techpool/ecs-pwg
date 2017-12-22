const
	stageConfig = require('./../../config/stage'),
	serviceConfig = require('./../../config/service'),
	httpUtil = require('./../../util/common/http');

const UserServiceUtil = function() {

	// Public Methods

	// Validate the accessToken (or) get a new token
	// If given access token exists and not expired, it returns the same access token
	// else a new access token is created and returned.
	this.validateAccessToken = (accessToken, userAgent) => {
		let headers = {};
		if (accessToken) headers['Access-Token'] = accessToken;
		if (userAgent) headers['User-Agent'] = userAgent;
		return httpUtil
			.get(
				`${stageConfig.ECS_ENDPOINT}${serviceConfig.USER.ENDPOINT}/access-tokens`,
				headers
			)
			.then((res) => res.body)
			.catch((err) => {
				console.error(`USER_CALL_FAILED :: validateAccessToken :: ${accessToken} :: ${userAgent}`);
				throw err;
			})
		;
	}
};

module.exports = new UserServiceUtil();
