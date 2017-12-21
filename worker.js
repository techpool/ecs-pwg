const
	stageConfig = require('./src/config/stage');

const
	dataAccessor = require('./src/data/dataAccessor');

// Subscribing to redis pubsub events
const pubsub = require('./src/util/common/redis')['pubsub'];
pubsub.psubscribe(stageConfig.REDIS.NOTIFY);

pubsub.on('pmessage', (pattern, channel, message) => {
	if (channel === `__keyevent@${stageConfig.REDIS.DB}__:expired`) {
		// TODO: Implementation
	}
});

pubsub.on('psubscribe', (e) => console.log( `Redis pubsub has subscribed successfully to event: ${e}` ));
