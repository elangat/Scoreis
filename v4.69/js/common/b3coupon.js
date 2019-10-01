(function(){

    var Event = YAHOO.util.Event,
        Dom = YAHOO.util.Dom,
        $ = YAHOO.util.Selector.query,
        Util = ZAPNET.util;

    var SELECTION_NO = '<div class="selection selection-na"><div class="sel-odds">&nbsp;</div></div>';
    var SELECTION_EMPTY = '<div class="selection selection-empty">&nbsp;</div>';

    var LIVE_MARKET_MATCH_ODDS = '2002',
        LIVE_MARKET_DOUBLE_CHANCE = '1027',
        LIVE_MARKET_TOTALS_UNDER_OVER = '2005',
        LIVE_MARKET_NEXT_GOAL = '1013';

    var ENTITY_SORT_FN = function(a, b){
        if (a.order == b.order){
            return a.name < b.name ? -1 : 1;
        }
        return a.order - b.order;
    };

    var PERIOD_LABELS = {
        '1p': '1st Half',
        'paused': 'HT',
        '2p': '2nd Half',
        'ended': 'FT',
        '1set': 'Set 1',
        '2set': 'Set 2',
        '3set': 'Set 3',
        '4set': 'Set 4',
        '5set': 'Set 5'
    };

    var LIVE_MATCH_SORT_FN = function(a, b){
        var aEnd = a.status == 'ended' ? 1 : 0;
        var bEnd = b.status == 'ended' ? 1 : 0;
        if (aEnd || bEnd){
            return aEnd - bEnd;
        }
        var aMin = a.lmtime == 'pause' ? '46' : parseInt(a.lmtime);
        var bMin = b.lmtime == 'pause' ? '46' : parseInt(b.lmtime);
        if (Util.isNumeric(aMin) && Util.isNumeric(bMin)){
            return bMin - aMin;
        }
        return a.ts - b.ts;
    };

    var scrollToTop = function(step){
        if (window.pageYOffset <= 0){
            return;
        }
        if (!step){
            step = Math.round(Math.max(75, window.pageYOffset / 25));
        }
        window.scrollBy(0, 0 - step);
        setTimeout(function(){
            scrollToTop(step);
        }, 20);
    };

    ZAPNET.BetDBReadyEvent.subscribe(function(){
        ZAPNET.BetDB.matchOddsChangeEvent.subscribe(function(data){
            var dir = data.odds < data.old ? 'down' : 'up';
            var selEls = $('.match div[sid="' + data.id + '"].selection');
            Util.foreach(selEls, function(selEl){
                var selectionButton = Dom.getAncestorByClassName(selEl, 'selection-button');
                Dom.addClass(selectionButton, 'odds-' + dir);
                var oddsArr = Util.div('odds-change-arrow odds-change-arrow-' + dir);
                selectionButton.appendChild(oddsArr);
                var selOdds = $('div.sel-odds', selEl, true);
                var oddsEl = selOdds ? selOdds : selEl;
                oddsEl.innerHTML = Util.formatOdds(data.odds);
                setTimeout(function(){
                    selectionButton.removeChild(oddsArr);
                    Dom.removeClass(selectionButton, 'odds-up');
                    Dom.removeClass(selectionButton, 'odds-down');
                }, 3000);
            });
        });

        ZAPNET.BetDB.outrightOddsChangeEvent.subscribe(function(data){
            // var dir = data.odds < data.old ? 'down' : 'up';
            // oddsChange('outrights', data.id, data.odds, dir);
        });

        var getMatchCards = function(match){
            var hr = 0, hy = 0, ar = 0, ay = 0;

            if (match.cards && match.cards.home && match.cards.away){
                hr = +match.cards['home'].yellowred + +match.cards['home'].red;
                hy = +match.cards['home'].yellow;
                ar = +match.cards['away'].yellowred + +match.cards['away'].red;
                ay = +match.cards['away'].yellow;
            }

            return {
                hr: hr,
                hy: hy,
                ar: ar,
                ay: ay
            };
        };

        ZAPNET.BetDB.matchChangedEvent.subscribe(function(matchId){
            var match = ZAPNET.BetDB.matches[matchId];
            var matchEls = $('div[mid="' + matchId + '"].match');
            Util.foreach(matchEls, function(matchEl){
                var day = $('div.match-status div.day', matchEl, true);
                var score = $('div.match-status div.score', matchEl, true);
                if (day){
                    if (match.status == "live"){
                        day.innerHTML = match.lmtime;
                    }
                }
                if (score && match.status == "live"){
                    var rh = match.cards ? +match.cards['home'].red + +match.cards['home'].yellowred : 0;
                    var ra = match.cards ? +match.cards['away'].red + +match.cards['away'].yellowred : 0;
                    score.innerHTML = (+rh ? '<span class="red-cards">' +  rh + '</span>&nbsp;&nbsp;' : '') + match.score + (+ra ? '&nbsp;&nbsp;<span class="red-cards">' + ra + '</span>' : '');
                }

                var minute = $('div.match-live-info div.match-minute', matchEl, true);
                if (minute){
                    minute.innerHTML = match.lmtime;
                }
                var matchScore = $('div.match-live-info div.match-score', matchEl, true);
                if (matchScore){
                    matchScore.innerHTML = match.score;
                }

                if (match.tournament.category.sport.code == 'tennis'){
                    var homeServer = match.ldata && match.ldata.server && match.ldata.server == '1';
                    var awayServer = match.ldata && match.ldata.server && match.ldata.server == '2';
                    var setscore = '', setscores;
                    if (match.setscores){
                        setscores = match.setscores.split(' - ');
                        setscore = setscores.pop();
                    }
                    var homeServerEl = $('div.home-tennis-server', matchEl, true);
                    var awayServerEl = $('div.away-tennis-server', matchEl, true);
                    var tennisSetscoresEl = $('div.tennis-last-set-score', matchEl, true);
                    if (homeServerEl){
                        if (homeServer){
                            Dom.addClass(homeServerEl, 'tennis-server-on');
                        } else {
                            Dom.removeClass(homeServerEl, 'tennis-server-on');
                        }
                    }
                    if (awayServerEl){
                        if (awayServer){
                            Dom.addClass(awayServerEl, 'tennis-server-on');
                        } else {
                            Dom.removeClass(awayServerEl, 'tennis-server-on');
                        }
                    }
                    if (tennisSetscoresEl){
                        tennisSetscoresEl.innerHTML = setscore;
                    }
                }

                if (match.tournament.category.sport.code == 'soccer'){
                    var matchInfoEl = $('div.match-info.match-card-info', matchEl, true);
                    if (matchInfoEl){
                        var cards = getMatchCards(match);
                        var hrEl = $('div.match-home-red-cards', matchInfoEl, true);
                        var hyEl = $('div.match-home-yellow-cards', matchInfoEl, true);
                        var arEl = $('div.match-away-red-cards', matchInfoEl, true);
                        var ayEl = $('div.match-away-yellow-cards', matchInfoEl, true);
                        if (hrEl && hyEl && arEl && ayEl){
                            if (cards.hr){
                                Dom.addClass(matchInfoEl, 'have-home-reds');
                                Dom.replaceClass(hrEl, 'match-cards-off', 'match-cards-on');
                                hrEl.innerHTML = cards.hr;
                            } else {
                                Dom.removeClass(matchInfoEl, 'have-home-reds');
                                Dom.replaceClass(hrEl, 'match-cards-on', 'match-cards-off');
                                hrEl.innerHTML = '';
                            }
                            if (cards.hy){
                                Dom.addClass(matchInfoEl, 'have-home-yellows');
                                Dom.replaceClass(hyEl, 'match-cards-off', 'match-cards-on');
                                hyEl.innerHTML = cards.hy;
                            } else {
                                Dom.removeClass(matchInfoEl, 'have-home-yellows');
                                Dom.replaceClass(hyEl, 'match-cards-on', 'match-cards-off');
                                hyEl.innerHTML = '';
                            }
                            if (cards.ar){
                                Dom.addClass(matchInfoEl, 'have-away-reds');
                                Dom.replaceClass(arEl, 'match-cards-off', 'match-cards-on');
                                arEl.innerHTML = cards.ar;
                            } else {
                                Dom.removeClass(matchInfoEl, 'have-away-reds');
                                Dom.replaceClass(arEl, 'match-cards-on', 'match-cards-off');
                                arEl.innerHTML = '';
                            }
                            if (cards.ay){
                                Dom.addClass(matchInfoEl, 'have-away-yellows');
                                Dom.replaceClass(ayEl, 'match-cards-off', 'match-cards-on');
                                ayEl.innerHTML = cards.ay;
                            } else {
                                Dom.removeClass(matchInfoEl, 'have-away-yellows');
                                Dom.replaceClass(ayEl, 'match-cards-on', 'match-cards-off');
                                ayEl.innerHTML = '';
                            }
                        }
                    }
                }

            });

            var matchMarketMenuEl = $('.match-content div[mid="' + matchId + '"].match .match-bets .match-market-menu', null, true);
            if (matchMarketMenuEl){
                var mmmHtml = [];
                ZAPNET.Coupon.getMatchMarketMenu(mmmHtml, match);
                matchMarketMenuEl.innerHTML = mmmHtml.join('');
            }
            var matchMarketsEl = $('.match-content div[mid="' + matchId + '"].match .match-bets .match-markets', null, true);
            if (matchMarketsEl){
                var mmHtml = [];
                ZAPNET.Coupon.getSingleMatchMarkets(mmHtml, match);
                matchMarketsEl.innerHTML = mmHtml.join('');
            }

            ZAPNET.Coupon.setLiveMatchPanelInfo(matchId);
        });
        ZAPNET.BetDB.matchRemovedEvent.subscribe(function(matchId){
            var matchEls = $('div[mid="' + matchId + '"].match');
            var reRender = false;
            Util.foreach(matchEls, function(matchEl){
                matchEl.parentNode.removeChild(matchEl);
                if (ZAPNET.SportsCouponView && Dom.hasClass(matchEl, 'match-status-live')){
                    reRender = true;
                }
            });
            if (reRender){
                ZAPNET.Coupon.render();
            }
        });
        ZAPNET.BetDB.matchMarketStatusChangeEvent.subscribe(function(matchId){
            var matchEls = $('div[mid="' + matchId + '"].match', null);
            if (!matchEls || !matchEls.length){
                return;
            }
            Util.foreach(matchEls, function(matchEl){
                var matchMarketsEls = $('div.match-markets div[mkid].match-market', matchEl);
                if (matchMarketsEls && matchMarketsEls.length){
                    Util.foreach(matchMarketsEls, function(marketEl){
                        var mkId = Dom.getAttribute(marketEl, 'mkid');
                        var market = ZAPNET.BetDB.markets[mkId] ? ZAPNET.BetDB.markets[mkId] : false;
                        if (market && market.status == 'open'){
                            Dom.removeClass(marketEl, 'nobet');
                        } else {
                            Dom.addClass(marketEl, 'nobet');
                        }
                    });
                }
                if (Dom.hasClass(matchEl, 'open-match')){
                    var matchMarketsEl = $('div.match-all-markets', matchEl, true);
                    if (matchMarketsEl){
                        var html = [];
                        ZAPNET.Coupon.getMatchMarkets(html, matchId, true, false);
                        matchMarketsEl.innerHTML = html.join('');
                    }
                }
            });
        });
        //ZAPNET.BetDB.matchMarketChangeEvent.subscribe(ZAPNET.SportsCouponManager.matchMarketChangeHandler);
    });

    var LIVE_SPORT_MARKETS = {
        soccer: {
            markets: [{
                id: LIVE_MARKET_MATCH_ODDS,
                name: Util.t('Final Result'),
                hasSpecial: false,
                hasVarSpecial: false,
                headers: ['1', 'X', '2'],
                outcomes: ['1', 'X', '2']
            },{
                id: LIVE_MARKET_DOUBLE_CHANCE,
                name: Util.t('DC'),
                hasSpecial: false,
                hasVarSpecial: false,
                headers: ['1XDC', '12DC', 'X2DC'],
                outcomes: ['1X', '12', 'X2']
            },{
                id: LIVE_MARKET_NEXT_GOAL,
                name: Util.t('Next Goal'),
                hasSpecial: false,
                hasVarSpecial: false,
                headers: ['1', 'No Goal', '2'],
                outcomes: ['1', 'None', '2']
            },{
                id: LIVE_MARKET_TOTALS_UNDER_OVER,
                name: Util.t('Under/Over'),
                hasSpecial: false,
                hasVarSpecial: true,
                headers: ['Under', 'Over'],
                outcomes: ['Under', 'Over']
            }]
        },
        basketball: {
            markets: [{
                id: LIVE_MARKET_MATCH_ODDS,
                name: Util.t('Final Result'),
                hasSpecial: false,
                hasVarSpecial: false,
                headers: ['1', 'X', '2'],
                outcomes: ['1', 'X', '2']
            },{
                id: LIVE_MARKET_DOUBLE_CHANCE,
                name: Util.t('DC'),
                hasSpecial: false,
                hasVarSpecial: false,
                headers: ['1XDC', '12DC', 'X2DC'],
                outcomes: ['1X', '12', 'X2']
            },{
                id: LIVE_MARKET_NEXT_GOAL,
                name: Util.t('Next Goal'),
                hasSpecial: false,
                hasVarSpecial: false,
                headers: ['1', 'No Goal', '2'],
                outcomes: ['1', 'None', '2']
            },{
                id: LIVE_MARKET_TOTALS_UNDER_OVER,
                name: Util.t('Next Goal'),
                hasSpecial: false,
                hasVarSpecial: true,
                headers: ['Under', 'Over'],
                outcomes: ['Under', 'Over']
            }]
        },
        'ice-hockey': {
            markets: [{
                id: LIVE_MARKET_MATCH_ODDS,
                name: Util.t('Final Result'),
                hasSpecial: false,
                hasVarSpecial: false,
                headers: ['1', 'X', '2'],
                outcomes: ['1', 'X', '2']
            },{
                id: LIVE_MARKET_DOUBLE_CHANCE,
                name: Util.t('DC'),
                hasSpecial: false,
                hasVarSpecial: false,
                headers: ['1XDC', '12DC', 'X2DC'],
                outcomes: ['1X', '12', 'X2']
            },{
                id: LIVE_MARKET_NEXT_GOAL,
                name: Util.t('Next Goal'),
                hasSpecial: false,
                hasVarSpecial: false,
                headers: ['1', 'No Goal', '2'],
                outcomes: ['1', 'None', '2']
            },{
                id: LIVE_MARKET_TOTALS_UNDER_OVER,
                name: Util.t('Next Goal'),
                hasSpecial: false,
                hasVarSpecial: true,
                headers: ['Under', 'Over'],
                outcomes: ['Under', 'Over']
            }]
        },
        tennis: {
            markets: [{
                id: LIVE_MARKET_MATCH_ODDS,
                name: Util.t('Final Result'),
                hasSpecial: false,
                hasVarSpecial: false,
                headers: ['1', 'X', '2'],
                outcomes: ['1', 'X', '2']
            },{
                id: LIVE_MARKET_DOUBLE_CHANCE,
                name: Util.t('DC'),
                hasSpecial: false,
                hasVarSpecial: false,
                headers: ['1XDC', '12DC', 'X2DC'],
                outcomes: ['1X', '12', 'X2']
            },{
                id: LIVE_MARKET_NEXT_GOAL,
                name: Util.t('Next Goal'),
                hasSpecial: false,
                hasVarSpecial: false,
                headers: ['1', 'No Goal', '2'],
                outcomes: ['1', 'None', '2']
            },{
                id: LIVE_MARKET_TOTALS_UNDER_OVER,
                name: Util.t('Next Goal'),
                hasSpecial: false,
                hasVarSpecial: true,
                headers: ['Under', 'Over'],
                outcomes: ['Under', 'Over']
            }]
        }
    };

    var MARKET_3WAY = 10,
        MARKET_2WAY = 20,
        MARKET_UNDER_OVER = 56,
        MARKET_TOTALS = 60,
        MARKET_LIVE_UNDER_OVER_GAMES = 226;

    var MARKET_LIVE_RESULT = 2002,
        MARKET_LIVE_WINNER = 1010,
        MARKET_LIVE_MATCH_WINNER = 1102,
        MARKET_LIVE_REST = 1004,
        MARKET_LIVE_UNDER_OVER = 2005,
        MARKET_LIVE_NEXT_GOAL = 1013,
        MARKET_LIVE_2WAY_OVERTIME = 1037,
        MARKET_LIVE_3WAY_OVERTIME = 1106,
        MARKET_LIVE_UNDER_OVER_OVERTIME = 1039,
        MARKET_LIVE_UNDER_OVER_GAMES = 1083,
        MARKET_LIVE_REST_OVERTIME = 1192;

    var SPORT_MARKETS = {
        soccer: {
            main: [
                {type: MARKET_3WAY },
                {type: MARKET_UNDER_OVER, special: 2.5}
            ],
            live: [
                { type: MARKET_LIVE_RESULT},
                { type: MARKET_LIVE_UNDER_OVER, special: 'v'},
                { type: MARKET_LIVE_REST, special: 'v'},
                { type: MARKET_LIVE_NEXT_GOAL, special: 'v'}
            ],
            livemain: [
                { type: MARKET_LIVE_RESULT},
                { type: MARKET_LIVE_UNDER_OVER, special: 'v'}
            ]
        },
        basketball: {
            main: [
                {type: MARKET_2WAY },
                {type: MARKET_TOTALS, special: 'v'}
            ],
            live: [
                { type: MARKET_LIVE_RESULT},
                { type: MARKET_LIVE_UNDER_OVER, special: 'v'}
            ]
        },
        baseball: {
            main: [
                {type: MARKET_2WAY },
                {type: MARKET_TOTALS, special: 'v'}
            ],
            live: [
                { type: MARKET_LIVE_2WAY_OVERTIME},
                { type: MARKET_LIVE_UNDER_OVER_OVERTIME, special: 'v'},
                { type: MARKET_LIVE_REST_OVERTIME}
            ],
            livemain: [
                { type: MARKET_LIVE_2WAY_OVERTIME},
                { type: MARKET_LIVE_UNDER_OVER_OVERTIME, special: 'v'}
            ]
        },
        'ice-hockey': {
            main: [
                {type: MARKET_3WAY },
                {type: MARKET_UNDER_OVER, special: 'v'}
            ],
            live: [
                { type: MARKET_LIVE_RESULT},
                { type: MARKET_LIVE_UNDER_OVER, special: 'v'},
                { type: MARKET_LIVE_3WAY_OVERTIME},
                { type: MARKET_LIVE_NEXT_GOAL, special: 'v'}
            ],
            livemain: [
                { type: MARKET_LIVE_RESULT},
                { type: MARKET_LIVE_UNDER_OVER, special: 'v'}
            ]
        },
        tennis: {
            main: [{type: MARKET_2WAY }],
            live: [
                { type: MARKET_LIVE_WINNER},
                { type: MARKET_LIVE_UNDER_OVER_GAMES, special: 'v'}
            ]
        },
        handball: {
            main: [
                {type: MARKET_3WAY },
                {type: MARKET_TOTALS, special: 'v'}
            ],
            live: [
                { type: MARKET_LIVE_RESULT},
                { type: MARKET_LIVE_UNDER_OVER, special: 'v'}
            ]
        },
        rugby: {
            main: [
                {type: MARKET_3WAY },
                {type: MARKET_TOTALS, special: 'v'}
            ]
        },
        futsal: {
            main: [
                {type: MARKET_3WAY },
                {type: MARKET_TOTALS, special: 'v'}
            ]
        },
        'am-football': {
            main: [
                {type: MARKET_2WAY },
                {type: MARKET_TOTALS, special: 'v'}
            ]
        },
        snooker: {
            main: [{type: MARKET_2WAY }]
        },
        cricket: {
            main: [{type: MARKET_2WAY }]
        },
        darts: {
            main: [{type: MARKET_2WAY }]
        },
        volleyball: {
            main: [{type: MARKET_2WAY }],
            live: [
                { type: MARKET_LIVE_MATCH_WINNER},
                { type: MARKET_LIVE_UNDER_OVER, special: 'v'}
            ]
        }
    };


    ZAPNET.Coupon = function(){
        var element = null,
            view = 'coupon',
            bettingSlip = null,
            leagueMenuList = null,
            leagueMenuTitle = '',
            sectionPerTournament = true,
            matchMarketGroupStatus = {},
            priceLimit = false,
            singleMatchView = false,
            selectedLiveView = 'singlematch',
            liveSportOrder = [],
            tournaments = [],
            outrights = [],
            favoriteLive = {},
            liveOverviewSelectedSportId,
            selectedOverviewMatchId,
            matchSelectedMarkets = {},
            nextLiveMatchId = false,
            lastLiveMatchId = false,
            category = false,
            sport = false,
            sportDate = 'today',
            sportSort = 'league',
            readyDbFn = false,
            virtualData = false,
            currentLtms = false,
            selectedVirtualSport = 'football',
            playerSelectionsPanelEl = Dom.get('player-selections-panel'),
            renderEvent = new YAHOO.util.CustomEvent('Render Event', this, false, YAHOO.util.CustomEvent.FLAT),

        couponClick = function(e){
            var el = Event.getTarget(e);

            if (Dom.hasClass(el, 'market-openclose')){
                Event.preventDefault(e);
                var marketMenu = Dom.getAncestorByClassName(el, 'market-menu');
                if (Dom.hasClass(marketMenu, 'closed')){
                    Dom.removeClass(marketMenu, 'closed');
                } else {
                    Dom.addClass(marketMenu, 'closed');
                }
            }
            if (Dom.hasClass(el, 'market-select')){
                Event.preventDefault(e);
                var marketEl = Dom.getAncestorByClassName(el, 'market');
                var marketId = Dom.getAttribute(marketEl, 'mid');
                var tournamentEl = Dom.getAncestorByClassName(el, 'couponsection');
                var tournamentId = Dom.getAttribute(tournamentEl, 'tid');
                var tournament = getTournamentByIndex(tournamentId);
                if (Dom.hasClass(marketEl, 'selected')){
                    Dom.removeClass(marketEl, 'selected');
                    removeMarket(tournament.markets, marketId);
                } else {
                    Dom.addClass(marketEl, 'selected');
                    addMarket(tournament.markets, marketId);
                }
            }

            if (Dom.hasClass(el, 'live-sport-select')){
                Event.preventDefault(e);
                var sportId = Dom.getAttribute(el, 'sport');
                if (sportId){
                    var i = 0;
                    while(i++ < liveSportOrder.length){
                        if (liveSportOrder[i] == sportId){
                            liveSportOrder.splice(i, 1);
                            break;
                        }
                    }
                    liveSportOrder.unshift(sportId);
                    render();
                }
            }

            if (Dom.hasClass(el, 'category-select')){
                Event.preventDefault(e);
                var catId = Dom.getAttribute(el, 'cid');
                if (catId){
                    var menu = Dom.getAncestorByClassName(el, 'league-menu');
                    var inputs = $('tr[cid="' + catId + '"].tournaments input.tournament-check', menu);
                    Util.foreach(inputs, function(input){
                        input.checked = !input.checked;
                    });
                }
            }

            if (Dom.hasClass(el, 'tournament-select')){
                Event.preventDefault(e);
                var input = $('input.tournament-check', Dom.getAncestorByTagName(el, 'td'), true);
                if (input){
                    input.checked = !input.checked;
                }
            }

            if (Dom.hasClass(el, 'sport-link')){
                Event.preventDefault(e);
                var sportId = Dom.getAttribute(el, 'sid');
                if (sportId){
                    setSport(sportId);
                    /*
                    ZAPNET.Coupon.resetTournaments();
                    Util.foreach(ZAPNET.BetDB.sports[sportId].categories, function(cat){
                        Util.foreach(ZAPNET.BetDB.categories[cat.id].tournaments, function(tour){
                            ZAPNET.Coupon.addTournament(tour.id);
                        });
                    }); */
                    ZAPNET.SportsMenu.refresh();
                }
            }

            if (Dom.hasClass(el, 'category-link')){
                Event.preventDefault(e);
                var catId = Dom.getAttribute(el, 'cid');
                if (catId){
                    setCategory(catId);
                    /*
                    ZAPNET.Coupon.resetTournaments();
                    Util.foreach(ZAPNET.BetDB.categories[catId].tournaments, function(tour){
                        ZAPNET.Coupon.addTournament(tour.id);
                    });
                    */
                    ZAPNET.SportsMenu.refresh();
                }
            }

            if (Dom.hasClass(el, 'tournament-link')){
                Event.preventDefault(e);
                var tourId = Dom.getAttribute(el, 'tid');
                if (tourId){
                    //setTournament(tourId);
                    ZAPNET.Coupon.setTournament(tourId);
                }
            }

            if (Dom.hasClass(el, 'match-page-back-button')){
                if (!sport && !category && !tournaments.length){
                    ZAPNET.Website.sportsReload();
                } else {
                    view = 'coupon';
                    loadCoupon();
                }
            }

            if (Dom.hasClass(el, 'match-link') || Dom.hasClass(el.parentNode, 'match-link')){
                if (!Dom.hasClass(el, 'match-link')){
                    el = el.parentNode;
                }
                Event.preventDefault(e);
                var mId = Dom.getAttribute(el, 'mid');
                if (mId){
                    if (ZAPNET_ONLINE_CONSTANTS.VIEW_THEME && ZAPNET_ONLINE_CONSTANTS.VIEW_THEME == 'rv'){
                        gotoMatch(mId);
                    } else {
                        showMatch(mId);
                    }
                }
                return;
            }

            if (Dom.hasClass(el, 'league-menu-select')){
                Event.preventDefault(e);
                var menu = Dom.getAncestorByClassName(el, 'league-menu');
                var inputs = $('input.tournament-check', menu);
                var tourId;
                reset();
                Util.foreach(inputs, function(input){
                    if (input.checked){
                        tourId = Dom.getAttribute(input, 'tid');
                        if (tourId){
                            doAddTournament(tourId);
                        }
                    }
                });
                view = 'coupon';
                render();
            }

            if (Dom.hasClass(el, 'league-sport-select')){
                var menu = Dom.getAncestorByClassName(el, 'league-menu');
                var inputs = $('input.tournament-check', menu);
                Util.foreach(inputs, function(input){
                    input.checked = !input.checked;
                });
            }

            if (Dom.hasClass(el, 'more-markets') || Dom.hasClass(el.parentNode, 'more-markets')){
                var match = Dom.getAncestorByClassName(el, 'match');
                if (match){
                    if (Dom.hasClass(match, 'open')){
                        Dom.removeClass(match, 'open');
                    } else {
                        openMatch(match, true);
                        Dom.addClass(match, 'open');
                    }
                    return;
                }
            }

            if (Dom.hasClass(el, 'match-statistics-link')){
                var match = Dom.getAncestorByClassName(el, 'match');
                    if (match){
                    var mid = Dom.getAttribute(match, 'mid');
                    if (mid){
                        openMatchStatistics(mid);
                    }
                }
            }

            if (Dom.hasClass(el, 'match-market-show-more-less') || Dom.hasClass(el.parentNode, 'match-market-show-more-less')){
                var match = Dom.getAncestorByClassName(el, 'match');
                if (match){
                    if (Dom.hasClass(match, 'open-all')){
                        Dom.removeClass(match, 'open-all');
                        $('div.moreless-label', match, true).innerHTML = Util.t('Show More');
                        window.scrollBy(0, 0 - (window.pageYOffset - Dom.getY(match)));
                    } else {
                        Dom.addClass(match, 'open-all');
                        $('div.moreless-label', match, true).innerHTML = Util.t('Show Less');
                    }
                    return;
                }
            }

            if (Dom.hasClass(el, 'live-match-list-show-more')){
                Event.preventDefault(e);
                var matchSection = Dom.getAncestorByClassName(el, 'live-match-sport-content');
                if (matchSection){
                    var matches = $('.match-list-item.hidden', matchSection);
                    if (matches.length){
                        Dom.removeClass(matches.slice(0, 10), 'hidden');
                        Dom.removeClass(matchSection, 'show-only-more');
                        if (matches.length <= 10){
                            Dom.addClass(matchSection, 'show-only-less');
                        }
                    }
                    postRenderLive();
                    return;
                }
            }

            if (Dom.hasClass(el, 'live-match-list-show-less')){
                Event.preventDefault(e);
                var matchSection = Dom.getAncestorByClassName(el, 'live-match-sport-content');
                if (matchSection){
                    var matches = $('.match-list-item:not(.hidden)', matchSection);
                    if (matches.length){
                        Dom.addClass(matches.slice(-10), 'hidden');
                        Dom.removeClass(matchSection, 'show-only-less');
                        if (matches.length <= 20){
                            Dom.addClass(matchSection, 'show-only-more');
                        }
                    }
                    postRenderLive();
                    return;
                }
            }

            if (Dom.hasClass(el.parentNode, 'matches-show-more-less') ||
                Dom.hasClass(el.parentNode.parentNode, 'matches-show-more-less')){
                var sportSection = Dom.getAncestorByClassName(el, 'sport-section');
                var sportSectionPart = Dom.getAncestorByClassName(el, 'sport-section-part');
                var moreLessEl = Dom.getAncestorByClassName(el, 'matches-show-more-less');
                var showMore = Dom.hasClass(el, 'matches-show-more') || Dom.hasClass(el.parentNode, 'matches-show-more');
                var showLess = Dom.hasClass(el, 'matches-show-less') || Dom.hasClass(el.parentNode, 'matches-show-less');
                var sportId = Dom.getAttribute(sportSection, 'sid');
                if (sportSection && sportSectionPart && moreLessEl){
                    var ol = Dom.getAttribute(moreLessEl, 'ol');
                    var lastMatchSets = $('.matches-set', sportSectionPart);
                    var lastMatchSetHeight = false;
                    var lastMatchSet = lastMatchSets && lastMatchSets.length ? lastMatchSets[lastMatchSets.length - 1] : false;
                    if (showLess && lastMatchSet && lastMatchSets.length > 1){
                        ol = Math.max(1, +ol - 1);
                        Dom.setAttribute(moreLessEl, 'ol', ol);
                        if (ol == 1){
                            Dom.addClass(moreLessEl, 'moreonly-section');
                        }
                        if (lastMatchSet){
                            lastMatchSetHeight = Dom.getRegion(lastMatchSet).height;
                            lastMatchSet.parentNode.removeChild(lastMatchSet);
                        }
                        if (lastMatchSetHeight){
                            window.scrollBy(0, 0 - lastMatchSetHeight);
                        }
                    } else if (showMore){
                        var curMatchIds = {}, matchId;
                        var lastMatchRowColor = false;
                        var matches = $('.match', sportSectionPart);
                        if (matches && matches.length){
                            for(var mi = 0; mi < matches.length; mi += 1){
                                matchId = Dom.getAttribute(matches[mi], 'mid');
                                if (matchId && ZAPNET.BetDB.matches[matchId]){
                                    curMatchIds[matchId] = matchId;
                                    if (Dom.hasClass(matches[mi], 'r0')){
                                        lastMatchRowColor = 0;
                                    } else if (Dom.hasClass(matches[mi], 'r1')){
                                        lastMatchRowColor = 1;
                                    }
                                }
                            }
                        }
                        if (Dom.hasClass(sportSectionPart, 'sport-section-part-live')){
                            matches = getNextLiveMatches(sportId, curMatchIds, 15);
                        } else if (Dom.hasClass(sportSectionPart, 'sport-section-part-top')){
                            matches = getNextTopMatches(sportId, curMatchIds, 15);
                        } else {
                            matches = getNextMatches(sportId, curMatchIds, 15);
                        }
                        if (matches && matches.length){
                            ol = +ol + 1;
                            Dom.setAttribute(moreLessEl, 'ol', ol);
                            Dom.removeClass(moreLessEl, 'moreonly-section');
                            var matchSet = Util.div('matches-set');
                            var html = [];
                            Util.foreach(matches, function(match){
                                html.push('<div class="match');
                                if (lastMatchRowColor === 0){
                                    html.push(' r1');
                                    lastMatchRowColor = 1;
                                } else if (lastMatchRowColor === 1){
                                    html.push(' r0');
                                    lastMatchRowColor = 0;
                                }
                                if (ZAPNET_ONLINE_CONSTANTS.WEBSITE_MATCH_STATISTICS){
                                    html.push(' match-stats');
                                }
                                html.push('" mid="', match.id, '">');
                                renderMatchLine(html, match);
                                html.push('</div>');
                            });
                            matchSet.innerHTML = html.join('');
                            moreLessEl.parentNode.insertBefore(matchSet, moreLessEl);
                        }
                    }
                    return;
                }
            }

            if (Dom.hasClass(el.parentNode, 'markets-show-more-less') ||
                Dom.hasClass(el.parentNode.parentNode, 'markets-show-more-less')){
                var marketsSection = Dom.getAncestorByClassName(el, 'match-markets');
                var moreLessEl = Dom.getAncestorByClassName(el, 'markets-show-more-less');
                var showMore = Dom.hasClass(el, 'markets-show-more') || Dom.hasClass(el.parentNode, 'markets-show-more');
                var showLess = Dom.hasClass(el, 'markets-show-less') || Dom.hasClass(el.parentNode, 'markets-show-less');
                if (marketsSection && moreLessEl){
                    var ol = Dom.getAttribute(moreLessEl, 'ol');
                    if (showLess){
                        var lastMarketSets = $('.markets-section:not(.markets-section-hidden)', marketsSection);
                        if (lastMarketSets && lastMarketSets.length > 1){
                            var lastMarketSetHeight = false;
                            var lastMarketSet = lastMarketSets && lastMarketSets.length ? lastMarketSets[lastMarketSets.length - 1] : false;
                            ol = Math.max(1, +ol - 1);
                            Dom.setAttribute(moreLessEl, 'ol', ol);
                            if (ol == 1){
                                Dom.addClass(moreLessEl, 'moreonly-section');
                            }
                            Dom.removeClass(moreLessEl, 'lessonly-section');
                            if (lastMarketSet){
                                lastMarketSetHeight = Dom.getRegion(lastMarketSet).height;
                                Dom.addClass(lastMarketSet, 'markets-section-hidden');
                            }
                            if (lastMarketSetHeight){
                                window.scrollBy(0, 0 - lastMarketSetHeight);
                            }
                        }
                    } else if (showMore){
                        var hiddenMarketSections;
                        if (window.ZAPNET_COMPANYNAME && ZAPNET_COMPANYNAME == 'SpartaBet'){
                            hiddenMarketSections = $('.markets-section-hidden', marketsSection);
                        } else {
                            hiddenMarketSections = [$('.markets-section-hidden', marketsSection, true)];
                        }
                        if (hiddenMarketSections){
                            Util.foreach(hiddenMarketSections, function(hiddenMarketSection){
                                ol = Math.max(1, +ol + 1);
                                Dom.setAttribute(moreLessEl, 'ol', ol);
                                Dom.removeClass(moreLessEl, 'moreonly-section');
                                Dom.removeClass(hiddenMarketSection, 'markets-section-hidden');
                                hiddenMarketSection = $('.markets-section-hidden', marketsSection, true);
                                if (!hiddenMarketSection){
                                    Dom.addClass(moreLessEl, 'lessonly-section');
                                }
                            });
                        }
                    }
                    return;
                }
            }

            if (Dom.hasClass(el, 'highlights-today')){
                renderMatchList(element, getTodayMatches(), 10, 'Today', getHighlightMenuHtml('highlights-today'));
            } else if (Dom.hasClass(el, 'highlights-tomorrow')){
                renderMatchList(element, getTomorrowMatches(), 10, 'Tomorrow', getHighlightMenuHtml('highlights-tomorrow'));
            } else if (Dom.hasClass(el, 'highlights-next-3h')){
                renderMatchList(element, getNext3HMatches(), 10, 'Next 3 hours', getHighlightMenuHtml('highlights-next-3h'));
            } else if (Dom.hasClass(el, 'highlights-next-3d')){
                renderMatchList(element, getNext3DMatches(), 10, 'Next 3 days', getHighlightMenuHtml('highlights-next-3d'));
            }

            if (Dom.hasClass(el, 'sports-daily-coupon')){
                renderMatchList(element, getTodayMatches(), 10, 'Today', getHighlightMenuHtml('highlights-today'));
            }

            if (Dom.hasClass(el, 'sport-date-item-today')){
                setSportDate('today');
            } else if (Dom.hasClass(el, 'sport-date-item-tomorrow')){
                setSportDate('tomorrow');
            } else if (Dom.hasClass(el, 'sport-date-item-3day')){
                setSportDate('3day');
            } else if (Dom.hasClass(el, 'sport-date-item-all')){
                setSportDate('all');
            } else if (Dom.hasClass(el, 'sport-sort-item-time')){
                setSportSort('time');
            } else if (Dom.hasClass(el, 'sport-sort-item-league')){
                setSportSort('league');
            }

            var selection = Dom.hasClass(el, 'selection-button') ? el : Dom.getAncestorByClassName(el, 'selection-button');
            if (selection){
                selectionClick(selection);
                return;
            }

            if (Dom.hasClass(el, 'tracker-match-sound')){
                if (Dom.hasClass(el, 'sound-on')){
                    Dom.replaceClass(el, 'sound-on', 'sound-off');
                    el.innerHTML = Util.t('Off');
                } else {
                    Dom.replaceClass(el, 'sound-off', 'sound-on');
                    el.innerHTML = Util.t('On');
                }
                return;
            }

            if (Dom.hasClass(el, 'match-option') && Dom.hasClass(el, 'match-favorite')){
                var mEl = Dom.getAncestorByClassName(el, 'match');
                var mid = Dom.getAttribute(mEl, 'mid');
                if (favoriteLive[mid]){
                    Dom.removeClass(el, 'match-favorite-on');
                    delete favoriteLive[mid];
                    if (Dom.hasClass($('#hd li.product-favorites', null, true), 'selected')){
                        if (Util.countProperties(favoriteLive)){
                            ZAPNET.Website.showFavorites();
                        } else {
                            ZAPNET.Website.sportsReload();
                        }
                    }
                } else {
                    Dom.addClass(el, 'match-favorite-on');
                    favoriteLive[mid] = mid;
                }
                return;
            } else if (Dom.hasClass(el, 'match-favorite')){
                var mEl = Dom.getAncestorByClassName(el, 'match');
                var mid = Dom.getAttribute(mEl, 'mid');
                if (Dom.hasClass(el, 'fav-on')){
                    Dom.removeClass(el, 'fav-on');
                    window.scrollBy(0, -52);
                    delete favoriteLive[mid];
                } else {
                    Dom.addClass(el, 'fav-on');
                    favoriteLive[mid] = mid;
                    window.scrollBy(0, 52);
                }
                refreshLiveMatchList();
                Event.stopEvent(e);
                return;
            }

            if (Dom.hasClass(el, 'overview-match-favorite')){
                var mEl = Dom.getAncestorByClassName(el, 'match');
                var mid = Dom.getAttribute(mEl, 'mid');
                if (Dom.hasClass(el, 'favorite-on')){
                    Dom.removeClass(el, 'favorite-on');
                    delete favoriteLive[mid];
                } else {
                    Dom.addClass(el, 'favorite-on');
                    favoriteLive[mid] = mid;
                }
                if (selectedLiveView == 'favorites'){
                    showLive();
                }
                Event.stopEvent(e);
                return;
            }

            if (Dom.hasClass(el, 'overview-match-tracker-handle')){
                var mEl = Dom.getAncestorByClassName(el, 'match');
                var mid = Dom.getAttribute(mEl, 'mid');
                if (mid){
                    if (!Dom.hasClass(el, 'selected')){
                        Dom.removeClass($('.overview-match-tracker-handle.selected', element ? element : Dom.get('coupon')), 'selected');
                        Dom.addClass(el, 'selected');
                        selectedOverviewMatchId = +mid;
                    }
                    showSideMatchTracker(selectedOverviewMatchId);
                    Event.stopEvent(e);
                    return;
                }
            }

            if (Dom.hasClass(el, 'match-minute') && ZAPNET.SportsCouponView){
                var mEl = Dom.getAncestorByClassName(el, 'match');
                if (Dom.hasClass(mEl, 'match-status-live')){
                    var matchCouponEl = Dom.getAncestorByClassName(mEl, 'match-coupon-view');
                    if (matchCouponEl && Dom.hasClass(matchCouponEl, 'add-to-favorites')){
                        var mid = Dom.getAttribute(mEl, 'mid');
                        if (favoriteLive[mid]){
                            delete favoriteLive[mid];
                        } else {
                            favoriteLive[mid] = mid;
                        }
                        render();
                        return;
                    }
                }
            }

            if (Dom.hasClass(el, 'market-menu-button')){
                var matchEl = Dom.getAncestorByClassName(el, 'match');
                var mId = Dom.getAttribute(matchEl, 'mid');
                var betType = Dom.getAttribute(el, 'bt');
                if (Dom.hasClass(el, 'selected')){
                    Dom.removeClass(el, 'selected');
                    if (matchSelectedMarkets[mId] && matchSelectedMarkets[mId][betType]){
                        delete matchSelectedMarkets[mId][betType];
                        if (!Util.countProperties(matchSelectedMarkets[mId])){
                            delete matchSelectedMarkets[mId];
                        }
                    }
                } else {
                    Dom.addClass(el, 'selected');
                    if (!matchSelectedMarkets[mId]){
                        matchSelectedMarkets[mId] = {};
                    }
                    matchSelectedMarkets[mId][betType] = betType;
                }
                showLiveSingleMatchMarkets(mId);
                return;
            }
            if (Dom.hasClass(el, 'market-menu-moreless')){
                var marketMenu = Dom.getAncestorByClassName(el, 'match-market-menu');
                if (marketMenu){
                    if (Dom.hasClass(marketMenu, 'show-full')){
                        Dom.removeClass(marketMenu, 'show-full');
                        el.innerHTML = '<span class="market-menu-moreless"></span>' + Util.t('Show More');
                    } else {
                        Dom.addClass(marketMenu, 'show-full');
                        el.innerHTML = '<span class="market-menu-moreless"></span>' + Util.t('Show Less');
                    }
                }
            }

            var aEl = Dom.getAncestorByTagName(el, 'A');
            if (aEl){
                if (Dom.hasClass(aEl, 'match-list-item')){
                    Event.preventDefault(e);
                    var mEl = $('div[mid].match', aEl, true);
                    var mid = Dom.getAttribute(mEl, 'mid');
                    showMatch(mid);
                    Dom.removeClass($('div.match-list .match.selected'), 'selected');
                    Dom.addClass(mEl, 'selected');
                }
            }

            var virtualMatch = Dom.hasClass(el, 'virtual-event') ? el : Dom.getAncestorByClassName(el, 'virtual-event');
            if (virtualMatch) {
                var mId = Dom.getAttribute(virtualMatch, 'mid');
                if (mId){
                    showVirtualMatch(mId);
                    return;
                }
                var oId = Dom.getAttribute(virtualMatch, 'rid');
                if (oId){
                    showVirtualRace(oId);
                    return;
                }
            }

            if (Dom.hasClass(el, 'virtual-sport-menu-item')){
                var sportId = Dom.getAttribute(el, 'sport');
                if (sportId){
                    selectedVirtualSport = sportId;
                    showVirtual();
                }
            }

            if (Dom.hasClass(el, 'openclose') || Dom.hasClass(el, 'opencloseitem') || Dom.hasClass(el, 'live-section-nr-matches')){
                var ocSection = Dom.getAncestorByClassName(el, 'openclose-section');
                if (Dom.hasClass(ocSection, 'openclose-closed')){
                    Dom.removeClass(ocSection, 'openclose-closed');
                } else {
                    Dom.addClass(ocSection, 'openclose-closed');
                }
            }

            if (Dom.hasClass(el, 'sport-item') && !Dom.hasClass(el, 'selected')){
                var sid = Dom.getAttribute(el, 'sid');
                var matchSection = Dom.getAncestorByClassName(el, 'match-section');
                Dom.removeClass($('.match-section-sport-menu .sport-item.selected', matchSection, true), 'selected');
                Dom.addClass(el, 'selected');
                Dom.removeClass($('.match-section-sport-content .sport-section.selected', matchSection, true), 'selected');
                Dom.addClass($('div[sid="' + sid + '"].sport-section', matchSection, true), 'selected');
            }

            if (Dom.hasClass(el, 'match-more-markets')){
                Event.preventDefault(e);
                var mEl = Dom.getAncestorByClassName(el, 'match');
                var mid = Dom.getAttribute(mEl, 'mid');
                gotoMatch(mid);
            }

            if (Dom.hasClass(el, 'match-coupon-tabview-menu-item')){
                var tbi = Dom.getAttribute(el, 'tb');
                if (tbi){
                    var tvMenuTop = Dom.getAncestorByClassName(el, 'match-coupon-view-tabview-menu');
                    Dom.removeClass($('.match-coupon-view-tabview-menu-item-selected', tvMenuTop), 'match-coupon-view-tabview-menu-item-selected');
                    Dom.addClass(el, 'match-coupon-view-tabview-menu-item-selected');
                    var tvTop = Dom.getAncestorByClassName(el, 'match-coupon-view-tabview');
                    Dom.removeClass($('.match-coupon-view-tabview-item-selected', tvTop, true), 'match-coupon-view-tabview-item-selected');
                    var tvCurSelItem = $('div[tb="' + tbi + '"].match-coupon-view-tabview-item', tvTop, true);
                    Dom.addClass(tvCurSelItem, 'match-coupon-view-tabview-item-selected');
                }
            }
            if (Dom.hasClass(el, 'inline-match-clode')){
                var mEl = Dom.getAncestorByClassName(el, 'match');
                closeInlineMatch(mEl);
            }
            if (Dom.hasClass(el, 'open-livetracker')){
                Event.preventDefault(e);
                var mEl = Dom.getAncestorByClassName(el, 'match');
                var mid = Dom.getAttribute(mEl, 'mid');
                Dom.setStyle(el, 'text-align', 'left');
                el.innerHTML = '<div style="height: 360px; background-color: #000;">' +
                    '<iframe class="livetracker" scrolling="no" frameborder="0" src="/statistics/livetracker?id=' + mid + '"></iframe>' +
                    '</div>';
            }
            if (Dom.hasClass(el, 'match-live-info') || Dom.hasClass(el.parentNode, 'match-live-info')){
                Event.preventDefault(e);
                var mEl = Dom.getAncestorByClassName(el, 'match');
                var mid = Dom.getAttribute(mEl, 'mid');
                ZAPNET.Website.setLiveProduct();
                setTimeout(function(){
                    gotoMatch(mid);
                });
            }

            if (Dom.hasClass(el, 'betslip-openclose-details') || Dom.hasClass(el.parentNode, 'betslip-openclose-details')){
                var tBody = Dom.getAncestorByTagName(el, 'tbody');
                if (Dom.hasClass(tBody, 'open')){
                    Dom.removeClass(tBody, 'open');
                } else {
                    Dom.addClass(tBody, 'open');
                }
                Event.stopEvent(e);
                return;
            }

            if (Dom.hasClass(el, 'match-markets-market-group') || Dom.hasClass(el.parentNode, 'match-markets-market-group')) {
                el = Dom.hasClass(el.parentNode, 'match-markets-market-group') ? el.parentNode : el;
                var mgid = Dom.getAttribute(el, 'mgid');
                if (Dom.hasClass(el, 'open')) {
                    Dom.removeClass(el, 'open');
                    matchMarketGroupStatus[mgid] = 'closed';
                } else {
                    Dom.addClass(el, 'open');
                    matchMarketGroupStatus[mgid] = 'open';
                }
                Event.stopEvent(e);
                return;
            }

            if (Dom.hasClass(el, 'match-coupon-sport-menu-item')){
                var menu = Dom.getAncestorByClassName(el, 'match-coupon-sport-menu');
                var coupon = Dom.getAncestorByClassName(el, 'match-coupon-view');
                Dom.removeClass($('.match-coupon-sport-menu-item.selected', menu), 'selected');
                Dom.addClass(el, 'selected');
                Dom.removeClass(coupon, 'match-select-6h');
                Dom.removeClass(coupon, 'match-select-24h');
                Dom.removeClass(coupon, 'match-select-top');
                Dom.removeClass(coupon, 'match-select-all');
                Dom.removeClass(coupon, 'match-select-sport');
                var sportId = Dom.getAttribute(el, 'sport');
                var typeId = Util.isNumeric(sportId) ? 'sport' : sportId;
                Dom.addClass(coupon, 'match-select-' + typeId);
                if (typeId == 'sport'){
                    Dom.removeClass($('div.match:not(.match-sport-' + sportId + ')', coupon), 'match-select-sport');
                    Dom.addClass($('div.match.match-sport-' + sportId, coupon), 'match-select-sport');
                }
            }

            if (Dom.hasClass(el, 'live-page-type-menu-item')){
                var currentLiveView = selectedLiveView;
                if (Dom.hasClass(el, 'live-page-type-overview')){
                    selectedLiveView = 'overview';
                } else if (Dom.hasClass(el, 'live-page-type-singlematch')){
                    selectedLiveView = 'singlematch';
                } else if (Dom.hasClass(el, 'live-page-type-favorites')){
                    selectedLiveView = 'favorites';
                } else if (Dom.hasClass(el, 'live-page-type-upcoming')){
                    selectedLiveView = 'upcoming';
                }
                if (currentLiveView == 'singlematch' && selectedLiveView != 'singlematch'){
                    loadLiveOverview();
                } else {
                    showLive();
                }
            }

            if (Dom.hasClass(el, 'live-overview-sport-menu-item') || Dom.hasClass(el.parentNode, 'live-overview-sport-menu-item')){
                el = Dom.hasClass(el, 'live-overview-sport-menu-item') ? el : el.parentNode;
                var sportId = Dom.getAttribute(el, 'sport');
                if (sportId){
                    liveOverviewSelectedSportId = sportId;
                    showLive();
                }
            }
        },

        gotoMatch = function(matchId){
            if (ZAPNET_ONLINE_CONSTANTS.LIVE_MATCHPAGE == 'matchpage' || Dom.hasClass(document.body, 'skin-ubet')){
                showMatch(matchId);
            } else {
                var mEl = $('.match-coupon-view div[mid="' + matchId + '"].match', null, true);
                if (Dom.hasClass(mEl, 'open-match')){
                    closeInlineMatch(mEl);
                } else {
                    openInlineMatch(mEl);
                    mEl.scrollIntoView(true);
                }
            }
        },

        gotoLiveMatch = function(matchId){
            ZAPNET.Website.setLiveProduct();
            setTimeout(function(){
                gotoMatch(matchId)
            });
        },

        couponViewMouseOver = function(e){
            var el = Event.getTarget(e);
            if (Dom.hasClass(el, 'match-market') || Dom.hasClass(el, 'sel-odds') || Dom.hasClass(el, 'match-market-line')){
                var cview = Dom.getAncestorByClassName(el, 'match-coupon-sport');
                var market = Dom.getAncestorByClassName(el, 'match-market-column');
                if (cview && market){
                    var marketInd = Dom.getAttribute(market, 'midx');
                    Dom.addClass(cview, 'in-market');
                    Dom.addClass(cview, 'in-market-' + marketInd);
                }
            }
            if (Dom.hasClass(el, 'match-option-player-selections')){
                Dom.removeClass(playerSelectionsPanelEl, 'visible');
                showPlayerSelectionStatistics(el);
            }
        },

        couponViewMouseOut = function(e){
            var el = Event.getTarget(e);
            if (Dom.hasClass(el, 'match-market') || Dom.hasClass(el, 'sel-odds') || Dom.hasClass(el, 'match-market-line')){
                var cview = Dom.getAncestorByClassName(el, 'match-coupon-sport');
                var market = Dom.getAncestorByClassName(el, 'match-market-column');
                if (cview && market){
                    var marketInd = Dom.getAttribute(market, 'midx');
                    Dom.removeClass(cview, 'in-market');
                    Dom.removeClass(cview, 'in-market-' + marketInd);
                }
            }
            if (Dom.hasClass(el, 'match-option-player-selections')){
                Dom.removeClass(playerSelectionsPanelEl, 'visible');
            }
        },

        selectionClick = function(selWrapper){
            if (!selWrapper){
                return;
            }
            var selEl = $('div.selection', selWrapper, true);
            var selectionId = Dom.getAttribute(selEl, 'sid');
            if (!selectionId){
                return;
            }
            var selType = Dom.getAttribute(selEl, 'odt');
            var outrightSelection = selType && selType == 'or';
            if (Dom.hasClass(selWrapper, 'selection-on')){
                Dom.removeClass(selWrapper, 'selection-on');
                if (outrightSelection){
                    bettingSlip.removeOutrightSelection(selectionId)
                } else {
                    bettingSlip.removeSelection(selectionId);
                }
            } else {
                if (outrightSelection){
                    if (!bettingSlip.setOutrightSelection(selectionId)){
                        Dom.addClass(selWrapper, 'selection-on');
                    }
                } else {
                    var error = bettingSlip.setSelection(selectionId);
                    if (error){
                        if (error == ZAPNET.MULTI_MATCH_SELECTIONS){
                            Util.askQuestion(Util.t('Selection from the same match already in slip. Replace selection?'), [{
                                    label: Util.t('Replace Selection'),
                                    fn: function(){
                                        try{
                                            var selection = ZAPNET.BetDB.selections[selectionId];
                                            var match = selection.market.match;
                                            bettingSlip.removeMatch(match.id);
                                            error = bettingSlip.setSelection(selectionId);
                                            console.log(error);
                                            if (!error){
                                                Dom.addClass(selWrapper, 'selection-on');
                                            }
                                        } catch (e){
                                            console.log(e);
                                        }
                                    },
                                    isDefault: false
                                },{
                                    label: Util.t('Cancel'),
                                    fn: function(){},
                                    isDefault: true
                                }
                            ], 'Betting Slip', 'warning');
                        } else if (error == ZAPNET.MAX_SELECTIONS) {
                           Util.showErrorMessage(Util.t('Maximum selections have already been added to the betslip'), 'Maximum Selections');
                        }
                    } else {
                        Dom.addClass(selWrapper, 'selection-on');
                    }
                }
            }
        },

        openMatchStatistics = function(mid){
            window.open('/statistics/matchstats?id=' + mid, null, 'height=750,width=1024,location=no,menubar=no,status=no,titlebar=no,toolbar=no');
        },

        getNextMatches = function(sportId, curMatchIds, limit, live, liveStatus){
            var matches = ZAPNET.BetDB.getMatchesByTime(sportId, live, liveStatus ? liveStatus : "open");
            if (!matches){
                return false;
            }
            if (live && window.ZAPNET_COMPANYNAME != 'AP'){
                matches.reverse();
            }
            var matchList = [];
            var match;
            for(var i = 0; i < matches.length; i += 1){
                match = matches[i];
                if (!curMatchIds[match]){
                    matchList.push(ZAPNET.BetDB.matches[match]);
                    if (matchList.length >= limit){
                        break;
                    }
                    continue;
                }
            }
            return matchList;
        },

        getNextLiveMatches = function(sportId, curMatchIds, limit){
            return getNextMatches(sportId, curMatchIds, limit, true, "live");
        },

        getNextTopMatches = function(sportId, curMatchIds, limit){
            var matchList = [], j, topMatch;
            if (window.ZAPNET_FEATURED_MATCHES && window.ZAPNET_FEATURED_MATCHES[sportId]){
                for(j = 0; j < window.ZAPNET_FEATURED_MATCHES[sportId].length; j += 1){
                    var matchId = window.ZAPNET_FEATURED_MATCHES[sportId][j];
                    if (ZAPNET.BetDB.matches[matchId]){
                        topMatch = ZAPNET.BetDB.matches[matchId];
                        if (!curMatchIds[matchId] && topMatch && topMatch.status == "open" && matchList.length < limit){
                            matchList.push(topMatch);
                        }
                    }
                };
            }
            return matchList;
        },

        removeSelection = function(sId){
            var sels = $('div[sid="' + sId + '"].selection');
            Util.foreach(sels, function(sel){
                var selWrap = Dom.getAncestorByClassName(sel, 'selection-button');
                Dom.removeClass(selWrap, 'selection-on');
            });
        },

        addSelection = function(sId){
            var sels = $('div[sid="' + sId + '"].selection');
            Util.foreach(sels, function(sel){
                var selWrap = Dom.getAncestorByClassName(sel, 'selection-button');
                Dom.addClass(selWrap, 'selection-on');
            });
        },

        setElement = function(e){
            element = e;
            Event.purgeElement(e);
            Event.on(e, 'click', couponClick);

            var infoPanelsEl = Dom.get('match-info-panels');
            Event.purgeElement(infoPanelsEl);
            Event.on(infoPanelsEl, 'click', couponClick);

            if (ZAPNET.SportsCouponView){
                Event.on(e, 'mouseover', couponViewMouseOver);
                Event.on(e, 'mouseout', couponViewMouseOut);
            }
        },

        setBettingSlip = function(slip){
            bettingSlip = slip;
            bettingSlip.selectionRemovedEvent.subscribe(function(type, args){
                removeSelection(args[0]);
            });
            bettingSlip.outrightRemovedEvent.subscribe(function(type, args){

            });
            bettingSlip.selectionAddedEvent.subscribe(function(type, args){
                addSelection(args[0]);
            });
            bettingSlip.outrightAddedEvent.subscribe(function(type, args){

            });
            bettingSlip.changeEvent.subscribe(function(){});
            bettingSlip.renderEvent.subscribe(function(){
            });
            bettingSlip.slipClosedEvent.subscribe(function(){});
        },

        setSectionPerTournament = function(b){
            sectionPerTournament = b;
        },

        reset = function(){
            tournaments = [];
            outrights = [];
            category = false;
            sport = false
        },

        getIndex = function(object, id){
            var i;
            for(i = 0; i < object.length; i += 1){
                if (object[i].id == id){
                    return i;
                }
            }

            return -1;
        },

        getMarketIndex = function(markets, marketId){
            var i;
            for(i = 0; i < markets.length; i += 1){
                if (markets[i] == marketId){
                    return i;
                }
            }

            return -1;
        },

        clearMarket = function(markets, marketId){
            var mIndex = getMarketIndex(markets, marketId);
            if (mIndex < 0){
                return 0;
            }
            markets.splice(mIndex, 1);
            return 1;
        },

        addMarket = function(markets, marketId){
            clearMarket(markets, marketId);
            markets.push(marketId);
            render();
        },

        addDefaultMarket = function(markets){
            markets.push('10');
        },

        removeMarket = function(markets, marketId){
            clearMarket(markets, marketId);
            if (!markets.length){
                addDefaultMarket(markets);
            }
            render();
        },

        toggleMarket = function(markets, marketId){
            var nmr = clearMarket(markets, marketId);
            if (nmr){
                if (!markets.length){
                    addDefaultMarket(markets);
                }
            } else {
                addMarket(markets, marketId);
            }
        },

        setMarket = function(markets, marketId){
            reset();
            addMarket(markets, marketId);
        },

        getTournamentIndex = function(tournamentId){
            return getIndex(tournaments, tournamentId);
        },

        getTournamentByIndex = function(tournamentId){
            var i = getTournamentIndex(tournamentId);
            if (i < 0){
                return false;
            }

            return tournaments[i];
        },

        clearTournament = function(tournamentId){
            var mIndex = getTournamentIndex(tournamentId);
            if (mIndex < 0){
                return 0;
            }
            tournaments.splice(mIndex, 1);
            return 1;
        },

        doAddTournament = function(tournamentId){
            resetOutrights();
            tournaments.push({
                id: tournamentId,
                markets: ['10'],
                openmatches: []
            });
        },

        addTournament = function(tournamentId){
            clearTournament(tournamentId);
            doAddTournament(tournamentId);
            view = 'coupon';
            loadCoupon();
        },

        addTournaments = function(tournamentIds){
            Util.foreach(tournamentIds, function(tournamentId){
                clearTournament(tournamentId);
                doAddTournament(tournamentId);
            });
            view = 'coupon';
            loadCoupon();
        },

        addDefaultTournament = function(){

        },

        removeTournament = function(tournamentId){
            clearTournament(tournamentId);
            if (!tournaments.length){
                addDefaultTournament();
            }
            view = 'coupon';
            loadCoupon();
        },

        removeTournaments = function(tournamentIds){
            Util.foreach(tournamentIds, function(tournamentId){
                clearTournament(tournamentId);
            });
            view = 'coupon';
            loadCoupon();
        },

        toggleTournament = function(tournamentId){
            var nmr = clearTournament(tournamentId);
            view = 'coupon';
            if (nmr){
                if (!tournaments.length){
                    addDefaultTournament();
                }
            } else {
                addTournament(tournamentId);
            }
        },

        setTournament = function(tournamentId){
            resetTournaments();
            addTournament(tournamentId);
        },

        setTournaments = function(tournamentIds){
            resetTournaments();
            addTournaments(tournamentIds);
        },

        resetTournaments = function(){
            view = 'coupon';
            tournaments = [];
            category = false;
            sport = false;
        },

        setCategory = function(categoryId){
            view = 'coupon';
            category = categoryId;
            sport = false;
            tournaments = [];
            loadCoupon();
        },

        setSport = function(sportId){
            view = 'coupon';
            sport = sportId;
            sportDate = 'today'
            category = false;
            tournaments = [];
            loadCoupon();
        },

        setSportDate = function(date){
            sportDate = date;
            loadCoupon();
        },

        setSportSort = function(sort){
            sportSort = sort
            loadCoupon();
        },

        getOutrightIndex = function(outrightId){
            return getIndex(outrights, outrightId);
        },

        getSport = function(){
            return sport;
        },

        getCategory = function(){
            return category;
        },

        getTournaments = function(){
            return tournaments;
        },

        clearOutright = function(outrightId){
            var mIndex = getOutrightIndex(outrightId);
            if (mIndex < 0){
                return 0;
            }
            outrights.splice(mIndex, 1);
            return 1;
        },

        doAddOutright = function(outrightId){
            resetTournaments();
            outrights.push({
                id: outrightId
            });
        },

        addOutright = function(outrightId){
            clearOutright(outrightId);
            doAddOutright(outrightId);
            view = 'outright';
            render();
        },

        addMultiOutrights = function(outrightIds){
            Util.foreach(outrightIds, function(outrightId){
                clearOutright(outrightId);
                doAddOutright(outrightId);
            });
            view = 'outright';
            render();
        },

        addDefaultOutright = function(){

        },

        removeOutright = function(outrightId){
            clearOutright(outrightId);
            if (!outrights.length){
                addDefaultOutright();
            }
            view = 'outright';
            render();
        },

        removeMultiOutrights = function(outrightIds){
            Util.foreach(outrightIds, function(outrightId){
                clearOutright(outrightId);
                if (!outrights.length){
                    addDefaultOutright();
                }
            });
            view = 'outright';
            render();
        },

        setOutrights = function(outrightIds){
            resetOutrights();
            resetTournaments();
            Util.foreach(outrightIds, function(outrightId){
                outrights.push({id: outrightId });
            });
            if (!outrights.length){
                addDefaultOutright();
            }
            view = 'outright';
            render();
        },

        toggleOutright = function(outrightId){
            var nmr = clearOutright(outrightId);
            view = 'outright';
            if (nmr){
                if (!outrights.length){
                    addDefaultOutright();
                }
            } else {
                addOutright(outrightId);
            }
        },

        setOutright = function(outrightId){
            resetOutrights();
            addOutright(outrightId);
        },

        resetOutrights = function(){
            view = 'outright';
            outrights = [];
        },

        loadCoupon = function(){
            var callback = {
                success: function (data) {
                    view = 'coupon';
                    ZAPNET.SportsMenu.refresh();
                    render();
                },
                failure: function () {
                    view = 'coupon';
                    ZAPNET.SportsMenu.refresh();
                    render();
                }
            };
            showLoading();
            if (tournaments.length){
                var tournamentIds = [];
                Util.foreach(tournaments, function(tour){
                    tournamentIds.push(tour.id);
                });
                ZAPNET.BetDB.loadTournaments(callback, tournamentIds, [10,20,56,60]);
            } else if (category){
                ZAPNET.BetDB.loadCategories(callback, category, [10,20,56,60]);
            } else if (sport){
                ZAPNET.BetDB.loadSport(callback, category, [10,20,56,60]);
            }
        },

        getMatchSections = function(){
            var i, j, tourId, tour, tournament, type, marketTypes,
                section, sections = [], marketInfo, skipTypes,
                tourList = tournaments.slice(), tsFrom = false, tsTo = false;

            if (!tourList.length){
                if (sport){
                    Util.foreach(ZAPNET.BetDB.sports[sport].categories, function(category){
                        Util.foreach(category.tournaments, function(tournament){
                            tourList.push(tournament);
                        });
                    });
                    if (sportDate && sportDate !== 'all'){
                        var today = $P.date('Y-m-d', $P.strtotime('-6 hours'));
                        if (sportDate === 'today'){
                            tsTo = $P.strtotime(today + ' +30 hours');
                        } else if (sportDate === 'tomorrow'){
                            var tomorrow = $P.strtotime(today + ' +30 hours');
                            tsFrom = tomorrow;
                            tsTo = +tomorrow + (24*60*60);
                        } else if (sportDate === '3day'){
                            tsTo = $P.strtotime(today + ' +3 days +6 hours');
                        }
                    }
                } else if (category){
                    Util.foreach(ZAPNET.BetDB.categories[category].tournaments, function(tournament){
                        tourList.push(tournament);
                    });

                }
            }
            // tourList.reverse();

            if (sportSort == 'league'){
                tourList.sort(function(ta, tb){
                    var ca = ta.category;
                    var cb = tb.category;
                    if (ca !== cb){
                        if (ca.order == cb.order){
                            return ca.name > cb.name ? 1 : -1;
                        }
                        return ca.order - cb.order;
                    }
                    if (ta.order == tb.order){
                        return ta.name > tb.name ? 1 : -1;
                    }
                    return ta.order - tb.order;
                });
            }
            for(i = 0; i < tourList.length; i += 1){
                tourId = tourList[i].id;
                if (ZAPNET.BetDB.tournaments[tourId]){
                    tour = ZAPNET.BetDB.tournaments[tourId];
                    var tourMatchList = ZAPNET.BetDB.getTournamentMatches(tourId);
                    if (!tourMatchList || !tourMatchList.length){
                        continue;
                    }
                    if (sportSort == 'league' || !sections.length){
                        section = {
                            title: sportSort == 'time' ? Util.t(tour.category.sport.name)  : Util.t(tour.category.sport.name) + ' / ' + Util.t(tour.category.name) + ' / ' + tour.name,
                            sport: tour.category.sport,
                            markets: [],
                            marketTypes: {},
                            selected: [],
                            tournament: tour,
                            matches: []
                        };
                        sections.push(section);
                    }
                    marketTypes = {
                        '10': {
                            name: 'Main',
                            order: 0,
                            type: '10'
                        }
                    };
                    skipTypes = {
                        10: true
                    };
                    Util.foreach(tourMatchList, function(match){
                        if (tsFrom && +tsFrom > +match.ts){
                            return;
                        }
                        if (tsTo && +tsTo < +match.ts){
                            return;
                        }
                        section.matches.push(match);
                        for(type in match.marketTypes){
                            if (match.marketTypes.hasOwnProperty(type) && !skipTypes[type]){
                                marketInfo = ZAPNET.BetDB.getMarketInfoByType(type);
                                marketTypes[type] = {
                                    type: type,
                                    name: marketInfo ? (marketInfo.market_short_name ? marketInfo.market_short_name : marketInfo.market_name) : type,
                                    order: marketInfo ? marketInfo.market_order : 1
                                };
                            }
                        }
                    });

                    section.markets = $P.array_values($P.array_keys(marketTypes));
                    section.marketTypes = marketTypes;
                }
            }

            if (sections.length){
                if (sportSort == 'time'){
                    sections[0].matches.sort(function(a, b){
                        return a.ts - b.ts;
                    });
                } else {
                    sections.sort(function(ta, tb){
                        var ca = ta.tournament.category;
                        var cb = tb.tournament.category;
                        if (ca.id == cb.id){
                            return ta.tournament.order - tb.tournament.order;
                        } else {
                            if (ca.order == cb.order){
                                return ca.name > cb.name ? 1 : -1;
                            } else {
                                return ca.order - cb.order;
                            }
                        }
                    });
                }
            }

            return sections;
        },

        renderMarketMenu = function(html, section){
            var i, market, marketList = section.markets;

            html.push('<div class="market-menu"><div class="market-container">');
            marketList.sort(function(a,b){
                var marketA = section.marketTypes[a];
                var marketB = section.marketTypes[b];
                return marketA.order - marketB.order;
            });
            for(i = 0; i < marketList.length; i += 1){
                market = marketList[i];
                html.push('<div class="market');
                if ($P.in_array(market, section.selected)){
                    html.push(' selected');
                }
                html.push('" mid="', market, '"><a href="#" class="market-select">', Util.t(section.marketTypes[market].name), '</a></div>');
            }
            html.push('<div class="market-openclose"></div><div class="spacer"></div></div></div><div class="spacer"></div>');
        },

        getMarketGroup = function(marketId){
            var marketList = YAHOO.lang.isArray(marketId) ? marketId : (marketId + '').split(',');
            var marketGroup = {
                cols: 0,
                markets: []
            };
            Util.foreach(marketList, function(mId){
                var marketTypeId = false;
                var marketSpecial = false;
                if (YAHOO.lang.isString(mId)){
                    var parts = mId.split(':');
                    if (parts.length == 2){
                        marketTypeId = parts[0];
                        marketSpecial = parts[1];
                    } else if (parts.length == 1){
                        marketTypeId = parts[0];
                    } else {
                        return;
                    }
                } else if (mId.type) {
                    marketTypeId = mId.type;
                    if (mId.special){
                        marketSpecial = mId.special;
                    }
                }
                var marketType = ZAPNET.BetDB.getMarketInfoByType(marketTypeId);
                if (!marketType){
                    return;
                }
                var nrSels = Util.countProperties(marketType.selections);
                var hasVarSpecial = marketType.has_var_special == '1';
                var cols = nrSels + (hasVarSpecial ? 1 : 0);
                var specials = [''], i;
                if (marketSpecial !== false){
                    specials = [marketSpecial];
                } else if (marketType.specials){
                    specials = marketType.specials;
                } else if (+marketType.nr_specials){
                    specials = [];
                    for(i = 0; i < marketType.nr_specials; i += 1){
                        specials.push('');
                    }
                }
                var outcomeHeaders = [];
                var outcomes = [];
                var selections = ZAPNET.BetDB.getMarketTypeSelections(marketType.id);
                Util.foreach(selections, function(outcomeInfo){
                    var outcome = outcomeInfo.outcome;
                    outcomes.push(outcome);
                    outcomeHeaders.push(outcomeInfo.outcome_label && outcomeInfo.outcome_label.length < outcome.length ? outcomeInfo.outcome_label : outcome);
                });
                Util.foreach(specials, function(special){
                    marketGroup.cols += cols;
                    marketGroup.markets.push({
                        cols: cols,
                        market: marketTypeId,
                        title: Util.t(marketType.market_name) + (special ? ' ' + special : ''),
                        special: special,
                        handicap: !!hasVarSpecial,
                        headers: outcomeHeaders,
                        outcomes: outcomes
                    });
                });
            });

            return marketGroup;
        },

        getMarketSelection = function(match, market, outcome, special){
            if (!match.marketTypes[market]){
                return false;
            }
            special = special || '';
            if (!match.marketTypes[market][special] && match.marketTypes[market]['2.5']){
                special = '2.5';
            }
            if (!match.marketTypes[market][special]){
                return false;
            }
            if (match.marketTypes[market][special].market.status != 'open'){
                return false;
            }
            if (!match.marketTypes[market][special].outcomes[outcome]){
                return false;
            }
            var selection = match.marketTypes[market][special].outcomes[outcome];
            if (!selection){
                return false;
            }
            var odds = selection.odds >= 10 && selection.odds == Math.round(selection.odds) ? Math.round(selection.odds) : selection.odds;
            if (odds < 1){
                return false;
            }
            return {
                selection: selection,
                special: special,
                odds: odds
            };
        },
        getSelection = function(html, match, market, outcome, special, outcomeName, noShowSpecial, specialName){
            var selectionInfo = getMarketSelection(match, market, outcome, special);
            outcomeName = outcomeName || outcome;
            html.push('<div class="selection-button selection-button-', outcome, (selectionInfo ? '' : ' selection-disabled'));
            if (selectionInfo && bettingSlip && bettingSlip.isMatchesSlip() && bettingSlip.hasSelection(selectionInfo.selection.id)){
                html.push(' selection-on');
            }
            html.push('">');
            html.push('<div class="outcome">', Util.t(outcomeName));
            if (!noShowSpecial && special !== false && (special + '').length && Util.isNumeric(special)){
                html.push('&nbsp;<span class="outcome-special">', specialName ? specialName : special, '</span>');
            }
            html.push('</div>');
            if (selectionInfo){
                var selection = selectionInfo.selection;
                var odds = Util.formatOdds(selectionInfo.odds);
                html.push('<div class="selection');
                if (bettingSlip && bettingSlip.isMatchesSlip() && bettingSlip.hasSelection(selection.id)){
                    html.push(' selection-on');
                }
                if ('dir' in selection){
                    html.push(' odds-' + selection.dir);
                }
                html.push('" sid="', selection.id, '" odt="m">');
                html.push('<div class="bg"></div><div class="sel-odds">', odds, '</div>');
                html.push('</div>');
            } else {
                html.push('<div class="no-odds"></div>');
            }
            html.push('</div>');
        },

        getTopMarkets = function(markets, nrMarkets){
            nrMarkets = nrMarkets || 1;
            var openMarkets = [];
            var closedMarkets = [];
            var special, market;
            for(special in markets){
                if (markets.hasOwnProperty(special)){
                    market = markets[special].market;
                    if (market.status == "open"){
                        openMarkets.push(special);
                    } else {
                        closedMarkets.push(special);
                    }
                }
            }
            if (!openMarkets.length && closedMarkets.length){
                openMarkets = closedMarkets;
            }
            var getMarketDeviation = function(special){
                var sId, sel, n = [], nrOdds = 0, total = 0, avg, i, dev = 0;
                if (!markets[special] || !markets[special].market || !markets[special].market.selections){
                    return 10000;
                }
                if (Util.countProperties(markets[special].market.selections) == 1){
                    return 10000;
                }
                for(sId in markets[special].market.selections){
                    if (markets[special].market.selections.hasOwnProperty(sId)){
                        sel = markets[special].market.selections[sId];
                        if (sel.odds > 1){
                            n.push(+sel.odds);
                            total += +sel.odds;
                            nrOdds += 1;
                        } else {
                            n.push(1000);
                        }
                    }
                }
                avg = nrOdds ? total / nrOdds : 10000;
                for(i = 0; i < n.length; i += 1){
                    dev += Math.abs(n[i] - avg);
                }
                return dev;
            };
            openMarkets.sort(function(a, b){
                return getMarketDeviation(a) - getMarketDeviation(b);
            });

            return openMarkets.slice(0, nrMarkets);
        },

        getTopMarket = function(markets, nrMarkets){
            var specials = getTopMarkets(markets, nrMarkets);
            if (specials && specials.length){
                return specials[0];
            }
            return '';
        },
        getOutrightSelection = function(html, competitor){
            var odds = competitor.odds && competitor.odds >= 10 && competitor.odds == Math.round(competitor.odds) ? Math.round(competitor.odds) : competitor.odds;
            html.push('<div class="selection-button selection-button-outright');
            if (bettingSlip && bettingSlip.isOutrightsSlip() && bettingSlip.hasSelection(competitor.id)){
                html.push(' selection-on');
            }
            html.push('">');
            if (odds >= 1){
                html.push('<div class="selection');
                if (bettingSlip && bettingSlip.isOutrightsSlip() && bettingSlip.hasSelection(competitor.id)){
                    html.push(' selection-on');
                }
                if ('dir' in competitor){
                    html.push(' odds-' + competitor.dir);
                }
                var odds;
                html.push('" sid="', competitor.id, '" odt="or">');
                html.push('<div class="bg"></div><div class="sel-odds">', Util.formatOdds(odds), '</div>');
                html.push('</div>');
            } else {
                html.push('<div class="no-odds"></div>');
            }
            html.push('</div>');
        },

        getMatchMarket = function(match, marketType, special){
            if (!match || !match.marketTypes[marketType]){
                return 0;
            }
            if (!match.marketTypes[marketType][special] || !match.marketTypes[marketType][special].market){
                return 0;
            }

            return match.marketTypes[marketType][special].market.id;
        },

        openInlineMatch = function(matchEl){
            var matchId = Dom.getAttribute(matchEl, 'mid');
            var match = ZAPNET.BetDB.matches[matchId];
            var matchMarketsEl = $('.match-all-markets', matchEl, true);
            if (!matchMarketsEl){
                if (match.status == "live"){
                    if (ZAPNET_ONLINE_CONSTANTS.ALWAYS_OPEN_LIVETRACKER){
                        matchEl.appendChild(Util.div('open-livetracker', '<div style="height: 360px; background-color: #000;">' +
                            '<iframe class="livetracker" scrolling="no" frameborder="0" src="/statistics/livetracker?id=' + matchId + '"></iframe>' +
                            '</div>'));
                    } else {
                        matchEl.appendChild(Util.div('open-livetracker', Util.t('Open live stream')));
                    }

                }
                matchMarketsEl = Util.div('match-all-markets');
                matchEl.appendChild(matchMarketsEl);
                matchEl.appendChild(Util.div('inline-match-clode', Util.t('Close') + ' &#x21EA;'));
            }
            Dom.addClass(matchMarketsEl, 'loading');
            Dom.addClass(matchEl, 'open-match');
            loadMatch(matchId, function(){
                var html = [];
                getMatchMarkets(html, matchId, true, false);
                Dom.removeClass(matchMarketsEl, 'loading');
                matchMarketsEl.innerHTML = html.join('');
            });
        },

        closeInlineMatch = function(matchEl){
            Dom.removeClass(matchEl, 'open-match');
            var matchMarketsEl = $('.match-all-markets', matchEl, true);
            if (matchMarketsEl){
                matchMarketsEl.parentNode.removeChild(matchMarketsEl);
            }
            var matchCloseEl = $('.inline-match-clode', matchEl, true);
            if (matchCloseEl){
                matchCloseEl.parentNode.removeChild(matchCloseEl);
            }
            var matchLiveTrackerEl = $('.open-livetracker', matchEl, true);
            if (matchLiveTrackerEl){
                matchLiveTrackerEl.parentNode.removeChild(matchLiveTrackerEl);
            }
        },

        openMatch = function(match, limitMarkets){
            var matchId = Dom.getAttribute(match, 'mid');
            var html = [];
            getMatchMarkets(html, matchId, false, limitMarkets);
            var otherMarkets = $('div.match-other-markets', match, true);
            otherMarkets.innerHTML = html.join('');
        },

        closeMatch = function(openEl){
            var match = Dom.getAncestorByClassName(openEl, 'match');
            var matchMarkets = $('div.match-other-markets', match, true);
            matchMarkets.parentNode.removeChild(matchMarkets);
        },

        getMatchExtraInfo = function(match){
            return '<span class="league-name" title="' + Util.t(match.tournament.category.sport.name) + ' :: ' + Util.t(match.tournament.category.name) + ' :: ' + match.tournament.name.replace(match.tournament.category.name + ' ', '') + '">' + match.tournament.name + '</span>';
        },

        getMatchesTimeRange = function(from, to){
            var matches = ZAPNET.BetDB.getMatchesByTime();
            var matchList = [], i, match, count = 0;
            for(i = 0; i < matches.length; i += 1){
                match = ZAPNET.BetDB.matches[matches[i]];
                if (match.status == "open"){
                    if (from && +from > +match.ts){
                        continue;
                    }
                    if (to && +to < +match.ts){
                        continue;
                    }
                    matchList.push(match);
                    count += 1;
                }
            };

            return matchList;
        },

        getTodayMatches = function(){
            var today = $P.date('Y-m-d');
            return getMatchesTimeRange(false, $P.strtotime(today + ' 23:59:59'))
        },

        getTomorrowMatches = function(){
            var today = $P.date('Y-m-d', $P.strtotime('-6 hours'));
            var tomorrow = $P.strtotime(today + ' +30 hours');
            return getMatchesTimeRange(tomorrow, +tomorrow + (24*60*60));
        },

        getNext3DMatches = function(){
            var today = $P.date('Y-m-d', $P.strtotime('-6 hours'));
            return getMatchesTimeRange(false, $P.strtotime(today + ' +3 days +6 hours'))
        },

        getNext3HMatches = function(){
            return getMatchesTimeRange(false, $P.strtotime('+3 hours'))
        },

        renderMatchLiveInfo = function(html, match){
            var matchPeriod = PERIOD_LABELS[match.lstatus] ? PERIOD_LABELS[match.lstatus] : $P.ucwords(match.lstatus);
            html.push('<div class="period">', Util.t('Live'), ' - ', Util.t(matchPeriod), '</div>');
            html.push('<div class="betstatus"></div>');
            html.push('<div class="minute">', match.lmtime, '</div>');
            html.push('<div class="score">', match.score, '</div>');
            var sport = match.tournament.category.sport;
            if (sport.code == 'soccer'){
                var hr = +match.cards['home'].yellowred + +match.cards['home'].red;
                var hy = +match.cards['home'].yellow;
                var ar = +match.cards['away'].yellowred + +match.cards['away'].red;
                var ay = +match.cards['away'].yellow;
                if (hr){
                    html.push('<div class="home-red">', hr, '</div>');
                }
                if (hy){
                    html.push('<div class="home-yellow">', hy, '</div>');
                }
                if (ar){
                    html.push('<div class="away-red">', ar, '</div>');
                }
                if (ay){
                    html.push('<div class="away-yellow">', ay, '</div>');
                }
            }
        },

        getDefaultMatchMarket = function(match, betType, defaultMarkets){
            var sport = match.tournament.category.sport;
            var marketTypes = [];
            if (ZAPNET.COUPONS.ONLINE[sport.code]){
                var sportMarkets = ZAPNET.COUPONS.ONLINE[sport.code].MAIN;
                Util.foreach(sportMarkets.markets, function(market){
                    if (market.btype == betType){
                        marketTypes = market.types;
                    }
                });
            }
            if (defaultMarkets && defaultMarkets.length){
                Util.foreach(defaultMarkets, function(defMarket){
                    marketTypes.push(defMarket);
                });
            }
            var market = false;
            var openMarket = false;
            Util.foreach(marketTypes, function(typeId){
                if (!openMarket && match.marketTypes[typeId]){
                    var topMarketSpecial;
                    if (ZAPNET.BetDB.marketTypesById[match.tournament.category.sport.id] && ZAPNET.BetDB.marketTypesById[match.tournament.category.sport.id][typeId] && ZAPNET.BetDB.marketTypesById[match.tournament.category.sport.id][typeId].specials){
                        var specials = ZAPNET.BetDB.marketTypesById[match.tournament.category.sport.id][typeId].specials.split(',');
                        if (specials.length == 1){
                            topMarketSpecial = specials[0];
                        }
                    } else {
                        topMarketSpecial = getTopMarket(match.marketTypes[typeId]);
                    }
                    if (topMarketSpecial !== false && match.marketTypes[typeId][topMarketSpecial]){
                        market = match.marketTypes[typeId][topMarketSpecial].market;
                        if (market.status == 'open'){
                            openMarket = market;
                        }
                    }
                }
            });

            if (openMarket){
                return openMarket;
            }

            return market;
        },

        showPlayerSelectionStatistics = function(el){
            var marketId = false;
            var matchEl = Dom.getAncestorByClassName(el, 'match');
            if (matchEl){
                var marketEl = $('.match-markets div[mkid].match-market', matchEl, true);
                if (marketEl){
                    marketId = Dom.getAttribute(marketEl, 'mkid');
                }
            }
            var NO_DATA_HTML = '<span>' + Util.t('No data available at this time') + '</span>';
            var show = function(html, short){
                playerSelectionsPanelEl.innerHTML = html;
                if (short){
                    Dom.addClass(playerSelectionsPanelEl, 'short');
                } else {
                    Dom.removeClass(playerSelectionsPanelEl, 'short');
                }
                Dom.addClass(playerSelectionsPanelEl, 'visible');
                var xy = Dom.getXY(el);
                Dom.setXY(playerSelectionsPanelEl, [xy[0] + 18, short ? xy[1] : xy[1] - 55]);
            }
            var callback = {
                success: function(o){
                    var data = eval('(' + o.responseText + ')');
                    if (data.stats){
                        if (!ZAPNET.BetDB.markets[marketId]){
                            show(NO_DATA_HTML, true);
                            return;
                        }
                        var market = ZAPNET.BetDB.markets[marketId];
                        var sportId = market.match.tournament.category.sport.id;
                        if (!ZAPNET.BetDB.marketTypesById[sportId] || !ZAPNET.BetDB.marketTypesById[sportId][market.type]){
                            show(NO_DATA_HTML, true);
                            return;
                        }
                        var marketInfo = ZAPNET.BetDB.marketTypesById[sportId][market.type];
                        var outcomes = [];
                        if (marketInfo.selections){
                            Util.foreach(marketInfo.selections, function(selection){
                                outcomes.push({
                                    outcome: selection.outcome,
                                    label: selection.outcome_label ? selection.outcome_label : selection.outcome,
                                    order: selection.outcome_order
                                });
                            });
                        }
                        outcomes.sort(function(a, b){
                            return a.order - b.order;
                        })
                        var counts = {};
                        var error = false;
                        Util.foreach(data.stats, function(perc, selId){
                            if (!ZAPNET.BetDB.selections[selId]){
                                error = true;
                            }
                            var selection = ZAPNET.BetDB.selections[selId];
                            counts[selection.outcome] = perc;
                        });
                        if (error || Util.countProperties(counts) != outcomes.length){
                            show(NO_DATA_HTML, true);
                            return;
                        }
                        var html = [];
                        html.push('<div class="header">' + Util.t('Our customers bet like this') + '</div>');
                        html.push('<table><tr class="hd">');
                        Util.foreach(outcomes, function(oc){
                            html.push('<td class="ho">', oc.label, '</td>');
                        });
                        html.push('</tr><tr class="graph">');
                        Util.foreach(outcomes, function(oc){
                            var perc = 0;
                            if (counts[oc.outcome]){
                                perc = counts[oc.outcome];
                            }
                            html.push('<td class="ho"><div class="graph-outer"><div class="graph-inner" style="width: ', perc, '%"></div></div></td>');
                        });
                        html.push('</tr><tr class="percs">');
                        Util.foreach(outcomes, function(oc){
                            var perc = 0;
                            if (counts[oc.outcome]){
                                perc = counts[oc.outcome];
                            }
                            html.push('<td class="ho">', perc, '%</td>');
                        });
                        html.push('</tr></table>');
                        show(html.join(''));
                    } else {
                        show(NO_DATA_HTML, true);
                    }
                },
                failure: function(o){
                    show(NO_DATA_HTML, true);
                },
                cache: false,
                timeout: 3500
            };
            if (marketId){
                YAHOO.util.Connect.asyncRequest('GET', '/sports/marketstats?m=' + marketId, callback);
            } else {
                show(NO_DATA_HTML, true);
            }
        },

        renderMatchCouponMarket = function(html, market){
            if (!market){
                return;
            }
            Util.foreach(market.selections, function(selection){
                getSelection(html, market.match, market.type, selection.outcome, market.special, false, true);
            });
            if (market.special && $P.trim(market.special) !== ''){
                html.push('<div class="match-market-line">', market.special, '</div>');
            }
        },

        renderMatchLine = function(html, match){
            html.push('<div class="match-time">', $P.date('H:i', match.ts), '</div>');
            html.push('<div class="match-date">', $P.date('j', match.ts), ' ', Util.t($P.date('M', match.ts)), '</div>');

            html.push('<div class="match-name', (match.status == "live" || match.willgolive ? '' : ' match-name-single'), '">');
            html.push('<div class="match-code">', match.code ? match.code : '&nbsp;', '</div>');
            html.push('<div class="match-teams"><a href="#" class="match-link" mid="', match.id, '">', getMatchName(match), '</a></div>');
            html.push('</div>');

            var fourmarkets = window.ZAPNET_COMPANYNAME == 'Cashago' && match.tournament.category.sport.code == 'soccer';

            if (match.status == "live"){
                html.push('<div class="match-live-info">');
                renderMatchLiveInfo(html, match);
                html.push('</div>');
            } else if (match.willgolive){
                html.push('<div class="match-wgl">', Util.t(ZAPNET_ONLINE_CONSTANTS.WILLGOLIVE_TEXT), '</div>');
            }

            var resultMarket = getDefaultMatchMarket(match, 'result', [10,20,810,820,2002,1037,1010,1102]);
            html.push('<div class="match-league">');
            html.push('<div class="match-cat"><a href="#" class="category-link" cid="', match.tournament.category.id, '">', Util.t(match.tournament.category.name), '</a></div>');
            html.push('<div class="match-tour" title="', match.tournament.name, '"><a href="#" class="tournament-link" tid="', match.tournament.id, '">', match.tournament.name, '</a></div>');
            html.push('</div>');
            if (match.status !== "live" && resultMarket && resultMarket.mincomb && resultMarket.mincomb > 0){
                html.push('<div class="match-min-combs', (fourmarkets ? ' match-odds-extended' : ''), '">', resultMarket.mincomb, '</div>');
            }
            html.push('<div class="match-odds', (fourmarkets ? ' match-odds-extended' : ''), (match.status == "live" ? ' match-odds-live' : ''), '">');
            html.push('<div class="match-odds-market match-odds-market-1">');
            renderMatchCouponMarket(html, resultMarket);
            html.push('</div>');

            html.push('<div class="match-odds-market match-odds-market-2">');
            renderMatchCouponMarket(html, getDefaultMatchMarket(match, 'totals', [56,856,60,2005,52,1021,226,1083]));
            html.push('</div>');

            if (fourmarkets){
                if (match.status == "live"){
                    html.push('<div class="match-odds-market match-odds-market-3">');
                    renderMatchCouponMarket(html, getDefaultMatchMarket(match, 'rest', [1004]));
                    html.push('</div>');
                    html.push('<div class="match-odds-market match-odds-market-4">');
                    renderMatchCouponMarket(html, getDefaultMatchMarket(match, 'ng', [1013]));
                    html.push('</div>');
                } else {
                    html.push('<div class="match-odds-market match-odds-market-3">');
                    renderMatchCouponMarket(html, getDefaultMatchMarket(match, 'ggng', [43, 843]));
                    html.push('</div>');
                    html.push('<div class="match-odds-market match-odds-market-4">');
                    renderMatchCouponMarket(html, getDefaultMatchMarket(match, 'htresult', [42, 842]));
                    html.push('</div>');
                }
            }

            if (ZAPNET_ONLINE_CONSTANTS.WEBSITE_MATCH_STATISTICS) {
                html.push('<div class="match-statistics-link"></div>');
            }
            var nrMarkets = match.nrm ? match.nrm : Util.countProperties(match.marketTypes);
            if (nrMarkets){
                html.push('<div class="match-link xxxx" mid="', match.id, '">+', nrMarkets, '</div>');
            }
            html.push('</div>');
        },

        renderSportSection = function(html, sportId, matches, matchLimit, title, partType){
            if (ZAPNET_ONLINE_CONSTANTS.SPORTS_MAINPAGE == 'coupon' && ZAPNET.SportsCouponView){
                var matchView = {
                    rows: 1,
                    cols: [
                        {
                            header: 'Match Odds',
                            outcomeHeaders: ['1', 'X', '2'],
                            outcomes: ['1', 'X', '2'],
                            size: 3,
                            rows: [{
                                markets: [{
                                    type: 10
                                }, {
                                    type: 20
                                }]
                            }]
                        }
                    ]
                };
                var firstMatch = matches[0];
                var matchSettings = {
                    html: html,
                    header: Util.t(firstMatch.tournament.category.sport.name) + ' - ' + Util.t(firstMatch.tournament.category.name),
                    sportTabview: false,
                    extraClasses: 'sports-match-coupon',
                    maxSectionMatches: 250,
                    dateHeaders: true,
                    groupBy: 'tournament',
                    marketHeaderTitle: 'tournament',
                    matchOptions: [
                        'playerSelections',
                        'statistics',
                        'tvChannels',
                        'willGoLive'
                    ]
                };
                if (ZAPNET.MATCH_VIEW_RENDER_FN){
                    matchSettings.matchRenderFn = ZAPNET.MATCH_VIEW_RENDER_FN;
                }
                ZAPNET.SportsCouponView.render(matches, matchView, matchSettings);
                return;
            }
            var sport = sportId && ZAPNET.BetDB.sports[sportId] ? ZAPNET.BetDB.sports[sportId] : false;
            var m3way = true;
            if (sport && ZAPNET.COUPONS.ONLINE[sport.code]){
                var sportMarkets = ZAPNET.COUPONS.ONLINE[sport.code].MAIN;
                Util.foreach(sportMarkets.markets, function(market){
                    if (market.btype == 'result'){
                        if (market.outcomes.length == 2){
                            m3way = false;
                        }
                    }
                });
            }
            var isLive = partType == 'live';
            var fourmarkets = window.ZAPNET_COMPANYNAME == 'Cashago' && sport.code == 'soccer';

            html.push('<div class="sport-section-part sport-section-part-', (partType ? partType : 'all'), '">');
            html.push('<div class="sport-section-market-header', ZAPNET_ONLINE_CONSTANTS.WEBSITE_MATCH_STATISTICS ? ' match-stats' : '', (isLive ? ' sport-section-market-header-live' : ''),  '">');
            if (title){
                html.push('<div class="header-title">', Util.t(title), '</div>');
            }
            if (window.ZAPNET_COMPANYNAME == 'mCHEZA'){
                html.push('<div class="header-time">', Util.t('Time'), '</div>');
                html.push('<div class="header-code">', Util.t('Game ID'), '</div>');
                html.push('<div class="header-match">', Util.t('Home team v Away team'), '</div>');
                html.push('<div class="header-league">', Util.t('League'), '</div>');
            }
            html.push('<div class="match-odds', (fourmarkets ? ' match-odds-extended' : ''), (isLive ? ' match-odds-live' : ''), '">');
            html.push('<div class="match-odds-market match-odds-market-1"><div class="outcome-header outcome-header-1">1</div>');
            if (m3way){
                html.push('<div class="outcome-header outcome-header-X">X</div>');
            }
            html.push('<div class="outcome-header outcome-header-2">2</div></div>');
            html.push('<div class="match-odds-market match-odds-market-2"><div class="outcome-header outcome-header-1">', Util.t('U'), '</div><div class="outcome-header outcome-header-2">', Util.t('O'), '</div></div>');

            if (fourmarkets){
                if (isLive){
                    html.push('<div class="match-odds-market match-odds-market-3"><div class="outcome-header outcome-header-wide">', Util.t('REST TIME'), '</div></div>');
                    html.push('<div class="match-odds-market match-odds-market-4"><div class="outcome-header outcome-header-wide">', Util.t('NEXT GOAL'), '</div></div>');
                } else {
                    html.push('<div class="match-odds-market match-odds-market-3"><div class="outcome-header outcome-header-Yes">', Util.t('GG'), '</div>');
                    html.push('<div class="outcome-header outcome-header-No">', Util.t('NG'), '</div></div>');
                    html.push('<div class="match-odds-market match-odds-market-4"><div class="outcome-header outcome-header-1">', Util.t('F1'), '</div>');
                    html.push('<div class="outcome-header outcome-header-X">', Util.t('FX'), '</div>');
                    html.push('<div class="outcome-header outcome-header-2">', Util.t('F2'), '</div></div>');
                }
            }

            html.push('</div></div>');
            var matchCount = 0;
            var matchLimitExceeded = false;
            html.push('<div class="matches-set">');
            Util.foreach(matches, function(match){
                matchCount += 1;
                if (matchLimitExceeded){
                    return;
                }
                html.push('<div class="match', ZAPNET_ONLINE_CONSTANTS.WEBSITE_MATCH_STATISTICS ? ' match-stats' : '', match.live ? (match.livebet == 'started' ? ' betstart' : ' betstop') : '', ' r', ((matchCount-1) % 2), '" mid="', match.id, '">');
                renderMatchLine(html, match);
                html.push('</div>');
                if (matchLimit){
                    if (matchCount >= matchLimit){
                        matchLimitExceeded = true;
                    }
                }
            });
            html.push('</div>');
            if (+matchCount >= +matchLimit){
                html.push('<div class="matches-show-more-less moreonly-section" ol="1">');
                html.push('<div class="matches-show-more"><div class="moreless-label">', Util.t('Show More'), '</div></div>');
                html.push('<div class="matches-show-less"><div class="moreless-label">', Util.t('Show Less'), '</div></div>');
                html.push('</div>');
            }
            html.push('</div>');

        },

        renderFavoriteOdds = function(html, priceLimit){
            var matchList = ZAPNET.BetDB.getPregameMatchesOddsLessThan(priceLimit);
            html.push('<div class="match-section coupon-match-section">');
            html.push('<div class="header">', Util.t('Odds Less Than'), ' ', Util.formatOdds(priceLimit));
            html.push('</div>');
            if (!matchList || !matchList.length){
                html.push('<div class="empty-section">No events found</div>');
                html.push('</div>');
                return;
            }
            var firstMatch = matchList[0];
            html.push('<div class="match-section-sport-content">');
            html.push('<div class="sport-section selected">');
            renderSportSection(html, firstMatch.tournament.category.sport.id, matchList);
            html.push('</div>');
            html.push('</div>');
            html.push('</div>');
            return;
        },

        renderMatchSections = function(el, sports, selectedSportId, matchLimit, liveLimit){
            if (!sports.length){
                el.innerHTML = '';
                return;
            }
            selectedSportId = selectedSportId || sports[0].id;

            var html = [];
            html.push('<div class="home-match-section match-section">');
            html.push('<div class="match-section-sport-menu">');
            Util.foreach(sports, function(sportSection){
                var sport = ZAPNET.BetDB.sports[sportSection.id];
                var style = '';
                if (window.ZAPNET_COMPANYNAME == 'SpartaBet'){
                    style = ' style="background-image: url(../../images/online/b3/sparta/sports/' + sport.code + '.png); background-size: 20px 20px;"';
                }
                html.push('<div class="sport-item', sport.id == selectedSportId ? ' selected' : '', '" sid="', sport.id, '"><div class="sport-icon sport-', sport.code, '"', style, '></div>', Util.t(sport.name), '</div>');
            });
            html.push('</div>');
            html.push('<div class="match-section-sport-content">');
            Util.foreach(sports, function(sportSection){
                var sport = ZAPNET.BetDB.sports[sportSection.id];
                html.push('<div class="sport-section ', sport.id == selectedSportId ? ' selected' : '', '" sid="', sport.id, '">');
                if (sportSection.live && sportSection.live.length){
                    renderSportSection(html, sportSection.id, sportSection.live, liveLimit, Util.t('Live Markets'), 'live');
                    html.push('<div style="height: 15px;">&nbsp;</div>');
                }
                if (window.ZAPNET_COMPANYNAME == 'AP'){
                    if (sportSection.matches && sportSection.matches.length){
                        renderSportSection(html, sportSection.id, sportSection.matches, matchLimit, Util.t('Markets'), 'all');
                        html.push('<div style="height: 15px;">&nbsp;</div>');
                    }
                    if (sportSection.top && sportSection.top.length){
                        renderSportSection(html, sportSection.id, sportSection.top, false, Util.t('Highlights'), 'top');
                    }
                } else {
                    if (sportSection.top && sportSection.top.length){
                        renderSportSection(html, sportSection.id, sportSection.top, false, Util.t('Highlights'), 'top');
                        html.push('<div style="height: 15px;">&nbsp;</div>');
                    }
                    if (sportSection.matches && sportSection.matches.length){
                        renderSportSection(html, sportSection.id, sportSection.matches, matchLimit, Util.t('Markets'), 'all');
                    }
                }
                html.push('</div>');
            });
            html.push('</div>');
            html.push('</div>');

            el.innerHTML = html.join('');
        },

        refreshMatch = function(matchId){
            var match;
            var newLive = false;
            if (lastLiveMatchId && lastLiveMatchId == matchId){
                if (ZAPNET.BetDB.matches[matchId]){
                    match = ZAPNET.BetDB.matches[matchId];
                    if (match.status != "live" || match.lstatus == 'ended'){
                        newLive = true;
                    }
                } else {
                    newLive = true;
                }
                if (newLive){
                    setTimeout(function(){
                        showLive();
                    }, 10);
                }
            }
            if (!ZAPNET.BetDB.matches[matchId]){
                var matchEl = $('div.virtual-games div[mid="' + matchId + '"].virtual-match-event', null, true);
                if (matchEl){
                    showVirtual();
                }
                return;
            }
            match = ZAPNET.BetDB.matches[matchId];
            if (match.status == "live"){
                var matchEls = $('div[mid="' + matchId + '"].match');
                if (matchEls && matchEls.length){
                    Util.foreach(matchEls, function(matchEl){
                        if (match.livebet == 'started'){
                            Dom.replaceClass(matchEl, 'betstop', 'betstart');
                        } else {
                            Dom.replaceClass(matchEl, 'betstart', 'betstop');
                        }
                    });
                }
                var rmMatchEl = $('div.sport-section-part:not(.sport-section-part-live) div[mid="' + matchId +'"].match', null, true);
                if (rmMatchEl){
                    rmMatchEl.parentNode.removeChild(rmMatchEl);
                }
            }

            if (ZAPNET.SportsCouponView){
                return;
            }

            var matchEl = $('div.match-section div.match-section-sport-content div[mid="' + matchId + '"].match', null, true);
            if (!matchEl){
                return;
            }
            var html = [];
            renderMatchLine(html, match);
            matchEl.innerHTML = html.join('');
        },

        renderCoupon = function(html, section, marketId, extraInfo){
            html.push('<div class="match-section coupon-match-section">');
            if (section.title){
                html.push('<div class="header">', section.title);
                html.push('</div>');
            }
            if (!section.matches || !section.matches.length){
                html.push('<div class="empty-section">No events found</div>');
                html.push('</div>');
                return;
            }
            var firstMatch = section.matches[0];
            html.push('<div class="match-section-sport-content">');
            html.push('<div class="sport-section selected">');
            renderSportSection(html, firstMatch.tournament.category.sport.id, section.matches);
            html.push('</div>');
            html.push('</div>');
            html.push('</div>');
            return;

            var tournament = section.tournament ? getTournamentByIndex(section.tournament.id) : false;
            var marketGroups = {};

            var colSpan = 3;
            html.push('<div class="match-section">');
            if (section.title){
                html.push('<div class="header">', section.title);
                if (section.menu){
                    html.push(section.menu);
                }
                html.push('</div>');
            }
            var curDay = null;
            if (!section.matches || !section.matches.length){
                html.push('No events found');
            } else {
                Util.foreach(section.matches, function(match, i){
                    var marketGroup;
                    var sport = match.tournament.category.sport;
                    var sportId = sport.id;
                    var mStat = match.status == "live" ? 'L' : 'M';
                    var marketGroup, coupType;
                    if (marketGroups[mStat + sportId]){
                        marketGroup = marketGroups[mStat + sportId];
                    } else {
                        if (match.status == 'live'){
                            if (SPORT_MARKETS[sport.code]['livemain']){
                                coupType = 'livemain';
                            } else {
                                coupType = 'live';
                            }
                        } else {
                            coupType = 'main'
                        }
                        marketGroup = getMarketGroup(SPORT_MARKETS[sport.code][coupType]);
                        marketGroups[mStat + sportId] = marketGroup;
                    }
                    var m;
                    var nrMarkets = Util.countProperties(match.markets);
                    var matchDay = $P.date('Y-m-d', match.ts);
                    curDay = matchDay;
                    var dayName = matchDay == $P.date('Y-m-d') ? 'Today' : $P.date('l', match.ts);
                    html.push('<div class="match', match.live ? (match.livebet == 'started' ? ' betstart' : ' betstop') : '', '" mid="', match.id, '">');
                    html.push('<div class="match-status ');
                    if (match.status == "live"){
                        html.push('live');
                    } else if (match.willgolive){
                        html.push('will-go-live');
                    }
                    html.push('">');
                    html.push('<div class="day">', dayName, '</div>');
                    if (match.status == "live"){
                        html.push('<div class="score">', match.score, '</div>');
                    } else if (match.willgolive){
                        html.push('<div class="text">Live</div>');
                        html.push('<div class="text">', $P.date('H:i', match.ts), '</div>');
                    } else {
                        html.push('<div class="time">', $P.date('H:i', match.ts), '</div>');
                    }
                    html.push('</div>');
                    html.push('<div class="match-bets">');
                    html.push('<div class="match-markets">');
                    html.push('<div class="match-main-markets match-main-markets-', marketGroup.markets.length, '">');
                    var count = 0;
                    Util.foreach(marketGroup.markets, function(market, mi){
                        var special = market.special;
                        if (special == 'v'){
                            if (match.marketTypes[market.market]){
                                special = getTopMarket(match.marketTypes[market.market], 1);
                            } else {
                                special = '';
                            }
                        }
                        var marketTypeInfo = ZAPNET.BetDB.marketTypesById[match.tournament.category.sport.id] && ZAPNET.BetDB.marketTypesById[match.tournament.category.sport.id][market.market] ? ZAPNET.BetDB.marketTypesById[match.tournament.category.sport.id][market.market] : false;
                        var selType, nrSels = Util.countProperties(market.outcomes);
                        if (nrSels <= 2){
                            selType = 'market-sel-type-2';
                        } else {
                            selType = 'market-sel-type-n';
                        }
                        if (marketTypeInfo.selection_type == '3way'){
                            selType = 'market-sel-type-3way';
                        }
                        marketId = getMatchMarket(match, market.market, special);
                        html.push('<div class="match-market match-market-', market.market ,' match-market-i-', mi, ' ', selType, '">');
                        if (count){
                            html.push('<div class="match-info">', Util.t(marketTypeInfo.market_name), ' ', special, '</div>');
                        } else {
                            html.push('<div class="match-info"><span class="match-code">', match.code, '</span>&nbsp;', Util.t(match.tournament.category.sport.name), ' / ', Util.t(match.tournament.category.name), ' / ', match.tournament.name, '</div>');
                        }
                        Util.foreach(market.outcomes, function(outcome){
                            var outcomeName = outcome;
                            if (marketTypeInfo && Util.inArray(marketTypeInfo.selection_type, ['2way', '3way'])){
                                if (outcome == '1'){
                                    outcomeName = match.competitors[0];
                                } else if (outcome == '2'){
                                    outcomeName = match.competitors[1];
                                }
                            }
                            getSelection(html, match, market.market, outcome, special, outcomeName, true);
                        });
                        html.push('</div>');
                        count += 1;
                    });
                    html.push('</div>');
                    html.push('<div class="match-other-markets">');
                    html.push('</div>');
                    html.push('</div>');
                    html.push('</div>');
                    html.push('<div class="more-markets">');
                    html.push('<div class="nr-markets">+', nrMarkets, '</div>');
                    html.push('<div class="openclose"></div>');
                    html.push('</div>');
                    html.push('</div>');
                });
            }
            html.push('</div>');
        },

        renderLiveMatchCoupon = function(el, section, marketId, extraInfo){
            if (!section.matches || !section.matches.length){
                return;
            }
            var html = [];
            var firstMatch = section.matches[0];
            var marketGroup = getMarketGroup(marketId);

            var colSpan = 3;
            html.push('<table class="coupon">');
            html.push('<tr class="match-header"><td class="code">&nbsp;</td><td class="code">&nbsp;</td><td colspan="', extraInfo ? 3 : 2, '">&nbsp;</td>');
            Util.foreach(marketGroup.markets, function(market){
                if (market.handicap){
                    html.push('<td>&nbsp;</td>');
                }
                Util.foreach(market.headers, function(header){
                    html.push('<td>', header, '</td>');
                });
            });
            html.push('<td colspan="2">&nbsp;</td>');
            html.push('</tr>');
            var curDay = null;
            Util.foreach(section.matches, function(match, i){
                var nrSels = 0, m, msels;
                for(m in match.markets){
                    if (match.markets.hasOwnProperty(m)){
                        msels = Util.countProperties(match.markets[m].selections);
                        nrSels += msels ? msels : 0;
                    }
                }
                var matchName = getMatchName(match);
                var matchDay = $P.date('Y-m-d', match.ts);
                if (curDay && matchDay != curDay){
                    //html.push('<tr><td colspan="', colSpan, '" class="nextday">', $P.date('d F Y', match.ts), '</td></tr>');
                }
                curDay = matchDay;
                html.push('<tr class="match', match.live ? (match.livebet == 'started' ? ' betstart' : ' betstop') : '', ' r', (i % 2), '" mid="', match.id, '"><td class="code">', match.code);
                html.push('</td><td class="time">', match.lmtime, '</td><td class="score">', match.score, '</td>', extraInfo ? '<td class="event">' + getMatchExtraInfo(match) + '</td>' : '', '<td class="event"><span class="match-name">', $P.ucwords(matchName.toLowerCase()).replace(' V ', ' - '), '</span></td>');
                Util.foreach(marketGroup.markets, function(market){
                    if (market.handicap){
                        html.push('<td>&nbsp;</td>');
                    }
                    Util.foreach(market.outcomes, function(outcome){
                        html.push('<td>');
                        getSelection(html, match, market.market, outcome, market.special);
                        html.push('</td>');
                    });
                });
                html.push('<td class="md"><div class="mdh"></div></td><td class="allsels">');
                html.push('<a href="#" class="openmatch');
                html.push('">', nrSels, '</a></td>');
                html.push('</tr>');
            });
            html.push('</table>');

            el.innerHTML = html.join('');
        },

        renderMatchList = function(el, matches, marketId, title, menu){
            var html = [];
            var section = {
                matches: matches,
                title: title,
                menu: menu
            };
            renderCoupon(html, section, marketId);
            el.innerHTML = html.join('');
            //Event.purgeElement(el);
            //Event.on(el, 'click', couponClick);
        },

        renderSideBarLiveMatch = function(el, matches){
            var html = [];

            Util.foreach(matches, function(match, i){
                if (match.live){
                    html.push('<div class="live-match live-match-live">');
                    html.push('<div class="match-name">', getMatchName(match), '</div>');
                    html.push('<div class="match-status">', match.lmtime, '</div>');
                    html.push('<div class="match-score">', match.score, '</div>');
                    html.push('<div class="match-market-title"><div class="market-phase">Fulltime</div><div class="market-name">1X2</div></div>');
                    html.push('<div class="odds">');
                    html.push('<div class="sel-wrapper">1');
                    getSelection(html, match, 2002, '1', '');
                    html.push('</div>');
                    html.push('<div class="sel-wrapper">X');
                    getSelection(html, match, 2002, 'X', '');
                    html.push('</div>');
                    html.push('<div class="sel-wrapper">2');
                    getSelection(html, match, 2002, '2', '');
                    html.push('</div>');
                    html.push('</div>');
                    html.push('</div>');
                } else {
                    html.push('<div class="live-match live-match-upcoming">');
                    html.push('<div class="match-time">', $P.date('d/m/Y H:i', match.ts), '</div>');
                    html.push('<div class="match-name">', getMatchName(match), '</div>');
                    html.push('<div class="match-upcoming">', 'UPCOMING', '</div>');
                    html.push('</div>');
                }
            });

            el.innerHTML = html.join('');
            //Event.purgeElement(el);
            //Event.on(el, 'click', couponClick);
        },

        renderSideBarMatchResults = function(el, results){
            var html = [];

            Util.foreach(results, function(match){
                html.push('<div class="match-results">');
                html.push('<div class="match-name">', getMatchName(match), '</div>');
                html.push('<div class="match-time">', $P.date('d/m/Y H:i', match.ts), '</div>');
                html.push('<div class="match-score">', match.ftres, '</div>');
                html.push('<div class="results">');
                html.push('<div class="result', (match.res1 == 'won' ? ' result-won' : '') , '">1');
                html.push('<div class="odds">', Util.formatOdds(match.odds1), '</div>');
                html.push('</div>');
                html.push('<div class="result', (match.resX == 'won' ? ' result-won' : '') , '">X');
                html.push('<div class="odds">', Util.formatOdds(match.oddsX), '</div>');
                html.push('</div>');
                html.push('<div class="result', (match.res2 == 'won' ? ' result-won' : '') , '">2');
                html.push('<div class="odds">', Util.formatOdds(match.odds2), '</div>');
                html.push('</div>');
                html.push('</div>');
                html.push('</div>');
            });

            el.innerHTML = html.join('');
        },

        renderSideBarMarketMovers = function(el, movers){
            var index = 0;
            var showMovers = function(mvs){
                var html = ['<div class="mover-wrapper">'];
                Util.foreach(mvs, function(mv){
                    html.push('<div class="mover">');
                    html.push('<div class="match-name">', mv.match, '</div>');
                    Util.foreach(['1', 'X', '2'], function(oc){
                        var sel = mv[oc];
                        var dir = 'none';
                        if (sel.odds < sel.podds){
                            dir = 'down';
                        } else if (sel.odds > sel.podds){
                            dir = 'up';
                        }
                        //html.push('<div class="moverodds moverodds-', oc, ' moverodds-', dir, '">');
                        //html.push(sel.odds);
                        //html.push('</div>');

                        html.push('<div class="selection-button selection-button-', oc, '"><div odt="m" sid="', sel.sid, '" class="selection"><div class="outcome">', oc, '</div><div class="bg"></div><div class="sel-odds">', Util.formatOdds(sel.odds), '</div><div class="odds-change-arrow-', dir, '"></div></div></div>');
                    });
                    html.push('</div>');
                });
                html.push('</div>');
                el.innerHTML = html.join('');
            };
            var roll = function(){
                var mvs;
                var animate = function(){
                    var wrapper = $('div.mover-wrapper', el, true);
                    var animation = new YAHOO.util.Anim(wrapper, {
                        top: {
                            to: -55
                        }
                    }, 1, YAHOO.util.Easing.easeIn);
                    animation.onComplete.subscribe(function(){
                        showMovers(mvs.slice(1));
                    });
                    animation.animate();
                };
                if (index >= movers.length){
                    index = 0;
                }
                mvs = movers.slice(index, 4 + index);
                if (mvs.length < 4){
                    mvs = mvs.concat(movers.slice(0, 4-mvs.length));
                }
                showMovers(mvs);
                animate();
                index += 1;
            };

            showMovers(movers.slice(0, 3));
            if (movers.length > 3){
                index = 0;
                setInterval(roll, 3000);
            }
        },

        renderMarkets = function(html, section){
            Util.foreach(section.selected, function(marketId){
                // html.push('<div class="section-head">', section.marketTypes[marketId].name, '</div>');
                renderCoupon(html, section, marketId);
            });
        },

        renderSection = function(html, section){
            // html.push('<div class="couponsection matches-coupon" tid="', section.tournament.id);
            // html.push('"><div class="header"><div class="title"><span>', section.title, '</span></div></div>');
            // renderMarketMenu(html, section);
            renderMarkets(html, section);
            //html.push('</div>');
        },

        getMatchMarketMenu = function(html, match){
            var market, marketInfo, selections;
            var i = 0, marketList = [];
            Util.foreach(match.marketTypes, function(specials, mt){
                var marketOpen = false;
                Util.foreach(specials, function(marketDef, special){
                    if (marketDef.market.status == "open"){
                        marketOpen = true;
                    }
                });
                if (marketOpen){
                    marketInfo = ZAPNET.BetDB.getMarketInfoByType(mt);
                    marketList.push(marketInfo);
                }
            });
            marketList.sort(function(a, b){
                return a.market_order - b.market_order;
            });
            var matchMarkets = {}, betType, marketDef;
            if (matchSelectedMarkets[match.id] && Util.countProperties(matchSelectedMarkets[match.id])){
                matchMarkets = matchSelectedMarkets[match.id];
            }
            html.push('<div class="market-menu-items">');
            for(i = 0; i < marketList.length; i += 1){
                market = marketList[i];
                betType = market.market_type;
                marketDef = ZAPNET.BetDB.marketTypesById[match.tournament.category.sport.id][betType];
                html.push('<div class="market-menu-button', matchMarkets[betType] ? ' selected' : '' ,'" bt="', betType, '">', Util.t(market.market_name), '</div>');
            }
            html.push('</div>');
            html.push('<div class="market-menu-moreless"><span class="market-menu-moreless"></span>', Util.t('Show More'), '</div>');
        },

        getMatchMarkets = function(html, matchId, allMarkets, limitMarkets, noGroups){
            if (!noGroups && window.ZAPNET_ONLINE_CONSTANTS && ZAPNET_ONLINE_CONSTANTS.MATCH_MARKETS_GROUPED) {
                return getMatchMarketsGrouped(html, matchId, allMarkets, limitMarkets, noGroups);
            }

            if (!ZAPNET.BetDB.matches[matchId]){
                return;
            }
            var match = ZAPNET.BetDB.matches[matchId];

            // html.push('<div class="match-all-markets"><div class="match-market-container">');
            var market, marketInfo, selections;
            var i = 0, marketList = [];
            Util.foreach(match.markets, function(market){
                if (market && market.id && (market.status == "open" || market.status == "suspended")){
                    var marketTypeInfo = ZAPNET.BetDB.marketTypes[market.typeid] ? ZAPNET.BetDB.marketTypes[market.typeid] : false;
                    if (marketTypeInfo && match.status == "open" && +marketTypeInfo.is_live){
                        return;
                    }
                    if (marketTypeInfo && match.status == "live" && !+marketTypeInfo.is_live){
                        return;
                    }
                    marketList.push({
                        id: market.id,
                        name: market.name,
                        type: market.type,
                        order: market.order,
                        special: market.special,
                        info: marketTypeInfo
                    });
                }
            });
            marketList.sort(function(a, b){
                if (a.order != b.order){
                    return a.order - b.order;
                }
                if (a.type != a.type){
                    return a.type - b.type;
                }
                var ai = parseFloat(a.special) || 0;
                var bi = parseFloat(b.special) || 0;
                return ai - bi;
            });
            var countMarkets = 0;
            var hiddenSections = false;
            html.push('<div class="markets-section">');
            var count = 0;
            for(i = 0; i < marketList.length; i += 1){
                marketInfo = marketList[i];
                if (!ZAPNET.BetDB.markets[marketInfo.id]){
                    continue;
                }
                market = ZAPNET.BetDB.markets[marketInfo.id];
                if (!allMarkets){
                    if (market.status != "open" || market.type == '10' || market.type == '20'){
                        continue;
                    }
                }
                if (market.status != "open"){
                    continue;
                }
                selections = ZAPNET.BetDB.getMarketSelections(marketInfo.id);
                var nrSels = selections.length;
                var selType;
                if (nrSels <= 2){
                    selType = 'market-sel-type-2';
                } else {
                    selType = 'market-sel-type-n';
                }
                var marketTypeInfo = marketInfo.info;
                if (marketTypeInfo.selection_type == '3way'){
                    selType = 'market-sel-type-3way';
                }
                if (marketTypeInfo.market_code == 'goalscorer'){
                    selType = selType + ' match-market-wide-outcome';
                }
                var handicapSpecial = false;
                if ((nrSels == 2 || marketTypeInfo.selection_type == '3way' || marketTypeInfo.selection_type == '2way') && Util.isNumeric(market.special) && market.name.toLowerCase().indexOf('handicap') >= 0 && (marketTypeInfo.selection_type == '3way' || marketTypeInfo.selection_type == '2way' || (selections[0].outcome == '1' && selections[1].outcome == '2'))){
                    handicapSpecial = true;
                }
                html.push('<div class="match-market r', (count % 2), ' match-markets-' + (i < 20 ? 'high' : 'low'), ' ', selType, '"><div class="market-name">');
                html.push(Util.t(market.name));
                if ((market.special + '').length){
                    html.push('&nbsp;', market.special);
                }
                html.push('&nbsp;<span class="min-comb">', market.mincomb, '+</span>');
                html.push('</div>');
                selections.sort(function(a, b){
                    var aOrder = 0, bOrder = 0;
                    if (marketTypeInfo.selections && marketTypeInfo.selections[a.outcome] && marketTypeInfo.selections[a.outcome].outcome_order){
                        aOrder = +marketTypeInfo.selections[a.outcome].outcome_order;
                    }
                    if (marketTypeInfo.selections && marketTypeInfo.selections[b.outcome] && marketTypeInfo.selections[b.outcome].outcome_order){
                        bOrder = +marketTypeInfo.selections[b.outcome].outcome_order;
                    }
                    if (market.name.toLowerCase().indexOf('scorer') >= 0){
                        return a.odds - b.odds;
                    }
                    return aOrder - bOrder;
                });
                Util.foreach(selections, function(selection, i){
                    var selButton = '';
                    var outcomeLabel = selection.label && selection.label.length < selection.outcome.length ? selection.label : selection.outcome;
                    if (false && (marketTypeInfo.selection_type == '3way' || marketTypeInfo.selection_type == '2way')){
                        if (outcomeLabel == '1'){
                            outcomeLabel = match.competitors[0];
                            selButton = ' selection-button-1';
                        } else if (outcomeLabel == '2'){
                            outcomeLabel = match.competitors[1];
                            selButton = ' selection-button-2';
                        } else {
                            selButton = ' selection-button-X';
                        }
                    }
                    var marketSpecial = market.special;
                    if (handicapSpecial){
                        var msNum = selection.outcome == '2' ? 0 - (+market.special) : market.special;
                        marketSpecial = '(' + (msNum < 0 ? msNum : '+' + msNum) + ')';
                    }
                    getSelection(html, match, marketInfo.type, selection.outcome, market.special, outcomeLabel, !handicapSpecial, marketSpecial);
                    var breakSels = false;
                    var nSel = i + 1;
                    if (marketTypeInfo.market_code == 'goalscorer'){
                        breakSels = true;
                    } else if (nrSels > 5){
                        if (nSel && nSel % 3 == 0){
                            breakSels = true;
                        }
                    }
                    if (breakSels){
                        html.push('<div class="newline"></div>');
                    }
                });
                html.push('</div>');
                countMarkets += 1;
                if (limitMarkets && countMarkets >= limitMarkets){
                    hiddenSections = true;
                    countMarkets = 0;
                    html.push('</div><div class="markets-section markets-section-hidden">');
                }
                count += 1;
            }
            html.push('</div>');
            if (hiddenSections){
                html.push('<div class="markets-show-more-less moreonly-section" ol="1">');
                html.push('<div class="markets-show-more"><div class="moreless-label">', Util.t('Show More'), '</div></div>');
                html.push('<div class="markets-show-less"><div class="moreless-label">', Util.t('Show Less'), '</div></div>');
                html.push('</div>');
            }
            //html.push('<div class="spacer"></div>');
            // html.push('</div></div>');
        },

        getMatchMarketsGrouped = function(html, matchId, allMarkets, limitMarkets){
            if (!ZAPNET.BetDB.matches[matchId]){
                return;
            }
            var match = ZAPNET.BetDB.matches[matchId];

            var sport = match.tournament.category.sport;
            var i = 0;
            var marketGroups = [];
            var marketGroupDefs = ZAPNET.BetDB.marketGroups;
            if (!marketGroupDefs || !marketGroupDefs[sport.id]) {
                return getMatchMarkets(html, matchId, allMarkets, limitMarkets, true);
            }
            var defaultMarketGroup = false;
            var otherMarketGroup = false;

            Util.foreach(marketGroupDefs[sport.id], function (gDef, id) {
                if (match.status == "live" && gDef.type == 'pre') {
                    return;
                }
                if (match.status != "live" && gDef.type == 'live') {
                    return;
                }
                if (gDef.default) {
                    defaultMarketGroup = gDef;
                } else if (gDef.other) {
                    otherMarketGroup = gDef;
                } else {
                    marketGroups.push(gDef);
                }
            });
            marketGroups.sort(function (a, b) {
                var aOrder = a.order || +a.order === 0 ? +a.order : 9999999;
                var bOrder = b.order || +b.order === 0 ? +b.order : 9999999;
                return aOrder - bOrder;
            })
            if (defaultMarketGroup) {
                marketGroups.unshift(defaultMarketGroup);
            }
            if (otherMarketGroup) {
                marketGroups.push(otherMarketGroup);
            }
            if (!marketGroups.length) {
                return getMatchMarkets(html, match, allMarkets, limitMarkets, true);
            }
            var processedMarketTypes = {};
            Util.foreach(marketGroups, function (marketGroup) {
                var marketTypeList = [];
                var groupMarketTypes = {};
                Util.foreach(marketGroup.markets, function (gm) {
                    groupMarketTypes[gm.type] = gm;
                });
                Util.foreach(match.marketTypes, function (special, marketTypeId) {
                    var marketTypeInfo = ZAPNET.BetDB.marketTypesById[sport.id] && ZAPNET.BetDB.marketTypesById[sport.id][marketTypeId] ? ZAPNET.BetDB.marketTypesById[sport.id][marketTypeId] : false;
                    if (!processedMarketTypes[marketTypeId] && marketTypeInfo && (marketGroup.other || groupMarketTypes[marketTypeId])) {
                        marketTypeList.push(marketTypeInfo);
                        processedMarketTypes[marketTypeId] = marketTypeId;
                    }
                });
                if (!marketTypeList.length) {
                    return;
                }
                marketTypeList.sort(function (a, b) {
                    var aOrder = groupMarketTypes[a.market_type] && groupMarketTypes[a.market_type].order ? groupMarketTypes[a.market_type].order : a.market_order;
                    var bOrder = groupMarketTypes[b.market_type] && groupMarketTypes[b.market_type].order ? groupMarketTypes[b.market_type].order : b.market_order;
                    if (aOrder != bOrder) {
                        return aOrder - bOrder;
                    }
                    return a.market_type - b.market_type;
                });
                if (!matchMarketGroupStatus[marketGroup.id]) {
                    matchMarketGroupStatus[marketGroup.id] = marketGroup.default ? 'open' : 'closed';
                }
                var groupOpen = matchMarketGroupStatus[marketGroup.id] == 'open';
                html.push('<div class="match-markets-market-group', groupOpen ? ' open' : '', '" mgid="', marketGroup.id, '">');
                html.push('<div class="title">', Util.t(marketGroup.name), '&nbsp;(', marketTypeList.length, ')');
                html.push('<div class="market-group-open-close"></div></div>');
                html.push('<div class="market-group-contents">');
                var marketTypeItem, special, market, matchMarket, selections, marketInfo;
                var count = 0;
                for(i = 0; i < marketTypeList.length; i += 1){
                    marketTypeItem = marketTypeList[i];
                    if (!match.marketTypes[marketTypeItem.market_type]){
                        continue;
                    }
                    matchMarket = match.marketTypes[marketTypeItem.market_type];
                    for(special in matchMarket){
                        if (!matchMarket.hasOwnProperty(special)){
                            continue;
                        }
                        market = matchMarket[special].market;
                        if (!allMarkets){
                            if (market.status != "open" || market.type == '10' || market.type == '20'){
                                continue;
                            }
                        }
                        if (market.status != "open"){
                            continue;
                        }
                        selections = ZAPNET.BetDB.getMarketSelections(market.id);
                        var nrSels = selections.length;
                        var selType;
                        if (nrSels <= 2){
                            selType = 'market-sel-type-2';
                        } else {
                            selType = 'market-sel-type-n';
                        }
                        var marketTypeInfo = marketTypeItem;
                        if (marketTypeInfo.selection_type == '3way'){
                            selType = 'market-sel-type-3way';
                        }
                        if (marketTypeInfo.market_code == 'goalscorer'){
                            selType = selType + ' match-market-wide-outcome';
                        }
                        var handicapSpecial = false;
                        if ((nrSels == 2 || marketTypeInfo.selection_type == '3way' || marketTypeInfo.selection_type == '2way') && Util.isNumeric(market.special) && market.name.toLowerCase().indexOf('handicap') >= 0 && (marketTypeInfo.selection_type == '3way' || marketTypeInfo.selection_type == '2way' || (selections[0].outcome == '1' && selections[1].outcome == '2'))){
                            handicapSpecial = true;
                        }
                        html.push('<div class="match-market r', (count % 2), ' match-markets-' + (i < 20 ? 'high' : 'low'), ' ', selType, '"><div class="market-name">');
                        html.push(Util.t(market.name));
                        if ((market.special + '').length){
                            html.push('&nbsp;', market.special);
                        }
                        html.push('&nbsp;<span class="min-comb">', market.mincomb, '+</span>');
                        html.push('</div>');
                        selections.sort(function(a, b){
                            var aOrder = 0, bOrder = 0;
                            if (marketTypeInfo.selections && marketTypeInfo.selections[a.outcome] && marketTypeInfo.selections[a.outcome].outcome_order){
                                aOrder = +marketTypeInfo.selections[a.outcome].outcome_order;
                            }
                            if (marketTypeInfo.selections && marketTypeInfo.selections[b.outcome] && marketTypeInfo.selections[b.outcome].outcome_order){
                                bOrder = +marketTypeInfo.selections[b.outcome].outcome_order;
                            }
                            return aOrder - bOrder;
                        });
                        Util.foreach(selections, function(selection, i){
                            var selButton = '';
                            var outcomeLabel = selection.label && selection.label.length < selection.outcome.length ? selection.label : selection.outcome;
                            if (false && (marketTypeInfo.selection_type == '3way' || marketTypeInfo.selection_type == '2way')){
                                if (outcomeLabel == '1'){
                                    outcomeLabel = match.competitors[0];
                                    selButton = ' selection-button-1';
                                } else if (outcomeLabel == '2'){
                                    outcomeLabel = match.competitors[1];
                                    selButton = ' selection-button-2';
                                } else {
                                    selButton = ' selection-button-X';
                                }
                            }
                            var marketSpecial = market.special;
                            if (handicapSpecial){
                                var msNum = selection.outcome == '2' ? 0 - (+market.special) : market.special;
                                marketSpecial = '(' + (msNum < 0 ? msNum : '+' + msNum) + ')';
                            }
                            getSelection(html, match, market.type, selection.outcome, market.special, outcomeLabel, !handicapSpecial, marketSpecial);
                            var breakSels = false;
                            var nSel = i + 1;
                            if (marketTypeInfo.market_code == 'goalscorer'){
                                breakSels = true;
                            } else if (nrSels > 5){
                                if (nSel && nSel % 3 == 0){
                                    breakSels = true;
                                }
                            }
                            if (breakSels){
                                html.push('<div class="newline"></div>');
                            }
                        });
                        count += 1;
                        html.push('</div>');
                    }
                }
                html.push('</div></div>');
            });
        },

        getSingleMatchMarkets = function(html, match){
            var market, special, marketInfo, selections, specials,
                nrSpecials, nrMarkets, singleSpecial,
                marketList, nrSelections;
            var sport = match.tournament.category.sport;
            var i = 0, j = 0, marketTypeList = [];
            var matchMarkets = false, betType;
            if (matchSelectedMarkets[match.id] && Util.countProperties(matchSelectedMarkets[match.id])){
                matchMarkets = matchSelectedMarkets[match.id];
            }
            Util.foreach(match.marketTypes, function(special, marketTypeId){
                var marketTypeInfo = ZAPNET.BetDB.marketTypesById[sport.id] && ZAPNET.BetDB.marketTypesById[sport.id][marketTypeId] ? ZAPNET.BetDB.marketTypesById[sport.id][marketTypeId] : false;
                if (marketTypeInfo){
                    if (!matchMarkets || matchMarkets[marketTypeInfo.market_type]){
                        marketTypeList.push(marketTypeInfo);
                    }
                }
            });
            marketTypeList.sort(function(a, b){
                if (a.market_order != b.market_order){
                    return a.market_order - b.market_order;
                }
                return a.market_type - b.market_type;
            });
            for(i = 0; i < marketTypeList.length; i += 1){
                marketInfo = marketTypeList[i];
                if (!match.marketTypes[marketInfo.market_type]){
                    continue;
                }
                nrSpecials = false;
                singleSpecial = false;
                nrMarkets = Util.countProperties(match.marketTypes[marketInfo.market_type]);
                if (!nrMarkets){
                    continue;
                }
                if (marketInfo.nr_specials){
                    if (marketInfo.nr_specials > 1){
                        nrSpecials = marketInfo.nr_specials;
                    } else if (marketInfo.nr_specials == 1){
                        nrSpecials = 1;
                    }
                } else if (+marketInfo.has_special || +marketInfo.has_var_special || nrMarkets > 1){
                    nrSpecials = nrMarkets;
                }
                if (marketInfo.specials){
                    specials = marketInfo.specials.split(',');
                } else if (nrSpecials){
                    specials = getTopMarkets(match.marketTypes[marketInfo.market_type], nrSpecials);
                } else {
                    for(special in match.marketTypes[marketInfo.market_type]){
                        if (match.marketTypes[marketInfo.market_type].hasOwnProperty(special)){
                            specials = [special];
                            break;
                        }
                    }
                }
                if (!specials || specials.length <= 0){
                    continue;
                }
                nrSelections = Util.countProperties(marketInfo.selections);
                marketList = [];
                if (nrSelections > 2 && specials.length > 1){
                    Util.foreach(specials, function(special){
                        marketList.push([special]);
                    });
                } else {
                    marketList.push(specials);
                }
                var marketTypeHtml = [];
                for(j = 0; j < marketList.length; j += 1){
                    specials = marketList[j];
                    specials.sort(function(a,b){
                        return a < b ? -1 : 1;
                    });
                    Util.foreach(specials, function(special){
                        if (!match.marketTypes[marketInfo.market_type] || !match.marketTypes[marketInfo.market_type][special]){
                            return;
                        }
                        market = match.marketTypes[marketInfo.market_type][special].market;
                        if (market.status != "open"){
                            return;
                        }
                        selections = ZAPNET.BetDB.getMarketSelections(market.id);
                        var selectionsAvailable = false, selIndex, selection;
                        for (selIndex in selections){
                            if (selections.hasOwnProperty(selIndex)){
                                selection = selections[selIndex];
                                if (selection.odds >= 1){
                                    selectionsAvailable = true;
                                }
                            }
                        }
                        if (!selectionsAvailable){
                            return;
                        }
                        var nrSels = selections.length;
                        var selType;
                        if (nrSels <= 2){
                            selType = 'market-sel-type-2';
                        } else {
                            selType = 'market-sel-type-n';
                        }
                        var marketTypeInfo = ZAPNET.BetDB.marketTypes[market.typeid] ? ZAPNET.BetDB.marketTypes[market.typeid] : false;
                        if (marketTypeInfo.selection_type == '3way'){
                            selType = 'market-sel-type-3way';
                        }
                        var handicapSpecial = false;
                        if ((nrSels == 2 || marketTypeInfo.selection_type == '3way' || marketTypeInfo.selection_type == '2way') && Util.isNumeric(market.special) && market.name.toLowerCase().indexOf('handicap') >= 0 && (marketTypeInfo.selection_type == '3way' || marketTypeInfo.selection_type == '2way' || (selections[0].outcome == '1' && selections[1].outcome == '2'))){
                            handicapSpecial = true;
                        }
                        marketTypeHtml.push('<div class="match-market ', selType, '">');
                        Util.foreach(selections, function(selection){
                            var selButton = '';
                            var outcomeLabel = selection.label && selection.label.length < selection.outcome.length ? selection.label : selection.outcome;
                            if (false && (marketTypeInfo.selection_type == '3way' || marketTypeInfo.selection_type == '2way')){
                                if (outcomeLabel == '1'){
                                    outcomeLabel = match.competitors[0];
                                    selButton = ' selection-button-1';
                                } else if (outcomeLabel == '2'){
                                    outcomeLabel = match.competitors[1];
                                    selButton = ' selection-button-2';
                                } else {
                                    selButton = ' selection-button-X';
                                }
                            }
                            var marketSpecial = special;
                            if (handicapSpecial){
                                var msNum = selection.outcome == '2' ? 0 - (+special) : special;
                                marketSpecial = '(' + (msNum < 0 ? msNum : '+' + msNum) + ')';
                            }
                            getSelection(marketTypeHtml, match, marketInfo.market_type, selection.outcome, special, outcomeLabel, !handicapSpecial && selButton, marketSpecial);
                        });
                        marketTypeHtml.push('</div>');
                    });
                }
                if (marketTypeHtml.length){
                    html.push('<div class="match-market"><div class="market-name">');
                    html.push(Util.t(marketInfo.market_name));
                    if (specials.length == 1 && (specials[0] +'').length > 0){
                        html.push('&nbsp;', specials[0]);
                    }
                    html.push('</div>');
                    html.push(marketTypeHtml.join(''));
                    html.push('</div>');
                }

/*
                Util.foreach(marketList, function(marketSpecials){
                    html.push('<div class="match-market-header ui-header ui-bar-a" data-role="header" data-theme="a"><h1 class="ui-title">', marketInfo.market_name);
                    if (marketSpecials.length === 1 && marketSpecials[0]){
                        html.push('&nbsp;', marketSpecials[0]);
                    }
                    var showSpecial = marketSpecials.length > 1;
                    html.push('</h1></div>');
                    var extraClass = false;
                    if (marketInfo.market_code == 'goalscorer') {
                        extraClass = ' market-sels-1';
                    } else if (nrSelections == 3 && !showSpecial) {
                        extraClass = ' market-sels-3';
                    } else if (nrSelections == 2 && showSpecial){
                        extraClass = ' market-sels-2-special'
                    }
                    html.push('<div class="match-row match-market-odds', extraClass ? ' ' + extraClass : '', '">');
                    var hasSpecialRender = ZAPNET.SportsCouponManager.hasSpecialMarketRender(marketInfo.market_type);
                    var selBlocks = [];
                    Util.foreach(marketSpecials, function(special){
                        market = match.marketTypes[marketInfo.market_type];
                        if (!market[special]){
                            return;
                        }
                        selections = ZAPNET.BetDB.getMarketSelections(market[special].market.id);
                        if (!hasSpecialRender && nrSelections ==  2 && showSpecial){
                            html.push('<div class="match-market-special">', special, '</div>');
                        }
                        Util.foreach(selections, function(selection){
                            var oddsStr = ZAPNET.SportsCouponManager.getMobileSelection(market, selection.outcome, special);
                            if (hasSpecialRender){
                                selBlocks[selection.outcome] = oddsStr;
                            } else {
                                html.push(oddsStr);
                            }
                        });
                    });
                    if (hasSpecialRender){
                        html.push(ZAPNET.SportsCouponManager.specialMarketRender(marketInfo.market_type, selBlocks));
                    }
                    html.push('</div>');
                });
*/
            }
        },

        showSingleMatchTimeline = function(html, match){
            var comps = match.name.split(' v ');
            var homeTeam = comps[0];
            var awayTeam = comps[1];
            var homeCode = homeTeam.substring(0, 3).toUpperCase();
            var awayCode = awayTeam.substring(0, 3).toUpperCase();
            html.push('<div class="match-name-info">');
            html.push('<div class="league-header">', Util.t(match.tournament.category.sport.name), ' / ', Util.t(match.tournament.category.name), ' / ', match.tournament.name, '</div>');
            html.push('<div class="home-team"><div class="flag"></div><div class="name">', Util.t(homeTeam), '</div></div>');
            html.push('<div class="away-team"><div class="flag"></div><div class="name">', Util.t(awayTeam), '</div></div>');
            html.push('<div class="period">', match.status == "live" ? match.lstatus : $P.date('d/m/Y', match.ts), '</div>');
            html.push('<div class="score">', match.status == "live" ? match.score : $P.date('H:i', match.ts), '</div>');
            if (match.live){
                html.push('<div class="matchtime">', match.lmtime, '</div>');
            }
            html.push('</div>');
            html.push('<div class="timeline">');
            html.push('<div class="timeline-home"><div class="team-color"></div><div class="team-code">', homeCode, '</div></div>');
            html.push('<div class="timeline-away"><div class="team-color"></div><div class="team-code">', awayCode, '</div></div>');
            html.push('<div class="timeline-sections">');
            var minutes = 90;
            var parts = minutes / 15;
            var i;
            var width = Math.floor(100/(parts + 1));
            for(i = 0; i < parts ; i += 1){
                html.push('<div class="section');
                if (i == 0){
                    html.push(' first-section');
                }
                html.push('" style="width: ', width, '%; left: ', (i + 0.5)*width, '%">', i*15, '</div>');
                if (i + 1 == parts){
                    html.push('<div class="section last-section" style="width: ', width, '%; left: ', (i + 1.5)*width, '%">', minutes, '</div>');
                }
            }
            html.push('</div></div>');
        },

        showSingleMatchLiveTracker = function(html, match){
            var comps = match.name.split(' v ');
            var homeTeam = comps[0];
            var awayTeam = comps[1];
            var homeCode = homeTeam.substring(0, 3).toUpperCase();
            var awayCode = awayTeam.substring(0, 3).toUpperCase();

            html.push('<div class="tracker-pitch"></div>');
            html.push('<div class="match-statistics"><div class="header">');
            html.push('<div class="home-team">', homeCode, '</div>');
            html.push('<div class="away-team">', awayCode, '</div>');
            html.push('</div>');
            var items = [
                {label: 'Goals', homeStat: 1, awayStat: 2},
                {label: 'Corners', homeStat: 4, awayStat: 1},
                {label: 'Fouls', homeStat: 6, awayStat: 3},
                {label: 'Offsides', homeStat: 2, awayStat: 3},
                {label: 'Shots Target', homeStat: 3, awayStat: 5},
                {label: 'Shots Wide', homeStat: 5, awayStat: 7}
            ];
            Util.foreach(items, function(item){
                var total = item.awayStat + item.homeStat;
                var homeFill = total == 0 ? 0 : item.homeStat * 100 / total;
                var awayFill = total == 0 ? 0 : item.awayStat * 100 / total;
                html.push('<div class="line">');
                html.push('<div class="home-stat"><div class="fill" style="width: ', homeFill,'%"></div><div class="stat-label">', item.homeStat, '</div></div>');
                html.push('<div class="label">', item.label,'</div>');
                html.push('<div class="away-stat"><div class="fill" style="width: ', awayFill,'%"></div><div class="stat-label">', item.awayStat, '</div></div>');
                html.push('</div>');
            });
            html.push('</div>');

            html.push('<div class="tracker-options">');
            html.push('<div class="tracker-option tracker-match-info"><span class="icon"></span>&nbsp;Match Info</div>');
            html.push('<div class="tracker-option tracker-match-tactical"><span class="icon"></span>&nbsp;Tactical</div>');
            html.push('<div class="tracker-option tracker-match-statistics"><span class="icon"></span>&nbsp;Statistics</div>');
            html.push('<div class="tracker-option tracker-match-live"><span class="icon"></span>&nbsp;Live Tracker</div>');
            html.push('<div class="tracker-option tracker-match-sound sound-on">On</div>');
            html.push('</div>');
        },

        setLiveMatchInfo = function(match){

        },

        setLiveMatchPanelInfo = function(matchId){
            var match = ZAPNET.BetDB.matches[matchId];
            if (match.status !== 'live'){
                return;
            }
            var liveInfoTable = $('div.match-content div[mid="' + matchId + '"].match div.live-info-table', null, true);
            if (!liveInfoTable){
                return;
            }
            var score = match.score.split(':');
            $('div.lmtime', liveInfoTable, true).innerHTML = match.lmtime;
            $('div.home-corner', liveInfoTable, true).innerHTML = match.corners['home'];
            $('div.home-yellow', liveInfoTable, true).innerHTML = match.cards['home'].yellow;
            $('div.home-red', liveInfoTable, true).innerHTML = +match.cards['home'].yellowred + +match.cards['home'].red;
            $('div.home-goal', liveInfoTable, true).innerHTML = score[0];
            $('div.away-corner', liveInfoTable, true).innerHTML = match.corners['away'];
            $('div.away-yellow', liveInfoTable, true).innerHTML = match.cards['away'].yellow;
            $('div.away-red', liveInfoTable, true).innerHTML = +match.cards['away'].yellowred + +match.cards['away'].red;
            $('div.away-goal', liveInfoTable, true).innerHTML = score[1];
        },

        renderLiveMatch = function(html, match, marketGroup){
            var nrSels = 0, m, msels;
            var nrMarkets = 0;
            for(m in match.markets){
                if (match.markets.hasOwnProperty(m)){
                    msels = Util.countProperties(match.markets[m].selections);
                    nrSels += msels ? msels : 0;
                    nrMarkets += 1;
                }
            }
            var matchDay = $P.date('Y-m-d', match.ts);
            html.push('<div class="match', match.live ? (match.livebet == 'started' ? ' betstart' : ' betstop') : '', '" mid="', match.id, '">');
            html.push('<div class="match-status ');
            if (match.status == "live"){
                html.push('live');
            } else if (match.willgolive){
                html.push('will-go-live');
            }
            html.push('">');
            var rh = match.cards ? +match.cards['home'].red + +match.cards['home'].yellowred : 0;
            var ra = match.cards ? +match.cards['away'].red + +match.cards['away'].yellowred : 0;
            if (match.status == "live"){
                html.push('<div class="day">', match.lmtime, '</div>');
                html.push('<div class="score">');
                if (+rh){
                    html.push('<span class="red-cards">', rh, '</span>&nbsp;&nbsp;');
                }
                html.push(match.score);
                if (+ra){
                    html.push('&nbsp;&nbsp;<span class="red-cards">', ra, '</span>');
                }
                html.push('</div>');
            } else if (match.willgolive){
                html.push('<div class="day">', matchDay == $P.date('Y-m-d') ? 'Today' : $P.date('l', match.ts), '</div>');
                html.push('<div class="text">Live</div>');
                html.push('<div class="text">', $P.date('H:i', match.ts), '</div>');
            } else {
                html.push('<div class="day">', matchDay == $P.date('Y-m-d') ? 'Today' : $P.date('l', match.ts), '</div>');
                html.push('<div class="time">', $P.date('H:i', match.ts), '</div>');
            }
            html.push('</div>');
            html.push('<div class="match-bets">');
            html.push('<div class="match-markets">');
            html.push('<div class="match-main-markets', (match.status !== "live" ? ' match-main-markets-' + marketGroup.markets.length : ''), '">');
            var count = 0;
            Util.foreach(marketGroup.markets.slice(0, 2), function(market, mi){
                var marketId = getMatchMarket(match, market.market, market.special);
                var special = market.special;
                if (special == 'v'){
                    if (match.marketTypes[market.market]){
                        special = getTopMarket(match.marketTypes[market.market], 1);
                    } else {
                        special = '';
                    }
                }
                var marketTypeInfo = ZAPNET.BetDB.marketTypesById[match.tournament.category.sport.id] && ZAPNET.BetDB.marketTypesById[match.tournament.category.sport.id][market.market] ? ZAPNET.BetDB.marketTypesById[match.tournament.category.sport.id][market.market] : false;
                html.push('<div class="match-market match-market-', market.market, ' match-market-i-', mi, '" mid="', marketId ,'">');
                if (count){
                    html.push('<div class="match-info">', Util.t(marketTypeInfo.market_name), ' ', special, '</div>');
                } else {
                    html.push('<div class="match-info"><span class="match-code">', match.code, '</span>&nbsp;', Util.t(match.tournament.category.name), ' / ', match.tournament.name, '</div>');
                }
                Util.foreach(market.outcomes, function(outcome){
                    var outcomeName = outcome;
                    if (!count && marketTypeInfo && marketTypeInfo.selection_type == '3way'){
                        if (outcome == '1'){
                            outcomeName = match.competitors[0];
                        } else if (outcome == '2'){
                            outcomeName = match.competitors[1];
                        }
                    }
                    getSelection(html, match, market.market, outcome, special, outcomeName, true);
                });
                html.push('</div>');
                count += 1;
            });
            html.push('</div>');
            html.push('<div class="match-other-markets">');
            html.push('</div>');
            html.push('</div>');
            html.push('</div>');
            html.push('<div class="more-markets">');
            html.push('<div class="nr-markets">+', nrMarkets, '</div>');
            html.push('<div class="openclose"></div>');
            html.push('</div>');
            html.push('</div>');
        },

        loadMatch = function(matchId, callback){
            YAHOO.util.Connect.asyncRequest('GET', '/sports/matches?m=' + matchId, {
                success: function(o){
                    var data = eval('(' + o.responseText + ')');
                    if (data){
                        ZAPNET.BetDB.addMatches(data);
                        callback();
                    }
                },
                failure: function(){
                },
                cache: false,
                timeout: 40000
            });
        },

        showMatch = function(matchId){
            Dom.removeClass(document.body, 'welcome-page');
            Dom.removeClass('page', 'welcome-page');
            var liveMatch = $('div.match-content', null, true);
            if (liveMatch){
                showLoading(liveMatch);
            }
            var callback = {
                success: function(){
                    if (!ZAPNET.BetDB.matches[matchId]){
                        ZAPNET.Website.sportsReload();
                        Util.showErrorMessage(Util.t('Match not found'), 'Error');
                        return;
                    }
                    var match = ZAPNET.BetDB.matches[matchId];
                    if (match.status == "live"){
                        ZAPNET.Website.show('live');
                        showLiveSingleMatch(matchId);
                    } else {
                        ZAPNET.Website.show('sports');
                        showSingleMatch(matchId);
                    }
                }
            };
            var live = true;
            if (ZAPNET.BetDB.matches[matchId]){
                var match = ZAPNET.BetDB.matches[matchId];
                if (match.status == "open"){
                    live = false;
                }
            }
            if (live){
                ZAPNET.BetDB.loadMatches(callback, matchId, 'LVM', 'mlist');
            } else {
                ZAPNET.BetDB.loadMatches(callback, matchId);
            }
        },

        showMatch2 = function(matchId, doShow){
            Dom.removeClass(document.body, 'welcome-page');
            Dom.removeClass('page', 'welcome-page');
            if (!ZAPNET.BetDB.matches[matchId]){
                return;
            }
            var match = ZAPNET.BetDB.matches[matchId];
            if (match.status == "live"){
                if (doShow){
                    showLiveSingleMatch(matchId);
                } else {
                    ZAPNET.Website.setLiveProduct();
                    nextLiveMatchId = matchId;
                }
            } else {
                ZAPNET.Website.setSportsProduct();
            }
            if (!doShow){
                var liveMatch = $('div.match-content', null, true);
                showLoading(liveMatch);
                if (false){
                    var callback = {
                        success: function(o){
                            var data = eval('(' + o.responseText + ')');
                            if (data){
                                ZAPNET.BetDB.addMatches(data);
                                showMatch(matchId, true);
                            }
                        },
                        failure: function(){
                        },
                        cache: false,
                        timeout: 40000
                    };
                    YAHOO.util.Connect.asyncRequest('GET', '/sports/matches?m=' + matchId, callback);
                } else {
                    var callback = {
                        success: function(){
                            showMatch(matchId, true);
                        }
                    };
                    ZAPNET.BetDB.loadMatches(callback, matchId, 'LVM', 'mlist');
                }
                return;
            }
            if (match.status != "live"){
                showSingleMatch(matchId);
            }
        },

        showVirtualMatch = function(matchId){
            var vMatch = $('div.virtual-games div.virtual-selected-event', null, true);
            showLoading(vMatch);
            var callback = {
                success: function(o){
                    var data = eval('(' + o.responseText + ')');
                    if (data){
                        ZAPNET.BetDB.addMatches(data);
                        var html = [];
                        var match = ZAPNET.BetDB.matches[matchId];
                        renderVirtualEvent(html, match);
                        vMatch.innerHTML = html.join('');
                    }
                },
                failure: function(){
                },
                cache: false,
                timeout: 40000
            };
            YAHOO.util.Connect.asyncRequest('GET', '/sports/matches?m=' + matchId, callback);
        },

        showVirtualRace = function(raceId){
            var vRace = $('div.virtual-games div.virtual-selected-event', null, true);
            showLoading(vRace);
            var callback = {
                success: function(o){
                    var data = eval('(' + o.responseText + ')');
                    if (data){
                        ZAPNET.BetDB.addMatches(data);
                        var html = [];
                        var match = ZAPNET.BetDB.outrightsById[raceId];
                        renderVirtualRace(html, match);
                        vRace.innerHTML = html.join('');
                    }
                },
                failure: function(){
                },
                cache: false,
                timeout: 40000
            };
            YAHOO.util.Connect.asyncRequest('GET', '/sports/races?r=' + raceId, callback);
        },

        showSingleMatch = function(matchId){
            selectedLiveView == 'singlematch';
            ZAPNET.Website.setSportsView();
            var match = ZAPNET.BetDB.matches[matchId];
            var html = [];
            html.push('<div class="match-page-top">');
            html.push('<span class="match-page-back-button">', Util.t('Back'), '</span>');
            html.push('&nbsp;&nbsp;&nbsp;<a href="#" class="sport-link" sid="', match.tournament.category.sport.id, '">', Util.t(match.tournament.category.sport.name), '</a>');
            html.push('&nbsp;::&nbsp;<a href="#" class="category-link" cid="', match.tournament.category.id, '">', Util.t(match.tournament.category.name), '</a>');
            html.push('&nbsp;::&nbsp;<a href="#" class="tournament-link" tid="', match.tournament.id, '">', Util.t(match.tournament.name), '</a>');
            html.push('</div>');
            html.push('<div class="match-content match-page-sport-', match.tournament.category.sport.code, '"><div class="match-section"><div class="match', match.live ? (match.livebet == 'started' ? ' betstart' : ' betstop') : '', ' single-match ', match.tournament.category.sport.code, '-single-match" mid="', matchId, '"><div class="match-bets">');
            var comps = match.name.split(' v ');
            var home = comps[0];
            var away = comps[1];
            html.push('<div class="match-schedule-header">', Util.t(match.tournament.category.sport.name), ' / ', Util.t(match.tournament.category.name), ' / ', Util.t(match.tournament.name), '<div class="match-statistics-link"></div></div>');
            html.push('<div class="live-match-panel">');
            html.push('<div class="live-info-table">');
            html.push('<div class="info-top"><div class="match-code">', match.code, '</div><div class="lmtime">', $P.date('H:i m/d', match.ts), '</div><div class="corner"></div><div class="yellow"></div><div class="red"></div><div class="goal"></div></div>');
            html.push('<div class="info-home"><div class="team">', Util.t(home), '</div><div class="home-corner"></div><div class="home-yellow"></div><div class="home-red"></div><div class="home-goal"></div></div>');
            html.push('<div class="info-away"><div class="team">', Util.t(away), '</div><div class="away-corner"></div><div class="away-yellow"></div><div class="away-red"></div><div class="away-goal"></div></div>');
            html.push('</div></div>');
            html.push('<div class="match-markets">');
            if (match.pl){
                html.push('<div class="match-notice">');
                html.push(Util.t('Match Length') + ': ' + (match.pl * 2) + ' ' + Util.t('mins.'));
                html.push('</div>');
            }
            if (window.ZAPNET_COMPANYNAME == 'SpartaBet'){
                getSingleMatchMarkets(html, match);
            } else {
                getMatchMarkets(html, matchId, true, 20);
            }
            html.push('</div></div></div></div></div>');
            element.innerHTML = html.join('');
            setLiveMatchPanelInfo(matchId);
            scrollToTop();
            if (window.ZAPNET_COMPANYNAME == 'SpartaBet'){
                var matchMarketsEl = $('.match-content .match .match-markets', null, true);
                if (matchMarketsEl){
                    Dom.setStyle(matchMarketsEl, 'display', 'none');
                    var windowHeight = Dom.getRegion(Dom.get('ft')).top;
                    Dom.setStyle(matchMarketsEl, 'height', 'auto');
                    Dom.setStyle(matchMarketsEl, 'display', 'block');
                    var matchMarketsRegion = Dom.getRegion(matchMarketsEl);
                    var matchMarketsTop = matchMarketsRegion.top;
                    var matchMarketsHeight = matchMarketsRegion.height;
                    if (windowHeight - matchMarketsTop > 200 && matchMarketsTop + matchMarketsHeight > windowHeight){
                        var scrollHeight = windowHeight - matchMarketsTop;
                        Dom.setStyle(matchMarketsEl, 'height', scrollHeight + 'px');
                        Dom.setStyle(matchMarketsEl, 'overflow-y', 'scroll');
                    }
                }
            }
        },

        showLiveSingleMatch = function(matchId, noScrollToTop){
            selectedLiveView == 'singlematch';
            ZAPNET.Website.setLiveView();
            if ((ZAPNET_ONLINE_CONSTANTS.LIVE_MATCHPAGE == 'matchpage' || Dom.hasClass(document.body, 'skin-ubet')) && !$('#bd > .content .match-list', null, true)){
                singleMatchView = true;
                nextLiveMatchId = matchId;
                view = 'live';
                render();
                setTimeout(postRenderLive, 0);
            }
            var match = ZAPNET.BetDB.matches[matchId];
            var html = [];
            html.push('<div class="match-section"><div class="match', match.live ? (match.livebet == 'started' ? ' betstart' : ' betstop') : '', ' single-match" mid="', matchId, '">');
            var matchListEl = $('#bd .content div.match-list', null, true);
            if (matchListEl){
                Dom.removeClass($('.selected', matchListEl), 'selected');
                Dom.addClass($('div[mid="' + matchId + '"].match', matchListEl, true), 'selected');
            }
            var own = false;
            if (own){
                html.push('<div class="match-header">');

                html.push('<div class="single-match-timeline">');
                showSingleMatchTimeline(html, match);
                html.push('</div>');

                html.push('<div class="single-match-livetracker">');
                showSingleMatchLiveTracker(html, match);
                html.push('</div>');

                html.push('</div>');
            } else {
                if (window.ZAPNET_NO_LIVE_TRACKER){
                    var comps = match.name.split(' v ');
                    var home = comps[0];
                    var away = comps[1];
                    html.push('<div class="live-match-panel">');
                    html.push('<div class="live-info-table">');
                    html.push('<div class="info-top"><div class="match-code">', match.code, '</div><div class="lmtime">', $P.date('H:i m/d', match.ts), '</div><div class="corner"></div><div class="yellow"></div><div class="red"></div><div class="goal"></div></div>');
                    html.push('<div class="info-home"><div class="team">', Util.t(home), '</div><div class="home-corner"></div><div class="home-yellow"></div><div class="home-red"></div><div class="home-goal"></div></div>');
                    html.push('<div class="info-away"><div class="team">', Util.t(away), '</div><div class="away-corner"></div><div class="away-yellow"></div><div class="away-red"></div><div class="away-goal"></div></div>');
                    html.push('</div></div>');
                } else if (window.ZAPNET_COMPANYNAME == 'mCHEZA'){
                    html.push('<div class="srl-lmts"></div>');
                    YAHOO.util.Connect.asyncRequest('GET', '/statistics/mid?id=' + match.id, {
                        success: function(o){
                            var data = eval('(' + o.responseText + ')');
                            if (data && data.id){
                                if (currentLtms){
                                    SRLive.removeWidget(currentLtms);
                                }
                                currentLtms = SRLive.addWidget('widgets.lmts', {
                                    container: '.srl-lmts',
                                    matchId: data.id,
                                    //showTitle: <true|false>,
                                    //showScoreboard: <true|false>,
                                    //showGoalscorers: <true|false>,
                                    //showMomentum: <true|false>,//old momentum look
                                    //showMomentum2: true,//new momentum look
                                    //momentum2_type: undefined, //<'line'|'bar'>
                                    //momentum2_showArea: undefined, //<true|false>,
                                    //showPitch: <true|false>,
                                    //showSidebar: <true|false>,
                                    //showHeatmap: <true|false>,
                                    //showLineups: <true|false>,//beside this parameter we need to enable this component on our side as well
                                    //collapse_enabled: <true|false>,
                                    //collapse_startCollapsed: <true|false>,
                                    //sidebarLayout: <'dynamic'|'bottom'>,
                                    //pitchCrowd: <true|false>
                                });
                            }
                        }
                    });
                } else if (ZAPNET_ONLINE_CONSTANTS.LIVETRACKER_POSITION && ZAPNET_ONLINE_CONSTANTS.LIVETRACKER_POSITION == 'right'){
                    var height = Util.inArray(match.tournament.category.sport.code, ['soccer', 'tennis']) ? '160' : '100';
                    html.push('<div class="match-live-stats-header">', Util.t(match.tournament.category.sport.name), ' :: ');
                    html.push(Util.t(match.tournament.category.name), ' :: ', Util.t(match.tournament.name), '</div>');
                    html.push('<div style="height: ' + height + 'px; background-color: #000;">');
                    html.push('<iframe class="livestats" scrolling="no" frameborder="0" src="/bc/livestats?id=' + match.id + '"></iframe>');
                    html.push('</div>');
                } else {
                    html.push('<div style="height: 360px; background-color: #000;">');
                    html.push('<iframe class="livetracker" scrolling="no" frameborder="0" src="/statistics/livetracker?id=' + match.id + '"></iframe>');
                    html.push('</div>');
                }
            }
            lastLiveMatchId = match.id;
            if (match.pl){
                html.push('<div class="match-notice">');
                html.push(Util.t('Match Length') + ': ' + (match.pl * 2) + ' ' + Util.t('mins.'));
                html.push('</div>');
            }

            html.push('<div class="match-bets">');
            html.push('<div class="match-market-menu">');
            getMatchMarketMenu(html, match);
            html.push('</div>');

            html.push('<div class="match-markets">');
            getSingleMatchMarkets(html, match);
            html.push('</div>');
            html.push('</div>');

            html.push('</div>');
            html.push('</div>');
            var matchContentEl = $('div.match-content', null, true);
            if (matchContentEl){
                matchContentEl.innerHTML = html.join('');
            } else {
                console.log('No match content el ', matchId);
                singleMatchView = true;
                nextLiveMatchId = matchId;
                view = 'live';
                render();
                setTimeout(postRenderLive, 0);
                return;
            }
            setLiveMatchInfo(match);
            if (ZAPNET_ONLINE_CONSTANTS.LIVETRACKER_POSITION && ZAPNET_ONLINE_CONSTANTS.LIVETRACKER_POSITION == 'right'){
                var trackerEl = $('#nav-right .livetracker-container', null, true);
                if (!trackerEl){
                    trackerEl = Util.div('livetracker-container');
                    var navRight = Dom.get('nav-right');
                    var rightTopEl = $('.page-block-right-top', navRight, true);
                    if (rightTopEl){
                        navRight.insertBefore(trackerEl, rightTopEl);
                    }
                }
                trackerEl.innerHTML = '<div style="height: 100%; width: 100%; background-color: #000;"><iframe class="livetracker" scrolling="no" frameborder="0" src="/statistics/livetracker?id=' + match.id + '"></iframe></div>';
            }

            Dom.removeClass(document.body, 'live-coupon-view');

            if (ZAPNET_ONLINE_CONSTANTS.LIVE_BETTING_ODDSCONTENT_SCROLL){
                var matchMarketsEl = $('.match-content .match .match-markets', null, true);
                if (matchMarketsEl){
                    var windowHeight = Dom.getViewportHeight();
                    var matchMarketsRegion = Dom.getRegion(matchMarketsEl);
                    var matchMarketsTop = matchMarketsRegion.top;
                    var matchMarketsHeight = matchMarketsRegion.height;
                    if (windowHeight - matchMarketsTop > 200 && matchMarketsTop + matchMarketsHeight > windowHeight){
                        var scrollHeight = windowHeight - matchMarketsTop;
                        Dom.setStyle(matchMarketsEl, 'height', scrollHeight + 'px');
                        Dom.setStyle(matchMarketsEl, 'overflow-y', 'scroll');
                    }
                }
            }

            if (!noScrollToTop){
                scrollToTop();
            }
        },

        showLiveSingleMatchMarkets = function(matchId){
            var match = ZAPNET.BetDB.matches[matchId];
            var html = [];
            getSingleMatchMarkets(html, match);
            var matchMarketEl = $('div.match-content div.single-match div.match-bets div.match-markets', null, true);
            if (matchMarketEl){
                matchMarketEl.innerHTML = html.join('');
            }
        },

        getHighlightMenuHtml = function(selected){
            var html = [];
            html.push('<div class="highlights-menu">');
            if (!selected){
                html.push('<div class="menu-item menu-item-selected">Coming Up</div>');
            }
            html.push('<div class="menu-item highlights-next-3h', selected == 'highlights-next-3h' ? ' menu-item-selected' : '', '">Next 3 Hours</div>');
            html.push('<div class="menu-item highlights-today', selected == 'highlights-today' ? ' menu-item-selected' : '', '">Today</div>');
            html.push('<div class="menu-item highlights-tomorrow', selected == 'highlights-tomorrow' ? ' menu-item-selected' : '', '">Tomorrow</div>');
            html.push('<div class="menu-item highlights-next-3d', selected == 'highlights-next-3d' ? ' menu-item-selected' : '', '">Next 3 Days</div>');
            html.push('</div>');

            return html.join('');
        },

        renderMatch = function(html, match, extraClasses){
            html.push('<a href="#" class="match-list-item');
            if (extraClasses){
                Util.foreach(extraClasses, function(ec){
                    html.push(' ', ec);
                });
            }
            html.push('"><div class="match', match.live ? (match.livebet == 'started' ? ' betstart' : ' betstop') : '', '', match.status == 'live' ? ' match-live' : '', (lastLiveMatchId == match.id ? ' selected' : ''), '" mid="', match.id, '">');
            html.push('<div class="match-body">');
            html.push('<div class="match-favorite', favoriteLive[match.id] ? ' fav-on' :'', '"></div>');
            var teams = match.name.split(' v ');
            if (teams.length == 2){
                html.push('<div class="match-name"><div class="home">', Util.t(teams[0]), '</div><div class="away">', Util.t(teams[1]), '</div></div>');
            }
            if (match.status == 'live'){
                html.push('<div class="betstatus"></div>');
                html.push('<div class="match-timeinfo">', match.lmtime, '</div>');
                if (match.score){
                    var score = match.score.replace('-', ':').split(':');
                    if (score.length == 2){
                        html.push('<div class="match-score"><div class="home-score">', score[0], '</div><div class="away-score">', score[1], '</div></div>');
                    }
                }
            } else {
                html.push('<div class="match-timeinfo">', $P.date('d/m', match.ts), '<br/>', $P.date('H:i', match.ts), '</div>');
            }
            var resultMarket = getDefaultMatchMarket(match, 'result', [10,20,810,820,381,382,1976,2002,1037,1010,1102]);
            if (resultMarket && resultMarket.selections){
                var n = Util.countProperties(resultMarket.selections);
                if (n > 1){
                    var selectionList = [];
                    Util.foreach(resultMarket.selections, function(selection){
                        selectionList.push(selection);
                    });
                    selectionList.sort(function(a, b){
                        return +a.order - +b.order;
                    });
                    html.push('<div class="match-bets"><div class="match-markets"><div class="match-market market-sel-type-' + n + 'way">');
                    Util.foreach(selectionList, function(selection){
                        getSelection(html, match, resultMarket.type, selection.outcome, '', selection.outcome, true, '');
                    });
                    html.push('</div></div></div>');
                }
            }
            html.push('</div></div></a>');
        },

        getLiveMatchesInfo = function(sports, upcomingSports){
            var firstMatch = false;
            var firstNonEndedMatch = false;
            var favorites = [];
            var comingupList = [];
            var matchesIn = {};
            var sportMatchesList = [];
            Util.foreach(sports, function(sport){
                if (!LIVE_SPORT_MARKETS[sport.sport.code]){
                    // return;
                }
                var sportMatches = [];
                Util.foreach(sport.matches, function(match){
                    if (match.status === "live"){
                        if (firstMatch === false){
                            firstMatch = match;
                        }
                        if (firstNonEndedMatch === false && match.lstatus !== 'ended'){
                            firstNonEndedMatch = match;
                        }
                        if (favoriteLive[match.id]){
                            favorites.push(match);
                        }
                        sportMatches.push(match);
                    } else {
                        comingupList.push(match);
                    }
                    matchesIn[match.id] = match.id;
                });
                if (sport.sport.code == 'soccer'){
                    sportMatches.sort(LIVE_MATCH_SORT_FN);
                }
                if (sportMatches.length){
                    sportMatchesList.push({
                        sport: sport.sport,
                        matches: sportMatches
                    });
                }
            });
            Util.foreach(upcomingSports, function(sport){
                if (!LIVE_SPORT_MARKETS[sport.sport.code]){
                    return;
                }
                var sportMatches = [];
                Util.foreach(sport.matches, function(match){
                    if (!matchesIn[match.id] && match.status !== 'live'){
                        sportMatches.push(match);
                    }
                });
                if (sportMatches.length){
                    comingupList.push({
                        sport: sport.sport,
                        matches: sportMatches
                    });
                }
            });

            return {
                sportList: sportMatchesList,
                favorites: favorites,
                comingupList: comingupList,
                matchesIn: matchesIn,
                firstMatch: firstNonEndedMatch ? firstNonEndedMatch : firstMatch
            };
        },

        renderLiveMatchList = function(html, sports, upcomingSports){
                /*
                html.push('<div class="match-time">', match.lmtime, '</div>');
                var comps = match.name.split(' v ');
                var home = comps[0];
                var away = comps && comps[1] ? comps[1] : '-';
                html.push('<div class="match-name"><div class="home">', home, '</div><div class="away">', away , '</div></div>');
                var rh = match.cards ? +match.cards['home'].red + +match.cards['home'].yellowred : 0;
                var ra = match.cards ? +match.cards['away'].red + +match.cards['away'].yellowred : 0;
                html.push('<div class="match-cards">');
                html.push('<div class="home-cards">', +rh ? '<span class="red-cards">' + rh + '</span>' : '&nbsp;', '</div>');
                html.push('<div class="away-cards">', +ra ? '<span class="red-cards">' + rh + '</span>' : '&nbsp;', '</div>');
                html.push('</div>');
                var goals = match.score ? match.score.split(':') : [0,0];
                html.push('<div class="match-score">');
                html.push('<div class="home-score">', goals[0], '</div>');
                html.push('<div class="away-score">', goals[1], '</div>');
                html.push('</div>');
                html.push('<div class="match-bets"><div class="match-markets"><div class="match-market">');
                getSelection(html, match, 2002, '1');
                getSelection(html, match, 2002, 'X');
                getSelection(html, match, 2002, '2');
                html.push('</div></div></div>');
                html.push('<div class="moremarkets">+50</div>');
                html.push('</div>');
                 */

            var firstMatch = null;
            var live = getLiveMatchesInfo(sports, upcomingSports);
            html.push('<div class="match-section openclose-section" style="border: 0">');
            html.push('<div class="live-match-section-header"><span class="openclose"></span>' + Util.t('Favorites') + '</div>');
            html.push('<div id="live-match-section-favorites" class="match-section-content openclose-content">');
            Util.foreach(live.favorites, function(match){
                renderMatch(html, match);
            });
            html.push('</div>');
            html.push('<div class="live-match-favorite-search"><input type="text" id="live-match-search" placeholder="Find your game"/></div>');
            html.push('</div>');

            html.push('<div class="match-section openclose-section" style="border: 0">');
            html.push('<div class="live-match-section-header opencloseitem"><span class="openclose"></span>' + Util.t('Live Right Now') + '</div>');
            html.push('<div class="openclose-content">');
            Util.foreach(live.sportList, function(sport, i){
                var sportMatches = sport.matches.slice(0);
                var byLeague = Util.inArray(window.ZAPNET_COMPANYNAME, ['Bets52', 'SpartaBet']);
                if (byLeague){
                    var featuredLeagues = ZAPNET.BetDB.getFeaturedLeagues(sport.sport.id);
                    var featuredTourIds = {};
                    Util.foreach(featuredLeagues, function(league){
                        Util.foreach(league.tournaments, function(tId){
                            featuredTourIds[tId] = tId;
                        });
                    });
                    sportMatches.sort(function(a, b){
                        if (a.tournament.id == b.tournament.id){
                            return LIVE_MATCH_SORT_FN(a, b);
                        }
                        var aFeatured = featuredTourIds[a.tournament.id] ? -1 : 1;
                        var bFeatured = featuredTourIds[b.tournament.id] ? -1 : 1;
                        if (aFeatured != bFeatured){
                            return aFeatured - bFeatured;
                        }
                        if (a.tournament.category.id == b.tournament.category.id){
                            if (a.tournament.order == b.tournament.order){
                                return a.tournament.name < b.tournament.name ? -1 : 1;
                            } else {
                                return a.tournament.order - b.tournament.order;
                            }
                        }
                        if (a.tournament.category.order == b.tournament.category.order){
                            return a.tournament.category.name < b.tournament.category.name ? -1 : 1;
                        } else {
                            return a.tournament.category.order - b.tournament.category.order;
                        }
                    });
                }
                var curTourId = 0;
                var curCatId = 0;
                html.push('<div id="live-match-sport-', sport.sport.id, '" class="live-match-sport openclose-section', i ? ' openclose-closed' : '', '">');
                html.push('<div class="live-match-sport-header opencloseitem"><span class="openclose"></span>', Util.t(sport.sport.name), ' (<span class="live-section-nr-matches" id="nr-live-sport-', sport.sport.id, '">', sport.matches.length, '</span>)</div>');
                html.push('<div class="openclose-content">');
                html.push('<div class="live-match-sport-content">');
                Util.foreach(sportMatches, function(match){
                    var catId = match.tournament.category.id;
                    var tourId = match.tournament.id;
                    if (byLeague){
                        if (curCatId != catId){
                            html.push('<div class="live-match-list-category">', Util.t(match.tournament.category.name), '</div>');
                        }
                        if (curTourId != tourId){
                            html.push('<div class="live-match-list-tournament">', Util.t(match.tournament.name), '</div>');
                        }
                    }
                    renderMatch(html, match);
                    if (!firstMatch){
                        firstMatch = match;
                    }
                    curTourId = tourId;
                    curCatId = catId;
                });
                html.push('</div>');
                html.push('</div>');
                html.push('</div>');
            });
            html.push('</div>');
            html.push('</div>');

            html.push('<div class="match-section openclose-section" style="border: 0">');
            html.push('<div class="live-match-section-header opencloseitem"><span class="openclose"></span>' + Util.t('Starting Soon') + '</div>');
            html.push('<div class="openclose-content">');
            Util.foreach(live.comingupList, function(sport, i){
                html.push('<div id="live-soon-match-sport-', sport.sport.id, '" class="live-soon-match-sport live-match-sport openclose-section', i ? ' openclose-closed' : '' , '">');
                html.push('<div class="live-match-sport-header opencloseitem"><span class="openclose"></span>', Util.t(sport.sport.name), '</div>');
                html.push('<div class="openclose-content">');
                html.push('<div class="live-match-sport-content show-only-more">');
                var count = 0;
                Util.foreach(sport.matches, function(match){
                    renderMatch(html, match, count >= 10 ? ['hidden'] : false);
                    count++;
                });
                html.push('<a class="live-match-list-show-more" href="#">', Util.t('Show more'), '</a>');
                html.push('<a class="live-match-list-show-less" href="#">', Util.t('Show less'), '</a>');
                html.push('</div>');
                html.push('</div>');
                html.push('</div>');
            });
            html.push('</div>');
            html.push('</div>');

            /*
            html.push('<div class="match-section" style="border: 0">');
            html.push('<div class="live-match-section-header"><span class="calendar"></span>Calendar</div>');
            html.push('<div class="match-section-content">');
            html.push('</div>');
            html.push('</div>');
            */

            return firstMatch;
        },

        showSideMatchTracker = function(matchId){
            var iframeEl = $('#nav-right .livetracker-container iframe.livetracker', null, true);
            if (iframeEl){
                iframeEl.src = '/statistics/livetracker?id=' + matchId;
            }
        },

        renderLiveOverview = function(html, sports, upcomingSports){
            var matches = ZAPNET.BetDB.getMatchesByTime(false, false, 'all');
            var liveMatches = [], upcomingMatches = [], i, match;
            var liveSportMap = {};
            var liveSportList = [];
            for(i = 0; i < matches.length; i += 1){
                match = ZAPNET.BetDB.matches[matches[i]];
                if (match.status == "live"){
                    liveMatches.push(match);
                    liveSportMap[match.tournament.category.sport.id] = match.tournament.category.sport.id;
                } else if (+match.willgolive){
                    upcomingMatches.push(match);
                }
            }
            Util.foreach(liveSportMap, function(sportId){
                liveSportList.push(ZAPNET.BetDB.sports[sportId]);
            });
            liveSportList.sort(function(a,b){
                if (a.order == b.order){
                    return a.name < b.name ? -1 : 1;
                }
                return a.order - b.order;
            });
            Dom.addClass(document.body, 'live-coupon-view');
            var matchSettings = false;
            if (ZAPNET.MATCH_VIEW_RENDER_FN){
                matchSettings = {};
                matchSettings.matchRenderFn = ZAPNET.MATCH_VIEW_RENDER_FN;
            }
            var liveView;
            if (window.ZAPNET_COMPANYNAME == 'SpartaBet') {
                ZAPNET.Website.setLiveView();
                var matchOddsView = {
                    rows: 1,
                    header: 'Match Odds',
                    outcomeHeaders: ['1', 'X', '2'],
                    outcomes: ['1', 'X', '2'],
                    size: 3,
                    rows: [{
                        markets: [{
                            type: 2002
                        }, {
                            type: 1010
                        }, {
                            type: 1102
                        }, {
                            type: 1037
                        }, {
                            type: 1106
                        }]
                    }]
                };
                var underOverView = {
                    rows: 1,
                    header: 'Under Over',
                    outcomeHeaders: ['-', '+'],
                    outcomes: ['Under', 'Over'],
                    specialAlign: 'left',
                    varSpecial: true,
                    size: 3,
                    rows: [{
                        markets: [{
                            type: 2005
                        },  {
                            type: 1083
                        }, {
                            type: 1039
                        }]
                    }]
                };
                var nextGoalView = {
                    rows: 1,
                    header: 'Next Goal',
                    outcomeHeaders: ['1', 'X', '2'],
                    outcomes: ['1', 'X', '2'],
                    size: 3,
                    rows: [{
                        markets: [{
                            type: 1013
                        }]
                    }]
                };
                var view = {
                    rows: 1,
                    cols: [matchOddsView, underOverView, nextGoalView]
                };
                var viewTennis = {
                    rows: 1,
                    cols: [
                        {
                            header: 'Match Odds',
                            outcomeHeaders: ['1', 'X', '2'],
                            outcomes: ['1', 'X', '2'],
                            size: 3,
                            rows: [{
                                markets: [{
                                    type: 2002
                                }, {
                                    type: 1010
                                }, {
                                    type: 1102
                                }, {
                                    type: 1037
                                }, {
                                    type: 1106
                                }]
                            }]
                        },
                        {
                            header: 'Set',
                            outcomeHeaders: ['1', '2'],
                            outcomes: ['1', '2'],
                            specialAlign: 'center',
                            varSpecial: true,
                            size: 3,
                            rows: [{
                                markets: [{
                                    type: 1922,
                                    specialFn: function(match){
                                        if (match.status == '1set'){
                                            return 1;
                                        } else if (match.status == '2set'){
                                            return 2;
                                        } else if (match.status == '3set'){
                                            return 3;
                                        } else if (match.status == '4set'){
                                            return 4;
                                        } else if (match.status == '5set'){
                                            return 5;
                                        }
                                        return false;
                                    }
                                }]
                            }]
                        },
                        {
                            header: 'Under Over',
                            outcomeHeaders: ['-', '+'],
                            outcomes: ['Under', 'Over'],
                            specialAlign: 'left',
                            varSpecial: true,
                            size: 3,
                            rows: [{
                                markets: [{
                                    type: 2005
                                },  {
                                    type: 1083
                                }, {
                                    type: 1039
                                }]
                            }]
                        }
                    ]
                };

                var viewBasketball = {
                    rows: 1,
                    cols: [
                        {
                            header: 'Match Odds',
                            outcomeHeaders: ['1', '2'],
                            outcomes: ['1', '2'],
                            size: 2,
                            rows: [{
                                markets: [{
                                    type: 1976
                                }]
                            }]
                        },{
                            header: 'Handicap',
                            outcomeHeaders: ['1', '2'],
                            outcomes: ['1', '2'],
                            specialAlign: 'left',
                            varSpecial: true,
                            size: 3,
                            rows: [{
                                markets: [{
                                    type: 1034
                                }]
                            }]
                        },{
                            header: 'Points Overall',
                            outcomeHeaders: ['-', '+'],
                            outcomes: ['Under', 'Over'],
                            specialAlign: 'left',
                            varSpecial: true,
                            size: 3,
                            rows: [{
                                markets: [{
                                    type: 1033
                                },  {
                                    type: 2005
                                }]
                            }]
                        }
                    ]
                };

                var viewHandball = {
                    rows: 1,
                    cols: [
                        {
                            header: 'Match Odds',
                            outcomeHeaders: ['1', 'X', '2'],
                            outcomes: ['1', 'X', '2'],
                            size: 3,
                            rows: [{
                                markets: [{
                                    type: 2002
                                }, {
                                    type: 1010
                                }, {
                                    type: 1102
                                }, {
                                    type: 1037
                                }, {
                                    type: 1106
                                }]
                            }]
                        },{
                            header: 'Handicap',
                            outcomeHeaders: ['1', '2'],
                            outcomes: ['1', '2'],
                            specialAlign: 'left',
                            varSpecial: true,
                            size: 3,
                            rows: [{
                                markets: [{
                                    type: 20005492
                                }]
                            }]
                        },{
                            header: 'Goals Overall',
                            outcomeHeaders: ['-', '+'],
                            outcomes: ['Under', 'Over'],
                            specialAlign: 'left',
                            varSpecial: true,
                            size: 3,
                            rows: [{
                                markets: [{
                                    type: 2005
                                },  {
                                    type: 1083
                                }, {
                                    type: 1039
                                }]
                            }]
                        }
                    ]
                };

                var viewBadminton= {
                    rows: 1,
                    cols: [
                        {
                            header: 'Match Odds',
                            outcomeHeaders: ['1', 'X', '2'],
                            outcomes: ['1', 'X', '2'],
                            size: 3,
                            rows: [{
                                markets: [{
                                    type: 20006559
                                }]
                            }]
                        }
                    ]
                };

                var viewBaseball = {
                    rows: 1,
                    cols: [
                        {
                            header: 'Match Odds',
                            outcomeHeaders: ['1', '2'],
                            outcomes: ['1', '2'],
                            size: 2,
                            rows: [{
                                markets: [{
                                    type: 2002
                                }, {
                                    type: 1010
                                }, {
                                    type: 1102
                                }, {
                                    type: 1037
                                }, {
                                    type: 1106
                                }]
                            }]
                        },{
                            header: 'Run Line',
                            outcomeHeaders: ['1', '2'],
                            outcomes: ['1', '1'],
                            size: 3,
                            rows: [{
                                markets: [{
                                    type: 20000378
                                }]
                            }]
                        },{
                            header: 'Under/Over',
                            outcomeHeaders: ['Under', 'Over'],
                            outcomes: ['Under', 'Over'],
                            specialAlign: 'left',
                            varSpecial: true,
                            size: 3,
                            rows: [{
                                markets: [{
                                    type: 20000378
                                }]
                            }]
                        }
                    ]
                };

                var viewIcehockey = {
                    rows: 1,
                    cols: [
                        {
                            header: 'Match Odds',
                            outcomeHeaders: ['1', 'X', '2'],
                            outcomes: ['1', 'X', '2'],
                            size: 3,
                            rows: [{
                                markets: [{
                                    type: 2002
                                }, {
                                    type: 20006558
                                }]
                            }]
                        },{
                            header: 'Handicap',
                            outcomeHeaders: ['1', '2'],
                            outcomes: ['1', '1'],
                            size: 3,
                            rows: [{
                                markets: [{
                                    type: 20010173
                                }]
                            }]
                        },{
                            header: 'Under/Over',
                            outcomeHeaders: ['Under', 'Over'],
                            outcomes: ['Under', 'Over'],
                            specialAlign: 'left',
                            varSpecial: true,
                            size: 3,
                            rows: [{
                                markets: [{
                                    type: 2005
                                }]
                            }]
                        }
                    ]
                };

                var viewSnooker = {
                    rows: 1,
                    cols: [
                        {
                            header: 'Match Odds',
                            outcomeHeaders: ['1', '2'],
                            outcomes: ['1', '2'],
                            size: 2,
                            rows: [{
                                markets: [{
                                    type: 1102
                                }]
                            }]
                        },{
                            header: 'Handicap',
                            outcomeHeaders: ['1', '2'],
                            outcomes: ['1', '1'],
                            size: 3,
                            rows: [{
                                markets: [{
                                    type: 1034
                                }]
                            }]
                        },{
                            header: 'Under/Over',
                            outcomeHeaders: ['Under', 'Over'],
                            outcomes: ['Under', 'Over'],
                            specialAlign: 'left',
                            varSpecial: true,
                            size: 3,
                            rows: [{
                                markets: [{
                                    type: 2005
                                }]
                            }]
                        }
                    ]
                };

                var viewTableTennis = {
                    rows: 1,
                    cols: [
                        {
                            header: 'Match Odds',
                            outcomeHeaders: ['1', '2'],
                            outcomes: ['1', '2'],
                            size: 2,
                            rows: [{
                                markets: [{
                                    type: 1102
                                }]
                            }]
                        },{
                            header: 'Handicap',
                            outcomeHeaders: ['1', '2'],
                            outcomes: ['1', '1'],
                            size: 3,
                            rows: [{
                                markets: [{
                                    type: 20009119
                                }]
                            }]
                        },{
                            header: 'Total Points',
                            outcomeHeaders: ['Under', 'Over'],
                            outcomes: ['Under', 'Over'],
                            specialAlign: 'left',
                            varSpecial: true,
                            size: 3,
                            rows: [{
                                markets: [{
                                    type: 20009120
                                }]
                            }]
                        }
                    ]
                };

                var viewVolleyball = {
                    rows: 1,
                    cols: [
                        {
                            header: 'Match Odds',
                            outcomeHeaders: ['1', '2'],
                            outcomes: ['1', '2'],
                            size: 2,
                            rows: [{
                                markets: [{
                                    type: 1102
                                }]
                            }]
                        },{
                            header: 'Handicap',
                            outcomeHeaders: ['1', '2'],
                            outcomes: ['1', '1'],
                            size: 3,
                            rows: [{
                                markets: [{
                                    type: 20008692
                                }]
                            }]
                        },{
                            header: 'Total Points',
                            outcomeHeaders: ['Under', 'Over'],
                            outcomes: ['Under', 'Over'],
                            specialAlign: 'left',
                            varSpecial: true,
                            size: 3,
                            rows: [{
                                markets: [{
                                    type: 20008694
                                }]
                            }]
                        }
                    ]
                };

                var viewCricket = {
                    rows: 1,
                    cols: [
                        {
                            header: 'Match Odds',
                            outcomeHeaders: ['1', 'X', '2'],
                            outcomes: ['1', 'X', '2'],
                            size: 3,
                            rows: [{
                                markets: [{
                                    type: 20009342
                                }]
                            }]
                        }
                    ]
                };


                var sportViews = {"soccer":{"rows":1,"cols":[{"header":"Match Odds","outcomeHeaders":["1","X","2"],"outcomes":["1","X","2"],"size":3,"rows":[{"markets":[{"type":"2002"}]}]},{"header":"Next Goal","outcomeHeaders":["1","X","2"],"outcomes":["1","X","2"],"size":3,"rows":[{"markets":[{"type":"1013"},{"type":"20105506"},{"type":"20205506"},{"type":"20305506"},{"type":"20405506"},{"type":"20505506"},{"type":"20605506"}]}]},{"header":"Total Goals","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"2005"}]}],"specialAlign":"left","varSpecial":true}]},"basketball":{"rows":1,"cols":[{"header":"Match Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"1976"}]}]},{"header":"Handicap","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":3,"rows":[{"markets":[{"type":"1034"}]}],"specialAlign":"left","varSpecial":true},{"header":"Total Points","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"2005"}]}],"specialAlign":"left","varSpecial":true}]},"tennis":{"rows":1,"cols":[{"header":"Match Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"1010"}]}]},{"header":"Current Set Handicap","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":3,"rows":[{"markets":[{"type":"21002449"},{"type":"22002449"},{"type":"23002449"},{"type":"24002449"},{"type":"25002449"}]}],"specialAlign":"left","varSpecial":true},{"header":"Current Set Games","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"21002448"},{"type":"22002448"},{"type":"23002448"},{"type":"24002448"},{"type":"25002448"}]}],"specialAlign":"left","varSpecial":true}]},"volleyball":{"rows":1,"cols":[{"header":"Match Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"1102"}]}]},{"header":"Current Set Handicap","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":3,"rows":[{"markets":[{"type":"21005486"},{"type":"22005486"},{"type":"23005486"},{"type":"24005486"},{"type":"25005486"}]}],"specialAlign":"left","varSpecial":true},{"header":"Current Set Points","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"21005485"},{"type":"22005485"},{"type":"23005485"},{"type":"24005485"},{"type":"25005485"}]}],"specialAlign":"left","varSpecial":true}]},"beach-volley":{"rows":1,"cols":[{"header":"Match Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"1102"}]}]},{"header":"Current Set Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"21008665"},{"type":"22008665"},{"type":"23008665"}]}]},{"header":"Current Set Points","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"21008667"},{"type":"22008667"},{"type":"23008667"}]}],"specialAlign":"left","varSpecial":true}]},"baseball":{"rows":1,"cols":[{"header":"Match Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"2002"}]}]},{"header":"Handicap","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":3,"rows":[{"markets":[{"type":"20000378"}]}],"specialAlign":"left","varSpecial":true},{"header":"Total Runs","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"2005"}]}],"specialAlign":"left","varSpecial":true}]},"ice-hockey":{"rows":1,"cols":[{"header":"Match Odds","outcomeHeaders":["1","X","2"],"outcomes":["1","X","2"],"size":3,"rows":[{"markets":[{"type":"2002"}]}]},{"header":"Handicap","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":3,"rows":[{"markets":[{"type":"20010173"}]}],"specialAlign":"left","varSpecial":true},{"header":"Total Goals","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"2005"}]}],"specialAlign":"left","varSpecial":true}]},"handball":{"rows":1,"cols":[{"header":"Match Odds","outcomeHeaders":["1","X","2"],"outcomes":["1","X","2"],"size":3,"rows":[{"markets":[{"type":"2002"}]}]},{"header":"Handicap","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":3,"rows":[{"markets":[{"type":"20005492"}]}],"specialAlign":"left","varSpecial":true},{"header":"Total Goals","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"2005"}]}],"specialAlign":"left","varSpecial":true}]},"snooker":{"rows":1,"cols":[{"header":"Match Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"1102"}]}]},{"header":"Handicap","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":3,"rows":[{"markets":[{"type":"1034"}]}],"specialAlign":"left","varSpecial":true},{"header":"Total Frames","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"2005"}]}],"specialAlign":"left","varSpecial":true}]},"field-hockey":{"rows":1,"cols":[{"header":"Match Odds","outcomeHeaders":["1","X","2"],"outcomes":["1","X","2"],"size":3,"rows":[{"markets":[{"type":"2002"}]}]},{"header":"Next Goal","outcomeHeaders":["1","X","2"],"outcomes":["1","X","2"],"size":3,"rows":[{"markets":[{"type":"20111510"},{"type":"20211510"},{"type":"20311510"},{"type":"20411510"},{"type":"20511510"},{"type":"20611510"},{"type":"20711510"},{"type":"20811510"},{"type":"20911510"},{"type":"21011510"},{"type":"21111510"}]}]},{"header":"Total Goals","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"20008952"}]}],"specialAlign":"left","varSpecial":true}]},"cricket":{"rows":1,"cols":[{"header":"Match Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"1986"}]}]},{"header":"Total Runs","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"20012011"}]}],"specialAlign":"left","varSpecial":true}]},"american-football":{"rows":1,"cols":[{"header":"Match Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"20006564"}]}]},{"header":"Handicap","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":3,"rows":[{"markets":[{"type":"20006565"}]}],"specialAlign":"left","varSpecial":true},{"header":"Total Goals","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"20006575"}]}],"specialAlign":"left","varSpecial":true}]},"waterpolo":{"rows":1,"cols":[{"header":"Match Odds","outcomeHeaders":["1","X","2"],"outcomes":["1","X","2"],"size":3,"rows":[{"markets":[{"type":"20008765"}]}]},{"header":"Handicap","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":3,"rows":[{"markets":[{"type":"20008770"}]}],"specialAlign":"left","varSpecial":true},{"header":"Total Goals","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"20008771"}]}],"specialAlign":"left","varSpecial":true}]},"beach-soccer":{"rows":1,"cols":[{"header":"Match Odds","outcomeHeaders":["1","X","2"],"outcomes":["1","X","2"],"size":3,"rows":[{"markets":[{"type":"20008947"}]}]},{"header":"Next Goal","outcomeHeaders":["1","X","2"],"outcomes":["1","X","2"],"size":3,"rows":[{"markets":[{"type":"20110500"},{"type":"20210500"},{"type":"20310500"},{"type":"20410500"},{"type":"20510500"},{"type":"20610500"},{"type":"20710500"},{"type":"20810500"},{"type":"20910500"},{"type":"21010500"},{"type":"21110500"},{"type":"21210500"},{"type":"21310500"},{"type":"21410500"},{"type":"21510500"},{"type":"21610500"},{"type":"21710500"},{"type":"21810500"}]}]},{"header":"Total Goals","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"20008949"}]}],"specialAlign":"left","varSpecial":true}]},"futsal":{"rows":1,"cols":[{"header":"Match Odds","outcomeHeaders":["1","X","2"],"outcomes":["1","X","2"],"size":3,"rows":[{"markets":[{"type":"2002"}]}]},{"header":"Handicap","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":3,"rows":[{"markets":[{"type":"1034"}]}],"specialAlign":"left","varSpecial":true},{"header":"Total Goals","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"2005"},{"type":"1033"}]}],"specialAlign":"left","varSpecial":true}]},"table-tennis":{"rows":1,"cols":[{"header":"Match Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"1102"}]}]},{"header":"Current Set winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"21006590"},{"type":"22006590"},{"type":"23006590"},{"type":"24006590"},{"type":"25006590"},{"type":"26006590"},{"type":"27006590"}]}]},{"header":"Current Set Points","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"21006592"},{"type":"22006592"},{"type":"23006592"},{"type":"24006592"},{"type":"25006592"},{"type":"26006592"},{"type":"27006592"}]}],"specialAlign":"left","varSpecial":true}]},"badminton":{"rows":1,"cols":[{"header":"Match Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"20006559"}]}]},{"header":"Current Game winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"21006560"},{"type":"22006560"},{"type":"23006560"}]}]},{"header":"Current Set Points","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"21006561"},{"type":"22006561"},{"type":"23006561"}]}],"specialAlign":"left","varSpecial":true}]},"rugby-league":{"rows":1,"cols":[{"header":"Match Odds","outcomeHeaders":["1","X","2"],"outcomes":["1","X","2"],"size":3,"rows":[{"markets":[{"type":"20008747"}]}]},{"header":"Handicap","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":3,"rows":[{"markets":[{"type":"20008744"}]}],"specialAlign":"left","varSpecial":true},{"header":"Total Points","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"20008749"}]}],"specialAlign":"left","varSpecial":true}]},"rugby-union":{"rows":1,"cols":[{"header":"Match Odds","outcomeHeaders":["1","X","2"],"outcomes":["1","X","2"],"size":3,"rows":[{"markets":[{"type":"20008737"}]}]},{"header":"Handicap","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":3,"rows":[{"markets":[{"type":"20008734"}]}],"specialAlign":"left","varSpecial":true},{"header":"Total Points","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"20008739"}]}],"specialAlign":"left","varSpecial":true}]},"rugby-sevens":{"rows":1,"cols":[{"header":"Match Odds","outcomeHeaders":["1","X","2"],"outcomes":["1","X","2"],"size":3,"rows":[{"markets":[{"type":"20009491"}]}]},{"header":"Handicap","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":3,"rows":[{"markets":[{"type":"20009492"}]}],"specialAlign":"left","varSpecial":true},{"header":"Total Points","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"20009494"}]}],"specialAlign":"left","varSpecial":true}]},"aussie-rules":{"rows":1,"cols":[{"header":"Match Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"20008802"}]}]},{"header":"Handicap","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":3,"rows":[{"markets":[{"type":"20008801"}]}],"specialAlign":"left","varSpecial":true},{"header":"Total Goals","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"20008804"}]}],"specialAlign":"left","varSpecial":true}]},"boxing":{"rows":1,"cols":[{"header":"Money Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"20008752"}]}]},{"header":"Total Rounds","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"20008753"},{"type":"21008753"}]}],"specialAlign":"left","varSpecial":true}]},"mma":{"rows":1,"cols":[{"header":"Money Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"20008774"}]}]},{"header":"Total Rounds","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"20008775"}]}],"specialAlign":"left","varSpecial":true}]},"bowls":{"rows":1,"cols":[{"header":"Match Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"1102"}]}]},{"header":"Set Handicap","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":3,"rows":[{"markets":[{"type":"1482"}]}],"specialAlign":"left","varSpecial":true},{"header":"Total Sets","outcomeHeaders":["Under\/Over"],"outcomes":["Under\/Over"],"size":2,"rows":[{"markets":[{"type":"1480"}]}],"specialAlign":"left","varSpecial":true}]},"floorball":{"rows":1,"cols":[{"header":"Match Odds","outcomeHeaders":["1","X","2"],"outcomes":["1","X","2"],"size":3,"rows":[{"markets":[{"type":"20008790"}]}]},{"header":"Handicap","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":3,"rows":[{"markets":[{"type":"20008789"}]}],"specialAlign":"left","varSpecial":true},{"header":"Total","outcomeHeaders":["Under\/Over"],"outcomes":["Under\/Over"],"size":2,"rows":[{"markets":[{"type":"20008791"}]}],"specialAlign":"left","varSpecial":true}]},"darts":{"rows":1,"cols":[{"header":"Match Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"20008810"}]}]},{"header":"Current Set Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"21011256"},{"type":"22011256"},{"type":"23011256"},{"type":"24011256"},{"type":"25011256"},{"type":"26011256"},{"type":"27011256"}]}]},{"header":"Total Sets","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"1480"}]}],"specialAlign":"left","varSpecial":true}]},"squash":{"rows":1,"cols":[{"header":"Match Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"20009483"}]}]},{"header":"Current Set Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"21012000"},{"type":"22012000"},{"type":"23012000"},{"type":"24012000"},{"type":"25012000"}]}]},{"header":"Current Set Points","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"21012002"},{"type":"22012002"},{"type":"23012002"},{"type":"24012002"}]}],"specialAlign":"left","varSpecial":true}]},"bandy":{"rows":1,"cols":[{"header":"Match Odds","outcomeHeaders":["1","X","2"],"outcomes":["1","X","2"],"size":3,"rows":[{"markets":[{"type":"20000382"}]}]},{"header":"Handicap","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":3,"rows":[{"markets":[{"type":"20000383"}]}],"specialAlign":"left","varSpecial":true},{"header":"Total","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"20000386"}]}],"specialAlign":"left","varSpecial":true}]},"e-basketball":{"rows":1,"cols":[{"header":"Match Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"20009144"}]}]},{"header":"Handicap","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":3,"rows":[{"markets":[{"type":"20009145"}]}],"specialAlign":"left","varSpecial":true},{"header":"Current Quarter Total","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"21009150"},{"type":"21009150"},{"type":"21009150"},{"type":"21009150"}]}],"specialAlign":"left","varSpecial":true}]},"e-football":{"rows":1,"cols":[{"header":"Match Odds","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"20008846"}]}]},{"header":"Handicap","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":3,"rows":[{"markets":[{"type":"20008851"}]}],"specialAlign":"left","varSpecial":true},{"header":"Total Goals","outcomeHeaders":["Under\/Over"],"outcomes":["Under\/Over"],"size":2,"rows":[{"markets":[{"type":"20008858"}]}],"specialAlign":"left","varSpecial":true}]},"e-ice-hockey":{"rows":1,"cols":[{"header":"Match Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"20011489"}]}]},{"header":"Handicap","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":3,"rows":[{"markets":[{"type":"20011491"}]}],"specialAlign":"left","varSpecial":true},{"header":"Total Goals","outcomeHeaders":["Under\/Over"],"outcomes":["Under\/Over"],"size":2,"rows":[{"markets":[{"type":"20011492"}]}],"specialAlign":"left","varSpecial":true}]},"e-tennis":{"rows":1,"cols":[{"header":"Match Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"20011946"}]}]},{"header":"Current Set Handicap","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":3,"rows":[{"markets":[{"type":"21011949"},{"type":"22011949"},{"type":"23011949"},{"type":"24011949"},{"type":"25011949"}]}],"specialAlign":"left","varSpecial":true}]},"king-of-glory":{"rows":1,"cols":[{"header":"Match Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"20011072"}]}]},{"header":"Current Game Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":3,"rows":[{"markets":[{"type":"21011190"},{"type":"22011190"},{"type":"23011190"},{"type":"24011190"},{"type":"25011190"}]}],"specialAlign":"left","varSpecial":true}]},"counter-strike-go":{"rows":1,"cols":[{"header":"Match Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"20009241"}]}]},{"header":"Current Map Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"20009251"},{"type":"20009257"},{"type":"20009263"},{"type":"20009269"},{"type":"20009275"}]}]},{"header":"Total Maps","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"20009245"}]}],"specialAlign":"left","varSpecial":true}]},"dota-2":{"rows":1,"cols":[{"header":"Match Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"20009180"}]}]},{"header":"Current Game","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"20009190"},{"type":"20009196"},{"type":"20009202"},{"type":"20009208"},{"type":"20009214"}]}]},{"header":"Games Total","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"20009184"}]}],"specialAlign":"left","varSpecial":true}]},"league-of-legends":{"rows":1,"cols":[{"header":"Match Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"20009321"}]}]},{"header":"Current Game Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"20009323"},{"type":"20009324"},{"type":"20009325"},{"type":"20009326"},{"type":"20009327"}]}]},{"header":"Total Games","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"20009783"}]}],"specialAlign":"left","varSpecial":true}]},"hearthstone":{"rows":1,"cols":[{"header":"Match Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"20009298"}]}]},{"header":"Current Game Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"21009299"},{"type":"22009299"},{"type":"23009299"},{"type":"24009299"},{"type":"25009299"}]}]},{"header":"Games Handicap","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":3,"rows":[{"markets":[{"type":"20009330"}]}],"specialAlign":"left","varSpecial":true}]},"heroes-of-the-storm":{"rows":1,"cols":[{"header":"Match Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"20009303"}]}]},{"header":"Current Game Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"21009304"},{"type":"22009304"},{"type":"23009304"},{"type":"24009304"},{"type":"25009304"}]}]},{"header":"Games Handicap","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":3,"rows":[{"markets":[{"type":"20009311"}]}],"specialAlign":"left","varSpecial":true}]},"overwatch":{"rows":1,"cols":[{"header":"Match Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"20009914"}]}]},{"header":"Current Game","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"20009930"},{"type":"20009931"},{"type":"20010337"},{"type":"20010338"},{"type":"20010339"},{"type":"20010352"},{"type":"20010353"}]}]}]},"starcraft-2":{"rows":1,"cols":[{"header":"Match Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"20009313"}]}]},{"header":"Current Game Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"21009315"},{"type":"22009315"},{"type":"23009315"},{"type":"24009315"},{"type":"25009315"},{"type":"26009315"},{"type":"27009315"}]}]},{"header":"Total Games","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"20009781"}]}],"specialAlign":"left","varSpecial":true}]},"mortal-kombat-xl":{"rows":1,"cols":[{"header":"Match Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"20011037"}]}]},{"header":"Current Game Winner","outcomeHeaders":["1","2"],"outcomes":["1","2"],"size":2,"rows":[{"markets":[{"type":"21011237"},{"type":"22011237"},{"type":"23011237"},{"type":"24011237"},{"type":"25011237"}]}]},{"header":"Total Games","outcomeHeaders":["Under","Over"],"outcomes":["Under","Over"],"size":3,"rows":[{"markets":[{"type":"20011449"}]}],"specialAlign":"left","varSpecial":true}]}};
                var featuredLeagues = ZAPNET.BetDB.getFeaturedLeagues(liveOverviewSelectedSportId);
                var featuredTourIds = {};
                Util.foreach(featuredLeagues, function(league){
                    Util.foreach(league.tournaments, function(tId){
                        featuredTourIds[tId] = tId;
                    });
                });
                matchSettings = {
                    sportViews: sportViews,
                    groupBy: 'tournament',
                    extraInfoFn: function(match){
                        return '<div class="overview-match-favorite' + (favoriteLive[match.id] ? ' favorite-on' : '') + '"></div>' +
                               '<div class="overview-match-tracker-handle' + (selectedOverviewMatchId == match.id ? ' selected' : '') + '"></div>' ;
                    },
                    sortFn: function(a, b){
                        if (a.tournament.id == b.tournament.id){
                            return LIVE_MATCH_SORT_FN(a, b);
                        }
                        var aFeatured = featuredTourIds[a.tournament.id] ? -1 : 1;
                        var bFeatured = featuredTourIds[b.tournament.id] ? -1 : 1;
                        if (aFeatured != bFeatured){
                            return aFeatured - bFeatured;
                        }
                        if (a.tournament.category.id == b.tournament.category.id){
                            if (a.tournament.order == b.tournament.order){
                                return a.tournament.name < b.tournament.name ? -1 : 1;
                            } else {
                                return a.tournament.order - b.tournament.order;
                            }
                        }
                        if (a.tournament.category.order == b.tournament.category.order){
                            return a.tournament.category.name < b.tournament.category.name ? -1 : 1;
                        } else {
                            return a.tournament.category.order - b.tournament.category.order;
                        }
                    }
                };

                var filteredList = [];
                if (selectedLiveView != 'upcoming'){
                    if (selectedLiveView == 'overview' && !liveOverviewSelectedSportId && liveSportList.length){
                        liveOverviewSelectedSportId = liveSportList[0].id;
                    }
                    Util.foreach(liveMatches, function(match){
                        if (selectedLiveView == 'favorites'){
                            if (favoriteLive[match.id]){
                                filteredList.push(match);
                            }
                        } else {
                            if (match.tournament.category.sport.id == liveOverviewSelectedSportId){
                                filteredList.push(match);
                            }
                        }
                    });
                }
                filteredList.sort(matchSettings.sortFn);

                if (selectedOverviewMatchId && !ZAPNET.BetDB.matches[selectedOverviewMatchId]){
                    selectedOverviewMatchId = null;
                }
                if (!selectedOverviewMatchId && filteredList.length){
                    selectedOverviewMatchId = filteredList[0].id;
                    showSideMatchTracker(selectedOverviewMatchId);
                }

                var liveContent = [];
                if (selectedLiveView == 'overview'){
                    liveContent.push('<div class="live-overview-sport-menu">');
                    Util.foreach(liveSportList, function(sport){
                        liveContent.push('<div sport="', sport.id, '" title="', Util.t(sport.name), '" class="live-overview-sport-menu-item ', sport.id == liveOverviewSelectedSportId ? ' selected' : '', ' sport sport-', sport.code, '"><div class="image" style="background-image: url(/images/online/b3/sparta/sports/', sport.code, '.png"></div><div class="label">', Util.t(sport.name), '</div></div>');
                    });
                    liveContent.push('</div>');
                }
                if (selectedLiveView == 'upcoming'){
                    liveContent.push(ZAPNET.SportsCouponView.renderUpcoming(upcomingMatches));
                } else {
                    liveContent.push(ZAPNET.SportsCouponView.render(filteredList, view, matchSettings));
                }
                liveView = liveContent.join('');
            } else {
                liveView = ZAPNET.SportsCouponView.renderLive(liveMatches, favoriteLive, true, matchSettings);
            }
            html.push(
                '<div class="match-content live-match-content">',
                liveView,
                '<div class="coupon-separation"></div>',
                // ZAPNET.SportsCouponView.renderUpcoming(upcomingMatches),
                '</div>'
            );
            return;
        },

        renderLiveSingleView = function(html, sports, upcomingSports){
            html.push('<div class="match-list">');
            var firstMatch = renderLiveMatchList(html, sports, upcomingSports);
            html.push('</div>');

            html.push('<div class="match-content">');
            var showMatchListInContent = false;
            if (showMatchListInContent){
                Util.foreach(sports, function(sport){
                    if (!LIVE_SPORT_MARKETS[sport.sport.code]){
                        // return;
                    }
                    html.push('<div class="match-section">');
                    html.push('<div class="header sport sport-', sport.sport.code, '">', Util.t(sport.sport.name), ' LIVE</div>');
                    var marketGroups = {};
                    var nonLiveMatches = 0;
                    Util.foreach(sport.matches, function(match){
                        if (match.status !== "live" && nonLiveMatches >= 0){
                            return;
                        }
                        var sport = match.tournament.category.sport;
                        var sportId = sport.id;
                        var mStat = match.status == "live" ? 'L' : 'M';
                        var marketGroup;
                        if (marketGroups[mStat + sportId]){
                            marketGroup = marketGroups[mStat + sportId];
                        } else {
                            marketGroup = getMarketGroup(SPORT_MARKETS[sport.code][match.status == "live" ? 'live' : 'main']);
                            marketGroups[mStat + sportId] = marketGroup;
                        }
                        renderLiveMatch(html, match, marketGroup);
                    });
                    html.push('</div>');
                });
                Util.foreach(upcomingSports, function(sport){
                    if (!LIVE_SPORT_MARKETS[sport.sport.code]){
                        //return;
                    }
                    html.push('<div class="match-section">');
                    html.push('<div class="header sport sport-', sport.sport.code, '">UPCOMING ', Util.t(sport.sport.name), ' LIVE</div>');
                    var marketGroups = {};
                    var nonLiveMatches = 0;
                    Util.foreach(sport.matches, function(match){
                        if (match.status !== "open"){
                            return;
                        }
                        var sport = match.tournament.category.sport;
                        var sportId = sport.id;
                        var mStat = match.status == "live" ? 'L' : 'M';
                        var marketGroup;
                        if (marketGroups[mStat + sportId]){
                            marketGroup = marketGroups[mStat + sportId];
                        } else {
                            marketGroup = getMarketGroup(SPORT_MARKETS[sport.code][match.status == "live" ? 'live' : 'main']);
                            marketGroups[mStat + sportId] = marketGroup;
                        }
                        renderLiveMatch(html, match, marketGroup);
                    });
                    html.push('</div>');
                });
            } else {
                if (nextLiveMatchId){
                    showMatch(nextLiveMatchId);
                } else if (firstMatch){
                    showMatch(firstMatch.id);
                }
            }
            html.push('</div>');
        },

        renderLive = function(html, sports, upcomingSports){
            if (!selectedLiveView){
                if (ZAPNET_ONLINE_CONSTANTS.LIVE_MAINPAGE == 'coupon'){
                    selectedLiveView = 'overview';
                } else {
                    selectedLiveView = 'singlematch';
                }
            }
            renderLivePageMenu(html);
            html.push('<div class="live-page-main">');
            if (singleMatchView){
                renderLiveSingleView(html, sports, upcomingSports);
            } else {
                if (Util.inArray(selectedLiveView, ['overview', 'favorites', 'upcoming'])){
                    renderLiveOverview(html, sports, upcomingSports);
                } else {
                    renderLiveSingleView(html, sports, upcomingSports);
                }
            }
            html.push('</div>');
        },

        renderLivePageMenu = function(html){
            if (window.ZAPNET_COMPANYNAME == 'SpartaBet'){
                html.push('<div class="live-page-type-menu">');
                html.push('<div class="live-page-type-menu-item live-page-type-overview', selectedLiveView == 'overview' ? ' selected' : '', '">', Util.t('Overview'), '</div>');
                html.push('<div class="live-page-type-menu-item live-page-type-singlematch', selectedLiveView == 'singlematch' ? ' selected' : '', '">', Util.t('Match View'), '</div>');
                html.push('<div class="live-page-type-menu-item live-page-type-favorites', selectedLiveView == 'favorites' ? ' selected' : '', '">', Util.t('Favorites'), '</div>');
                //html.push('<div class="live-page-type-menu-item live-page-type-upcoming', selectedLiveView == 'upcoming' ? ' selected' : '', '">', Util.t('Upcoming Live'), '</div>');
                html.push('</div>');
            }
        },

        loadLiveOverview = function(){
            var el = element ? element : Dom.get('coupon');
            var html = [];
            renderLivePageMenu(html);
            html.push('<div class="live-page-main"></div>');
            var el = $('.live-page-main', el, true);
            showLoading(el);
            var callback = {
                success: function(){
                    showLive();
                }
            };
            ZAPNET.BetDB.load(callback, {
                g: 'LVM',
                r: [1004, 1010, 1011, 1013, 1020, 1021, 1022, 1030, 1033, 1034, 1037, 1039, 1083, 1089, 1090, 1102, 1106, 1107, 1480, 1482, 1922, 1976, 1986, 2002, 2005, 20000374, 20000378, 20000382, 20000383, 20000386, 20005475, 20005492, 20006558, 20006559, 20006564, 20006565, 20006575, 20008692, 20008694, 20008734, 20008737, 20008739, 20008744, 20008747, 20008749, 20008752, 20008753, 20008765, 20008770, 20008771, 20008774, 20008775, 20008789, 20008790, 20008791, 20008801, 20008802, 20008804, 20008810, 20008846, 20008851, 20008858, 20008947, 20008949, 20008952, 20009119, 20009120, 20009144, 20009145, 20009180, 20009184, 20009190, 20009196, 20009202, 20009208, 20009214, 20009241, 20009245, 20009251, 20009257, 20009263, 20009269, 20009275, 20009298, 20009303, 20009311, 20009313, 20009321, 20009323, 20009324, 20009325, 20009326, 20009327, 20009330, 20009342, 20009483, 20009491, 20009492, 20009494, 20009781, 20009783, 20009914, 20009930, 20009931, 20010173, 20010337, 20010338, 20010339, 20010352, 20010353, 20011037, 20011072, 20011449, 20011489, 20011491, 20011492, 20011946, 20012011, 20105506, 20110500, 20111510, 20205506, 20210500, 20211510, 20305506, 20310500, 20311510, 20405506, 20410500, 20411510, 20505506, 20510500, 20511510, 20605506, 20610500, 20611510, 20710500, 20711510, 20810500, 20811510, 20910500, 20911510, 21002448, 21002449, 21005485, 21005486, 21006560, 21006561, 21006590, 21006592, 21008665, 21008667, 21008753, 21009150, 21009299, 21009304, 21009315, 21010500, 21011190, 21011237, 21011256, 21011510, 21011949, 21012000, 21012002, 21110500, 21111510, 21210500, 21310500, 21410500, 21510500, 21610500, 21710500, 21810500, 22002448, 22002449, 22005485, 22005486, 22006560, 22006561, 22006590, 22006592, 22008665, 22008667, 22009299, 22009304, 22009315, 22011190, 22011237, 22011256, 22011949, 22012000, 22012002, 23002448, 23002449, 23005485, 23005486, 23006560, 23006561, 23006590, 23006592, 23008665, 23008667, 23009299, 23009304, 23009315, 23011190, 23011237, 23011256, 23011949, 23012000, 23012002, 24002448, 24002449, 24005485, 24005486, 24006590, 24006592, 24009299, 24009304, 24009315, 24011190, 24011237, 24011256, 24011949, 24012000, 24012002, 25002448, 25002449, 25005485, 25005486, 25006590, 25006592, 25009299, 25009304, 25009315, 25011190, 25011237, 25011256, 25011949, 25012000, 26006590, 26006592, 26009315, 26011256, 27006590, 27006592, 27009315, 27011256]
            });
        },

        postRenderLive = function(){
            var matchList = $('div.match-list', null, true);
            var matchContent = $('div.match-content', null, true);

            Dom.setStyle(matchList, 'min-height', '0');
            Dom.setStyle(matchContent, 'min-height', '0');

            var matchListRegion = Dom.getRegion(matchList);
            var matchContentRegion = Dom.getRegion(matchContent);
            var matchListHeight = Math.max(matchListRegion.height, matchContentRegion.height);//Dom.getViewportHeight() - matchListRegion.top;
            Dom.setStyle(matchList, 'min-height', (matchListHeight - 8) + 'px');
            Dom.setStyle(matchContent, 'min-height', (matchListHeight - 8) + 'px');
        },

        postRenderVirtual = function(){
            var rightCol = $('#nav-right', null, true);
            var matchContent = $('#bd .content .virtual-selected-event', null, true);
            Dom.setStyle(rightCol, 'min-height', '0');
            Dom.setStyle(matchContent, 'min-height', '0');

            var matchListRegion = Dom.getRegion(rightCol);
            var matchContentRegion = Dom.getRegion(matchContent);
            if (matchListRegion.bottom > matchContentRegion.bottom){
                Dom.setStyle(matchContent, 'min-height', (matchContentRegion.height + (matchListRegion.bottom - matchContentRegion.bottom)) + 'px');
            }
        },

        getMatchName = function(match){
            var teams = match.name.split(' v ');
            if (teams.length != 2){
                return match.name;
            }
            var matchName = Util.t(teams[0]) + ' v ' + Util.t(teams[1]);
            if (match.pl){
                matchName = matchName + ' (' + Util.t('Match Length') + ': ' + (match.pl * 2) + ' ' + Util.t('mins.') + ')';
            }
            return matchName;
        },

        renderVirtualEvent = function(html, match){
            html.push('<div class="section-header"><div class="sport sport-soccer"></div><div class="time">', $P.date('H:i', match.ts), '</div>');
            html.push('<div class="event-name"><span class="league">', match.tournament.category.name, '</span> ', getMatchName(match), '</div></div>');
            html.push('<div class="match-section"><div class="match-bets">');
            html.push('<div class="match-markets">');
            getSingleMatchMarkets(html, match);
            html.push('</div>');
            html.push('</div></div>');
        },

        renderVirtualRace = function(html, race){
            html.push('<div class="section-header"><div class="sport sport-', race.category.sport.code.replace('virtual-', ''), '"></div><div class="time">', $P.date('H:i', race.ts), '</div>');
            html.push('<div class="event-name"><span class="league">', race.category.name, '</span> ', race.name, '</div></div>');
            html.push('<div class="match-section"><div class="match-bets">');
            html.push('<div id="racing-coupon-content">');
            html.push('</div>');
            html.push('</div></div>');

            setTimeout(function(){
                try{
                    ZAPNET.RacingManager.setBettingSlip(bettingSlip);
                    ZAPNET.RacingManager.showRace(race.id, Dom.get('racing-coupon-content'));
                } catch (e){
                }
            }, 100);
        },

        renderVirtual = function(html){
            var upcoming = virtualData && virtualData.upcoming ? virtualData.upcoming : [];
            var results = virtualData && virtualData.results ? virtualData.results : [];
            var virtualSports = {
                football: {
                    name: 'Virtual Football',
                    code: 'soccer'
                },
                horses: {
                    name: 'Virtual Horse Racing',
                    code: 'horses'
                },
                hounds: {
                    name: 'Virtual Hound Racing',
                    code: 'hounds'
                }
            };
            var selectedSport = virtualSports[selectedVirtualSport];
            var nrSports = Util.countProperties(virtualSports);
            var menuItemSize = Math.floor(10000 / nrSports) / 100;
            html.push('<div class="virtual-games">');
            html.push('<div class="virtual-sport-menu">');
            Util.foreach(virtualSports, function(sport, code){
                html.push('<div class="virtual-sport-menu-item', code == selectedVirtualSport ? ' selected' : '', '" sport="', code, '" style="width: ', menuItemSize, '%;"><div class="sport sport-', code, '"></div>', sport.name, '</div>');
            });
            html.push('</div>');
            html.push('<div class="virtual-display-board">');
            html.push('<div class="upcoming-events"><div class="section-header">', Util.t('Upcoming Events'), '</div>');
            Util.foreach(upcoming, function(event){
                if (event.sportcode !== selectedSport.code){
                    return;
                }
                html.push('<div class="event virtual-event virtual-', event.type, '-event', '"');
                if (event.type == 'match'){
                    html.push(' mid="', event.id, '" ');
                } else {
                    html.push(' rid="', event.id, '" ');
                }
                html.push('><div class="sport sport-', event.sportcode, '"></div><div class="time">', $P.date('H:i', event.ts), '</div>');
                html.push('<div class="league">', event.league, '</div><div class="event-name">', event.name, '</div></div>');
            });
            html.push('</div>');
            html.push('<div class="recent-results"><div class="section-header">', Util.t('Last Results'), '</div>');
            Util.foreach(results, function(event){
                if (event.sportcode !== selectedSport.code){
                    return;
                }
                html.push('<div class="event"><div class="sport sport-', event.sportcode, '"></div><div class="time">', $P.date('H:i', event.ts), '</div>');
                html.push('<div class="league">', event.league, '</div><div class="event-name">', event.name, '</div><div class="result">', event.result, '</div></div>');
            });
            html.push('</div>');
            html.push('<div class="virtual-streaming">');
            html.push('<iframe frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="/vs1/vse_includes/', selectedVirtualSport, '.html" name="vseframePlayer" id="vseframePlayer"></iframe>');
            html.push('</div>');
            html.push('</div><!-- Board -->');
            html.push('<div class="virtual-selected-event">');
            if (virtualData){
                if (virtualData.next){
                    if (virtualData.odds){
                        ZAPNET.BetDB.addMatches(virtualData.odds);
                    }
                }
                if (selectedSport.code == 'soccer'){
                    if (ZAPNET.BetDB.matches[virtualData.next.id]){
                        var match = ZAPNET.BetDB.matches[virtualData.next.id];
                        renderVirtualEvent(html, match);
                    }
                } else {
                    if (ZAPNET.BetDB.outrightsById[virtualData.next.id]){
                        var race = ZAPNET.BetDB.outrightsById[virtualData.next.id]
                        renderVirtualRace(html, race, selectedSport.code);
                    }
                }
            }
            html.push('</div><!-- Selected -->');
            html.push('</div><!-- Virtual -->');

        },

        renderLeagueMenu = function(html, leagueMenu, title){
            html.push('<div class="block league-menu">');
            html.push('<div class="header"><a class="league-sport-select" href="#">', title, '</a><div class="league-menu-options"></div></div>');
            html.push('<table class="leagues">');
            Util.foreach(leagueMenu, function(category){
                html.push('<tr class="category" cid="', category.id, '"><td colspan="3"><div class="category"><a href="#" class="category-select" cid="', category.id, '">', Util.t(category.name), '</a><a href="#" class="league-menu-select"></a></div></td></tr>');
                var tournaments = [];
                while(category.tournaments.length){
                    tournaments = category.tournaments.splice(0, 3);
                    html.push('<tr class="tournaments" cid="', category.id, '">');
                    var n = 0;
                    Util.foreach(tournaments, function(tour){
                        html.push('<td class="tournament"><div class="tournament"><input type="checkbox" class="tournament-check" tid="', tour.id,'">');
                        html.push('<a href="#" class="tournament-select" tid="', tour.id, '">', tour.name, '</div></td>');
                        n += 1;
                    });
                    for(; n < 3; n += 1){
                        html.push('<td>&nbsp;</td>');
                    }
                    html.push('</tr>');
                }
            });
            html.push('</table></div>');
        },

        showSportLeagues = function(sportId){
            if (!ZAPNET.BetDB.sports[sportId]){
                return;
            }
            var sport = ZAPNET.BetDB.sports[sportId];
            var catList = Util.getList(sport.categories, ENTITY_SORT_FN);
            var leagueList = [];
            Util.foreach(catList, function(cat){
                var tList = Util.getList(cat.tournaments, ENTITY_SORT_FN);
                var tourList = [];
                Util.foreach(tList, function(tour){
                    var m;
                    for(m in tour.matches){
                        if (tour.matches.hasOwnProperty(m)){
                            if (!tour.matches[m].live){
                                tourList.push({
                                    name: tour.name,
                                    id: tour.id
                                });
                                break;
                            }
                        }
                    }
                });
                if (tourList.length){
                    leagueList.push({
                        name: cat.name,
                        id: cat.id,
                        tournaments: tourList
                    });
                }
            });
            if (leagueList.length){
                leagueMenuList = leagueList;
                leagueMenuTitle = sport.name;
                view = 'leagues';
                render();
            }
        },

        renderOutrights = function(html){
            Util.foreach(outrights, function(or){
                var outright = ZAPNET.BetDB.outrightsById[or.id];
                var colSpan;
                html.push('<div class="match-section outright-coupon" oid="', outright.id);
                html.push('"><div class="header"><div class="title"><span>', outright.category.sport.name, ' / ', outright.category.name, ' / ', outright.name, ' ', outright.market, '</span></div></div>');

                html.push('<table class="coupon">');
                html.push('<tr class="market-headers"><td class="date" colspan="3">');
                html.push(Util.t('Next Close Time'), ': ', $P.date('H:i d F Y', outright.ts), '</td>');
                var outrightMarkets = [{
                    cols: 1,
                    title: outright.market,
                    handicap: false,
                    headers: [outright.market],
                    outcomes: [1]
                }];
                Util.foreach(outrightMarkets, function(market){
                    html.push('<td class="market-title" colspan="', market.cols, '">', Util.t(market.title), '</td>');
                    colSpan += market.cols;
                });
                colSpan += 0;
                //html.push('<td colspan="2">&nbsp;</td>');
                html.push('</tr>');
                /*
                html.push('<tr class="match-header"><td class="code">ID</td><td colspan="2">Timetable Events</td>');
                Util.foreach(outrightMarkets, function(market){
                    if (market.handicap){
                        html.push('<td>&nbsp;</td>');
                    }
                    Util.foreach(market.headers, function(header){
                        html.push('<td>', header, '</td>');
                    });
                });
                html.push('<td colspan="2">&nbsp;</td>');
                html.push('</tr>');
                */
                var curDay = null;
                var counter = 1;
                var competitorList = [];
                Util.foreach(outright.competitors, function(competitor, i){
                    competitorList.push(competitor);
                });
                competitorList.sort(function(a,b){
                    return a.odds - b.odds;
                });
                Util.foreach(competitorList, function(competitor, i){
                    var nrSels = 0, m, msels;
                    for(m in competitor.markets){
                        if (competitor.markets.hasOwnProperty(m)){
                            msels = Util.countProperties(competitor.markets[m].selections);
                            nrSels += msels ? msels : 0;
                        }
                    }
                    html.push('<tr class="match r', (i % 2), '" mid="', competitor.id, '"><td class="code">', competitor.code);
                    html.push('</td><td class="time">', counter, '</td><td class="event"><span class="match-name">', $P.ucwords(competitor.name.toLowerCase()).replace(' V ', ' - '), '</span></td>');
                    Util.foreach(outrightMarkets, function(market){
                        if (market.handicap){
                            html.push('<td>&nbsp;</td>');
                        }
                        Util.foreach(market.outcomes, function(outcome){
                            html.push('<td>');
                            html.push('<div class="match-odds"><div class="match-odds-market">');
                            getOutrightSelection(html, competitor);
                            html.push('</div></div>');
                            html.push('</td>');
                        });
                    });
                    //html.push('<td class="md"><div class="mdh"></div></td>');
                    html.push('</tr>');
                    counter += 1;
                });
                html.push('</table>');
                html.push('</div>');
            });
        },

        showSportDateMenu = function(html){
            var items = ['today', 'tomorrow', '3day', 'all'];
            var itemLabels = {
                'today' : 'Today',
                'tomorrow' : 'Tomorrow',
                '3day' : '3-Day',
                'all' : 'All'
            };
            html.push('<div class="sport-date-menu">');
            Util.foreach(items, function(item){
                html.push('<span class="sport-date-item sport-date-item-', item, (item == sportDate ? ' sport-date-item-selected' : ''), '">', itemLabels[item], '</span>');
            });
            html.push('</div>');

            var sitems = ['time', 'league'];
            var sitemLabels = {
                'time': 'Sort By Time',
                'league': 'Sort By League'
            };
            html.push('<div class="sport-sort-menu">');
            Util.foreach(sitems, function(item){
                html.push('<span class="sport-sort-item sport-sort-item-', item, (item == sportSort ? ' sport-sort-item-selected' : ''), '">', sitemLabels[item], '</span>');
            });
            html.push('</div>');
        },

        showLive = function(){
            singleMatchView = false;
            selectedOverviewMatchId = null;
            view = 'live';
            ZAPNET.Website.show('live');
            nextLiveMatchId = false;
            render();
        },

        showVirtual = function(){
            view = 'virtual';
            var sportCode = selectedVirtualSport || 'soccer';
            if (sportCode == 'football'){
                sportCode = 'soccer';
            }
            showLoading();
            virtualData = false;
            YAHOO.util.Connect.asyncRequest('GET', '/sports/virtual?sport=' + sportCode, {
                success: function(o){
                    var data = eval('(' + o.responseText + ')');
                    if (data){
                        virtualData = data;
                        render();
                    }
                },
                failure: function(){
                },
                cache: false,
                timeout: 40000
            });
        },

        showMain = function(){
            view = 'coupon';
            render();
        },

        showFavoriteOdds = function(price){
            view = 'favodds';
            priceLimit = price;
            render();
        },

        addFavoriteMatch = function(mId){
            favoriteLive[mId] = mId;
        },

        getFavoriteMatches = function(){
            var matchList = [];
            Util.foreach(favoriteLive, function(mId){
                if (ZAPNET.BetDB.matches[mId]){
                    matchList.push(ZAPNET.BetDB.matches[mId]);
                }
            });

            return matchList;
        },

        isFavoriteMatch = function(matchId){
            return favoriteLive[matchId] ? true : false;
        },

        refreshLiveMatchList = function(){
            var el = element ? element : Dom.get('coupon');
            var matchListEl = $('div.match-list', el, true);
            if (!matchListEl){
                return;
            }

            var liveSports = ZAPNET.BetDB.getLiveMatchesBySport(false, liveSportOrder, "live");
            var upcomingSports = ZAPNET.BetDB.getLiveMatchesBySport(false, liveSportOrder, "open");

            var html = [];
            var live = getLiveMatchesInfo(liveSports, upcomingSports);
            var liveMatchFavEl = Dom.get('live-match-section-favorites');
            if (liveMatchFavEl){
                Util.foreach(live.favorites, function(match){
                    renderMatch(html, match);
                });
                liveMatchFavEl.innerHTML = html.join('');
            } else {
                return;
            }

            Util.foreach(live.sportList, function(sport){
                var sportEl = Dom.get('live-match-sport-' + sport.sport.id);
                if (!sportEl){
                    return;
                }
                var sportCountEl = Dom.get('nr-live-sport-' + sport.sport.id);
                sportCountEl.innerHTML = sport.matches.length;
                html = [];
                var sportMatches = sport.matches.slice(0);
                var byLeague = Util.inArray(window.ZAPNET_COMPANYNAME, ['Bets52', 'SpartaBet']);
                if (byLeague){
                    var featuredLeagues = ZAPNET.BetDB.getFeaturedLeagues(sport.sport.id);
                    var featuredTourIds = {};
                    Util.foreach(featuredLeagues, function(league){
                        Util.foreach(league.tournaments, function(tId){
                            featuredTourIds[tId] = tId;
                        });
                    });
                    sportMatches.sort(function(a, b){
                        if (a.tournament.id == b.tournament.id){
                            return LIVE_MATCH_SORT_FN(a, b);
                        }
                        var aFeatured = featuredTourIds[a.tournament.id] ? -1 : 1;
                        var bFeatured = featuredTourIds[b.tournament.id] ? -1 : 1;
                        if (aFeatured != bFeatured){
                            return aFeatured - bFeatured;
                        }
                        if (a.tournament.category.id == b.tournament.category.id){
                            if (a.tournament.order == b.tournament.order){
                                return a.tournament.name < b.tournament.name ? -1 : 1;
                            } else {
                                return a.tournament.order - b.tournament.order;
                            }
                        }
                        if (a.tournament.category.order == b.tournament.category.order){
                            return a.tournament.category.name < b.tournament.category.name ? -1 : 1;
                        } else {
                            return a.tournament.category.order - b.tournament.category.order;
                        }
                    });
                }
                var curTourId = 0;
                var curCatId = 0;
                Util.foreach(sportMatches, function(match){
                    var catId = match.tournament.category.id;
                    var tourId = match.tournament.id;
                    if (byLeague){
                        if (curCatId != catId){
                            html.push('<div class="live-match-list-category">', Util.t(match.tournament.category.name), '</div>');
                        }
                        if (curTourId != tourId){
                            html.push('<div class="live-match-list-tournament">', Util.t(match.tournament.name), '</div>');
                        }
                    }
                    renderMatch(html, match);
                    curTourId = tourId;
                    curCatId = catId;
                });
                $('div.live-match-sport-content', sportEl, true).innerHTML = html.join('');
            });

            html = [];
            Util.foreach(live.comingupList, function(sport){
                var sportEl = Dom.get('livesoon-match-sport-' + sport.sport.id);
                if (!sportEl){
                    return;
                }
                html = [];
                Util.foreach(sport.matches, function(match){
                    renderMatch(html, match);
                });
                $('div.live-match-sport-content', sportEl, true).innerHTML = html.join('');
            });

            postRenderLive();
        },

        renderFn = function(){
            render();
        },

        offlineRenderCoupon = function(sections, postFn){
            var sectionList = sections.slice(0);
            var renderSection = function(section){
                var html = [];
                renderCoupon(html, section);
                var sectionEl = Util.div('section-holder');
                sectionEl.innerHTML = html.join('');
                el.appendChild(sectionEl);
            };
            var renderNextSection = function(){
                if (sectionList.length == 0){
                    if (postFn){
                        postFn();
                    }
                    renderEvent.fire();
                    return;
                }
                var section = sectionList.shift();
                renderSection(section);
                setTimeout(renderNextSection, 1);
            };

            var el = element ? element : Dom.get('coupon');
            el.innerHTML = '';
            renderNextSection();
        },

        showLoading = function(loadElem){
            var el = loadElem ? loadElem : (element ? element : Dom.get('coupon'));
            el.innerHTML = '<div class="coupon-loading"><div class="loader" title="2"><svg version="1.1" id="loader-1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="40px" viewBox="0 0 50 50" style="enable-background:new 0 0 50 50;" xml:space="preserve"><path fill="#000" d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z"><animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.6s" repeatCount="indefinite"/></path></svg></div><div class="loading-label">' + Util.t('Loading') + '...</div></div>';
        },

        renderTodaysMatches = function(){
            renderMatchList(element, getTodayMatches(), 10, Util.t('Today'), '');
        },

        render = function(){
            var html = [], i, postFn = false;

            if (!ZAPNET.BetDB || !ZAPNET.BetDB.isReady()){
                if (!readyDbFn){
                    readyDbFn = renderFn;
                    ZAPNET.BetDBReadyEvent.subscribe(readyDbFn);
                }
                showLoading();
                return;
            }

            lastLiveMatchId = false;
            Dom.removeClass(document.body, 'welcome-page');
            Dom.removeClass('page', 'welcome-page');

            if (view == 'live'){
                var liveSports = ZAPNET.BetDB.getLiveMatchesBySport(false, liveSportOrder, "live");
                var upcomingSports = ZAPNET.BetDB.getLiveMatchesBySport(false, liveSportOrder, "open");
                renderLive(html, liveSports, upcomingSports);
                postFn = postRenderLive;
            } else if (view == 'virtual') {
                renderVirtual(html);
                postFn = postRenderVirtual;
            } else if (view == 'match') {

            } else if (view == 'leagues') {
                renderLeagueMenu(html, leagueMenuList, leagueMenuTitle);
            } else if (view == 'favodds') {
                renderFavoriteOdds(html, priceLimit);
            } else if (view == 'outright') {
                renderOutrights(html);
            } else {
                var sections = getMatchSections();
                if (!sections.length){
                    ZAPNET.Website.show('sports');
                    return;
                } else {
                    if (sport){
                        //showSportDateMenu(html);
                    }
                    var j;
                    if (true){
                        var catSections = {};
                        var catSection, match;
                        for(i = 0; i < sections.length; i += 1){
                            var cat = sections[i].tournament.category;
                            if (catSections[cat.id]){
                                catSection = catSections[cat.id];
                            } else {
                                catSection = {
                                    title: Util.t(cat.sport.name) + ' / ' + Util.t(cat.name),
                                    sport: cat.sport,
                                    markets: [],
                                    marketTypes: {},
                                    selected: [],
                                    matches: []
                                };
                                catSections[cat.id] = catSection;
                            }
                            for(j = 0; j < sections[i].matches.length ; j += 1){
                                match = sections[i].matches[j];
                                if (match.status != 'live'){
                                    catSection.matches.push(match);
                                }
                            }
                        }
                        sections = $P.array_values(catSections);
                    }
                    if (sections.length < 10){
                        for(i = 0; i < sections.length; i += 1){
                            renderCoupon(html, sections[i]);
                        }
                    } else {
                        offlineRenderCoupon(sections, postFn);
                        return;
                    }
                }
            }

            var el = element ? element : Dom.get('coupon');
            el.innerHTML = html.join('');
            if (postFn){
                postFn();
            }
            renderEvent.fire();
        };

        return {
            setElement: setElement,
            setBettingSlip: setBettingSlip,
            setSectionPerTournament: setSectionPerTournament,
            toggleMarket: toggleMarket,
            setMarket: setMarket,
            addMarket: addMarket,
            removeMarket: removeMarket,
            toggleTournament: toggleTournament,
            resetTournaments: resetTournaments,
            setTournament: setTournament,
            setTournaments: setTournaments,
            addTournament: addTournament,
            addTournaments: addTournaments,
            removeTournament: removeTournament,
            removeTournaments: removeTournaments,
            addOutright: addOutright,
            addMultiOutrights: addMultiOutrights,
            removeOutright: removeOutright,
            removeMultiOutrights: removeMultiOutrights,
            setOutrights: setOutrights,
            setCategory: setCategory,
            setSport: setSport,
            getSport: getSport,
            getCategory: getCategory,
            getTournaments: getTournaments,
            render: render,
            refreshMatch: refreshMatch,
            renderMatchList: renderMatchList,
            renderMatchSections: renderMatchSections,
            renderLiveMatchCoupon: renderLiveMatchCoupon,
            renderSideBarLiveMatch: renderSideBarLiveMatch,
            renderSideBarMatchResults: renderSideBarMatchResults,
            renderSideBarMarketMovers: renderSideBarMarketMovers,
            refreshLiveMatchList: refreshLiveMatchList,
            setLiveMatchPanelInfo: setLiveMatchPanelInfo,
            renderTodaysMatches: renderTodaysMatches,
            showSportLeagues: showSportLeagues,
            postRenderLive: postRenderLive,
            postRenderVirtual: postRenderVirtual,
            showLive: showLive,
            showVirtual: showVirtual,
            showMain: showMain,
            showMatch: showMatch,
            gotoLiveMatch: gotoLiveMatch,
            getMatchMarkets: getMatchMarkets,
            addFavoriteMatch: addFavoriteMatch,
            showFavoriteOdds: showFavoriteOdds,
            getFavoriteMatches: getFavoriteMatches,
            isFavoriteMatch: isFavoriteMatch,
            openMatch: openMatch,
            getHighlightMenuHtml: getHighlightMenuHtml,
            getMatchMarketMenu: getMatchMarketMenu,
            getSingleMatchMarkets: getSingleMatchMarkets,

            renderEvent: renderEvent
        };
    }();

}());