const
	http = require('http'),
	stageConfig = require('./src/config/stage');

http.createServer((req, res) => {
	res.write('Hello World!');
	res.end();
}).listen(stageConfig.PORT);
