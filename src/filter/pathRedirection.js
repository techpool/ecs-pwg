const
	express = require('express'),
	router = express.Router(),
	wrap = require('co-express'),
	qs = require('querystring');

const
	dataAccessor = require('./../data/dataAccessor');


const
	_getSlugFromPath = (path) => path.split('/').pop().split('-').pop(),
	_isPathEqualSlug = (path, slug) => decodeURIComponent(path) === slug;


// Removal of trailing slash
router.use((req, res, next) => {
	if (req.path !== '/' && req.originalUrl.endsWith('/'))
		return res.redirect(301, (req.secure ? 'https://' : 'http://') + req.headers.host + req.originalUrl.slice(0, -1));
	return next();
});


// Basic Redirections
router.use((req, res, next) => {
	let redirections = {};
	redirections['/theme.pratilipi/logo.png'] = '/logo.png';
	redirections['/apple-touch-icon.png'] = '/favicon.ico';
	redirections['/apple-touch-icon-120x120.png'] = '/favicon.ico';
	redirections['/apple-touch-icon-precomposed.png'] = '/favicon.ico';
	redirections['/apple-touch-icon-120x120-precomposed.png'] = '/favicon.ico';
	redirections['/about'] = '/about/pratilipi';
	redirections['/career'] = '/work-with-us';
	redirections['/authors'] = '/admin/authors';
	redirections['/email-templates'] = '/admin/email-templates';
	redirections['/batch-process'] = '/admin/batch-process';
	redirections['/resetpassword'] = '/forgot-password';
	redirections['/api.pratilipi/pratilipi/resource'] = '/api/pratilipi/content/image';
	redirections['/events'] = '/event';

	if (redirections[req.path])
		return res.redirect(301, (req.secure ? 'https://' : 'http://') + req.headers.host + req.originalUrl.replace(req.path, redirections[req.path]));

	return next();
});



//// Slug Redirections

// Skip for static file requests
router.use((req, res, next) => {
	if (req.path.isStaticFileRequest())
		return next('router');
	next();
});

// Author Slug redirection
router.use(wrap(function *(req, res, next) {
	if (req.path.startsWith('/user/') && req.path.count('/') === 2) {
		const author = yield dataAccessor.getAuthorBySlug(req.headers.host, _getSlugFromPath(req.path)).catch(() => null);
		if (author && author.slug) {
			if (_isPathEqualSlug(req.path, author.slug))
				return next('router'); // valid path
			return res.redirect(301, (req.secure ? 'https://' : 'http://') + req.headers.host + req.originalUrl.replace(req.path, author.slug));
		}
	}
	next();
}));

// Pratilipi Slug Redirections
router.use(wrap(function *(req, res, next) {
	if (req.path.startsWith('/story/') && req.path.count('/') === 2) {
		const pratilipi = yield dataAccessor.getPratilipiBySlug(req.headers.host, _getSlugFromPath(req.path)).catch(() => null);
		if (pratilipi && pratilipi.pageUrl) {
			if (_isPathEqualSlug(req.path, pratilipi.pageUrl))
				return next('router'); // valid path
			return res.redirect(301, (req.secure ? 'https://' : 'http://') + req.headers.host + req.originalUrl.replace(req.path, pratilipi.pageUrl));
		}
	}
	next();
}));

// Event Slug Redirections
router.use(wrap(function *(req, res, next) {
	if (req.path.startsWith('/event/') && req.path.count('/') === 2) {
		const event = yield dataAccessor.getEventBySlug(req.headers.host, _getSlugFromPath(req.path)).catch(() => null);
		if (event && event.slug) {
			if (_isPathEqualSlug(req.path, event.slug))
				return next('router'); // valid path
			return res.redirect(301, (req.secure ? 'https://' : 'http://') + req.headers.host + req.originalUrl.replace(req.path, event.slug));
		}
	}
	next();
}));

//// Page Redirections
router.use(wrap(function *(req, res, next) {
	const hardcodedUrlList = [
		'/',
		'/read',
		'/write',
		'/pratilipi-write',
		'/navigation',
		'/library',
		'/notifications',
		'/search',
		'/event',
		'/followers',
		'/following',
		'/updatepassword',
		'/share',
		'/account',
		'/register',
		'/login',
		'/forgot-password',
		'/admin',
		'/admin/authors',
		'/admin/batch-process',
		'/admin/email-templates',
		'/admin/translations',
		'/edit-event',
		'/edit-blog',
		'/sitemap',
		'/pratilipi-2016',
		'/books',
		'/stories',
		'/poems',
		'/articles',
		'/magazines',
		'/short-stories',
		'/poetry',
		'/non-fiction'
	];

	if (hardcodedUrlList.indexOf(req.path) >= 0)
		return next('router');

	// Backward compatibility - hit page service
	const page = yield dataAccessor.getPage(req.headers.host, req.path).catch(() => null);

	if (page == null)
		return next('router');

	// If got response, with type, PRATILIPI, AUTHOR, , -> Hit services metadata with id and redirect to slug
	let resource, slug;
	switch (page.pageType) {
		case 'PRATILIPI':
			resource = yield dataAccessor.getPratilipiById(req.headers.host, page.primaryContentId).catch(() => null);
			slug = resource && resource.pageUrl;
			break;
		case 'AUTHOR':
			resource = yield dataAccessor.getAuthorById(req.headers.host, page.primaryContentId).catch(() => null);
			slug = resource && resource.slug;
			break;
		case 'EVENT':
			resource = yield dataAccessor.getEventById(req.headers.host, page.primaryContentId).catch(() => null);
			slug = resource && resource.pageUrl;
			break;
	}

	if (slug)
		return res.redirect(301, (req.secure ? 'https://' : 'http://') + req.headers.host + req.originalUrl.replace(req.path, slug));

	next();

}));


module.exports = router;
