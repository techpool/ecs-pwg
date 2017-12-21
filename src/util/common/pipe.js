const
    request = require('request');

const
    stageConfig = require('./../../config/stage');

const PipeUtil = function() {

    const self = this;

    self.pipe = (req, res, options) =>
        req.pipe(request({
            uri: options.uri || options.url || stageConfig.ECS_ENDPOINT,
            method: options.method || req.method,
            qs: options.qs || options.query || req.query || {},
            headers: options.headers || req.headers || {},
            followAllRedirects: false,
            followRedirect: false,
            jar: true
        }))
        .on('response', (response) => {
            console.log(`PIPE :: ${port} :: ${response.statusCode} :: ${JSON.stringify(response.headers)}`);
            res.writeHead(response.statusCode, response.headers);
        })
        .pipe(res);

    self.pipeToMini = (req, res, options) =>
        self.pipe(req, res, Object.assign({}, options, {'uri': stageConfig.ECS_ENDPOINT + ':81'}));

    self.pipeToWebG = (req, res, options) =>
        self.pipe(req, res, Object.assign({}, options, {'uri': stageConfig.ECS_ENDPOINT + ':8081'}));

    self.pipeToWebP = (req, res, options) =>
        self.pipe(req, res, Object.assign({}, options, {'uri': stageConfig.ECS_ENDPOINT + ':8080'}));

};

module.exports = new PipeUtil();
