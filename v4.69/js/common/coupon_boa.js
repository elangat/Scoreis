(function(){

    var Event = YAHOO.util.Event,
        Dom = YAHOO.util.Dom,
        $ = YAHOO.util.Selector.query,
        Util = ZAPNET.util;

    var MARKET_MATCH_HANDICAP = '10',
        MARKET_CORRECT_SCORE = '2',
        MARKET_MATCH_ODDS = '10',
        MARKET_MATCH_ODDS_2WAY = '20',
        MARKET_UNDER_OVER = '60',
        MARKET_TOTALS_UNDER_OVER = '56',
        MARKET_FIRST_TO_SCORE = '41',
        MARKET_DOUBLE_CHANCE = '46',
        MARKET_GOAL_NO_GOAL = '43',
        MARKET_HALFTIME_FULLTIME = '44',
        MARKET_ASIAN_HANDICAP = '51',
        MARKET_ASIAN_TOTALS = '52',
        MARKET_1ST_ASIAN_HANDICAP = '53',
        MARKET_EUROPEAN_HANDICAP = '55',
        MARKET_HIGHEST_SCORING_HALF = '207',
        MARKET_TOTAL_GOALS_AGGR = '202',
        MARKET_MATCHBET_TOTALS = '208',
        MARKET_MATCHFLOW = '209',
        MARKET_TOTAL_GOALS = '258',
        MARKET_1ST_MATCH_ODDS = '42',
        MARKET_2ND_MATCH_ODDS = '259',
        MARKET_1ST_UNDER_OVER = '284',
        MARKET_2ND_UNDER_OVER = '285',
        MARKET_CORNER_TOTAL = '292',
        MARKET_1ST_CORNER_TOTAL = '293',
        MARKET_2ND_CORNER_TOTAL = '998',
        MARKET_ODD_EVEN_GOALS = '45',
        MARKET_1ST_ODD_EVEN_GOALS = '220',
        MARKET_2ND_ODD_EVEN_GOALS = '999',
        MARKET_GOALS_HOME = '48',
        MARKET_GOALS_AWAY = '49',
        MARKET_WINNING_MARGIN = '222',
        MARKET_AWAY_TEAM_TO_SCORE = '783',
        MARKET_AWAY_TEAM_TO_SCORE_ALT = '783',
        MARKET_HOME_TEAM_TO_SCORE = '782',
        MARKET_HOME_TEAM_TO_SCORE_ALT = '782',
        MARKET_AWAY_TEAM_SCORES_MONEYBALL = '778',
        MARKET_AWAY_TEAM_SCORES_MONEYBALL_ALT = '778',
        MARKET_HOME_TEAM_SCORES_MONEYBALL = '777',
        MARKET_HOME_TEAM_SCORES_MONEYBALL_ALT = '777',
        MARKET_AWAY_TEAM_UNDER_OVER ='776',
        MARKET_AWAY_TEAM_UNDER_OVER_ALT ='776',
        MARKET_HOME_TEAM_UNDER_OVER ='775',
        MARKET_HOME_TEAM_UNDER_OVER_ALT ='775',
        MARKET_HANDICAP ='774',
        MARKET_HANDICAP_ALT ='774',
        MARKET_WINNING_MARGIN_VIRTUAL = '780',
        MARKET_WINNING_MARGIN_VIRTUAL_ALT = '780',
        MARKET_LONGEST_CONSECUTIVE_HOOPS = '784',
        MARKET_LONGEST_CONSECUTIVE_HOOPS_ALT = '784',
        MARKET_TOTAL_POINTS ='860',
        MARKET_TOTAL_POINTS_ALT ='860',
        MARKET_TOTAL_POINTS_UNDER_OVER ='781',
        MARKET_TOTAL_POINTS_UNDER_OVER_ALT ='781',

        LIVE_MARKET_MATCH_ODDS = '2002',
        LIVE_MARKET_DOUBLE_CHANCE = '1027',
        LIVE_MARKET_TOTALS_UNDER_OVER = '2005',
        LIVE_MARKET_GOAL_NO_GOAL = '1030',
        LIVE_MARKET_CORRECT_SCORE = '1026',
        LIVE_MARKET_TOTAL_GOALS = '1140',
        LIVE_MARKET_UNDER_OVER = '1139',
        LIVE_MARKET_MATCHBET_TOTALS = '1183',
        LIVE_MARKET_MATCH_ODDS_2WAY = '1037',
        LIVE_MARKET_MATCH_ODDS_2WAY_TENNIS = '1010',
        LIVE_MARKET_MATCH_ODDS_2WAY_VOLLEYBALL = '1102',
        LIVE_MARKET_REST_OF_MATCH = '1004',
        LIVE_MARKET_NEXT_GOAL = '1013',


        MARKET_MATCH_ODDS = '810',
        MARKET_MATCH_ODDS_2WAY = '820',
        MARKET_DOUBLE_CHANCE = '846',
        MARKET_TOTALS_UNDER_OVER = '856',
        MARKET_GOAL_NO_GOAL = '843',
        MARKET_HALFTIME_FULLTIME = '844',
        MARKET_CORRECT_SCORE = '802',
        MARKET_MATCHBET_TOTALS = '908',
        MARKET_TOTAL_GOALS = '902',
        MARKET_TOTAL_GAMES = '860',
        MARKET_1ST_MATCH_ODDS = '842',
        MARKET_1ST_UNDER_OVER = '984',
        MARKET_ASIAN_HANDICAP_MATCH_ODDS = '851',
        MARKET_1ST_ASIAN_HANDICAP_MATCH_ODDS = '853',
        MARKET_BSK_UNDER_OVER = '860',
        MARKET_UNDER_OVER = '860',
        MARKET_BSK_HALFTIME_FULLTIME = '844',
        MARKET_HOME_TO_SCORE = '891',
        MARKET_AWAY_TO_SCORE = '892',
        MARKET_MATCH_ODDS_ALT = '10',
        MARKET_MATCH_ODDS_2WAY_ALT = '20',
        MARKET_DOUBLE_CHANCE_ALT = '46',
        MARKET_TOTALS_UNDER_OVER_ALT = '56',
        MARKET_GOAL_NO_GOAL_ALT = '43',
        MARKET_HALFTIME_FULLTIME_ALT = '44',
        MARKET_CORRECT_SCORE_ALT = '2',
        MARKET_MATCHBET_TOTALS_ALT = '208',
        MARKET_TOTAL_GOALS_ALT = '202',
        MARKET_1ST_MATCH_ODDS_ALT = '42',
        MARKET_1ST_UNDER_OVER_ALT = '284',
        MARKET_ASIAN_HANDICAP_MATCH_ODDS_ALT = '51',
        MARKET_1ST_ASIAN_HANDICAP_MATCH_ODDS_ALT = '53',
        MARKET_BSK_UNDER_OVER_ALT = '52',
        MARKET_UNDER_OVER_ALT = '60',
        MARKET_BSK_HALFTIME_FULLTIME_ALT = '44',
        MARKET_HOME_TO_SCORE_ALT = '891',
        MARKET_AWAY_TO_SCORE_ALT = '892',
        MARKET_TOTAL_GAMES_ALT = '226',
        MARKET_UNDER_OVER_INCL_OT = '229',
        MARKET_UNDER_OVER_FRAMES = '52',

        LIVE_MARKET_MATCH_ODDS = '2002',
        LIVE_MARKET_WHICH_TEAM_HAS_KICKOFF = '1002',
        LIVE_MARKET_DOUBLE_CHANCE = '1027',
        LIVE_MARKET_TOTALS_UNDER_OVER = '2005',
        LIVE_MARKET_GOAL_NO_GOAL = '1030',
        LIVE_MARKET_CORRECT_SCORE = '1026',
        LIVE_MARKET_TOTAL_GOALS = '1140',
        LIVE_MARKET_UNDER_OVER = '1039',
        LIVE_MARKET_MATCHBET_TOTALS = '1183',
        LIVE_MARKET_1ST_UNDER_OVER = '1021',
        LIVE_MARKET_OT_UNDER_OVER = '1007',
        LIVE_MARKET_1ST_MATCH_ODDS = '1022',
        LIVE_MARKET_OT_MATCH_ODDS = '1006',
        LIVE_MARKET_1ST_NEXT_GOAL = '1107',
        LIVE_MARKET_OT_NEXT_GOAL = '1014',
        LIVE_MARKET_1ST_REST_OF_1ST = '1020',
        LIVE_MARKET_MATCH_ODDS_2WAY = '1037',
        LIVE_MARKET_1ST_MATCH_ODDS_2WAY = '1036',
        LIVE_MARKET_TOTAL_GAMES = '1083',
        LIVE_MARKET_MATCH_ODDS_2WAY_TENNIS = '1010',
        LIVE_MARKET_SET_WINNER = '1011',
        LIVE_MARKET_TOTAL_GAMES_SET1 = '1084',
        LIVE_MARKET_TOTAL_GAMES_SET2 = '1085',
        LIVE_MARKET_TOTAL_GAMES_SET3 = '1086',
        LIVE_MARKET_TOTAL_GAMES_SET4 = '1087',
        LIVE_MARKET_TOTAL_GAMES_SET5 = '1088',
        LIVE_MARKET_TOTAL_POINTS_SET1 = '1043',
        LIVE_MARKET_TOTAL_POINTS_SET2 = '1047',
        LIVE_MARKET_TOTAL_POINTS_SET3 = '1050',
        LIVE_MARKET_TOTAL_POINTS_SET4 = '1053',
        LIVE_MARKET_TOTAL_POINTS_SET5 = '1070',
        LIVE_MARKET_GAME_WINNER_SET1 = '1089',
        LIVE_MARKET_GAME_WINNER_SET2 = '1090',
        LIVE_MARKET_GAME_WINNER_SET3 = '1091',
        LIVE_MARKET_GAME_WINNER_SET4 = '1092',
        LIVE_MARKET_GAME_WINNER_SET5 = '1093';


    var MARKET_TOTAL_GOALS = '202';
    var MARKET_MULTI_GOALS = '574';

    var CouponHandlers = ZAPNET.COUPONS.CouponHandlers;

    ZAPNET.COUPONS.MARKET_COUPONS = {
        soccer: {
            MATCH_ODDS: {
                menuName: 'Match Odds',
                handler: CouponHandlers.MatchOddsCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_ODDS, altid: MARKET_MATCH_ODDS_ALT, liveid: LIVE_MARKET_MATCH_ODDS, outcomes: ['1', 'X', '2']},
                    {name: 'Double Chance', id: MARKET_DOUBLE_CHANCE, altid: MARKET_DOUBLE_CHANCE_ALT, liveid: LIVE_MARKET_DOUBLE_CHANCE, outcomes: ['1X', '12', 'X2']},
                    {name: 'Under/Over 2.5', id: MARKET_TOTALS_UNDER_OVER, altid: MARKET_TOTALS_UNDER_OVER_ALT, liveid: LIVE_MARKET_TOTALS_UNDER_OVER, special: '2.5', outcomes: ['Under', 'Over']},
                    {name: 'Both Teams to Score', id: MARKET_GOAL_NO_GOAL, altid: MARKET_GOAL_NO_GOAL_ALT, liveid: LIVE_MARKET_GOAL_NO_GOAL, outcomes: ['Yes', 'No'], headers: ['Yes', 'No']}
                ]
            },
            WEBSITE_COUPON: {
                handler: CouponHandlers.MatchOddsCoupon,
                fullWidth: true,
                markets: [
                    {name: 'FT 1X2', id: MARKET_MATCH_ODDS, altid: MARKET_MATCH_ODDS_ALT, liveid: LIVE_MARKET_MATCH_ODDS, altliveid: LIVE_MARKET_OT_MATCH_ODDS, outcomes: ['1', 'X', '2']},
                    {name: 'Under/Over 2.5', id: MARKET_TOTALS_UNDER_OVER, altid: MARKET_TOTALS_UNDER_OVER_ALT, liveid: LIVE_MARKET_TOTALS_UNDER_OVER, altliveid: LIVE_MARKET_OT_UNDER_OVER, special: '2.5', outcomes: ['Under', 'Over']},
                    {name: 'Both Teams to Score', id: MARKET_GOAL_NO_GOAL, altid: MARKET_GOAL_NO_GOAL_ALT, outcomes: ['Yes', 'No'], headers: ['Yes', 'No']},
                //    {name: 'Total Goals', id: MARKET_TOTAL_GOALS, altid: MARKET_TOTAL_GOALS_ALT, outcomes: ['0-1 goals', '1-3 goals', '2+', '2-3 goals', '2-4 goals', '3-5 goals', '4+', '4-5 goals', '4-6 goals', '5+', '6+', '7+'], headers: ['0-1', '1-3', '2+', '2-3', '2-4', '3-5', '4+', '4-5', '4-6', '5+', '6+', '7+']},
                    {name: 'Multigoals', id: MARKET_MULTI_GOALS, altid: MARKET_MULTI_GOALS, outcomes: ['0-1', '1-2', '1-3', '2-3', '2-4', '2-5', '3-4', '3-5', '3-6', '4-5', '4-6', '7+'], headers: ['0-1', '1-2', '1-3', '2-3', '2-4', '2-5', '3-4', '3-5', '3-6', '4-5', '4-6', '7+']},
                    {name: '1st Half - 1X2', id: MARKET_1ST_MATCH_ODDS, altid: MARKET_1ST_MATCH_ODDS_ALT, outcomes: ['1', 'X', '2']},
                    {name: 'Halftime/Fulltime', id: MARKET_HALFTIME_FULLTIME, altid: MARKET_HALFTIME_FULLTIME_ALT, newline: true, outcomes: ['1/1', '1/X', '1/2', 'X/1', 'X/X', 'X/2', '2/1', '2/X', '2/2']},
                    {name: '1st Half - Under/Over', id: MARKET_1ST_UNDER_OVER, altid: MARKET_1ST_UNDER_OVER_ALT, liveid: LIVE_MARKET_1ST_UNDER_OVER, specials: [0.5, 1.5, 2.5], outcomes: ['Under', 'Over']},
                    {name: 'FT 1X2 & Under/Over 2.5', id: MARKET_MATCHBET_TOTALS, altid: MARKET_MATCHBET_TOTALS_ALT, special: 2.5, outcomes: ['Under and home', 'Under and draw', 'Under and away', 'Over and home', 'Over and draw', 'Over and away'], headers: ['1 & U', 'X & U', '2 & U', '1 & O', 'X & O', '2 & O']},
                    {name: 'Home Team To Score', id: MARKET_HOME_TO_SCORE, altid: MARKET_HOME_TO_SCORE_ALT, outcomes: ['Yes', 'No']},
                    {name: 'Away Team To Score', id: MARKET_AWAY_TO_SCORE, altid: MARKET_AWAY_TO_SCORE_ALT, outcomes: ['Yes', 'No']}
                ]
            },
            HALFTIME_FULLTIME: {
                menuName: 'Halftime/Fulltime',
                handler: CouponHandlers.StandardCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Halftime/Fulltime', id: MARKET_HALFTIME_FULLTIME, altid: MARKET_HALFTIME_FULLTIME_ALT, outcomes: ['1/1', '1/X', '1/2', 'X/1', 'X/X', 'X/2', '2/1', '2/X', '2/2']}
                ]
            },
            CORRECT_SCORE: {
                menuName: 'Correct Score',
                handler: CouponHandlers.CorrectScoreCoupon,
                fullWidth: true,
                markets: [
                    {
                        name: 'Correct Score', id: MARKET_CORRECT_SCORE, altid: MARKET_CORRECT_SCORE_ALT, liveid: LIVE_MARKET_CORRECT_SCORE,
                        outcomes: ['1:0', '2:0', '2:1', '3:0', '3:1', '3:2', '4:0', '4:1', '4:2', '0:0', '1:1', '2:2', '3:3'],
                        headers:  ['1-0', '2-0', '2-1', '3-0', '3-1', '3-2', '4-0', '4-1', '4-2', '0-0', '1-1', '2-2', '3-3']
                    }
                ]
            },
            COMBINATIONS: {
                menuName: 'Conbinations',
                handler: CouponHandlers.StandardCoupon,
                fullWidth: true,
                markets: [
                    {name: 'FT 1X2 & Under/Over 2.5', id: MARKET_MATCHBET_TOTALS, altid: MARKET_MATCHBET_TOTALS_ALT, special: '2.5', outcomes: ['Under and home', 'Under and draw', 'Under and away', 'Over and home', 'Over and draw', 'Over and away'], headers: ['1 & U', 'X & U', '2 & U', '1 & O', 'X & O', '2 & O']}
                ]
            },
            GOALS: {
                menuName: 'Total Goals',
                handler: CouponHandlers.StandardCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Total Goals', id: MARKET_MULTI_GOALS, outcomes: ['0', '0-1', '1-2', '1-3', '1-4', '1-5', '1-6', '2+', '2-3', '2-4', '2-5', '2-6', '3-4', '3-5', '3-6', '4+', '4-5', '4-6', '5+', '5-6', '6+', '7+']}
                ]
            },
            HALF_1ST: {
                menuName: '1st Half',
                handler: CouponHandlers.MatchOddsCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Match Odds', id: MARKET_1ST_MATCH_ODDS, altid: MARKET_1ST_MATCH_ODDS_ALT, outcomes: ['1', 'X', '2']},
                    {name: '1st Under/Over 0.5', id: MARKET_1ST_UNDER_OVER, altid: MARKET_1ST_UNDER_OVER_ALT, special: '0.5', headers: ['Under 0.5', 'Over 0.5'], outcomes: ['Under', 'Over']},
                    {name: '1st Under/Over 1.5', id: MARKET_1ST_UNDER_OVER, altid: MARKET_1ST_UNDER_OVER_ALT, special: '1.5', headers: ['Under 1.5', 'Over 1.5'], outcomes: ['Under', 'Over']},
                    {name: '1st Under/Over 2.5', id: MARKET_1ST_UNDER_OVER, altid: MARKET_1ST_UNDER_OVER_ALT, special: '2.5', headers: ['Under 2.5', 'Over 2.5'], outcomes: ['Under', 'Over']}
                ]
            },
            QUALIFY: {
                menuName: 'To Qualify',
                handler: CouponHandlers.StandardCoupon,
                fullWidth: false,
                reqid: 387,
                markets: [
                    {name: 'To Qualify', id: 387, outcomes: ['1', '2'], headers: ['Home', 'Away']}
                ]
            }
        },
        'virtual-football': {
            MATCH_ODDS: {
                menuName: 'Match Odds',
                handler: CouponHandlers.MatchOddsCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_ODDS, altid: MARKET_MATCH_ODDS_ALT, liveid: LIVE_MARKET_MATCH_ODDS, outcomes: ['1', 'X', '2']},
                    {name: 'Double Chance', id: MARKET_DOUBLE_CHANCE, altid: MARKET_DOUBLE_CHANCE_ALT, liveid: LIVE_MARKET_DOUBLE_CHANCE, outcomes: ['1X', '12', 'X2']},
                    {name: 'Under/Over 2.5', id: MARKET_TOTALS_UNDER_OVER, altid: MARKET_TOTALS_UNDER_OVER_ALT, liveid: LIVE_MARKET_TOTALS_UNDER_OVER, special: '2.5', outcomes: ['Under', 'Over']},
                    {name: 'Both Teams to Score', id: MARKET_GOAL_NO_GOAL, altid: MARKET_GOAL_NO_GOAL_ALT, liveid: LIVE_MARKET_GOAL_NO_GOAL, outcomes: ['Yes', 'No'], headers: ['Yes', 'No']}
                ]
            },
            WEBSITE_COUPON: {
                handler: CouponHandlers.MatchOddsCoupon,
                fullWidth: true,
                markets: [
                    {name: 'FT 1X2', id: MARKET_MATCH_ODDS, altid: MARKET_MATCH_ODDS_ALT, liveid: LIVE_MARKET_MATCH_ODDS, altliveid: LIVE_MARKET_OT_MATCH_ODDS, outcomes: ['1', 'X', '2']},
                    {name: 'Double Chance', id: MARKET_DOUBLE_CHANCE, altid: MARKET_DOUBLE_CHANCE_ALT, liveid: LIVE_MARKET_DOUBLE_CHANCE, outcomes: ['1X', '12', 'X2']},
                    {name: 'Under/Over 2.5', id: MARKET_TOTALS_UNDER_OVER, altid: MARKET_TOTALS_UNDER_OVER_ALT, liveid: LIVE_MARKET_TOTALS_UNDER_OVER, altliveid: LIVE_MARKET_OT_UNDER_OVER, special: '2.5', outcomes: ['Under', 'Over']},
                    {name: 'Halftime/Fulltime', id: MARKET_HALFTIME_FULLTIME, altid: MARKET_HALFTIME_FULLTIME_ALT, outcomes: ['1/1', '1/X', '1/2', 'X/1', 'X/X', 'X/2', '2/1', '2/X', '2/2']},
                    {name: 'First Team To Score', id: MARKET_FIRST_TO_SCORE, outcomes: ['1', 'No Goal', '2'], headers: ['1', 'No Goal', '2']}
                ]
            },
            HALFTIME_FULLTIME: {
                menuName: 'Halftime/Fulltime',
                handler: CouponHandlers.StandardCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Halftime/Fulltime', id: MARKET_HALFTIME_FULLTIME, altid: MARKET_HALFTIME_FULLTIME_ALT, outcomes: ['1/1', '1/X', '1/2', 'X/1', 'X/X', 'X/2', '2/1', '2/X', '2/2']}
                ]
            },
            CORRECT_SCORE: {
                menuName: 'Correct Score',
                handler: CouponHandlers.CorrectScoreCoupon,
                fullWidth: true,
                markets: [
                    {
                        name: 'Correct Score', id: MARKET_CORRECT_SCORE, altid: MARKET_CORRECT_SCORE_ALT, liveid: LIVE_MARKET_CORRECT_SCORE,
                        outcomes: ['1:0', '2:0', '2:1', '3:0', '3:1', '3:2', '4:0', '4:1', '4:2', '0:0', '1:1', '2:2', '3:3'],
                        headers:  ['1-0', '2-0', '2-1', '3-0', '3-1', '3-2', '4-0', '4-1', '4-2', '0-0', '1-1', '2-2', '3-3']
                    }
                ]
            },
            GOALS: {
                menuName: 'Total Goals',
                handler: CouponHandlers.StandardCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Total Goals', id: MARKET_TOTAL_GOALS, altid: MARKET_TOTAL_GOALS_ALT, outcomes: ['0-1 goals', '1-3 goals', '2+', '2-3 goals', '2-4 goals', '3-5 goals', '4+', '4-5 goals', '4-6 goals', '5+', '6+', '7+'], headers: ['0-1', '1-3', '2+', '2-3', '2-4', '3-5', '4+', '4-5', '4-6', '5+', '6+', '7+']}
                ]
            },
            HALF_1ST: {
                menuName: '1st Half',
                handler: CouponHandlers.MatchOddsCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Match Odds', id: MARKET_1ST_MATCH_ODDS, altid: MARKET_1ST_MATCH_ODDS_ALT, outcomes: ['1', 'X', '2']},
                    {name: '1st Under/Over 0.5', id: MARKET_1ST_UNDER_OVER, altid: MARKET_1ST_UNDER_OVER_ALT, special: '0.5', headers: ['Under 0.5', 'Over 0.5'], outcomes: ['Under', 'Over']},
                    {name: '1st Under/Over 1.5', id: MARKET_1ST_UNDER_OVER, altid: MARKET_1ST_UNDER_OVER_ALT, special: '1.5', headers: ['Under 1.5', 'Over 1.5'], outcomes: ['Under', 'Over']},
                    {name: '1st Under/Over 2.5', id: MARKET_1ST_UNDER_OVER, altid: MARKET_1ST_UNDER_OVER_ALT, special: '2.5', headers: ['Under 2.5', 'Over 2.5'], outcomes: ['Under', 'Over']}
                ]
            }
        },
        'virtual-football-league': {
            MATCH_ODDS: {
                menuName: 'Match Odds',
                handler: CouponHandlers.MatchOddsCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_ODDS, altid: MARKET_MATCH_ODDS_ALT, liveid: LIVE_MARKET_MATCH_ODDS, outcomes: ['1', 'X', '2']},
                    {name: 'Double Chance', id: MARKET_DOUBLE_CHANCE, altid: MARKET_DOUBLE_CHANCE_ALT, liveid: LIVE_MARKET_DOUBLE_CHANCE, outcomes: ['1X', '12', 'X2']},
                    {name: 'Under/Over 2.5', id: MARKET_TOTALS_UNDER_OVER, altid: MARKET_TOTALS_UNDER_OVER_ALT, liveid: LIVE_MARKET_TOTALS_UNDER_OVER, special: '2.5', outcomes: ['Under', 'Over']}
                ]
            },
            WEBSITE_COUPON: {
                handler: CouponHandlers.MatchOddsCoupon,
                fullWidth: true,
                markets: [
                    {name: 'FT 1X2', id: MARKET_MATCH_ODDS, altid: MARKET_MATCH_ODDS_ALT, liveid: LIVE_MARKET_MATCH_ODDS, altliveid: LIVE_MARKET_OT_MATCH_ODDS, outcomes: ['1', 'X', '2']},
                    {name: 'Double Chance', id: MARKET_DOUBLE_CHANCE, altid: MARKET_DOUBLE_CHANCE_ALT, liveid: LIVE_MARKET_DOUBLE_CHANCE, outcomes: ['1X', '12', 'X2']},
                    {name: 'Under/Over 2.5', id: MARKET_TOTALS_UNDER_OVER, altid: MARKET_TOTALS_UNDER_OVER_ALT, liveid: LIVE_MARKET_TOTALS_UNDER_OVER, altliveid: LIVE_MARKET_OT_UNDER_OVER, special: '2.5', outcomes: ['Under', 'Over']},
                    {name: 'First Team To Score', id: MARKET_FIRST_TO_SCORE, outcomes: ['1', 'No Goal', '2'], headers: ['1', 'No Goal', '2']},
                    {name: 'Halftime/Fulltime', id: MARKET_HALFTIME_FULLTIME, altid: MARKET_HALFTIME_FULLTIME_ALT, outcomes: ['1/1', '1/X', '1/2', 'X/1', 'X/X', 'X/2', '2/1', '2/X', '2/2']},
                    {name: 'Total Goals', id: MARKET_TOTAL_GOALS, outcomes: ['0 Goals', '1 Goals', '2 Goals', '3 Goals', '4 Goals'], headers: ['0', '1', '2', '3', '4']},
                    {name: 'Penalty in Match', id: 264, outcomes: ['Yes'], headers: ['Yes']},
                    {name: 'GG / NG', id: MARKET_GOAL_NO_GOAL, altid: MARKET_GOAL_NO_GOAL_ALT, liveid: LIVE_MARKET_GOAL_NO_GOAL, outcomes: ['Yes', 'No']},
                    {name: 'Yellow Card in Match', id: 702, outcomes: ['Yes'], headers: ['Yes']},
                    {name: 'HT GG / NG', id: 328, outcomes: ['Yes', 'No']},
                    {name: 'Handicap', id: 651, varSpecial: true, outcomes: ['1', '2'], headers: ['&nbsp;', '1', '2']},
                    {name: 'Time of First Goal', id: 601, outcomes: ['0-22', '23-45', '46-67', '68-90', 'No Goal'], headers: ['0-22', '23-45', '46-67', '68-90', 'No Goal']}
                ]
            },
            HALFTIME_FULLTIME: {
                menuName: 'Halftime/Fulltime',
                handler: CouponHandlers.StandardCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Halftime/Fulltime', id: MARKET_HALFTIME_FULLTIME, altid: MARKET_HALFTIME_FULLTIME_ALT, outcomes: ['1/1', '1/X', '1/2', 'X/1', 'X/X', 'X/2', '2/1', '2/X', '2/2']}
                ]
            },
            CORRECT_SCORE: {
                menuName: 'Correct Score',
                handler: CouponHandlers.CorrectScoreCoupon,
                fullWidth: true,
                markets: [
                    {
                        name: 'Correct Score', id: MARKET_CORRECT_SCORE, altid: MARKET_CORRECT_SCORE_ALT, liveid: LIVE_MARKET_CORRECT_SCORE,
                        outcomes: ['1:0', '2:0', '2:1', '3:0', '3:1', '3:2', '4:0', '4:1', '4:2', '0:0', '1:1', '2:2', '3:3'],
                        headers:  ['1-0', '2-0', '2-1', '3-0', '3-1', '3-2', '4-0', '4-1', '4-2', '0-0', '1-1', '2-2', '3-3']
                    }
                ]
            },
            GOALS: {
                menuName: 'Total Goals',
                handler: CouponHandlers.StandardCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Total Goals', id: MARKET_TOTAL_GOALS, altid: MARKET_TOTAL_GOALS_ALT, outcomes: ['0-1 goals', '1-3 goals', '2+', '2-3 goals', '2-4 goals', '3-5 goals', '4+', '4-5 goals', '4-6 goals', '5+', '6+', '7+'], headers: ['0-1', '1-3', '2+', '2-3', '2-4', '3-5', '4+', '4-5', '4-6', '5+', '6+', '7+']}
                ]
            },
            HALF_1ST: {
                menuName: '1st Half',
                handler: CouponHandlers.MatchOddsCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Match Odds', id: MARKET_1ST_MATCH_ODDS, altid: MARKET_1ST_MATCH_ODDS_ALT, outcomes: ['1', 'X', '2']},
                    {name: '1st Under/Over 0.5', id: MARKET_1ST_UNDER_OVER, altid: MARKET_1ST_UNDER_OVER_ALT, special: '0.5', headers: ['Under 0.5', 'Over 0.5'], outcomes: ['Under', 'Over']},
                    {name: '1st Under/Over 1.5', id: MARKET_1ST_UNDER_OVER, altid: MARKET_1ST_UNDER_OVER_ALT, special: '1.5', headers: ['Under 1.5', 'Over 1.5'], outcomes: ['Under', 'Over']},
                    {name: '1st Under/Over 2.5', id: MARKET_1ST_UNDER_OVER, altid: MARKET_1ST_UNDER_OVER_ALT, special: '2.5', headers: ['Under 2.5', 'Over 2.5'], outcomes: ['Under', 'Over']}
                ]
            }
        },
        'virtual-soccerbet-league': {
            MATCH_ODDS: {
                menuName: 'Match Odds',
                handler: CouponHandlers.MatchOddsCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_ODDS, altid: MARKET_MATCH_ODDS_ALT, liveid: LIVE_MARKET_MATCH_ODDS, outcomes: ['1', 'X', '2']},
                    {name: 'Double Chance', id: MARKET_DOUBLE_CHANCE, altid: MARKET_DOUBLE_CHANCE_ALT, liveid: LIVE_MARKET_DOUBLE_CHANCE, outcomes: ['1X', '12', 'X2']},
                    {name: 'Under/Over 2.5', id: MARKET_TOTALS_UNDER_OVER, altid: MARKET_TOTALS_UNDER_OVER_ALT, liveid: LIVE_MARKET_TOTALS_UNDER_OVER, special: '2.5', outcomes: ['Under', 'Over']}
                ]
            },
            WEBSITE_COUPON: {
                handler: CouponHandlers.MatchOddsCoupon,
                fullWidth: true,
                markets: [
                    {name: 'FT 1X2', id: MARKET_MATCH_ODDS, altid: MARKET_MATCH_ODDS_ALT, liveid: LIVE_MARKET_MATCH_ODDS, altliveid: LIVE_MARKET_OT_MATCH_ODDS, outcomes: ['1', 'X', '2']},
                    {name: 'Double Chance', id: MARKET_DOUBLE_CHANCE, altid: MARKET_DOUBLE_CHANCE_ALT, liveid: LIVE_MARKET_DOUBLE_CHANCE, outcomes: ['1X', '12', 'X2']},
                    {name: 'Under/Over 2.5', id: MARKET_TOTALS_UNDER_OVER, altid: MARKET_TOTALS_UNDER_OVER_ALT, liveid: LIVE_MARKET_TOTALS_UNDER_OVER, altliveid: LIVE_MARKET_OT_UNDER_OVER, special: '2.5', outcomes: ['Under', 'Over']},
                    {name: 'First Team To Score', id: MARKET_FIRST_TO_SCORE, outcomes: ['1', 'No Goal', '2'], headers: ['1', 'No Goal', '2']},
                    {name: 'Halftime/Fulltime', id: MARKET_HALFTIME_FULLTIME, altid: MARKET_HALFTIME_FULLTIME_ALT, outcomes: ['1/1', '1/X', '1/2', 'X/1', 'X/X', 'X/2', '2/1', '2/X', '2/2']},
                    {name: 'Total Goals', id: MARKET_TOTAL_GOALS, outcomes: ['0 Goals', '1 Goals', '2 Goals', '3 Goals', '4 Goals'], headers: ['0', '1', '2', '3', '4']},
                    {name: 'Penalty in Match', id: 264, outcomes: ['Yes'], headers: ['Yes']},
                    {name: 'GG / NG', id: MARKET_GOAL_NO_GOAL, altid: MARKET_GOAL_NO_GOAL_ALT, liveid: LIVE_MARKET_GOAL_NO_GOAL, outcomes: ['Yes', 'No']},
                    {name: 'Yellow Card in Match', id: 702, outcomes: ['Yes'], headers: ['Yes']},
                    {name: 'HT GG / NG', id: 328, outcomes: ['Yes', 'No']},
                    {name: 'Handicap', id: 651, varSpecial: true, outcomes: ['1', '2'], headers: ['&nbsp;', '1', '2']},
                    {name: 'Time of First Goal', id: 601, outcomes: ['0-22', '23-45', '46-67', '68-90', 'No Goal'], headers: ['0-22', '23-45', '46-67', '68-90', 'No Goal']}
                ]
            },
            HALFTIME_FULLTIME: {
                menuName: 'Halftime/Fulltime',
                handler: CouponHandlers.StandardCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Halftime/Fulltime', id: MARKET_HALFTIME_FULLTIME, altid: MARKET_HALFTIME_FULLTIME_ALT, outcomes: ['1/1', '1/X', '1/2', 'X/1', 'X/X', 'X/2', '2/1', '2/X', '2/2']}
                ]
            },
            CORRECT_SCORE: {
                menuName: 'Correct Score',
                handler: CouponHandlers.CorrectScoreCoupon,
                fullWidth: true,
                markets: [
                    {
                        name: 'Correct Score', id: MARKET_CORRECT_SCORE, altid: MARKET_CORRECT_SCORE_ALT, liveid: LIVE_MARKET_CORRECT_SCORE,
                        outcomes: ['1:0', '2:0', '2:1', '3:0', '3:1', '3:2', '4:0', '4:1', '4:2', '0:0', '1:1', '2:2', '3:3'],
                        headers:  ['1-0', '2-0', '2-1', '3-0', '3-1', '3-2', '4-0', '4-1', '4-2', '0-0', '1-1', '2-2', '3-3']
                    }
                ]
            },
            GOALS: {
                menuName: 'Total Goals',
                handler: CouponHandlers.StandardCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Total Goals', id: MARKET_TOTAL_GOALS, altid: MARKET_TOTAL_GOALS_ALT, outcomes: ['0-1 goals', '1-3 goals', '2+', '2-3 goals', '2-4 goals', '3-5 goals', '4+', '4-5 goals', '4-6 goals', '5+', '6+', '7+'], headers: ['0-1', '1-3', '2+', '2-3', '2-4', '3-5', '4+', '4-5', '4-6', '5+', '6+', '7+']}
                ]
            },
            HALF_1ST: {
                menuName: '1st Half',
                handler: CouponHandlers.MatchOddsCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Match Odds', id: MARKET_1ST_MATCH_ODDS, altid: MARKET_1ST_MATCH_ODDS_ALT, outcomes: ['1', 'X', '2']},
                    {name: '1st Under/Over 0.5', id: MARKET_1ST_UNDER_OVER, altid: MARKET_1ST_UNDER_OVER_ALT, special: '0.5', headers: ['Under 0.5', 'Over 0.5'], outcomes: ['Under', 'Over']},
                    {name: '1st Under/Over 1.5', id: MARKET_1ST_UNDER_OVER, altid: MARKET_1ST_UNDER_OVER_ALT, special: '1.5', headers: ['Under 1.5', 'Over 1.5'], outcomes: ['Under', 'Over']},
                    {name: '1st Under/Over 2.5', id: MARKET_1ST_UNDER_OVER, altid: MARKET_1ST_UNDER_OVER_ALT, special: '2.5', headers: ['Under 2.5', 'Over 2.5'], outcomes: ['Under', 'Over']}
                ]
            }
        },
        'virtual-basketball-league': {
            WEBSITE_COUPON: {
                handler: CouponHandlers.MatchOddsCoupon,
                fullWidth: true,
                markets: [
                    {name: 'FT 1X2', id: MARKET_MATCH_ODDS, altid: MARKET_MATCH_ODDS_ALT, liveid: LIVE_MARKET_MATCH_ODDS, altliveid: LIVE_MARKET_OT_MATCH_ODDS, outcomes: ['1', 'X', '2']},
                    {name: 'Away Team Score', id: MARKET_AWAY_TEAM_TO_SCORE, altid: MARKET_AWAY_TEAM_TO_SCORE_ALT, outcomes: ['3 Points', '<3 Points', '>3 Points']},
                    {name: 'Home Team Score', id: MARKET_HOME_TEAM_TO_SCORE, altid: MARKET_HOME_TEAM_TO_SCORE_ALT, outcomes: ['3 Points', '<3 Points', '>3 Points']},
                    {name: 'Away Team Scores Moneyball', id: MARKET_AWAY_TEAM_SCORES_MONEYBALL, altid: MARKET_AWAY_TEAM_SCORES_MONEYBALL_ALT, outcomes: ['No', 'Yes']},
                    {name: 'Home Team Scores Moneyball', id: MARKET_HOME_TEAM_SCORES_MONEYBALL, altid: MARKET_HOME_TEAM_SCORES_MONEYBALL_ALT, outcomes: ['No', 'Yes']},
                    {name: 'Away Team Under / Over 2.5', id: MARKET_AWAY_TEAM_UNDER_OVER, altid: MARKET_AWAY_TEAM_UNDER_OVER_ALT, special: '2.5', headers: ['Over 2.5', 'Under 2.5'], outcomes: ['Over', 'Under']},
                    {name: 'Home Team Under / Over 2.5', id: MARKET_HOME_TEAM_UNDER_OVER, altid: MARKET_HOME_TEAM_UNDER_OVER_ALT, special: '2.5', headers: ['Over 2.5', 'Under 2.5'], outcomes: ['Over', 'Under']},
                    {name: 'Handicap 0.5', id: MARKET_HANDICAP, altid: MARKET_HANDICAP_ALT, special: '0.5',outcomes: ['1', '2']},
                    {name: 'Winning Margin', id: MARKET_WINNING_MARGIN_VIRTUAL, altid: MARKET_WINNING_MARGIN_VIRTUAL_ALT,outcomes: ['1', '2','Other']},
                    {name: 'Longest Consecutive Hoops', id: MARKET_LONGEST_CONSECUTIVE_HOOPS, altid: MARKET_LONGEST_CONSECUTIVE_HOOPS_ALT,outcomes: ['1', '2','Other']},
                    {name: 'Total Points', id: MARKET_TOTAL_POINTS, altid: MARKET_TOTAL_POINTS_ALT,outcomes: ['5 Points','6 Points', '<5 Points', '>6 Points']},
                    {name: 'Total Points Under / Over 5.5', id: MARKET_TOTAL_POINTS_UNDER_OVER, altid: MARKET_TOTAL_POINTS_UNDER_OVER_ALT, special: '5.5', headers: ['Over 5.5', 'Under 5.5'], outcomes: ['Over', 'Under']},
                ]
            }
        },
        'virtual-archery': {
            WEBSITE_COUPON: {
                handler: CouponHandlers.MatchOddsCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Game Winner', id: 760, outcomes: ['1', 'X', '2'], headers: ['1', 'X', '2']}
                ]
            }
        },
        'virtual-badminton': {
            WEBSITE_COUPON: {
                handler: CouponHandlers.MatchOddsCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Game Winner', id: 760, outcomes: ['A', 'B'], headers: ['A', 'B']}
                ]
            }
        },
        'virtual-table-tennis': {
            WEBSITE_COUPON: {
                handler: CouponHandlers.MatchOddsCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Game Winner', id: 760, outcomes: ['A', 'B'], headers: ['A', 'B']}
                ]
            }
        },
        'virtual-archery': {
            WEBSITE_COUPON: {
                handler: CouponHandlers.MatchOddsCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Game Winner', id: 760, outcomes: ['1', 'X', '2'], headers: ['1', 'X', '2']}
                ]
            }
        },
        basketball: {
            MATCH_ODDS: {
                menuName: 'Match Odds',
                handler: CouponHandlers.HandicapCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Match Odds', id: MARKET_ASIAN_HANDICAP_MATCH_ODDS, altid: MARKET_ASIAN_HANDICAP_MATCH_ODDS_ALT, liveid: LIVE_MARKET_MATCH_ODDS_2WAY, markets: 1, varSpecial: true, outcomes: ['1', '2'], headers: ['&nbsp;', '1', '2']},
                    {name: 'Halftime Match Odds', id: MARKET_1ST_ASIAN_HANDICAP_MATCH_ODDS, altid: MARKET_1ST_ASIAN_HANDICAP_MATCH_ODDS_ALT, liveid: LIVE_MARKET_1ST_MATCH_ODDS_2WAY, varSpecial: true, markets: 1, outcomes: ['1', '2'], headers: ['&nbsp;', 'HT 1', 'HT 2']},
                    {name: 'Under/Over', id: MARKET_BSK_UNDER_OVER, altid: MARKET_BSK_UNDER_OVER_ALT, liveid: LIVE_MARKET_UNDER_OVER, markets: 1, varSpecial: true, outcomes: ['Under', 'Over'], headers: ['&nbsp;', 'Under', 'Over']}
                ]
            },
            HALFTIME_FULLTIME: {
                menuName: 'Halftime/Fulltime',
                handler: CouponHandlers.HandicapCoupon,
                markets: [
                    {name: 'Halftime/Fulltime', id: MARKET_BSK_HALFTIME_FULLTIME, altid: MARKET_BSK_HALFTIME_FULLTIME_ALT, varSpecial: true, markets: 1, outcomes: ['1/1', '1/2', '2/1', '2/2'], headers: ['&nbsp;', '1/1', '1/2', '2/1', '2/2']}
                ]
            },
            WEBSITE_COUPON: {
                handler: CouponHandlers.MatchOddsCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Match Odds', id: MARKET_ASIAN_HANDICAP_MATCH_ODDS, altid: MARKET_ASIAN_HANDICAP_MATCH_ODDS_ALT, markets: 1, varSpecial: true, outcomes: ['1', '2'], headers: ['&nbsp;', '1', '2']},
                    {name: 'Halftime Match Odds', id: MARKET_1ST_ASIAN_HANDICAP_MATCH_ODDS, altid: MARKET_1ST_ASIAN_HANDICAP_MATCH_ODDS_ALT, markets: 1, varSpecial: true, outcomes: ['1', '2'], headers: ['&nbsp;', '1', '2']},
                    {name: 'Under/Over', id: MARKET_BSK_UNDER_OVER, altid: MARKET_BSK_UNDER_OVER_ALT, markets: 1, varSpecial: true, outcomes: ['Under', 'Over'], headers: ['&nbsp;', 'Under', 'Over']},
                    {name: 'Halftime/Fulltime', id: MARKET_BSK_HALFTIME_FULLTIME, altid: MARKET_BSK_HALFTIME_FULLTIME_ALT, markets: 1, varSpecial: true, outcomes: ['1/1', '1/2', '2/1', '2/2'], headers: ['&nbsp;', '1/1', '1/2', '2/1', '2/2']}
                ]
            }
        },
        baseball: {
            MATCH_ODDS: {
                menuName: 'Match Odds',
                handler: CouponHandlers.MatchOddsTwoWayCoupon,
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_ODDS_2WAY_ALT, outcomes: ['1', '2']},
                    {name: 'Under/Over', id: MARKET_UNDER_OVER_INCL_OT, varSpecial: true, outcomes: ['Under', 'Over'], headers: ['&nbsp;', 'Under', 'Over']}
                ]
            }
        },
        boxing: {
            MATCH_ODDS: {
                menuName: 'Winner',
                handler: CouponHandlers.MatchOddsTwoWayCoupon,
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_ODDS_2WAY_ALT, outcomes: ['1', '2']},
                ]
            }
        },
        cricket: {
            MATCH_ODDS: {
                menuName: 'Winner',
                handler: CouponHandlers.MatchOddsTwoWayCoupon,
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_ODDS_2WAY_ALT, outcomes: ['1', '2']},
                ]
            }
        },
        'ice-hockey': {
            MATCH_ODDS: {
                menuName: 'Match Odds',
                fullWidth: true,
                handler: CouponHandlers.MatchOddsCoupon,
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_HANDICAP, outcomes: ['1', 'X', '2']},
                    {name: 'Double Chance', id: MARKET_DOUBLE_CHANCE, altid: MARKET_DOUBLE_CHANCE_ALT, liveid: LIVE_MARKET_DOUBLE_CHANCE, outcomes: ['1X', '12', 'X2']},
                    {name: 'Under/Over', id: MARKET_UNDER_OVER_ALT, altid: MARKET_UNDER_OVER, varSpecial: true, outcomes: ['Under', 'Over'], headers: ['&nbsp;', 'Under', 'Over']}
                ]
            }
        },
        tennis: {
            MATCH_ODDS: {
                menuName: 'Match Odds',
                handler: CouponHandlers.MatchOddsTwoWayCoupon,
                headers: {
                    1: 'Player(s) 1',
                    2: 'Player(s) 2'
                },
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_ODDS_2WAY, altid: MARKET_MATCH_ODDS_2WAY_ALT, liveid: LIVE_MARKET_MATCH_ODDS_2WAY_TENNIS, outcomes: ['1', '2']},
                    {name: 'Under/Over', id: MARKET_TOTAL_GAMES, altid: MARKET_TOTAL_GAMES_ALT, liveid: LIVE_MARKET_TOTAL_GAMES, varSpecial: true, outcomes: ['Under', 'Over'], headers: ['&nbsp;', 'Under', 'Over']}
                ]
            }
        },
        handball: {
            MATCH_ODDS: {
                menuName: 'Match Odds',
                handler: CouponHandlers.MatchOddsCoupon,
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_HANDICAP, outcomes: ['1', 'X', '2']}
                ]
            }
        },
        golf: {
            MATCH_ODDS: {
                menuName: 'Match Odds',
                handler: CouponHandlers.MatchOddsTwoWayCoupon,
                headers: {
                    1: 'Player 1',
                    2: 'Player 2'
                },
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_ODDS_2WAY, altid:MARKET_MATCH_ODDS_2WAY_ALT, outcomes: ['1', '2']},
                    {name: 'Under/Over', id: MARKET_UNDER_OVER, outcomes: ['Under', 'Over'], headers: ['&nbsp;', 'Under', 'Over']}
                ]
            }
        },
        motorsport: {
            MATCH_ODDS: {
                menuName: 'Match Odds',
                handler: CouponHandlers.MatchOddsTwoWayCoupon,
                headers: {
                    1: 'Driver 1',
                    2: 'Driver 2'
                },
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_ODDS_2WAY, altid:MARKET_MATCH_ODDS_2WAY_ALT, outcomes: ['1', '2']}
                ]
            }
        },
        rugby: {
            MATCH_ODDS: {
                menuName: 'Match Odds',
                handler: CouponHandlers.MatchOddsCoupon,
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_HANDICAP, outcomes: ['1', 'X', '2']},
                ]
            }
        },
        'american-football': {
            MATCH_ODDS: {
                menuName: 'Match Odds',
                handler: CouponHandlers.MatchOddsTwoWayCoupon,
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_ODDS_2WAY_ALT, outcomes: ['1', '2']},
                    {name: 'Under/Over', id: MARKET_UNDER_OVER, varSpecial: true, outcomes: ['Under', 'Over'], headers: ['&nbsp;', 'Under', 'Over']}
                ]
            }
        },
        snooker: {
            MATCH_ODDS: {
                menuName: 'Match Odds',
                handler: CouponHandlers.MatchOddsTwoWayCoupon,
                headers: {
                    1: 'Player 1',
                    2: 'Player 2'
                },
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_ODDS_2WAY_ALT, outcomes: ['1', '2']},
                    {name: 'Under/Over', id: MARKET_UNDER_OVER_FRAMES, varSpecial: true, outcomes: ['Under', 'Over'], headers: ['&nbsp;', 'Under', 'Over']}
                ]
            }
        },
        darts: {
            MATCH_ODDS: {
                menuName: 'Match Odds',
                handler: CouponHandlers.MatchOddsCoupon,
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_ODDS, outcomes: ['1', 'X', '2']}
                ]
            }
        },
        volleyball: {
            MATCH_ODDS: {
                menuName: 'Match Odds',
                handler: CouponHandlers.MatchOddsTwoWayCoupon,
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_ODDS_2WAY, altid: MARKET_MATCH_ODDS_2WAY_ALT, liveid: LIVE_MARKET_MATCH_ODDS_2WAY_VOLLEYBALL, outcomes: ['1', '2']},
                    {name: 'Under/Over', id: MARKET_TOTAL_GAMES_ALT, liveid: LIVE_MARKET_TOTALS_UNDER_OVER, varSpecial: true, outcomes: ['Under', 'Over'], headers: ['&nbsp;', 'Under', 'Over']}
                ]
            }
        },
        futsal: {
            MATCH_ODDS: {
                menuName: 'Match Odds',
                handler: CouponHandlers.MatchOddsCoupon,
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_HANDICAP, outcomes: ['1', '2']},
                    {name: 'Under/Over', id: MARKET_UNDER_OVER, varSpecial: true, outcomes: ['Under', 'Over'], headers: ['&nbsp;', 'Under', 'Over']}
                ]
            }
        }
    };

    ZAPNET.COUPONS.LIVE_COUPON = {
        handler: CouponHandlers.LiveBettingCoupon,
        fullWidth: true,
        live: true,
        markets: [
            {name: 'Match Odds', id: 10, markets: 1, outcomes: ['1', 'X', '2'], stype: '3way',
                sportmarkets: {
                    soccer: {id: MARKET_MATCH_ODDS, altid: MARKET_MATCH_ODDS_ALT, liveid: LIVE_MARKET_MATCH_ODDS, submarkets: {
                            id: MARKET_1ST_MATCH_ODDS, altid: MARKET_1ST_MATCH_ODDS_ALT, liveperiodid: {
                                '1p': LIVE_MARKET_1ST_MATCH_ODDS,
                                'ot': LIVE_MARKET_OT_MATCH_ODDS,
                                'awaiting_ot': LIVE_MARKET_OT_MATCH_ODDS,
                                '1p_ot': LIVE_MARKET_OT_MATCH_ODDS,
                                'ot_ht': LIVE_MARKET_OT_MATCH_ODDS,
                                '2p_ot': LIVE_MARKET_OT_MATCH_ODDS
                                }}, extramarkets: {
                            id: false, altid: false, liveid: LIVE_MARKET_REST_OF_MATCH}, hasdraw: true},
                    basketball: {id: MARKET_MATCH_ODDS_2WAY, altid: MARKET_MATCH_ODDS_2WAY_ALT, liveid: LIVE_MARKET_MATCH_ODDS_2WAY, hasdraw: false},
                    tennis: {id: MARKET_MATCH_ODDS_2WAY, altid: MARKET_MATCH_ODDS_2WAY_ALT, liveid: LIVE_MARKET_MATCH_ODDS_2WAY_TENNIS, submarkets: {
                            id: MARKET_MATCH_ODDS_2WAY, altid: MARKET_MATCH_ODDS_2WAY_ALT, liveid: LIVE_MARKET_SET_WINNER }, hasdraw: false},
                    baseball: {id: MARKET_MATCH_ODDS_2WAY, liveid: LIVE_MARKET_MATCH_ODDS_2WAY, hasdraw: false},
                    handball: {id: MARKET_MATCH_ODDS_2WAY, liveid: LIVE_MARKET_MATCH_ODDS_2WAY, hasdraw: false},
                    futsal: {id: MARKET_MATCH_ODDS_2WAY, liveid: LIVE_MARKET_MATCH_ODDS_2WAY, hasdraw: false},
                    'ice-hockey': {id: MARKET_MATCH_ODDS, altid: MARKET_MATCH_ODDS_ALT, liveid: LIVE_MARKET_MATCH_ODDS, hasdraw: true},
                    volleyball: {id: MARKET_MATCH_ODDS_2WAY, altid: MARKET_MATCH_ODDS_2WAY_ALT, liveid: LIVE_MARKET_MATCH_ODDS_2WAY_VOLLEYBALL, hasdraw: false},
                    'american-football': {id: MARKET_MATCH_ODDS_2WAY, liveid: LIVE_MARKET_MATCH_ODDS, hasdraw: false},
                    'virtual-football': {id: MARKET_MATCH_ODDS, altid: MARKET_MATCH_ODDS_ALT, liveid: LIVE_MARKET_MATCH_ODDS, hasdraw: true},
                    'virtual-football-league': {id: MARKET_MATCH_ODDS, altid: MARKET_MATCH_ODDS_ALT, liveid: LIVE_MARKET_MATCH_ODDS, hasdraw: true},
                    'virtual-soccerbet-league': {id: MARKET_MATCH_ODDS, altid: MARKET_MATCH_ODDS_ALT, liveid: LIVE_MARKET_MATCH_ODDS, hasdraw: true}
                }
            },
            {name: 'Under/Over', id: 56, markets: 1, outcomes: ['Under', 'Over'], headers: ['&nbsp;', '&#9660;', '&#9650;'], hasSpecial: true, stype: 'nway',
                sportmarkets: {
                    soccer: {id: MARKET_TOTALS_UNDER_OVER, altid: MARKET_TOTALS_UNDER_OVER_ALT, liveid: LIVE_MARKET_TOTALS_UNDER_OVER, submarkets: {
                            id: MARKET_1ST_UNDER_OVER, altid: MARKET_1ST_UNDER_OVER_ALT, liveperiodid: {
                                '1p': LIVE_MARKET_1ST_UNDER_OVER,
                                'ot': LIVE_MARKET_OT_UNDER_OVER,
                                'awaiting_ot': LIVE_MARKET_OT_UNDER_OVER,
                                '1p_ot': LIVE_MARKET_OT_UNDER_OVER,
                                'ot_ht': LIVE_MARKET_OT_UNDER_OVER,
                                '2p_ot': LIVE_MARKET_OT_UNDER_OVER}}},
                    basketball: {id: MARKET_BSK_UNDER_OVER, altid: MARKET_BSK_UNDER_OVER_ALT, liveid: LIVE_MARKET_UNDER_OVER, markets: 1},
                    tennis: {id: MARKET_TOTAL_GAMES, altid: MARKET_TOTAL_GAMES_ALT, liveid: LIVE_MARKET_TOTAL_GAMES, submarkets: {
                            id: MARKET_TOTAL_GAMES, altid: MARKET_TOTAL_GAMES_ALT, liveperiodid: {
                                '1set': LIVE_MARKET_TOTAL_GAMES_SET1,
                                '2set': LIVE_MARKET_TOTAL_GAMES_SET2,
                                '3set': LIVE_MARKET_TOTAL_GAMES_SET3,
                                '4set': LIVE_MARKET_TOTAL_GAMES_SET4,
                                '5set': LIVE_MARKET_TOTAL_GAMES_SET5
                            }}},
                    baseball: {id: MARKET_UNDER_OVER, liveid: LIVE_MARKET_UNDER_OVER},
                    handball: {id: MARKET_UNDER_OVER, liveid: LIVE_MARKET_UNDER_OVER},
                    futsal: {id: MARKET_UNDER_OVER, liveid: LIVE_MARKET_UNDER_OVER},
                    'ice-hockey': {id: MARKET_UNDER_OVER, liveid: LIVE_MARKET_TOTALS_UNDER_OVER},
                    volleyball: {id: MARKET_UNDER_OVER, altid: MARKET_TOTAL_GAMES_ALT, liveid: LIVE_MARKET_TOTALS_UNDER_OVER, submarkets: {
                            id: MARKET_TOTAL_GAMES, altid: MARKET_TOTAL_GAMES_ALT, liveperiodid: {
                                '1set': LIVE_MARKET_TOTAL_POINTS_SET1,
                                '2set': LIVE_MARKET_TOTAL_POINTS_SET2,
                                'pause1': LIVE_MARKET_TOTAL_POINTS_SET2,
                                '3set': LIVE_MARKET_TOTAL_POINTS_SET3,
                                'pause2': LIVE_MARKET_TOTAL_POINTS_SET3,
                                '4set': LIVE_MARKET_TOTAL_POINTS_SET4,
                                'pause3': LIVE_MARKET_TOTAL_POINTS_SET4,
                                '5set': LIVE_MARKET_TOTAL_POINTS_SET5,
                                'pause4': LIVE_MARKET_TOTAL_POINTS_SET5
                            }}},
                    'american-football': {id: MARKET_UNDER_OVER, liveid: LIVE_MARKET_UNDER_OVER},
                    'virtual-football': {id: MARKET_TOTALS_UNDER_OVER, altid: MARKET_TOTALS_UNDER_OVER_ALT, liveid: LIVE_MARKET_TOTALS_UNDER_OVER},
                    'virtual-football-league': {id: MARKET_TOTALS_UNDER_OVER, altid: MARKET_TOTALS_UNDER_OVER_ALT, liveid: LIVE_MARKET_TOTALS_UNDER_OVER},
                    'virtual-soccerbet-league': {id: MARKET_TOTALS_UNDER_OVER, altid: MARKET_TOTALS_UNDER_OVER_ALT, liveid: LIVE_MARKET_TOTALS_UNDER_OVER}
                }
            },
            {name: 'Rest of Match', id: LIVE_MARKET_REST_OF_MATCH, markets: 1, outcomes: ['1', 'X', '2'], stype: '3way',
                sportmarkets: {
                    soccer: {id: LIVE_MARKET_WHICH_TEAM_HAS_KICKOFF, altid: MARKET_MATCH_ODDS_ALT, liveid: LIVE_MARKET_REST_OF_MATCH, submarkets: {
                            id: false, altid: false, liveperiodid: {
                                '1p': LIVE_MARKET_1ST_REST_OF_1ST}}, hasdraw: true},
                    basketball: {id: false, liveid: false, hasdraw: false},
                    tennis: {id: false, hasdraw: false},
                    baseball: {id: false, liveid: false, hasdraw: false},
                    handball: {id: false, liveid: false, hasdraw: false},
                    futsal: {id: false, liveid: false, hasdraw: false},
                    'ice-hockey': {id: 0, liveid: LIVE_MARKET_REST_OF_MATCH, hasdraw: true},
                    volleyball: {id: false, liveid: false, hasdraw: false},
                    'american-football': {id: false, liveid: false, hasdraw: false},
                    'virtual-football': {id: LIVE_MARKET_WHICH_TEAM_HAS_KICKOFF, altid: MARKET_MATCH_ODDS_ALT, liveid: LIVE_MARKET_REST_OF_MATCH, hasdraw: true},
                    'virtual-football-league': {id: LIVE_MARKET_WHICH_TEAM_HAS_KICKOFF, altid: MARKET_MATCH_ODDS_ALT, liveid: LIVE_MARKET_REST_OF_MATCH, hasdraw: true},
                    'virtual-soccerbet-league': {id: LIVE_MARKET_WHICH_TEAM_HAS_KICKOFF, altid: MARKET_MATCH_ODDS_ALT, liveid: LIVE_MARKET_REST_OF_MATCH, hasdraw: true}
                }
            },
            {name: 'Next Goal', id: LIVE_MARKET_NEXT_GOAL, markets: 1, outcomes: ['1', 'None', '2'], liveoutcomes: ['1', 'X', '2'], headers: ['1', 'X', '2'], stype: '3way',
                sportmarkets: {
                    soccer: {id: MARKET_FIRST_TO_SCORE, liveid: LIVE_MARKET_NEXT_GOAL, submarkets: {
                            id: false, altid: false, liveperiodid: {
                                '1p': LIVE_MARKET_1ST_NEXT_GOAL,
                                'ot': LIVE_MARKET_OT_NEXT_GOAL,
                                'awaiting_ot': LIVE_MARKET_OT_NEXT_GOAL,
                                '1p_ot': LIVE_MARKET_OT_NEXT_GOAL,
                                'ot_ht': LIVE_MARKET_OT_NEXT_GOAL,
                                '2p_ot': LIVE_MARKET_OT_NEXT_GOAL}}, extramarkets: {
                            id: false, altid: false, liveid: LIVE_MARKET_1ST_REST_OF_1ST}, hasdraw: true},
                    basketball: {id: false, hasdraw: false},
                    volleyball: {id: false, liveid: false, hasdraw: false},
                    futsal: {id: false, liveid: false, hasdraw: false},
                    handball: {id: false, liveid: false, hasdraw: false},
                    'ice-hockey': {id: MARKET_FIRST_TO_SCORE, liveid: LIVE_MARKET_NEXT_GOAL, hasdraw: true},
                    tennis: {id: false, submarkets: {
                            id: MARKET_TOTAL_GAMES, altid: MARKET_TOTAL_GAMES_ALT, liveperiodid: {
                                '1set': LIVE_MARKET_GAME_WINNER_SET1,
                                '2set': LIVE_MARKET_GAME_WINNER_SET2,
                                '3set': LIVE_MARKET_GAME_WINNER_SET3,
                                '4set': LIVE_MARKET_GAME_WINNER_SET4,
                                '5set': LIVE_MARKET_GAME_WINNER_SET5
                            }}, hasdraw: false},
                    baseball: {id: MARKET_MATCH_ODDS_2WAY, liveid: LIVE_MARKET_MATCH_ODDS_2WAY, hasdraw: false},
                    'american-football': {id: MARKET_MATCH_ODDS_2WAY, liveid: LIVE_MARKET_MATCH_ODDS, hasdraw: false},
                    'virtual-football': {id: MARKET_FIRST_TO_SCORE, liveid: LIVE_MARKET_NEXT_GOAL, hasdraw: true},
                    'virtual-football-league': {id: MARKET_FIRST_TO_SCORE, liveid: LIVE_MARKET_NEXT_GOAL, hasdraw: true},
                    'virtual-soccerbet-league': {id: MARKET_FIRST_TO_SCORE, liveid: LIVE_MARKET_NEXT_GOAL, hasdraw: true}
                }
            }
        ]
    };

    ZAPNET.COUPONS.LIVE_TV_COUPON = {
        handler: CouponHandlers.LiveTVCoupon,
        fullWidth: true,
        live: true,
        markets: ZAPNET.COUPONS.LIVE_COUPON.markets
    };

    ZAPNET.COUPONS.LIVE_SHOP_COUPON = {
        handler: CouponHandlers.LiveBettingCoupon,
        fullWidth: true,
        live: true,
        markets: ZAPNET.COUPONS.LIVE_COUPON.markets.slice(0)
    };

    ZAPNET.COUPONS.LIVE_SHOP_COUPON.markets.push(
        {name: 'HT Match Odds', id: MARKET_1ST_MATCH_ODDS, altid: MARKET_1ST_MATCH_ODDS_ALT, liveid: LIVE_MARKET_1ST_MATCH_ODDS, markets: 1, outcomes: ['1', 'X', '2'], newline: true, stype: '3way'},
        {name: 'HT Under/Over', id: MARKET_1ST_UNDER_OVER, altid: MARKET_1ST_UNDER_OVER_ALT, markets: 3, liveid: LIVE_MARKET_1ST_UNDER_OVER, specials: [0.5, 1.5, 2.5], outcomes: ['Under', 'Over'], stype: 'nway'},
        {name: 'HT Rest Of Match', id: LIVE_MARKET_1ST_REST_OF_1ST, altid: LIVE_MARKET_1ST_REST_OF_1ST, liveid: LIVE_MARKET_1ST_REST_OF_1ST, markets: 1, outcomes: ['1', 'X', '2'], stype: '3way'},
        {name: 'HT Next Goal', id: LIVE_MARKET_1ST_NEXT_GOAL, altid: LIVE_MARKET_1ST_NEXT_GOAL, liveid: LIVE_MARKET_1ST_NEXT_GOAL, markets: 1, outcomes: ['1', 'None', '2'], liveoutcomes: ['1', 'X', '2'], headers: ['1', 'X', '2'], stype: '3way'}
    );
    ZAPNET.COUPONS.LIVE_SHOP_COUPON.markets[2].sportmarkets.soccer = {
        id: MARKET_MATCH_ODDS,
        altid: MARKET_MATCH_ODDS_ALT,
        liveid: LIVE_MARKET_REST_OF_MATCH, submarkets: {
            id: false, altid: false, liveperiodid: {
                '1p': LIVE_MARKET_1ST_REST_OF_1ST
            }
        }, hasdraw: true
    };

    ZAPNET.COUPONS.MARKET_BUTTONS = {
        soccer: [
            {label: "Match Odds", value: "match-odds", checked: true},
            {label: "Correct Score", value: "correct-score"},
            {label: "FT 1X2 & Under/Over 2.5", value: "combinations"},
            {label: "Goals", value: "goals"},
            {label: "1st Half", value: "1st-half"},
            {label: "Halftime/Fulltime", value: "halftime-fulltime"},
            {label: "To Qualify", value: "to-qualify"}
        ],
        'virtual-football': [
            {label: "Match Odds", value: "match-odds", checked: true},
            {label: "Correct Score", value: "correct-score"},
            {label: "FT 1X2 & Under/Over 2.5", value: "combinations"},
            {label: "Goals", value: "goals"},
            {label: "1st Half", value: "1st-half"},
            {label: "Halftime/Fulltime", value: "halftime-fulltime"},
            {label: "To Qualify", value: "to-qualify"}
        ],
        'virtual-football-league': [
            {label: "Match Odds", value: "match-odds", checked: true},
            {label: "Correct Score", value: "correct-score"}
        ],
        'virtual-soccerbet-league': [
            {label: "Match Odds", value: "match-odds", checked: true},
            {label: "Correct Score", value: "correct-score"}
        ],
        basketball: [
            {label: "Match Odds", value: "match-odds", checked: true},
            {label: "Halftime/Fulltime", value: "halftime-fulltime"}
        ],
        baseball: [
            {label: "Match Odds", value: "match-odds", checked: true}
        ],
        'ice-hockey': [
            {label: "Match Odds", value: "match-odds", checked: true}
        ],
        tennis: [
            {label: "Match Odds", value: "match-odds", checked: true}
        ],
        handball: [
            {label: "Match Odds", value: "match-odds", checked: true}
        ],
        golf: [
            {label: "Match Odds", value: "match-odds", checked: true}
        ],
        motorsport: [
            {label: "Match Odds", value: "match-odds", checked: true}
        ],
        rugby: [
            {label: "Match Odds", value: "match-odds", checked: true}
        ],
        'american-football': [
            {label: "Match Odds", value: "match-odds", checked: true}
        ],
        snooker: [
            {label: "Match Odds", value: "match-odds", checked: true}
        ],
        darts: [
            {label: "Match Odds", value: "match-odds", checked: true}
        ],
        volleyball: [
            {label: "Match Odds", value: "match-odds", checked: true}
        ],
        futsal: [
            {label: "Match Odds", value: "match-odds", checked: true}
        ]
    };



}());