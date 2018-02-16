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
		ECS_ENDPOINT: process.env.API_ENDPOINT ? process.env.API_ENDPOINT.split(':')[0] : process.env.API_END_POINT.split(':')[0],
		GCP_ENDPOINT: 'https://devo-pratilipi.appspot.com',
		REDIS: {
			HOST: process.env.MASTER_REDIS_ENDPOINT,
			PORT: process.env.MASTER_REDIS_ENDPOINT,
			DB: 10
		},
		PORT: process.env.SERVICE_PORT,
		DOMAIN: '.ptlp.co'
	},
	gamma: {
		ECS_ENDPOINT: process.env.API_ENDPOINT ? process.env.API_ENDPOINT.split(':')[0] : process.env.API_END_POINT.split(':')[0],
		GCP_ENDPOINT: 'https://gae-gamma.pratilipi.com',
		REDIS: {
			HOST: process.env.MASTER_REDIS_ENDPOINT,
			PORT: process.env.MASTER_REDIS_PORT,
			DB: 10
		},
		PORT: process.env.SERVICE_PORT,
		DOMAIN: '.pratilipi.com'
	},
	prod: {
		ECS_ENDPOINT: process.env.API_ENDPOINT ? process.env.API_ENDPOINT.split(':')[0] : process.env.API_END_POINT.split(':')[0],
		GCP_ENDPOINT: 'https://gae-prod.pratilipi.com',
		REDIS: {
			HOST: process.env.MASTER_REDIS_ENDPOINT,
			PORT: process.env.MASTER_REDIS_ENDPOINT,
			DB: 10
		},
		PORT: process.env.SERVICE_PORT,
		DOMAIN: '.pratilipi.com'
	}
};

module.exports = StageConfig[`${process.env.STAGE || 'local'}`];
