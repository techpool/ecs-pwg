const StageConfig = {
    local: {
		ECS_ENDPOINT: 'https://hindi-gamma.pratilipi.com/api',
		GCP_ENDPOINT: 'https://gae-gamma.pratilipi.com/api',
		REDIS: {
			NOTIFY: '*',
			HOST: 'localhost',
			PORT: 6379,
			DB: 0
		},
		PORT: 8080,
		DOMAIN: 'localhost'
	},
	devo: {
		ECS_ENDPOINT: process.env.API_END_POINT,
		GCP_ENDPOINT: 'https://devo-pratilipi.appspot.com/api',
		REDIS: {
			NOTIFY: 'Ex',
			HOST: 'devo-ecs.e6ocw5.0001.apse1.cache.amazonaws.com',
			PORT: 8080,
			DB: 10
		},
		PORT: 80,
		DOMAIN: '.ptlp.co'
	},
	gamma: {
		ECS_ENDPOINT: process.env.API_END_POINT,
		GCP_ENDPOINT: 'https://gae-gamma.pratilipi.com/api',
		REDIS: {
			NOTIFY: 'Ex',
			HOST: 'prod-ecs.cpzshl.ng.0001.apse1.cache.amazonaws.com',
			PORT: 8080,
			DB: 10
		},
		PORT: 80,
		DOMAIN: '.pratilipi.com'
	},
	prod: {
		ECS_ENDPOINT: process.env.API_END_POINT,
		GCP_ENDPOINT: 'https://gae-prod.pratilipi.com/api',
		REDIS: {
			NOTIFY: 'Ex',
			HOST: 'prod-ecs.cpzshl.ng.0001.apse1.cache.amazonaws.com',
			PORT: 8080,
			DB: 10
		},
		PORT: 80,
		DOMAIN: '.pratilipi.com'
	}
};

module.exports = StageConfig[`${process.env.STAGE || 'local'}`];
