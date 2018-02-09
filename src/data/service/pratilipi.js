const stageConfig = require('./../../config/stage');
const httpUtil = require('./../../util/common/http');

const PratilipiServiceUtil = function() {

	// Public Methods

	// Get Pratilipi meta-data by slug
	this.getBySlug = (host, slug, accessToken) => {
		// localhost testing
		if (host.split(':')[0] === 'localhost') { host = stageConfig.ECS_ENDPOINT.substr('https://'.length); host = host.substr(0, host.length - 4); }
		return httpUtil
			.get(`https://${host}/api/pratilipis`, {'AccessToken': accessToken}, {slug: slug})
			.then((res) => res.body)
			.catch((err) => {
				console.error(`PRATILIPI_CALL_FAILED :: getBySlug :: ${host} :: ${slug}`);
				throw err;
			})
		;
	};

	// Get Pratilipi meta-data by id
	this.getById = (host, id, accessToken) => {
		// localhost testing
		if (host.split(':')[0] === 'localhost') { host = stageConfig.ECS_ENDPOINT.substr('https://'.length); host = host.substr(0, host.length - 4); }
		return httpUtil
			.get(`https://${host}/api/pratilipi`, {'AccessToken': accessToken}, {pratilipiId: id})
			.then((res) => res.body)
			.catch((err) => {
				console.error(`PRATILIPI_CALL_FAILED :: getById :: ${host} :: ${id}`);
				throw err;
			})
		;
	};

};

module.exports = new PratilipiServiceUtil();
