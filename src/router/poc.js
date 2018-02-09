const
    express = require('express'),
    router  = express.Router();

const httpUtil = require('./../util/common/http');

router.get('/poc1', (req, res, next) => {
	let len = req.query.len ? parseInt(req.query.len) : 1;
	if (len > 1000000) len = 1000000;
	let message = "";
	for(let i = 0; i < len; i++) message += "a";
	res.send(message);
});

router.get('/poc2', (req, res, next) => {
	httpUtil.get('https://android.pratilipi.com/init?language=HINDI').then((data) => res.json(data)).catch((err) => res.json({message: 'call failed.'}));
});

router.get('/poc3', (req, res, next) => {
	res.json({message: 'OK'});
});

router.get('/poc4', (req, res, next) => {
    // len
    let len = req.query.len ? parseInt(req.query.len) : 1;
    if (len > 1000000) len = 1000000;

    // message
    let message = "This is a sample log...";
    if (req.query.message) message = req.query.message;
    try {
        message = JSON.parse(decodeURIComponent(message));
    } catch(e) {
        // do nothing
        console.log('could not parse json');
    }

    // stringify
    let stringify = false;
    if (req.query.stringify === "true") stringify = true;
    if (stringify && typeof(message) === 'object') message = JSON.stringify(message);

    // time it
    let x = Date.now();
	for(let i = 0; i < len; i++) console.log(message);
	let y = Date.now();
	console.log(`Time taken to print ${len} logs = ${y-x} ms`);
    res.json({time: `${y-x} ms`, len: `${len}`});

});

module.exports = router;
