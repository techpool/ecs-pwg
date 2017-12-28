const
	stageConfig = require('./src/config/stage');

const
	pwgUtil = require('./src/util/data/pwg');

// Subscribing to redis pubsub events
const pubsub = require('./src/util/common/redis')['pubsub'];
pubsub.psubscribe(stageConfig.REDIS.NOTIFY);

pubsub.on('pmessage', (pattern, channel, message) => {
	if (channel === `__keyevent@${stageConfig.REDIS.DB}__:expired`) {
		console.log(`INFO :: REDIS_EXPIRED :: ${message}`);
		let x = message.split('|');
		if (x[0] === 'shadow') {
			const key = 'key' + message.substr('shadow'.length);
			pwgUtil.deleteBucketAllocation(key)
				.then(() => console.log(`INFO :: WORKER :: DELETE :: ${key}`))
				.catch(() => console.error(`ERROR :: WORKER :: DELETE :: ${key}`))
			;
		}
	}
});

pubsub.on('psubscribe', (e) => console.log(`Redis pubsub has subscribed successfully to event: ${e}`));

console.log('PWG worker started...');
console.log('Thi service is responsible for cleaning up the expired access tokens, which are assigned to buckets!');
