const
    hostConfig = require('./../config/host'),
    Version = require('./../enum/version');

const
	express = require('express'),
	router = express.Router();

// Figuring out the version: pwa / mini
router.use((req, res, next) => {

    const host = hostConfig[req.headers.host];

    // Default - PWA
    let version = Version.PWA;

    // Serving mini website
    if (host.VERSION === Version.MINI) {
        version = Version.MINI;

    // Other urls where PWA is not supported
    } else if (req.path === '/pratilipi-write' ||
        req.path === '/write' ||
        req.path.startsWith('/admin/') ||
        req.path === '/edit-event' ||
        req.path === '/edit-blog' ||
        req.url.contains('loadPWA=false')) {

            version = Version.MINI;

    }

    // static files
    const referer = req.header('Referer') || "";
    if (req.path.isStaticFileRequest() &&
        (referer.contains('/pratilipi-write') ||
            referer.contains('/write') ||
            referer.contains('/admin') ||
            referer.contains('/edit-event') ||
            referer.contains('/edit-blog') ||
            referer.contains('loadPWA=false'))) {

                version = Version.MINI;

    }

    res.locals["version"] = version;
    next();

});

module.exports = router;

