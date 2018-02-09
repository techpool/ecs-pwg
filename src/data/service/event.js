const stageConfig = require('./../../config/stage');
const httpUtil = require('./../../util/common/http');

const EventServiceUtil = function() {

	// Public Methods

	// Get Event meta-data by slug
	this.getBySlug = (host, slug, accessToken) => {
		// localhost testing
		if (host.split(':')[0] === 'localhost') host = stageConfig.ECS_ENDPOINT.substr('https://'.length); host = host.substr(0, host.length - 4);
		return httpUtil
			.get(`https://${host}/api/events/v2.0`, {'AccessToken': accessToken}, {slug: slug})
			.then((res) => res.body)
			.catch((err) => {
				console.error(`EVENT_CALL_FAILED :: getBySlug :: ${host} :: ${slug}`);
				throw err;
			})
		;
    };

    // Get Event meta-data by id
	this.getById = (host, id, accessToken) => {
		// localhost testing
		if (host.split(':')[0] === 'localhost') host = stageConfig.ECS_ENDPOINT.substr('https://'.length); host = host.substr(0, host.length - 4);
		return httpUtil
			.get(`https://${host}/api/event`, {'AccessToken': accessToken}, {eventId: id})
			.then((res) => res.body)
			.catch((err) => {
				console.error(`EVENT_CALL_FAILED :: getById :: ${host} :: ${id}`);
				throw err;
			})
		;
    };

};

module.exports = new EventServiceUtil();
