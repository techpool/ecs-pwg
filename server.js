const
	app = require('./src/app'),
	stageConfig = require('./src/config/stage');

app.listen(stageConfig.PORT, ()=> console.log(`Server running on port ${stageConfig.PORT}`));
