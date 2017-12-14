module.exports = {
	local: {
		'SERVICE_PORT': 8080,
		'REDIS_NOTIFY_EVENTS': 'Ex',
		'REDIS_HOST': 'localhost',
		'REDIS_PORT': 6379,
		'REDIS_DB': 0,
		'PWG_LOAD_BALANCER': 'http://localhost:8080'
	},
	devo: {
		'SERVICE_PORT': 80,
		'REDIS_NOTIFY_EVENTS': 'Ex',
		'REDIS_HOST': 'devo-ecs.e6ocw5.0001.apse1.cache.amazonaws.com',
		'REDIS_PORT': 8080,
		'REDIS_DB': 10,
		'PWG_LOAD_BALANCER': process.env.API_END_POINT
	},
	gamma: {
		'SERVICE_PORT': 80,
		'REDIS_NOTIFY_EVENTS': 'Ex',
		'REDIS_HOST': 'prod-ecs.cpzshl.ng.0001.apse1.cache.amazonaws.com',
		'REDIS_PORT': 8080,
		'REDIS_DB': 10,
		'PWG_LOAD_BALANCER': process.env.API_END_POINT
	},
	prod: {
		'SERVICE_PORT': 80,
		'REDIS_NOTIFY_EVENTS': 'Ex',
		'REDIS_HOST': 'prod-ecs.cpzshl.ng.0001.apse1.cache.amazonaws.com',
		'REDIS_PORT': 8080,
		'REDIS_DB': 10,
		'PWG_LOAD_BALANCER': process.env.API_END_POINT
	}
}
