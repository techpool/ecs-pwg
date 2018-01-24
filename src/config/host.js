const 
    Version = require('./../enum/version'),
    stageConfig = require('./stage');

const HostConfig = {

    // production - chrome
    "www.pratilipi.com": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "hindi.pratilipi.com": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "gujarati.pratilipi.com": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "bengali.pratilipi.com": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "marathi.pratilipi.com": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "tamil.pratilipi.com": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "telugu.pratilipi.com": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "kannada.pratilipi.com": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "malayalam.pratilipi.com": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },


    // production - uc mini
    "m.pratilipi.com": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "hi.pratilipi.com": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "gu.pratilipi.com": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "bn.pratilipi.com": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "mr.pratilipi.com": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "ta.pratilipi.com": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "te.pratilipi.com": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "kn.pratilipi.com": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "ml.pratilipi.com": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },


    // gamma - product - chrome
    "www-gamma.pratilipi.com": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "hindi-gamma.pratilipi.com": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "gujarati-gamma.pratilipi.com": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "bengali-gamma.pratilipi.com": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "marathi-gamma.pratilipi.com": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "tamil-gamma.pratilipi.com": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "telugu-gamma.pratilipi.com": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "kannada-gamma.pratilipi.com": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "malayalam-gamma.pratilipi.com": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },


    // gamma - product - uc mini
    "m-gamma.pratilipi.com": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "hi-gamma.pratilipi.com": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "gu-gamma.pratilipi.com": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "bn-gamma.pratilipi.com": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "mr-gamma.pratilipi.com": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "ta-gamma.pratilipi.com": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "te-gamma.pratilipi.com": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "kn-gamma.pratilipi.com": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "ml-gamma.pratilipi.com": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },


    // gamma - growth - chrome
    "hindi-gamma-gr.pratilipi.com": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "gujarati-gamma-gr.pratilipi.com": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "bengali-gamma-gr.pratilipi.com": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "marathi-gamma-gr.pratilipi.com": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "tamil-gamma-gr.pratilipi.com": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "telugu-gamma-gr.pratilipi.com": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "kannada-gamma-gr.pratilipi.com": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "malayalam-gamma-gr.pratilipi.com": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },


    // devo - product - chrome
    "www-devo.ptlp.co": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "hindi-devo.ptlp.co": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "gujarati-devo.ptlp.co": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "bengali-devo.ptlp.co": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },
    
    "marathi-devo.ptlp.co": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "tamil-devo.ptlp.co": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "telugu-devo.ptlp.co": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "kannada-devo.ptlp.co": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "malayalam-devo.ptlp.co": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },



    // devo - product - uc mini
    "m-devo.ptlp.co": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "hi-devo.ptlp.co": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "gu-devo.ptlp.co": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "bn-devo.ptlp.co": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "mr-devo.ptlp.co": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },
    
    "ta-devo.ptlp.co": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "te-devo.ptlp.co": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "kn-devo.ptlp.co": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "ml-devo.ptlp.co": {
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },



    // devo - growth - chrome
    "hindi-devo-gr.ptlp.co": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 1
        }
    },

    "gujarati-devo-gr.ptlp.co": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 1
        }
    },

    "bengali-devo-gr.ptlp.co": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 1
        }
    },

    "marathi-devo-gr.ptlp.co": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 1
        }
    },

    "tamil-devo-gr.ptlp.co": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 1
        }
    },

    "telugu-devo-gr.ptlp.co": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 1
        }
    },

    "kannada-devo-gr.ptlp.co": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "malayalam-devo-gr.ptlp.co": {
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 1
        }
    },


    // local testing
    [`localhost:${stageConfig.PORT}`]: {
        VERSION: Version.PWA,
        TTL_DAYS: 1,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    }

}

module.exports = HostConfig;
