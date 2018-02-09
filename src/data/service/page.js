const stageConfig = require('./../../config/stage');
const httpUtil = require('./../../util/common/http');

const PageServiceUtil = function() {

	// Public Methods

	// Get Page by path
	this.getPage = (host, path, accessToken) => {
		// localhost testing
		if (host.split(':')[0] === 'localhost') { host = stageConfig.ECS_ENDPOINT.substr('https://'.length); host = host.substr(0, host.length - 4); }
		return httpUtil
			.get(`https://${host}/api/page`, {'AccessToken': accessToken}, {uri: path})
			.then((res) => res.body)
			.catch((err) => {
				console.error(`PAGE_CALL_FAILED :: getPage :: ${host} :: ${path}`);
				throw err;
			})
		;
	}
};

module.exports = new PageServiceUtil();
