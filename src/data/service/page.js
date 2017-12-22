const httpUtil = require('./../../util/common/http');

const PageServiceUtil = function() {

	// Public Methods

	// Get Page by path
	this.getPage = (host, path) => {
		// localhost testing
		if (host.split(':')[0] === 'localhost') host = 'hindi-devo.ptlp.co';
		return httpUtil
			.get(`https://${host}/api/page`, null, {uri: path})
			.then((res) => res.body)
			.catch((err) => {
				console.error(`PAGE_CALL_FAILED :: getPage :: ${host} :: ${path}`);
				throw err;
			})
		;
	}
};

module.exports = new PageServiceUtil();
