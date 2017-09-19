module.exports = {
	local: {
		'SERVICE_PORT': 3000,
		'REDIS_NOTIFY_EVENTS': 'Ex',
		'REDIS_HOST': 'localhost',
		'REDIS_PORT': 6379,
		'REDIS_DB': 0,
		'PWG_LOAD_BALANCER': 'http://internal-ecs-lb-pwg-pvt-555364892.ap-southeast-1.elb.amazonaws.com'
	},
	devo: {
		'SERVICE_PORT': 80,
		'REDIS_NOTIFY_EVENTS': 'Ex',
		'REDIS_HOST': 'growth-ecs.e6ocw5.0001.apse1.cache.amazonaws.com',
		'REDIS_PORT': 8080,
		'REDIS_DB': 0,
		'PWG_LOAD_BALANCER': process.env.API_END_POINT
	},
	gamma: {
		'SERVICE_PORT': 80,
		'REDIS_NOTIFY_EVENTS': 'Ex',
		'REDIS_HOST': 'prod-ecs.cpzshl.ng.0001.apse1.cache.amazonaws.com',
		'REDIS_PORT': 8080,
		'REDIS_DB': 0,
		'PWG_LOAD_BALANCER': process.env.API_END_POINT
	},
	prod: {
		'SERVICE_PORT': 80,
		'REDIS_NOTIFY_EVENTS': 'Ex',
		'REDIS_HOST': 'prod-ecs.cpzshl.ng.0001.apse1.cache.amazonaws.com',
		'REDIS_PORT': 8080,
		'REDIS_DB': 0,
		'PWG_LOAD_BALANCER': process.env.API_END_POINT
	}
}