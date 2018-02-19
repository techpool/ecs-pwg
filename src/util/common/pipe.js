const
    request = require('request');

const
    stageConfig = require('./../../config/stage');

const PipeUtil = function() {

    /*
        10xx => devo
        80xx => gamma
        00xx => prod

        xx80 => PAG
        xx81 => Mini Product
        xx82 => Mini Growth
        xx83 => Web Product
        xx84 => Web Growth
    */

    const SERVICE = {
        MINI_G: {
            NAME: 'MINI_G',
            PORT: '82'
        },
        MINI_P: {
            NAME: 'MINI_P',
            PORT: '81'
        },
        WEB_G: {
            NAME: 'WEB_G',
            PORT: '84'
        },
        WEB_P: {
            NAME: 'WEB_P',
            PORT: '83'
        }
    };

    const _getPort = (service, stage=`${process.env.STAGE || 'local'}`) => {
        switch (stage) {
            case 'devo': return '10' + service.PORT;
            case 'gamma': return '80' + service.PORT;
            case 'prod': return '' + service.PORT;
            default: return '80' + service.PORT;
        };
    };

    const self = this;

    self.pipe = (req, res, options) => {

        const 
            uri = options.uri || options.url || stageConfig.ECS_ENDPOINT,
            method = options.method || req.method,
            qs = options.query || req.query || {},
            headers = options.headers || req.headers || {};

        // Debugging
        console.log(`PIPE_REQUEST :: ${uri} :: ${method} :: ${JSON.stringify(qs)} :: ${JSON.stringify(headers)}`);

        return req.pipe(request({
            uri: uri,
            method: method,
            qs: qs,
            headers: headers,
            followAllRedirects: false,
            followRedirect: false,
            jar: true
        }))
        .on('response', (response) => {
            console.log(`PIPE_RESPONSE :: ${uri} :: ${method} :: ${response.statusCode} :: ${JSON.stringify(response.headers)}`);
            res.writeHead(response.statusCode, response.headers);
        })
        .pipe(res);

    };


    self.pipeToMiniG = (req, res, options) =>
        self.pipe(req, res, Object.assign({}, options, {'uri': stageConfig.ECS_ENDPOINT + ':' + _getPort(SERVICE.MINI_G) + req.originalUrl}));

    self.pipeToMiniP = (req, res, options) =>
        self.pipe(req, res, Object.assign({}, options, {'uri': stageConfig.ECS_ENDPOINT + ':' + _getPort(SERVICE.MINI_P)+ req.originalUrl}));

    self.pipeToWebG = (req, res, options) =>
        self.pipe(req, res, Object.assign({}, options, {'uri': stageConfig.ECS_ENDPOINT + ':' + _getPort(SERVICE.WEB_G) + req.originalUrl}));

    self.pipeToWebP = (req, res, options) =>
        self.pipe(req, res, Object.assign({}, options, {'uri': stageConfig.ECS_ENDPOINT + ':' + _getPort(SERVICE.WEB_P) + req.originalUrl}));

};

module.exports = new PipeUtil();
