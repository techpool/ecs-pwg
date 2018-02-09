const stageConfig = require('./../../config/stage');
const httpUtil = require('./../../util/common/http');

const _convert2V2 = (accessToken) => ({
	id: accessToken.accessToken,
	dateToExpire: accessToken.expiryMills
});

const UserServiceUtil = function() {

	// Public Methods

	// Validate the accessToken (or) get a new token
	// If given access token exists and not expired, it returns the same access token
	// else a new access token is created and returned.
	this.validateAccessToken = (host, accessToken, userAgent) => {
		// localhost testing
		if (host.split(':')[0] === 'localhost') host = stageConfig.ECS_ENDPOINT.substr('https://'.length); host = host.substr(0, host.length - 4);
		let headers = {};
		if (accessToken) {
			headers['Access-Token'] = accessToken;
			headers['AccessToken'] = accessToken; // PAG will figure out from this header
		}
		if (userAgent) headers['User-Agent'] = userAgent;
		return httpUtil
			.get(`https://${host}/api/user/accesstoken`, headers)
			.then((res) => res.body)
			.then(_convert2V2)
			.catch((err) => {
				console.error(`USER_CALL_FAILED :: validateAccessToken :: ${host} :: ${accessToken} :: ${userAgent}`);
				throw err;
			})
		;
	}
};

module.exports = new UserServiceUtil();
