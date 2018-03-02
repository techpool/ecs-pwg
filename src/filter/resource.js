const
	express = require('express'),
	router = express.Router();

const
	dataAccessor = require('./../data/dataAccessor');

const 
    stage = process.env.STAGE || 'local',
    stageConfig = require('./../config/stage'),
    hostConfig = require('./../config/host');

const
	Language = require('./../enum/language'),
	Version = require('./../enum/version');

const
    _getSlugFromPath = (path) => path.split('/').pop().split('-').pop(),
	_isPathEqualSlug = (path, slug) => decodeURIComponent(path) === slug;
	
const
	_blockedMiniPratilipiIds = [6755373518739047];


// _getHostName('TAMIL', 'm.pratilipi.com') => ta.pratilipi.com
// _getHostName('TAMIL', 'hindi.pratilipi.com') => tamil.pratilipi.com
const _getHostName = (languageString, currentHost) => {

	if (stage === 'local')
		return `localhost:${stageConfig.PORT}`;

	let currPrefix;

	// First go through web domains
	const webDomainPrefix = Object.values(Language).map(lang => lang.WEB_PREFIX);
	currPrefix = webDomainPrefix.filter(prefix => currentHost.contains(prefix))[0];
	if (currPrefix) return currentHost.replace(currPrefix, Language[languageString].WEB_PREFIX);

	// Then, go through basic domains (ta is substring of tamil)
	const mobDomainPrefix = Object.values(Language).map(lang => lang.MOB_PREFIX);
	currPrefix = mobDomainPrefix.filter(prefix => currentHost.contains(prefix))[0];
	if (currPrefix) return currentHost.replace(currPrefix, Language[languageString].MOB_PREFIX);

	// Else return the currentHost
	return currentHost;

};


//// Slug Redirections

// Skip for static file requests
router.use((req, res, next) => {
	if (req.path.isStaticFileRequest())
		return next('router');
	next();
});

// Author Slug redirection
router.use(async(req, res, next) => {
	if (req.path.startsWith('/user/') && req.path.count('/') === 2) {
		const author = await dataAccessor.getAuthorBySlug(req.headers.host, _getSlugFromPath(req.path), res.locals['access-token']).catch(() => null);
		if (author && author.slug && author.language) {
			if (_isPathEqualSlug(req.path, author.slug) && hostConfig[req.headers.host].LANGUAGE.NAME === author.language)
				return next('router'); // valid path
			return res.redirect(301, (req.secure ? 'https://' : 'http://') + _getHostName(author.language, req.headers.host) + req.originalUrl.replace(req.path, author.slug));
		}
	}
	next();
});

// Pratilipi Slug Redirections
router.use(async(req, res, next) => {
	if (req.path.startsWith('/story/') && req.path.count('/') === 2) {

		const pratilipi = await dataAccessor.getPratilipiBySlug(req.headers.host, _getSlugFromPath(req.path), res.locals['access-token']).catch(() => null);

		// Block some contents only on mini
		if (pratilipi && 
			pratilipi.pratilipiId && 
			_blockedMiniPratilipiIds.includes(pratilipi.pratilipiId) &&
			hostConfig[req.headers.host].VERSION === Version.MINI) {

			return res.redirect(301, (req.secure ? 'https://' : 'http://') + req.headers.host + '/download-app');
		}

		// Redirecting to updated url
		if (pratilipi && pratilipi.pageUrl && pratilipi.language) {
			if (_isPathEqualSlug(req.path, pratilipi.pageUrl) && hostConfig[req.headers.host].LANGUAGE.NAME === pratilipi.language)
				return next('router'); // valid path
			return res.redirect(301, (req.secure ? 'https://' : 'http://') + _getHostName(pratilipi.language, req.headers.host) + req.originalUrl.replace(req.path, pratilipi.pageUrl));
		}

	}
	next();
});

// Reader Redirections
router.use(async(req, res, next) => {
	if (req.path === '/read' && req.query['id']) {

		const pratilipi = await dataAccessor.getPratilipiById(req.headers.host, req.query['id'], res.locals['access-token']).catch(() => null);

		// Block some contents only on mini
		if (pratilipi && 
			pratilipi.pratilipiId && 
			_blockedMiniPratilipiIds.includes(pratilipi.pratilipiId) &&
			hostConfig[req.headers.host].VERSION === Version.MINI) {

			return res.redirect(301, (req.secure ? 'https://' : 'http://') + req.headers.host + '/download-app');
		}

		// Redirecting to updated language
		if (pratilipi && pratilipi.language) {
			if (hostConfig[req.headers.host].LANGUAGE.NAME === pratilipi.language)
				return next('router'); // valid path
			return res.redirect(301, (req.secure ? 'https://' : 'http://') + _getHostName(pratilipi.language, req.headers.host) + req.originalUrl);
		}

	}
	next();
});

// Event Slug Redirections
router.use(async(req, res, next) => {
	if (req.path.startsWith('/event/') && req.path.count('/') === 2) {
		const event = await dataAccessor.getEventBySlug(req.headers.host, _getSlugFromPath(req.path), res.locals['access-token']).catch(() => null);
		if (event && event.slug && event.language) {
			if (_isPathEqualSlug(req.path, event.slug) && hostConfig[req.headers.host].LANGUAGE.NAME === event.language)
				return next('router'); // valid path
			return res.redirect(301, (req.secure ? 'https://' : 'http://') + _getHostName(event.language, req.headers.host) + req.originalUrl.replace(req.path, event.slug));
		}
	}
	next();
});



//// Page Redirections - From old url to slug urls
router.use(async(req, res, next) => {
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
	const page = await dataAccessor.getPage(req.headers.host, req.path, res.locals['access-token']).catch(() => null);

	if (page == null)
		return next('router');

	// If got response, with type, PRATILIPI, AUTHOR, , -> Hit services metadata with id and redirect to slug
	let language, slug;
	switch (page.pageType) {
		case 'PRATILIPI':
            const pratilipi = await dataAccessor.getPratilipiById(req.headers.host, page.primaryContentId, res.locals['access-token']).catch(() => null);
            language = pratilipi && pratilipi.language;
			slug = pratilipi && pratilipi.pageUrl;
			break;
		case 'AUTHOR':
            const author = await dataAccessor.getAuthorById(req.headers.host, page.primaryContentId, res.locals['access-token']).catch(() => null);
            language = author && author.language;
			slug = author && author.slug;
			break;
		case 'EVENT':
            const event = await dataAccessor.getEventById(req.headers.host, page.primaryContentId, res.locals['access-token']).catch(() => null);
            language = event && event.language;
			slug = event && event.pageUrl;
			break;
	}

	if (language && slug)
		return res.redirect(301, (req.secure ? 'https://' : 'http://') + _getHostName(language, req.headers.host) + req.originalUrl.replace(req.path, slug));

	next();

});

module.exports = router;
