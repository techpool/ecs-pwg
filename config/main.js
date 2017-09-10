module.exports = {
	local: {
		'SERVICE_PORT': 3000,
		'REDIS_NOTIFY_EVENTS': 'Ex',
		'REDIS_HOST': 'localhost',
		'REDIS_PORT': 6379
	},
	devo: {
		'SERVICE_PORT': 80,
		'REDIS_NOTIFY_EVENTS': 'Ex',
		'REDIS_HOST': 'ecs-growth.cpzshl.0001.apse1.cache.amazonaws.com',
		'REDIS_PORT': 8080,
	},
	gamma: {
		'SERVICE_PORT': 80,
		'REDIS_NOTIFY_EVENTS': 'Ex',
		'REDIS_HOST': 'ecs-growth.cpzshl.0001.apse1.cache.amazonaws.com',
		'REDIS_PORT': 8080,
	},
	prod: {
		'SERVICE_PORT': 80,
		'REDIS_NOTIFY_EVENTS': 'Ex',
		'REDIS_HOST': 'ecs-growth.cpzshl.0001.apse1.cache.amazonaws.com',
		'REDIS_PORT': 8080,
	}
}