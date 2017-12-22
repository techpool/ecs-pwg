const httpUtil = require('./../../util/common/http');

const PratilipiServiceUtil = function() {

	// Public Methods

	// Get Pratilipi meta-data by slug
	this.getBySlug = (host, slug) => {
		// localhost testing
		if (host.split(':')[0] === 'localhost') host = 'hindi-devo.ptlp.co';
		return httpUtil
			.get(`https://${host}/api/pratilipis`, null, {slug: slug})
			.then((res) => res.body)
			.catch((err) => {
				console.error(`PRATILIPI_CALL_FAILED :: getBySlug :: ${host} :: ${slug}`);
				throw err;
			})
		;
	};

	// Get Pratilipi meta-data by id
	this.getById = (host, id) => {
		// localhost testing
		if (host.split(':')[0] === 'localhost') host = 'hindi-devo.ptlp.co';
		return httpUtil
			.get(`https://${host}/api/pratilipi`, null, {pratilipiId: id})
			.then((res) => res.body)
			.catch((err) => {
				console.error(`PRATILIPI_CALL_FAILED :: getById :: ${host} :: ${id}`);
				throw err;
			})
		;
	};

};

module.exports = new PratilipiServiceUtil();
