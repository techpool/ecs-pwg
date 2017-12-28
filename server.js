const
	app = require('./src/app'),
	stageConfig = require('./src/config/stage');

app.listen(stageConfig.PORT, ()=> console.log(`Server running on port ${stageConfig.PORT}`));


// Subscribing to redis pubsub events
const pubsub = require('./src/util/common/redis')['pubsub'];
pubsub.psubscribe(stageConfig.REDIS.NOTIFY);

pubsub.on('pmessage', (pattern, channel, message) => {
	console.log('----pmessage----')
	console.log(`pattern: ${pattern}`)
	console.log(`channel: ${channel}`)
	console.log(`message: ${message}`)
	console.log('----pmessage----')
});

pubsub.on('psubscribe', (e) => console.log(`Redis pubsub has subscribed successfully to event: ${e}`));
