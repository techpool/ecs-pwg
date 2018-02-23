const _getEcsEndPoint = (apiEndpoint) => {
	// local testing
	if (apiEndpoint === undefined)
		return 'localhost';
	// http:// protocol missing
	if (! apiEndpoint.startsWith('http://'))
		apiEndpoint = 'http://' + apiEndpoint;
	// Removing port number
	if (apiEndpoint.split(':').length === 3)
		apiEndpoint = apiEndpoint.split(':').slice(0, -1).join(':');
	return apiEndpoint;
};

const StageConfig = {
    local: {
		ECS_ENDPOINT: 'https://tamil-gamma.pratilipi.com/api',
		GROWTH_ECS_ENDPOINT: 'https://tamil-gamma.pratilipi.com/api',
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
		ECS_ENDPOINT: _getEcsEndPoint(process.env.API_ENDPOINT || process.env.API_END_POINT),
		GROWTH_ECS_ENDPOINT: 'http://internal-growth-1365734759.ap-south-1.elb.amazonaws.com',
		GCP_ENDPOINT: 'https://devo-pratilipi.appspot.com',
		REDIS: {
			HOST: process.env.MASTER_REDIS_ENDPOINT,
			PORT: process.env.MASTER_REDIS_PORT,
			DB: process.env.MASTER_REDIS_DB
		},
		PORT: process.env.SERVICE_PORT,
		DOMAIN: '.ptlp.co'
	},
	gamma: {
		ECS_ENDPOINT: _getEcsEndPoint(process.env.API_ENDPOINT || process.env.API_END_POINT),
		GROWTH_ECS_ENDPOINT: _getEcsEndPoint(process.env.API_ENDPOINT || process.env.API_END_POINT),
		GCP_ENDPOINT: 'https://gae-gamma.pratilipi.com',
		REDIS: {
			HOST: process.env.MASTER_REDIS_ENDPOINT,
			PORT: process.env.MASTER_REDIS_PORT,
			DB: process.env.MASTER_REDIS_DB
		},
		PORT: process.env.SERVICE_PORT,
		DOMAIN: '.pratilipi.com'
	},
	prod: {
		ECS_ENDPOINT: _getEcsEndPoint(process.env.API_ENDPOINT || process.env.API_END_POINT),
		GROWTH_ECS_ENDPOINT: _getEcsEndPoint(process.env.API_ENDPOINT || process.env.API_END_POINT),
		GCP_ENDPOINT: 'https://gae-prod.pratilipi.com',
		REDIS: {
			HOST: process.env.MASTER_REDIS_ENDPOINT,
			PORT: process.env.MASTER_REDIS_PORT,
			DB: process.env.MASTER_REDIS_DB
		},
		PORT: process.env.SERVICE_PORT,
		DOMAIN: '.pratilipi.com'
	}
};

module.exports = StageConfig[`${process.env.STAGE || 'local'}`];
