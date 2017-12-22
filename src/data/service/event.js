const httpUtil = require('./../../util/common/http');

const EventServiceUtil = function() {

	// Public Methods

	// Get Event meta-data by slug
	this.getBySlug = (host, slug) => {
		// localhost testing
		if (host.split(':')[0] === 'localhost') host = 'hindi-devo.ptlp.co';
		return httpUtil
			.get(`https://${host}/api/events/v2.0`, null, {slug: slug})
			.then((res) => res.body)
			.catch((err) => {
				console.error(`EVENT_CALL_FAILED :: getBySlug :: ${host} :: ${slug}`);
				throw err;
			})
		;
    };

    // Get Event meta-data by id
	this.getById = (host, id) => {
		// localhost testing
		if (host.split(':')[0] === 'localhost') host = 'hindi-devo.ptlp.co';
		return httpUtil
			.get(`https://${host}/api/event`, null, {eventId: id})
			.then((res) => res.body)
			.catch((err) => {
				console.error(`EVENT_CALL_FAILED :: getById :: ${host} :: ${id}`);
				throw err;
			})
		;
    };

};

module.exports = new EventServiceUtil();
