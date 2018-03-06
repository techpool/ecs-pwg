const
	express = require('express'),
	router = express.Router();

const
    stage = process.env.STAGE || 'local',
    stageConfig = require('./../config/stage');

const
    pipeUtil = require('./../util/common/pipe');


// robots.txt, sitemap
router.get(['/sitemap', '/robots.txt'], (req, res, next) =>
	pipeUtil.pipe(req, res, {
		url: stageConfig.GCP_ENDPOINT + req.originalUrl,
		headers: { 'ECS-HostName': req.headers.host.split(':')[0] }
	})
);

// Crawlers - only for prod and gamma env
router.get('/*', (req, res, next) => {

    // Remove prod stage check
    if (stage !== 'prod')
        return next();

    const userAgent = req.get('User-Agent');
    let isCrawler = false;

    if (!userAgent) {
        // Do Nothing

    } else if (userAgent.contains("Googlebot")) { // Googlebot/2.1; || Googlebot-News || Googlebot-Image/1.0 || Googlebot-Video/1.0
        isCrawler = true;

    } else if (userAgent === "Google (+https://developers.google.com/+/web/snippet/)") { // Google+
        isCrawler = true;

    } else if (userAgent.contains("Bingbot")) { // Microsoft Bing
        isCrawler = true;

    } else if (userAgent.contains("Slurp")) { // Yahoo
        isCrawler = true;

    } else if (userAgent.contains("DuckDuckBot")) { // DuckDuckGo
        isCrawler = true;

    } else if (userAgent.contains("Baiduspider")) { // Baidu - China
        isCrawler = true;

    } else if (userAgent.contains("YandexBot")) { // Yandex - Russia
        isCrawler = true;

    } else if (userAgent.contains("Exabot")) { // ExaLead - France
        isCrawler = true;

    } else if (userAgent === "facebot" ||
        userAgent.startsWith("facebookexternalhit")) { // Facebook Scraping requests
        isCrawler = true;

    } else if (userAgent.startsWith("Twitterbot")) { // Twitter
        isCrawler = true;

    } else if (userAgent.startsWith("WhatsApp")) { // Whatsapp
        isCrawler = true;

    } else if (userAgent.startsWith("ia_archiver")) { // Alexa Crawler
        isCrawler = true;
    }

    if (isCrawler) {
        // Crawler logging
        console.log(`CRAWLER :: ${decodeURIComponent(req.originalUrl)} :: ${req.headers['user-agent']} :: ${res.locals['access-token']}`);
        return pipeUtil.pipeToMiniP(req, res, {
            headers: Object.assign(req.headers, {'Access-Token': res.locals["access-token"]})
        });
    }

    return next();

});

module.exports = router;
