const
	app = require('./src/app'),
	stageConfig = require('./src/config/stage');

(async function () {
	try {

		// Listen to port
		app.listen(stageConfig.PORT, ()=> console.log(`Server running on port ${stageConfig.PORT}`));

	} catch(error) {
		console.log('Error', error);
		process.exit(1);
	}

})();
