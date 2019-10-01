(function(){

    var Event = YAHOO.util.Event,
        Dom = YAHOO.util.Dom,
        $ = YAHOO.util.Selector.query,
        Util = ZAPNET.util;

    ZAPNET.COUPONS.MARKETS = {
        MATCH_ODDS_1X2: 10,
        MATCH_ODDS_1X2_ALT: 810,
        MATCH_ODDS_12: 20,
        UNDER_OVER: 56,
        FIRST_TO_SCORE: 41,
        LIVE_MATCH_ODDS_1X2: 2002,
        LIVE_UNDER_OVER: 2005,
        LIVE_REST_OF_MATCH: 1004,
        LIVE_NEXT_GOAL: 1013,
        LIVE_1ST_NEXT_GOAL: 1107,
        LIVE_OT_NEXT_GOAL: 1014,
        LIVE_1ST_REST_OF_1ST: 1020,
        LIVE_1ST_UNDER_OVER: 1021,
        LIVE_MATCH_ODDS_1X2_HT: 1022,
        LIVE_MATCH_ODDS_12: 1037,
        LIVE_MATCH_ODDS_MW: 1010
    };

    ZAPNET.COUPONS.ONLINE = {
        soccer: {
            MAIN: {
                label: 'Main',
                markets: [
                    {label: 'FT 1X2', btype: 'result', types: [10, 810, 2002], outcomes: ['1', 'X', '2']},
                    {label: 'Double Chance', types: [46, 846, 1027], outcomes: ['1X', '12', 'X2']},
                    {label: 'Under/Over 2.5', btype: 'totals', types: [56, 60, 856, 2005], outcomes: ['Under', 'Over'], special: '2.5'},
                    {label: 'Both Teams to Score', types: [43, 843, 1030], outcomes: ['Yes', 'No'], headers: ['Yes', 'No']},
                ]
            },
            LIVE: {
                label: 'Live',
                markets: [
                    {label: 'FT 1X2', btype: 'result', types: [10, 810, 2002], outcomes: ['1', 'X', '2']},
                    {label: 'Under/Over', btype: 'totals', types: [56, 856, 2005], outcomes: ['Under', 'Over'], varSpecial: true},
                    {label: 'Rest Of Match', types: [10, 810, 1004], outcomes: ['1', 'X', '2'], hasSpecial: true},
                    {label: 'Next Goal', types: [41, 1013], outcomes: ['1', 'X', '2'], headers: ['1', 'X', '2'], hasSpecial: true},
                ]
            },
            HT: {
                label: '1st Half',
                markets: [
                    {label: '1st Half 1X2', types: [42, 842, 1022], outcomes: ['1', 'X', '2']},
                    {label: 'Under/Over 0.5', types: [284, 984, 1021], outcomes: ['Under', 'Over'], special: '0.5'},
                    {label: 'Under/Over 1.5', types: [284, 984, 1021], outcomes: ['Under', 'Over'], special: '1.5'},
                    {label: 'Under/Over 2.5', types: [284, 984, 1021], outcomes: ['Under', 'Over'], special: '2.5'}
                ]
            }
        },
        'ice-hockey': {
            MAIN: {
                label: 'Main',
                markets: [
                    {label: 'FT 1X2', btype: 'result', types: [10, 810, 2002], outcomes: ['1', 'X', '2']},
                    {label: 'Double Chance', types: [46, 846, 1027], outcomes: ['1X', '12', 'X2']},
                    {label: 'Under/Over', btype: 'totals', types: [56, 856, 2005], outcomes: ['Under', 'Over'], varSpecial: true},
                    {label: 'Both Teams to Score', types: [43, 843, 1030], outcomes: ['Yes', 'No'], headers: ['Yes', 'No']},
                ]
            },
            LIVE: {
                label: 'Live',
                markets: [
                    {label: 'FT 1X2', btype: 'result', types: [10, 810, 2002], outcomes: ['1', 'X', '2']},
                    {label: 'Under/Over', btype: 'totals', types: [56, 856, 2005], outcomes: ['Under', 'Over'], varSpecial: true},
                    {label: 'Rest Of Match', types: [10, 810, 1004], outcomes: ['1', 'X', '2'], hasSpecial: true},
                    {label: 'Next Goal', types: [41, 1013], outcomes: ['1', 'X', '2'], headers: ['1', 'X', '2'], hasSpecial: true},
                ]
            }
        },
        basketball: {
            MAIN: {
                label: 'Main',
                markets: [
                    {label: 'Result', btype: 'result', types: [20, 820, 1037], outcomes: ['1', '2']},
                    {label: 'Under/Over', btype: 'totals', types: [52, 1021], outcomes: ['Under', 'Over'], varSpecial: true}
                ]
            },
            LIVE: {
                label: 'Live',
                markets: [
                    {label: 'Result', btype: 'result', types: [20, 820, 1037], outcomes: ['1', '2']},
                    {label: 'Under/Over', btype: 'totals', types: [52, 1021], outcomes: ['Under', 'Over'], varSpecial: true}
                ]
            }
        },
        baseball: {
            MAIN: {
                label: 'Main',
                markets: [
                    {label: 'Result', btype: 'result', types: [20, 820, 1037], outcomes: ['1', '2']},
                    {label: 'Under/Over', btype: 'totals', types: [52, 1021], outcomes: ['Under', 'Over'], varSpecial: true}
                ]
            },
            LIVE: {
                label: 'Live',
                markets: [
                    {label: 'Result', btype: 'result', types: [20, 820, 1037], outcomes: ['1', '2']},
                    {label: 'Under/Over', btype: 'totals', types: [52, 1021], outcomes: ['Under', 'Over'], varSpecial: true}
                ]
            }
        },
        'american-football': {
            MAIN: {
                label: 'Main',
                markets: [
                    {label: 'Result', btype: 'result', types: [20, 820, 1037], outcomes: ['1', '2']},
                    {label: 'Under/Over', btype: 'totals', types: [52, 1021], outcomes: ['Under', 'Over'], varSpecial: true}
                ]
            },
            LIVE: {
                label: 'Live',
                markets: [
                    {label: 'Result', btype: 'result', types: [20, 820, 1037], outcomes: ['1', '2']},
                    {label: 'Under/Over', btype: 'totals', types: [52, 1021], outcomes: ['Under', 'Over'], varSpecial: true}
                ]
            }
        },
        tennis: {
            MAIN: {
                label: 'Main',
                markets: [
                    {label: 'Result', btype: 'result', types: [20, 820, 1010], outcomes: ['1', '2']},
                    {label: 'Under/Over', btype: 'totals', types: [226, 1083], outcomes: ['Under', 'Over'], varSpecial: true}
                ]
            },
            LIVE: {
                label: 'Live',
                markets: [
                    {label: 'Result', btype: 'result', types: [20, 820, 1010], outcomes: ['1', '2']},
                    {label: 'Under/Over', btype: 'totals', types: [226, 1083], outcomes: ['Under', 'Over'], varSpecial: true}
                ]
            }
        },
        volleyball: {
            MAIN: {
                label: 'Main',
                markets: [
                    {label: 'Result', btype: 'result', types: [20, 820, 1102], outcomes: ['1', '2']},
                    {label: 'Under/Over', btype: 'totals', types: [226, 2005], outcomes: ['Under', 'Over'], varSpecial: true}
                ]
            },
            LIVE: {
                label: 'Live',
                markets: [
                    {label: 'Result', btype: 'result', types: [20, 820, 1102], outcomes: ['1', '2']},
                    {label: 'Under/Over', btype: 'totals', types: [226, 2005], outcomes: ['Under', 'Over'], varSpecial: true}
                ]
            }
        },
        boxing: {
            MAIN: {
                label: 'Main',
                markets: [
                    {label: 'Winner', btype: 'result', types: [20, 820], outcomes: ['1', '2']},
                ]
            }
        }
    };

    ZAPNET.COUPONS.PERIOD_MARKETS = {
        soccer: {},
        basketball: {},
        volleyball: {},
        tennis: {}
    };
    ZAPNET.COUPONS.PERIOD_MARKETS.soccer[ZAPNET.COUPONS.MARKETS.MATCH_ODDS_1X2] = {
        '1p': 0
    };
    ZAPNET.COUPONS.PERIOD_MARKETS.soccer[ZAPNET.COUPONS.MARKETS.MATCH_ODDS_1X2_ALT] = {
        '1p': 0
    };
    ZAPNET.COUPONS.PERIOD_MARKETS.soccer[ZAPNET.COUPONS.MARKETS.LIVE_MATCH_ODDS_1X2] = {
        '1p': ZAPNET.COUPONS.MARKETS.LIVE_MATCH_ODDS_1X2_HT
    };
    ZAPNET.COUPONS.PERIOD_MARKETS.soccer[ZAPNET.COUPONS.MARKETS.LIVE_UNDER_OVER] = {
        '1p': ZAPNET.COUPONS.MARKETS.LIVE_1ST_UNDER_OVER
    };
    ZAPNET.COUPONS.PERIOD_MARKETS.soccer[ZAPNET.COUPONS.MARKETS.LIVE_REST_OF_MATCH] = {
        '1p': ZAPNET.COUPONS.MARKETS.LIVE_1ST_REST_OF_1ST
    };
    ZAPNET.COUPONS.PERIOD_MARKETS.soccer[ZAPNET.COUPONS.MARKETS.LIVE_NEXT_GOAL] = {
        '1p': ZAPNET.COUPONS.MARKETS.LIVE_1ST_NEXT_GOAL
    };

}());