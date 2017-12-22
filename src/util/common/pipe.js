const
    request = require('request');

const
    stageConfig = require('./../../config/stage');

const PipeUtil = function() {

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
        self.pipe(req, res, Object.assign({}, options, {'uri': req.originalUrl.replace(req.path, stageConfig.ECS_ENDPOINT + ':81')}));

    self.pipeToMiniP = (req, res, options) =>
        self.pipe(req, res, Object.assign({}, options, {'uri': req.originalUrl.replace(req.path, stageConfig.ECS_ENDPOINT + ':81')}));

    self.pipeToWebG = (req, res, options) =>
        self.pipe(req, res, Object.assign({}, options, {'uri': req.originalUrl.replace(req.path, stageConfig.ECS_ENDPOINT + ':8081')}));

    self.pipeToWebP = (req, res, options) =>
        self.pipe(req, res, Object.assign({}, options, {'uri': req.originalUrl.replace(req.path, stageConfig.ECS_ENDPOINT + ':8080')}));

};

module.exports = new PipeUtil();
