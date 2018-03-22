const
    Language = require('./../enum/language');

const 
    Version = require('./../enum/version'),
    stageConfig = require('./stage');

const HostConfig = {

    // production - chrome
    "www.pratilipi.com": {
        LANGUAGE: Language.ENGLISH,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "hindi.pratilipi.com": {
        LANGUAGE: Language.HINDI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "gujarati.pratilipi.com": {
        LANGUAGE: Language.GUJARATI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "bengali.pratilipi.com": {
        LANGUAGE: Language.BENGALI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "marathi.pratilipi.com": {
        LANGUAGE: Language.MARATHI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "tamil.pratilipi.com": {
        LANGUAGE: Language.TAMIL,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "telugu.pratilipi.com": {
        LANGUAGE: Language.TELUGU,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "kannada.pratilipi.com": {
        LANGUAGE: Language.KANNADA,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "malayalam.pratilipi.com": {
        LANGUAGE: Language.MALAYALAM,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },


    // production - mumbai - chrome
    "www-mum.pratilipi.com": {
        LANGUAGE: Language.ENGLISH,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "hindi-mum.pratilipi.com": {
        LANGUAGE: Language.HINDI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "gujarati-mum.pratilipi.com": {
        LANGUAGE: Language.GUJARATI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "bengali-mum.pratilipi.com": {
        LANGUAGE: Language.BENGALI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "marathi-mum.pratilipi.com": {
        LANGUAGE: Language.MARATHI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "tamil-mum.pratilipi.com": {
        LANGUAGE: Language.TAMIL,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "telugu-mum.pratilipi.com": {
        LANGUAGE: Language.TELUGU,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "kannada-mum.pratilipi.com": {
        LANGUAGE: Language.KANNADA,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "malayalam-mum.pratilipi.com": {
        LANGUAGE: Language.MALAYALAM,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },


    // production - uc mini
    "m.pratilipi.com": {
        LANGUAGE: Language.ENGLISH,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "hi.pratilipi.com": {
        LANGUAGE: Language.HINDI,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "gu.pratilipi.com": {
        LANGUAGE: Language.GUJARATI,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "bn.pratilipi.com": {
        LANGUAGE: Language.BENGALI,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "mr.pratilipi.com": {
        LANGUAGE: Language.MARATHI,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "ta.pratilipi.com": {
        LANGUAGE: Language.TAMIL,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "te.pratilipi.com": {
        LANGUAGE: Language.TELUGU,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "kn.pratilipi.com": {
        LANGUAGE: Language.KANNADA,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "ml.pratilipi.com": {
        LANGUAGE: Language.MALAYALAM,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },


    // production - uc mini
    "m-mum.pratilipi.com": {
        LANGUAGE: Language.ENGLISH,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "hi-mum.pratilipi.com": {
        LANGUAGE: Language.HINDI,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "gu-mum.pratilipi.com": {
        LANGUAGE: Language.GUJARATI,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "bn-mum.pratilipi.com": {
        LANGUAGE: Language.BENGALI,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "mr-mum.pratilipi.com": {
        LANGUAGE: Language.MARATHI,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "ta-mum.pratilipi.com": {
        LANGUAGE: Language.TAMIL,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "te-mum.pratilipi.com": {
        LANGUAGE: Language.TELUGU,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "kn-mum.pratilipi.com": {
        LANGUAGE: Language.KANNADA,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "ml-mum.pratilipi.com": {
        LANGUAGE: Language.MALAYALAM,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },


    // gamma - product - chrome
    "www-gamma.pratilipi.com": {
        LANGUAGE: Language.ENGLISH,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "hindi-gamma.pratilipi.com": {
        LANGUAGE: Language.HINDI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "gujarati-gamma.pratilipi.com": {
        LANGUAGE: Language.GUJARATI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "bengali-gamma.pratilipi.com": {
        LANGUAGE: Language.BENGALI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "marathi-gamma.pratilipi.com": {
        LANGUAGE: Language.MARATHI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "tamil-gamma.pratilipi.com": {
        LANGUAGE: Language.TAMIL,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "telugu-gamma.pratilipi.com": {
        LANGUAGE: Language.TELUGU,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "kannada-gamma.pratilipi.com": {
        LANGUAGE: Language.KANNADA,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "malayalam-gamma.pratilipi.com": {
        LANGUAGE: Language.MALAYALAM,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },


    // gamma - product - mumbai - chrome
    "www-mum-gamma.pratilipi.com": {
        LANGUAGE: Language.ENGLISH,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "hindi-mum-gamma.pratilipi.com": {
        LANGUAGE: Language.HINDI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "gujarati-mum-gamma.pratilipi.com": {
        LANGUAGE: Language.GUJARATI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "bengali-mum-gamma.pratilipi.com": {
        LANGUAGE: Language.BENGALI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "marathi-mum-gamma.pratilipi.com": {
        LANGUAGE: Language.MARATHI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "tamil-mum-gamma.pratilipi.com": {
        LANGUAGE: Language.TAMIL,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "telugu-mum-gamma.pratilipi.com": {
        LANGUAGE: Language.TELUGU,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "kannada-mum-gamma.pratilipi.com": {
        LANGUAGE: Language.KANNADA,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "malayalam-mum-gamma.pratilipi.com": {
        LANGUAGE: Language.MALAYALAM,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },


    // gamma - product - uc mini
    "m-gamma.pratilipi.com": {
        LANGUAGE: Language.ENGLISH,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "hi-gamma.pratilipi.com": {
        LANGUAGE: Language.HINDI,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "gu-gamma.pratilipi.com": {
        LANGUAGE: Language.GUJARATI,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "bn-gamma.pratilipi.com": {
        LANGUAGE: Language.BENGALI,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "mr-gamma.pratilipi.com": {
        LANGUAGE: Language.MARATHI,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "ta-gamma.pratilipi.com": {
        LANGUAGE: Language.TAMIL,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "te-gamma.pratilipi.com": {
        LANGUAGE: Language.TELUGU,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "kn-gamma.pratilipi.com": {
        LANGUAGE: Language.KANNADA,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "ml-gamma.pratilipi.com": {
        LANGUAGE: Language.MALAYALAM,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },


    // gamma - mumbai - product - uc mini
    "m-mum-gamma.pratilipi.com": {
        LANGUAGE: Language.ENGLISH,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "hi-mum-gamma.pratilipi.com": {
        LANGUAGE: Language.HINDI,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "gu-mum-gamma.pratilipi.com": {
        LANGUAGE: Language.GUJARATI,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "bn-mum-gamma.pratilipi.com": {
        LANGUAGE: Language.BENGALI,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "mr-mum-gamma.pratilipi.com": {
        LANGUAGE: Language.MARATHI,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "ta-mum-gamma.pratilipi.com": {
        LANGUAGE: Language.TAMIL,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "te-mum-gamma.pratilipi.com": {
        LANGUAGE: Language.TELUGU,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "kn-mum-gamma.pratilipi.com": {
        LANGUAGE: Language.KANNADA,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "ml-mum-gamma.pratilipi.com": {
        LANGUAGE: Language.MALAYALAM,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },


    // gamma - growth - chrome
    "hindi-gamma-gr.pratilipi.com": {
        LANGUAGE: Language.HINDI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 100
        }
    },

    "gujarati-gamma-gr.pratilipi.com": {
        LANGUAGE: Language.GUJARATI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 100
        }
    },

    "bengali-gamma-gr.pratilipi.com": {
        LANGUAGE: Language.BENGALI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 100
        }
    },

    "marathi-gamma-gr.pratilipi.com": {
        LANGUAGE: Language.MARATHI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 100
        }
    },

    "tamil-gamma-gr.pratilipi.com": {
        LANGUAGE: Language.TAMIL,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 100
        }
    },

    "telugu-gamma-gr.pratilipi.com": {
        LANGUAGE: Language.TELUGU,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 100
        }
    },

    "kannada-gamma-gr.pratilipi.com": {
        LANGUAGE: Language.KANNADA,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 100
        }
    },

    "malayalam-gamma-gr.pratilipi.com": {
        LANGUAGE: Language.MALAYALAM,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 100
        }
    },


    // devo - product - chrome
    "www-devo.ptlp.co": {
        LANGUAGE: Language.ENGLISH,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "hindi-devo.ptlp.co": {
        LANGUAGE: Language.HINDI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "gujarati-devo.ptlp.co": {
        LANGUAGE: Language.GUJARATI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "bengali-devo.ptlp.co": {
        LANGUAGE: Language.BENGALI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },
    
    "marathi-devo.ptlp.co": {
        LANGUAGE: Language.MARATHI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "tamil-devo.ptlp.co": {
        LANGUAGE: Language.TAMIL,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "telugu-devo.ptlp.co": {
        LANGUAGE: Language.TELUGU,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "kannada-devo.ptlp.co": {
        LANGUAGE: Language.KANNADA,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "malayalam-devo.ptlp.co": {
        LANGUAGE: Language.MALAYALAM,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },



    // devo - product - uc mini
    "m-devo.ptlp.co": {
        LANGUAGE: Language.ENGLISH,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "hi-devo.ptlp.co": {
        LANGUAGE: Language.HINDI,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "gu-devo.ptlp.co": {
        LANGUAGE: Language.GUJARATI,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "bn-devo.ptlp.co": {
        LANGUAGE: Language.BENGALI,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "mr-devo.ptlp.co": {
        LANGUAGE: Language.MARATHI,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },
    
    "ta-devo.ptlp.co": {
        LANGUAGE: Language.TAMIL,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "te-devo.ptlp.co": {
        LANGUAGE: Language.TELUGU,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "kn-devo.ptlp.co": {
        LANGUAGE: Language.KANNADA,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },

    "ml-devo.ptlp.co": {
        LANGUAGE: Language.MALAYALAM,
        VERSION: Version.MINI,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 0
        }
    },



    // devo - growth - chrome
    "hindi-devo-gr.ptlp.co": {
        LANGUAGE: Language.HINDI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 1
        }
    },

    "gujarati-devo-gr.ptlp.co": {
        LANGUAGE: Language.GUJARATI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 1
        }
    },

    "bengali-devo-gr.ptlp.co": {
        LANGUAGE: Language.BENGALI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 1
        }
    },

    "marathi-devo-gr.ptlp.co": {
        LANGUAGE: Language.MARATHI,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 1
        }
    },

    "tamil-devo-gr.ptlp.co": {
        LANGUAGE: Language.TAMIL,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 1
        }
    },

    "telugu-devo-gr.ptlp.co": {
        LANGUAGE: Language.TELUGU,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 1
        }
    },

    "kannada-devo-gr.ptlp.co": {
        LANGUAGE: Language.KANNADA,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    },

    "malayalam-devo-gr.ptlp.co": {
        LANGUAGE: Language.MALAYALAM,
        VERSION: Version.PWA,
        TTL_DAYS: 7,
        BUCKET: {
            TOTAL: 1,
            GROWTH: 1
        }
    },


    // local testing
    [`localhost:${stageConfig.PORT}`]: {
        LANGUAGE: Language.ENGLISH,
        VERSION: Version.PWA,
        TTL_DAYS: 1,
        BUCKET: {
            TOTAL: 100,
            GROWTH: 20
        }
    }

}

module.exports = HostConfig;
