const
	express = require('express'),
	router = express.Router();

// Removal of trailing slash
router.use((req, res, next) => {
	if (req.path !== '/' && req.originalUrl.endsWith('/')) {
		const originalUrl = req.protocol + '://' + req.headers.host + req.originalUrl,
			  redirectUrl = (req.secure ? 'https://' : 'http://') + req.headers.host + req.originalUrl.slice(0, -1);
		console.log(`301_REDIRECT :: ${originalUrl} :: ${redirectUrl}`);
		return res.redirect(301, redirectUrl);
	}
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

	if (redirections[req.path]) {
		const originalUrl = req.protocol + '://' + req.headers.host + req.originalUrl,
			  redirectUrl = (req.secure ? 'https://' : 'http://') + req.headers.host + req.originalUrl.replace(req.path, redirections[req.path]);
		console.log(`301_REDIRECT :: ${originalUrl} :: ${redirectUrl}`);
		return res.redirect(301, redirectUrl);
	}

	return next();
});

module.exports = router;
