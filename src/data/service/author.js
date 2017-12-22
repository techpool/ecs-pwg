const httpUtil = require('./../../util/common/http');

const AuthorServiceUtil = function() {

	// Public Methods

	// Get Pratilipi meta-data by slug
	this.getBySlug = (host, slug) => {
		// localhost testing
		if (host.split(':')[0] === 'localhost') host = 'hindi-devo.ptlp.co';
		return httpUtil
			.get(`https://${host}/api/authors`, null, {slug: slug})
			.then((res) => res.body)
			.catch((err) => {
				console.error(`AUTHOR_CALL_FAILED :: getBySlug :: ${host} :: ${slug}`);
				throw err;
			})
		;
    };

    // Get Author meta-data by id
	this.getById = (host, id) => {
		// localhost testing
		if (host.split(':')[0] === 'localhost') host = 'hindi-devo.ptlp.co';
		return httpUtil
			.get(`https://${host}/api/author`, null, {authorId: id})
			.then((res) => res.body)
			.catch((err) => {
				console.error(`AUTHOR_CALL_FAILED :: getById :: ${host} :: ${id}`);
				throw err;
			})
		;
    };

};

module.exports = new AuthorServiceUtil();