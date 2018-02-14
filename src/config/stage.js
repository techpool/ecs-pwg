const StageConfig = {
    local: {
		ECS_ENDPOINT: 'https://tamil-gamma.pratilipi.com/api',
		GCP_ENDPOINT: 'https://devo-pratilipi.appspot.com',
		REDIS: {
			HOST: 'localhost',
			PORT: 6379,
			DB: 0
		},
		PORT: 8080,
		DOMAIN: 'localhost'
	},
	devo: {
		ECS_ENDPOINT: process.env.API_ENDPOINT || process.env.API_END_POINT,
		GCP_ENDPOINT: 'https://devo-pratilipi.appspot.com',
		REDIS: {
			HOST: process.env.MASTER_REDIS_ENDPOINT || 'devo-ecs.e6ocw5.0001.apse1.cache.amazonaws.com',
			PORT: process.env.MASTER_REDIS_ENDPOINT ? 6379 : 8080,
			DB: 10
		},
		PORT: process.env.SERVICE_PORT,
		DOMAIN: '.ptlp.co'
	},
	gamma: {
		ECS_ENDPOINT: process.env.API_ENDPOINT || process.env.API_END_POINT,
		GCP_ENDPOINT: 'https://gae-gamma.pratilipi.com',
		REDIS: {
			HOST: process.env.MASTER_REDIS_ENDPOINT || 'prod-ecs.cpzshl.ng.0001.apse1.cache.amazonaws.com',
			PORT: process.env.MASTER_REDIS_ENDPOINT ? 6379 : 8080,
			DB: 10
		},
		PORT: process.env.SERVICE_PORT,
		DOMAIN: '.pratilipi.com'
	},
	prod: {
		ECS_ENDPOINT: process.env.API_ENDPOINT || process.env.API_END_POINT,
		GCP_ENDPOINT: 'https://gae-prod.pratilipi.com',
		REDIS: {
			HOST: process.env.MASTER_REDIS_ENDPOINT || 'prod-ecs.cpzshl.ng.0001.apse1.cache.amazonaws.com',
			PORT: process.env.MASTER_REDIS_ENDPOINT ? 6379 : 8080,
			DB: 10
		},
		PORT: process.env.SERVICE_PORT,
		DOMAIN: '.pratilipi.com'
	}
};

module.exports = StageConfig[`${process.env.STAGE || 'local'}`];
