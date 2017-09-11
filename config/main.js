module.exports = {
	local: {
		'SERVICE_PORT': 3000,
		'REDIS_NOTIFY_EVENTS': 'Ex',
		'REDIS_HOST': 'localhost',
		'REDIS_PORT': 6379,
		'PWG_LOAD_BALANCER': 'http://internal-ecs-lb-pwg-pvt-555364892.ap-southeast-1.elb.amazonaws.com'
	},
	devo: {
		'SERVICE_PORT': 80,
		'REDIS_NOTIFY_EVENTS': 'Ex',
		'REDIS_HOST': 'growth-ecs.e6ocw5.0001.apse1.cache.amazonaws.com',
		'REDIS_PORT': 8080,
		'PWG_LOAD_BALANCER': 'http://internal-ecs-lb-pwg-pvt-555364892.ap-southeast-1.elb.amazonaws.com'
	},
	gamma: {
		'SERVICE_PORT': 80,
		'REDIS_NOTIFY_EVENTS': 'Ex',
		'REDIS_HOST': 'ecs-growth.cpzshl.0001.apse1.cache.amazonaws.com',
		'REDIS_PORT': 8080,
		'PWG_LOAD_BALANCER': 'http://internal-ecs-lb-pwg-pvt-555364892.ap-southeast-1.elb.amazonaws.com'
	},
	prod: {
		'SERVICE_PORT': 80,
		'REDIS_NOTIFY_EVENTS': 'Ex',
		'REDIS_HOST': 'ecs-growth.cpzshl.0001.apse1.cache.amazonaws.com',
		'REDIS_PORT': 8080,
		'PWG_LOAD_BALANCER': 'http://internal-ecs-lb-pwg-pvt-555364892.ap-southeast-1.elb.amazonaws.com'
	}
}