(function(){
    var Util = ZAPNET.util;

    ZAPNET_LAST_ODDS_EVENT_ID_RECEIVED = 0;
    ZAPNET_LAST_ODDS_EVENT_ID_PROCESSED = 0;

    ZAPNET.BetDBReadyEvent = new YAHOO.util.CustomEvent('BetDB Ready');

    var extraSelectionNextId = 1000000001;

    ZAPNET.BetDBGen = function(noStart){
        var DB = {},
            ready = false,
            matchTimeLimit = false,
            schedule,
            sports,
            categories = {},
            tournaments = {},
            matches = {},
            matchcodes = {},
            markets = {},
            selections = {},
            outrights = {},
            outrightsById = {},
            outrightCategories = {},
            outrightCompetitors = {},
            outrightIncompatibles = {},
            outrightCompatibles = {},
            sportsByCode = {},
            matchesSports = {},
            marketTypes = {},
            marketTypesById = {},
            marketGroups = {},
            featuredLeagues = [],
            pools = {},
            matchOrderCache = {},
            leagueOrderCache = {},
            liveMatchesCache = {},
            extraSelections = {},
            loadPersistData = false,
            loadingBusy = false,
            loadQueue = [],
            matchOddsChangeEvent = new YAHOO.util.CustomEvent('Match Odds Change', this, false, YAHOO.util.CustomEvent.FLAT),
            outrightOddsChangeEvent = new YAHOO.util.CustomEvent('Outright Odds Change', this, false, YAHOO.util.CustomEvent.FLAT),
            matchRemovedEvent = new YAHOO.util.CustomEvent('Match Removed', this, false, YAHOO.util.CustomEvent.FLAT),
            matchStatusChangeEvent = new YAHOO.util.CustomEvent('Match Change of Status', this, false, YAHOO.util.CustomEvent.FLAT),
            matchesRemovedEvent = new YAHOO.util.CustomEvent('Matches Removed', this, false, YAHOO.util.CustomEvent.FLAT),
            selectionRemovedEvent = new YAHOO.util.CustomEvent('Selection Removed', this, false, YAHOO.util.CustomEvent.FLAT),
            matchesChangedEvent = new YAHOO.util.CustomEvent('Matches Changed', this, false, YAHOO.util.CustomEvent.FLAT),
            outrightsChangedEvent = new YAHOO.util.CustomEvent('Outrights Changed', this, false, YAHOO.util.CustomEvent.FLAT),
            outrightChangedEvent = new YAHOO.util.CustomEvent('Outright Changed', this, false, YAHOO.util.CustomEvent.FLAT),
            outrightSelectionRemovedEvent = new YAHOO.util.CustomEvent('Outright Selection Removed', this, false, YAHOO.util.CustomEvent.FLAT),
            matchChangedEvent = new YAHOO.util.CustomEvent('Match Changed', this, false, YAHOO.util.CustomEvent.FLAT),
            scheduleChangedEvent = new YAHOO.util.CustomEvent('Schedule Changed', this, false, YAHOO.util.CustomEvent.FLAT),
            scoreChangedEvent = new YAHOO.util.CustomEvent('Score Changed', this, false, YAHOO.util.CustomEvent.FLAT),
            matchMarketChangeEvent = new YAHOO.util.CustomEvent('Match Market Change', this, false, YAHOO.util.CustomEvent.FLAT),
            matchMarketStatusChangeEvent = new YAHOO.util.CustomEvent('Match Market Status Change', this, false, YAHOO.util.CustomEvent.FLAT),
            beforeReloadEvent = new YAHOO.util.CustomEvent('Reload Event', this, false, YAHOO.util.CustomEvent.FLAT),
            reloadEvent = new YAHOO.util.CustomEvent('Reload Event', this, false, YAHOO.util.CustomEvent.FLAT),
            infoEvent = new YAHOO.util.CustomEvent('Info Event', this, false, YAHOO.util.CustomEvent.FLAT),
            betEvent = new YAHOO.util.CustomEvent('Bet Event', this, false, YAHOO.util.CustomEvent.FLAT),
            errorEvent = new YAHOO.util.CustomEvent('Error Event', this, false, YAHOO.util.CustomEvent.FLAT);

        var getMatchCards = function(cardStr){
            var sides = cardStr.split(':');
            var homecards = sides[0].split(',');
            var awaycards = sides[1].split(',');
            var cards = {
                home: {
                    yellow: homecards[0],
                    yellowred: homecards[1],
                    red: homecards[2]
                },
                away: {
                    yellow: awaycards[0],
                    yellowred: awaycards[1],
                    red: awaycards[2]
                }
            };
            return cards;
        };

        var getMatchCorners = function(cornerStr){
            var sides = cornerStr.split(':');
            return {
                home: sides[0],
                away: sides[1]
            };
        };

        var updateMatchSchedule = function(data, marketTypesInfo){
            var locale = window.ZAPNET_LOCALE ? window.ZAPNET_LOCALE : false;
            var scheduleChanged = false;
            Util.foreach(data, function(sportData, sportId){
                if (!sports[sportId]){
                    scheduleChanged = true;
                }
                var sport = sports[sportId] ? sports[sportId] : sportData;
                if (locale && sport.names && sport.names[locale]){
                    sport.name = sport.names[locale];
                }
                if (sportData.full){
                    if (sportData.markets === false){
                        sport.full = true;
                        sport.markets = false;
                    } else {
                        sport.full = true;
                        if (sport.markets){
                            Util.foreach(sportData.markets, function(mt){
                                if (!Util.inArray(mt, sport.markets)){
                                    sport.markets.push(mt);
                                }
                            });
                        }
                    }
                }
                sports[sportId] = sport;
                sportsByCode[sport.code] = sport;
                matchesSports[sportId] = sport;
                if (Util.countProperties(sport.categories) == 0){
                    sport.categories = {};
                }
                Util.foreach(sportData.categories, function(categoryData, categoryId){
                    if (!categories[categoryId]){
                        scheduleChanged = true;
                    }
                    var category = categories[categoryId] ? categories[categoryId] : categoryData;
                    category.sport = sport;
                    if (locale && category.names && category.names[locale]){
                        category.name = category.names[locale];
                    }
                    categories[categoryId] = category;
                    sport.categories[categoryId] = category;
                    Util.foreach(categoryData.tournaments, function(tournamentData, tournamentId){
                        if (!tournaments[tournamentId]){
                            scheduleChanged = true;
                        }
                        var tournament = tournaments[tournamentId] ? tournaments[tournamentId] : tournamentData;
                        tournament.category = category;
                        if (locale && tournament.names && tournament.names[locale]){
                            tournament.name = tournament.names[locale];
                        }
                        tournament.mj = tournamentData.mj;
                        tournaments[tournamentId] = tournament;
                        category.tournaments[tournamentId] = tournament;
                        if (YAHOO.lang.isArray(tournament.matches)){
                            tournament.matches = {};
                        }
                        Util.foreach(tournamentData.matches, function(matchData, matchId){
                            matchData.hidden = true;
                            matchData.marketTypes = {};
                            var match = matches[matchId] ? matches[matchId] : matchData;
                            match.tournament = tournament;
                            if (locale && matchData.names && matchData.names[locale]){
                                match.name = matchData.names[locale];
                            }
                            match.full = match.full || matchData.full;
                            match.competitors = match.name.split(' v ');
                            match.lmtime = matchData.lmtime || null;
                            match.lstatus = matchData.lstatus || null;
                            match.score = matchData.score || null;
                            match.tvchn = matchData.tvchn || null;
                            match.setscores = matchData.setscores || null;
                            match.ldata = matchData.ldata || null;
                            match.livecorners = matchData.livecorners || null;
                            match.livecards = matchData.livecards || null;
                            match.lsrc = matchData.lsrc || null;
                            match.livebet = matchData.livebet || false;
                            match.cards = matchData.livecards ? getMatchCards(matchData.livecards) : {
                                home: {
                                    yellow: 0,
                                    yellowred: 0,
                                    red: 0
                                },
                                away: {
                                    yellow: 0,
                                    yellowred: 0,
                                    red: 0
                                }
                            };
                            match.corners = matchData.livecorners ? getMatchCorners(matchData.livecorners) : {
                                home: 0,
                                away: 0
                            };
                            matches[matchId] = match;
                            matchcodes[match.code] = match;
                            tournament.matches[matchId] = match;
                            Util.foreach(matchData.markets, function(marketData, marketId){
                                var market = markets[marketId] ? markets[marketId] : marketData;
                                var marketType = marketTypesInfo && marketTypesInfo[market.typeid] ? marketTypesInfo[market.typeid] : false;
                                if (!marketType){
                                    return;
                                }
                                match.hidden = false;
                                market.type = marketType.market_type;
                                market.name = marketType.market_name;
                                market.live = marketType.is_live === true || marketType.is_live == 1;
                                market.order = marketType.market_order;
                                market.match = match;
                                market.id = marketId;

                                if ('mco' in match){
                                    if (+match.mco && +match.mco > 0){
                                        market.mincomb = Math.min(market.selmc, +match.mco);
                                    } else {
                                        market.mincomb = market.selmc;
                                    }
                                }

                                markets[marketId] = market;
                                if (!match.marketTypes[market.type]){
                                    match.marketTypes[market.type] = {};
                                }
                                if (!match.marketTypes[market.type][market.special]){
                                    match.marketTypes[market.type][market.special] = {
                                        outcomes: {}
                                    };
                                }
                                match.marketTypes[market.type][market.special].market = market;
                                match.markets[market.id] = market;
                                Util.foreach(marketData.selections, function(selection, selectionId){
                                    var marketSelection = marketType.selections[selection.n] ? marketType.selections[selection.n] : false;
                                    selection.id = selectionId;
                                    selection.outcome = selection.n;
                                    selection.odds = selection.o;
                                    selection.label = marketSelection && marketSelection.outcome_label ? marketSelection.outcome_label : selection.n;
                                    selection.order = marketSelection && marketSelection.outcome_order ? marketSelection.outcome_order : 100000;
                                    delete selection.n;
                                    delete selection.o;
                                    if (selection.outcome){
                                        match.marketTypes[market.type][market.special].outcomes[selection.outcome] = selection;
                                    }
                                    selection.market = market;
                                    selections[selectionId] = selection;
                                    market.selections[selectionId] = selection;
                                });
                            });
                        });
                    });
                });
            });
            return scheduleChanged;
        };

        var updateOutrightSchedule = function(data){
            var scheduleChanged = false;
            Util.foreach(data, function(sportData, sportId){
                if (!sports[sportId]){
                    sports[sportId] = {
                        id: sportId,
                        name: sportData.name,
                        code: sportData.code,
                        order: sportData.order,
                        categories: {}
                    };
                    scheduleChanged = true;
                }
                var sport = sports[sportId];
                if (!outrights[sportId]){
                    outrights[sportId] = {};
                }
                if (!outrightCategories[sportId]){
                    outrightCategories[sportId] = {};
                    scheduleChanged = true;
                }
                Util.foreach(sportData.categories, function(categoryData, categoryId){
                    if (!outrightCategories[sportId][categoryId]){
                        scheduleChanged = true;
                    }
                    var category = outrightCategories[sportId][categoryId] ? outrightCategories[sportId][categoryId] : categoryData;
                    category.sport = sport;
                    outrightCategories[sportId][categoryId] = category;
                    Util.foreach(categoryData.outrights, function(outright, outrightId){
                        var i, oid;
                        outright.category = category;
                        outrights[sportId][outrightId] = outright;
                        outrightsById[outrightId] = outright;
                        if (!category.outrights){
                            category.outrights = {};
                        }
                        category.outrights[outrightId] = outright;
                        if (outright.incompatible && outright.incompatible.length){
                            for(i = 0; i < outright.incompatible.length; i += 1){
                                oid = outright.incompatible[i];
                                if (!outrightIncompatibles[outright.id]){
                                    outrightIncompatibles[outright.id] = {};
                                }
                                if (!outrightIncompatibles[oid]){
                                    outrightIncompatibles[oid] = {};
                                }
                                outrightIncompatibles[outright.id][oid] = true;
                                outrightIncompatibles[oid][outright.id] = true;
                            }
                        }
                        if (outright.compatible && outright.compatible.length){
                            for(i = 0; i < outright.compatible.length; i += 1){
                                oid = outright.compatible[i];
                                if (!outrightCompatibles[outright.id]){
                                    outrightCompatibles[outright.id] = {};
                                }
                                outrightCompatibles[outright.id][oid] = true;
                            }
                        }
                        Util.foreach(outright.competitors, function(competitor, competitorId){
                            outrightCompetitors[competitorId] = competitor;
                            competitor.outright = outright;
                        });
                    });
                });
            });

            return scheduleChanged;
        };

        var updateMarkets = function(marketData){
            Util.foreach(marketData, function(market, mid){
                marketTypes[mid] = market;
                if (!marketTypesById[market.sport_id]){
                    marketTypesById[market.sport_id] = {};
                }
                marketTypesById[market.sport_id][market.market_type] = market;
                marketTypesById[market.sport_id][market.market_type].id = mid;
            });
        };

        var updateMarketGroups = function(marketGroupData){
            Util.foreach(marketGroupData, function(marketGroup, sid){
                marketGroups[sid] = marketGroup;
            });
        };

        var updateFeaturedLeagues = function(featuredLeagueData){
            featuredLeagues = [];
            Util.foreach(featuredLeagueData, function(featuredLeague){
                featuredLeagues.push({
                    name: featuredLeague.name,
                    order: featuredLeague.sortorder,
                    category: featuredLeague.category,
                    tournaments: featuredLeague.id.split(",")
                });
            });
        };

        var getFeaturedLeagues = function(sportId){
            var result = [];
            Util.foreach(featuredLeagues, function(league){
                var foundSport = false;
                if (sportId){
                    Util.foreach(league.tournaments, function(tId){
                        if (tournaments[tId]){
                            if (tournaments[tId].category.sport.id == sportId){
                                foundSport = true;
                            }
                        }
                    });
                } else {
                    foundSport = false;
                }
                if (foundSport){
                    result.push(league);
                }
            });

            return result;
        };

        var init = function(noStart){
            schedule = window.ZAPNET_BET_DATA ? (window.ZAPNET_BET_DATA.schedule ? window.ZAPNET_BET_DATA.schedule : window.ZAPNET_BET_DATA) : {};
            var matchesData = schedule.sports ? schedule.sports : {};
            var outrightsData = schedule.outrights ? schedule.outrights : {};
            var poolsData = schedule.pools ? schedule.pools : {};
            sports = {};
            sportsByCode = {};
            matchesSports = {};
            categories = {};
            tournaments = {};
            matches = {};
            matchcodes = {};
            markets = {};
            marketTypes = {};
            marketTypesById = {};
            marketGroups = {};
            featuredLeagues = [];
            selections = {};
            outrights = {};
            outrightsById = {};
            outrightCategories = {};
            outrightCompetitors = {};
            outrightIncompatibles = {};
            outrightCompatibles = {};
            pools = {};
            matchTimeLimit = false;

            if (window.ZAPNET_BET_SCHEDULE_MARKETS){
                schedule.markets = window.ZAPNET_BET_SCHEDULE_MARKETS;
            }

            if (schedule.market_groups){
                updateMarketGroups(schedule.market_groups);
            }
            if (schedule.featured_leagues){
                updateFeaturedLeagues(schedule.featured_leagues);
            }
            updateMarkets(schedule.markets);
            updateMatchSchedule(matchesData, schedule.markets);
            updateOutrightSchedule(outrightsData);
            clearMatchCache();

            if (!noStart){
                ZAPNET.Events.setLastEvent(schedule.last_event_id);
            }

            DB.sports = sports;
            DB.sportsByCode = sportsByCode;
            DB.matchesSports = matchesSports;
            DB.categories = categories;
            DB.tournaments = tournaments;
            DB.matches = matches;
            DB.matchcodes = matchcodes;
            DB.markets = markets;
            DB.marketTypes = marketTypes;
            DB.marketTypesById = marketTypesById;
            DB.marketGroups = marketGroups;
            DB.featuredLeagues = featuredLeagues;
            DB.selections = selections;
            DB.outrights = outrights;
            DB.outrightsById = outrightsById;
            DB.outrightCategories = outrightCategories;
            DB.outrightCompetitors = outrightCompetitors;
            DB.outrightIncompatibles = outrightIncompatibles;
            DB.outrightCompatibles = outrightCompatibles;
            DB.pools = pools;
        };

        var reset = function(){
            sports = {};
            sportsByCode = {};
            matchesSports = {};
            categories = {};
            tournaments = {};
            matches = {};
            matchcodes = {};
            markets = {};
            selections = {};
            outrights = {};
            outrightsById = {};
            outrightCategories = {};
            outrightCompetitors = {};
            outrightIncompatibles = {};
            outrightCompatibles = {};
            pools = {};
            // matchTimeLimit = false;

            DB.sports = sports;
            DB.sportsByCode = sportsByCode;
            DB.matchesSports = matchesSports;
            DB.categories = categories;
            DB.tournaments = tournaments;
            DB.matches = matches;
            DB.matchcodes = matchcodes;
            DB.markets = markets;
            DB.selections = selections;
            DB.outrights = outrights;
            DB.outrightsById = outrightsById;
            DB.outrightCategories = outrightCategories;
            DB.outrightCompetitors = outrightCompetitors;
            DB.outrightIncompatibles = outrightIncompatibles;
            DB.outrightCompatibles = outrightCompatibles;
            DB.pools = pools;
        };

        var setTimeLimit = function(limit){
            if (!limit || limit == 'all'){
                matchTimeLimit = false;
            } else {
                switch(limit.toLowerCase()){
                    case '1h': matchTimeLimit = 3600; break;
                    case '3h': matchTimeLimit = 10800; break;
                    case '5h': matchTimeLimit = 18000; break;
                    case '1d': matchTimeLimit = 86400; break;
                    case '24h': matchTimeLimit = 86400; break;
                    case '1d': matchTimeLimit = 259200; break;
                    default: matchTimeLimit = false; break;
                }
            }
        };

        var getTimeLimit = function(){
            return matchTimeLimit;
        };

        var time = function(){
            return Math.round((new Date().getTime()) / 1000);
        };

        var filterMatch = function(match, now){
            if (!matchTimeLimit){
                return true;
            }
            now = now || time();
            return match.ts - now <= matchTimeLimit;
        };

        var addMarket = function(market){
            if (!matches[market.match_id]){
                return false;
            }
            var match = matches[market.match_id];
            match.markets[market.id] = market;
            markets[market.id] = market;
            market.match = match;
            match.hidden = false;

            Util.foreach(market.selections, function(selection, selectionId){
                selection.market = market;
                selections[selectionId] = selection;
            });
            if (market.status == "open"){
                if (!match.marketTypes[market.type]){
                    match.marketTypes[market.type] = {};
                }
                if (!match.marketTypes[market.type][market.special]){
                    match.marketTypes[market.type][market.special] = {
                        outcomes: {}
                    };
                }
                match.marketTypes[market.type][market.special].market = market;
                Util.foreach(market.selections, function(selection, selectionId){
                    match.marketTypes[market.type][market.special].outcomes[selection.outcome] = selection;
                });
            }

            return market;
        };

        var removeMarket = function(marketId){
            if (!markets[marketId]){
                return false;
            }
            var market = markets[marketId];
            Util.foreach(market.selections, function(selection){
                selectionRemovedEvent.fire(selection.id);
                delete selections[selection.id];
            });
            delete market.match.markets[market.id];
            delete markets[market.id];
            if (market.match.marketTypes[market.type] && market.match.marketTypes[market.type][market.special]){
                delete market.match.marketTypes[market.type][market.special];
            }
            if (market.match.marketTypes[market.type] && !Util.countProperties(market.match.marketTypes[market.type])){
                delete market.match.marketTypes[market.type];
            }

            return;
            if (!Util.countProperties(market.match.marketTypes)){
                market.match.hidden = true;
            }
        };

        var suspendMarket = function(marketId){
            if (!markets[marketId]){
                return;
            }

            var market = markets[marketId];
            market.status = 'suspended';

            if (market.match.marketTypes[market.type] && market.match.marketTypes[market.type][market.special]){
                delete market.match.marketTypes[market.type][market.special];
                if (!Util.countProperties(market.match.marketTypes[market.type])){
                    delete market.match.marketTypes[market.type];
                }
            }
        };

        var openMarket = function(marketId){
            if (!markets[marketId]){
                return;
            }

            var market = markets[marketId];
            var match = market.match;
            market.status = 'open';

            markets[marketId] = market;
            if (!match.marketTypes[market.type]){
                match.marketTypes[market.type] = {};
            }
            if (!match.marketTypes[market.type][market.special]){
                match.marketTypes[market.type][market.special] = {
                    outcomes: {}
                };
            }
            match.marketTypes[market.type][market.special].market = market;
            Util.foreach(market.selections, function(selection){
                match.marketTypes[market.type][market.special].outcomes[selection.outcome] = selection;
                selection.market = market;
                selections[selection.id] = selection;
            });
        }

        var removeMatch = function(matchId, marketFn){
            if (!matches[matchId]){
                return false;
            }
            var match = matches[matchId];
            Util.foreach(match.markets, function(market, i){
                try{
                    if (market){
                        removeMarket(market.id);
                    }
                } catch (e){
                    //Util.error('Error removing market for match ' + matchId);
                }
                try{
                    if (marketFn){
                        marketFn(market.id);
                    }
                } catch(e){
                    //Util.error('Error calling callback after remove market for match ' + matchId);
                }
            });

            delete match.tournament.matches[matchId];
            delete matches[matchId];

            if (match.code && matchcodes[match.code]){
                delete matchcodes[match.code];
            }

            if (!Util.hasProperties(match.tournament.matches)){
                var tournamentId = match.tournament.id;
                var category = match.tournament.category;
                delete category.tournaments[tournamentId];
                delete tournaments[tournamentId];
                var sport = category.sport;
                if (!Util.hasProperties(category.tournaments) && (!outrightCategories[sport.id] || !Util.hasProperties(outrightCategories[sport.id]) || !outrightCategories[sport.id][category.id] || !Util.hasProperties(outrightCategories[sport.id][category.id].outrights))){
                    var categoryId = category.id;
                    delete sport.categories[categoryId];
                    delete categories[categoryId];
                    if (!Util.hasProperties(sport.categories) && (!outrightCategories[sport.id] || !Util.hasProperties(outrightCategories[sport.id]))){
                        delete sports[sport.id];
                        delete matchesSports[sport.id];
                        delete sportsByCode[sport.id];
                    }
                }
                return true;
            }

            return false;
        };

        var addMatch = function(data){
            if (!data.sports && !data.outrights){
                return false;
            }

            if (data.markets){
                updateMarkets(data.markets);
            }
            var sc1 = false, sc2 = false;
            if (data.sports){
                sc1 = updateMatchSchedule(data.sports, marketTypes);
            }
            if (data.outrights){
                sc2 = updateOutrightSchedule(data.outrights);
            }
            if (data.market_groups){
                updateMarketGroups(data.market_groups);
            }
            if (data.featured_leagues){
                updateFeaturedLeagues(data.featured_leagues);
            }

            if (sc1 || sc2){
                scheduleChangedEvent.fire();
            }

            return sc1 || sc2;
        };

        var loadMatch = function(matchId, doneFn){
            var callback = {
                success: function(o){
                    var data = eval('(' + o.responseText + ')');
                    if (data){
                        addMatch(data);
                    }
                    doneFn();
                },
                failure: function(){
                    doneFn();
                },
                cache: false,
                timeout: 40000
            };
            YAHOO.util.Connect.asyncRequest('GET', '/bet/loadmatch.js?id=' + matchId, callback);

        };

        var loadMarket = function(marketId, doneFn){
            var callback = {
                success: function(o){
                    var data = eval('(' + o.responseText + ')');
                    if (data){
                        addMatch(data);
                    }
                    doneFn();
                },
                failure: function(){
                    doneFn();
                },
                cache: false,
                timeout: 40000
            };
            YAHOO.util.Connect.asyncRequest('GET', '/bet/loadmarket.js?id=' + marketId, callback);

        };

        var loadExtraSports = function(sports, doneFn){
            var callback = {
                success: function(o){
                    var data = eval('(' + o.responseText + ')');
                    if (data){
                        addMatch(data);
                    }
                    doneFn();
                },
                failure: function(){
                    doneFn();
                },
                cache: false,
                timeout: 40000
            };
            YAHOO.util.Connect.asyncRequest('GET', '/bet/loadsports.js?codes=' + sports.join(','), callback);
        };

        var getBetslipData = function(){
            var betList = ZAPNET.Events.getBetList();
            if (!betList || !betList.length){
                return false;
            }
            var root = {};
            var i, selId, sport, tournament, category, match, market, selection;
            for(i = 0; i < betList.length; i += 1){
                selId = betList[i];
                selection = ZAPNET.BetDB.selections[selId];
                market = selection.market;
                match = market.match;
                tournament = match.tournament;
                category = tournament.category;
                sport = category.sport;
                if (!root[sport.id]){
                    root[sport.id] = {
                        id: sport.id,
                        name: sport.name,
                        code: sport.code,
                        order: sport.order,
                        nrm: sport.nrm,
                        full: false,
                        markets: [],
                        'categories': {},
                        names: sport.names
                    };
                }
                if (!root[sport.id].categories[category.id]){
                    root[sport.id].categories[category.id] = {
                        id: category.id,
                        name: category.name,
                        code: category.code,
                        nrm: category.nrm,
                        'tournaments': {},
                        names: category.names
                    };
                }
                if (!root[sport.id].categories[category.id].tournaments[tournament.id]){
                    root[sport.id].categories[category.id].tournaments[tournament.id] = {
                        id: tournament.id,
                        name: tournament.name,
                        code: tournament.code,
                        order: tournament.order,
                        mj: tournament.mj,
                        nrm: tournament.nrm,
                        'matches': {},
                        names: tournament.names
                    };
                }
                if (!root[sport.id].categories[category.id].tournaments[tournament.id].matches[match.id]){
                    root[sport.id].categories[category.id].tournaments[tournament.id].matches[match.id] = {
                        id: match.id,
                        ts: match.ts,
                        status: match.status,
                        willgolive: match.willgolive,
                        live: match.live,
                        bet: match.bet,
                        mco: match.mco,
                        bets: match.bets,
                        neutral: match.neutral,
                        as: match.as,
                        pl: match.pl,
                        tvchn: match.tvchn,
                        name: match.name,
                        code: match.code,
                        nrm: match.nrm,
                        'markets': {},
                        mdata: match.mdata ? match.mdata : null,
                        full: false,
                    };
                }
                if (!root[sport.id].categories[category.id].tournaments[tournament.id].matches[match.id].markets[market.id]){
                    root[sport.id].categories[category.id].tournaments[tournament.id].matches[match.id].markets[market.id] = {
                        typeid: market.typeid,
                        special: market.special,
                        status: market.status,
                        stake: market.stake,
                        payout: market.payout,
                        selmc: market.selmc,
                        mincomb: market.mincomb,
                        max_payout: market.max_payout,
                        'selections': {}
                    };
                }
                root[sport.id].categories[category.id].tournaments[tournament.id].matches[match.id].markets[market.id].selections[selection.id] = {
                    n: selection.outcome,
                    o: selection.odds
                };
                if (!Util.inArray(market.type, root[sport.id].markets)){
                    root[sport.id].markets.push(market.type);
                }
            }

            var data = {
                'sports': root
            };
            return YAHOO.lang.JSON.stringify(data);
        };

        var clearDb = function(){
            reset();
        };

        var addPersistData = function(d){
            if (!loadPersistData){
                loadPersistData = [];
            }
            loadPersistData.push(d);
            if (loadPersistData.length > 10){
                console.log('PERSIST OVERLOAD');
                loadPersistData.shift();
            }
        };

        var load = function(cb, params){
            if (loadingBusy){
                if (loadQueue.length < 5 || cb.persist || cb.queue){
                    loadQueue.push({cb: cb, params: params});
                }
                return;
            }
            var loadingDone = function(){
                loadingBusy = false;
                if (loadQueue.length){
                    var next = loadQueue.shift();
                    load(next.cb, next.params);
                }
            };
            loadingBusy = true;
            var setEvents = !cb.skipEvents;
            var pairs = [];
            var eventParams = {}, betParams = false;
            if (setEvents){
                ZAPNET.Events.pause();
                if (ZAPNET.Events.isProductSubscribed('bets') || ZAPNET.Events.isProductSubscribed('account')){
                    params['aei'] = ZAPNET.Events.getLastEventId();
                }
                betParams = ZAPNET.Events.getBetList();
                if (betParams && betParams.length){
                    //params['b'] = betParams.join(',');
                }
            }
            try {
                var betslipDataStr = getBetslipData();
            } catch(e) {
            }
            Util.foreach(params, function(val, key){
                if (val === false){
                    return;
                }
                pairs.push(key + '=' + val);
                if (key == 't' || key == 'q' || key == 'b'){
                    return;
                }
                eventParams[key] = val;
            });
            var qStr = pairs.join('&');
            var callback = {
                success: function(o){
                    var data = eval('(' + o.responseText + ')');
                    if (data){
                        if (!('clearDb' in cb) || cb.clearDb){
                            clearDb();
                            if (loadPersistData && loadPersistData.length){
                                Util.foreach(loadPersistData, function(perDataStr){
                                    try{
                                        var perData = eval('(' + perDataStr + ')');
                                        addMatch(perData);
                                    }catch (e){
                                    }
                                });
                            }
                            if (betslipDataStr){
                                try{
                                    var betData = eval('(' + betslipDataStr + ')');
                                    addMatch(betData);
                                }catch (e){
                                }
                            }
                        }
                        if (cb.persist){
                            addPersistData(o.responseText);
                        }
                        try{
                            addMatch(data);
                        }catch (e){
                        }
                        if (data.moreschedule){
                            Util.foreach(data.moreschedule, function(sched){
                                addMatch(sched);
                            });
                        }
                        if (setEvents){
                            if (data.events){
                                ZAPNET.Events.setEvents(data.events);
                            }
                            if (data.evprm){
                                Util.foreach(data.evprm, function(val, key){
                                    eventParams[key] = val;
                                });
                            }
                            ZAPNET.Events.setFilterParams(eventParams);
                            if (data.le){
                                ZAPNET.Events.setLastEvent(data.le);
                            }
                        }
                    }
                    if (setEvents){
                        ZAPNET.Events.play();
                    }
                    if (cb.success){
                        cb.success(data);
                    }
                    if (cb.done){
                        cb.done();
                    }
                    loadingDone();
                },
                failure: function(){
                    if (setEvents){
                        ZAPNET.Events.play();
                    }
                    if (cb.failure){
                        cb.failure();
                    }
                    if (cb.done){
                        cb.done();
                    }
                    loadingDone();
                },
                cache: false,
                timeout: 60000
            };
            YAHOO.util.Connect.asyncRequest('GET', '/sports/load.js' + (qStr ? '?' + qStr : ''), callback);
        };

        var makeList = function(list){
            if (!list){
                return false;
            }
            if (YAHOO.lang.isArray(list)){
                return list.join(',');
            }
            return list + '';
        };

        var loadMatches = function(cb, matchIds, extraTags, options){
            var params = {
                o: 'm',
                i: makeList(matchIds)
            };
            if (extraTags){
                params['g'] = extraTags;
            }
            if (options){
                params['q'] = options;
            }
            load(cb, params);
        };
        var loadTournaments = function(cb, tourIds, markets, time, options){
            var params = {
                o: 't',
                i: makeList(tourIds),
                r: makeList(markets)
            };
            if (time){
                params['t'] = time;
            }
            if (options){
                params['q'] = options;
            }
            load(cb, params);
        };
        var loadCategories = function(cb, catIds, markets, time, options){
            var params = {
                o: 'c',
                i: makeList(catIds),
                r: makeList(markets)
            };
            if (time){
                params['t'] = time;
            }
            if (options){
                params['q'] = options;
            }
            load(cb, params);
        };
        var loadSports = function(cb, sportIds, markets, time, options){
            var params = {
                o: 's',
                i: makeList(sportIds),
                r: makeList(markets)
            };
            if (time){
                params['t'] = time;
            }
            if (options){
                params['q'] = options;
            }
            load(cb, params);
        };
        var loadOutrights = function(cb, outrightIds){
            var params = {
                o: 'o',
                i: makeList(outrightIds)
            };
            load(cb, params);
        };
        var loadBet = function(cb, matchCode, betCode){
            var params = {
                o: 'm',
                q: 'mc',
                i: makeList(matchCode),
                k: encodeURIComponent(betCode)
            };
            cb.skipEvents = true;
            cb.clearDb = false;
            load(cb, params);
        };

        var removeOutright = function(outrightId){
            if (!outrightsById[outrightId]){
                return false;
            }

            var outright = outrightsById[outrightId];
            var category = outright.category;
            var sport = category.sport;

            Util.foreach(outright.competitors, function(competitor, compId){
                delete outrightCompetitors[compId];
                delete outright.competitors[compId];
                outrightSelectionRemovedEvent.fire(compId);
            });

            delete outrightsById[outrightId];
            if (outrights && outrights[sport.id] && outrights[sport.id][outrightId]){
                delete outrights[sport.id][outrightId];
            }
            if (category.outrights && category.outrights[outrightId]){
                delete category.outrights[outrightId];
            }

            if (category.outrights && !Util.hasProperties(category.outrights)){
                delete category.outrights;
                delete outrightCategories[sport.id][category.id];
                if (!Util.hasProperties(outrightCategories[sport.id])){
                    if (!Util.hasProperties(sport.categories)){
                        delete sports[sport.id];
                    }
                }
                return true;
            }

            return false;
        };

        var addOutright = function(data){
            return updateOutrightSchedule(data);
        };

        var findSport = function(code){
            var id;
            for(id in sports){
                if (sports.hasOwnProperty(id)){
                    if (sports[id].code == code){
                        return id;
                    }
                }
            }

            return null;
        };

        var getMatches = function(sportId, live, matchStatus){
            if (sportId && !sports[sportId]){
                return [];
            }
            var sportList = sportId ? {id: sports[sportId]} : sports;
            var matchList = [];
            matchStatus = matchStatus || "open";
            Util.foreach(sportList, function(sport, sId){
                Util.foreach(sport.categories || {}, function(category){
                    Util.foreach(category.tournaments || {}, function(tournament){
                        Util.foreach(tournament.matches || {}, function(match, matchId){
                            if (true || !match.hidden){
                                if (live) {
                                    if ((match.status == "open" && match.willgolive) || match.status == "live"){
                                        if (matchStatus && matchStatus != "all"){
                                            if (match.status == matchStatus){
                                                matchList.push(matchId);
                                            }
                                        } else {
                                            matchList.push(matchId);
                                        }
                                    }
                                } else {
                                    if (matchStatus == "all" || match.status == matchStatus){
                                        matchList.push(matchId);
                                    }
                                }
                            }
                        });
                    });
                });
            });
            return matchList;
        };

        var getTopLeagueMatches = function(){
            var matchList = [];
            Util.foreach(sports, function(sport){
                Util.foreach(sport.categories || {}, function(category){
                    if (!Util.inArray(category.code, ['england', 'italy', 'spain', 'germany', 'france'])){
                        return;
                    }
                    Util.foreach(category.tournaments || {}, function(tournament){
                        if (tournament.order == 1){
                            Util.foreach(tournament.matches || {}, function(match, matchId){
                                if (match.status == "open"){
                                    matchList.push(matchId);
                                }
                            });
                        }
                    });
                });
            });
            matchList.sort(function(ai,bi){
                var a = matches[ai];
                var b = matches[bi];
                if (a.tournament.category.sport.order !== b.tournament.category.sport.order){
                    return a.tournament.category.sport.order - b.tournament.category.sport.order;
                }
                return a.ts - b.ts;
            });
            return matchList;
        };

        var clearMatchCache = function(){
            matchOrderCache = {};
            leagueOrderCache = {};
            liveMatchesCache = {};
        };

        var getMatchByCode = function(code){
            if (matchcodes[code]){
                return matchcodes[code];
            }
            code = parseInt(code, 10);
            if (matchcodes[code]){
                return matchcodes[code];
            }
            code = $P.str_pad(code, 4, '0', 'STR_PAD_LEFT');
            if (matchcodes[code]){
                return matchcodes[code];
            }
            return false;
        };

        var getBetSelection = function(matchId, betCode){
            return false;
            if (!matches[matchId]){
                return false;
            }
            var match = matches[matchId];


            return false;
        };

        var getExtraSelection = function(marketId, outcome, odds){
            if (!markets[marketId]){
                return false;
            }
            if (!extraSelections[marketId]){
                extraSelections[marketId] = {};
            }
            if (!extraSelections[marketId][outcome]){
                var selectionId = extraSelectionNextId++;
                var sel = {
                    id: selectionId,
                    odds: odds,
                    outcome: outcome,
                    isExtraSelection: true,
                    market: markets[marketId]
                };
                extraSelections[marketId][outcome] = sel;
                selections[selectionId] = sel;
            }

            return extraSelections[marketId][outcome].id;
        };

        var getMarketSelections = function(marketId){
            if (!markets[marketId]){
                return false;
            }

            var market = markets[marketId];
            var selections = [];
            Util.foreach(market.selections, function(selection){
                selections.push(selection);
            });
            selections.sort(function(a, b){
                return a.order - b.order;
            });

            return selections;
        };

        var getMarketTypeSelections = function(marketTypeId){
            if (!marketTypes[marketTypeId]){
                return false;
            }

            var marketType = marketTypes[marketTypeId];
            var selections = [];
            Util.foreach(marketType.selections, function(selection){
                selections.push(selection);
            });
            selections.sort(function(a, b){
                return a.outcome_order - b.outcome_order;
            });

            return selections;
        };

        var getMatchesByTime = function(sportId, live, liveStatus){

            // CACHE
            var cacheIndex = sportId ? sportId : 'ALL';
            if (matchOrderCache[cacheIndex]){
                return matchOrderCache[cacheIndex];
            }

            //var t1 = new Date().getTime();
            var matchList = getMatches(sportId, live, liveStatus);
            matchList.sort(function(a, b){
                var matchA = matches[a];
                var matchB = matches[b];

                var so = matchA.tournament.category.sport.order - matchB.tournament.category.sport.order;
                if (so) return so;

                if (matchA.status == 'live' && matchB.status != 'live'){
                    return -1;
                }
                if (matchB.status == 'live' && matchA.status != 'live'){
                    return 1;
                }
                if (matchA.status == 'live' && matchB.status == 'live'){
                    if (matchA.lmtime == 'FT' && matchB.lmtime != 'FT'){
                        return -1;
                    }
                    if (matchB.lmtime == 'FT' && matchA.lmtime != 'FT'){
                        return 1;
                    }
                }

                var ts = matchA.ts - matchB.ts;
                if (ts) return ts;

                var mc = matchA.code - matchB.code;
                if (mc) return mc;

                var cn = matchA.tournament.category.name == matchB.tournament.category.name ? 0 : (matchA.tournament.category.name > matchB.tournament.category.name ? 1 : -1);
                if (cn) return cn;

                var tn = matchA.tournament.name == matchB.tournament.name ? 0 : (matchA.tournament.name > matchB.tournament.name ? 1 : -1);
                if (tn) return tn;

                var mn = matchA.name == matchB.name ? 0 : (matchA.name > matchB.name ? 1 : -1);
                if (mn) return mn;

                return matchA.id - matchB.id;
            });

            //var t2 = new Date().getTime();
            //alert('Time to sort by time: ' + (t2-t1) + 'ms');
            return matchList;
        };

        var getMatchesByLeague = function(sportId){

            // CACHE
            var cacheIndex = sportId ? sportId : 'ALL';
            if (leagueOrderCache[cacheIndex]){
                return leagueOrderCache[cacheIndex];
            }

            var t1 = new Date().getTime();
            var matchList = getMatches(sportId);
            matchList.sort(function(a, b){
                var matchA = matches[a];
                var matchB = matches[b];

                var so = matchA.tournament.category.sport.order - matchB.tournament.category.sport.order;
                if (so) return so;

                var cn = matchA.tournament.category.name == matchB.tournament.category.name ? 0 : (matchA.tournament.category.name > matchB.tournament.category.name ? 1 : -1);
                if (cn) return cn;

                var tn = matchA.tournament.name == matchB.tournament.name ? 0 : (matchA.tournament.name > matchB.tournament.name ? 1 : -1);
                if (tn) return tn;

                if (matchA.status == 'live' && matchB.status != 'live'){
                    return -1;
                }
                if (matchB.status == 'live' && matchA.status != 'live'){
                    return 1;
                }

                var ts = matchA.ts - matchB.ts;
                if (ts) return ts;

                var mc = matchA.code - matchB.code;
                if (mc) return mc;

                var mn = matchA.name == matchB.name ? 0 : (matchA.name > matchB.name ? 1 : -1);
                if (mn) return mn;

                return 0;
            });

            var t2 = new Date().getTime();
            //alert('Time to sort by league: ' + (t2-t1) + 'ms');
            return matchList;
        };

        var getLiveMatches = function(sportId, liveStatus){
            //var t1 = new Date().getTime();
            var matchList = getMatches(sportId, true, liveStatus || "all");

            matchList.sort(function(a, b){
                var matchA = matches[a];
                var matchB = matches[b];

                if (matchA.status == 'live' && matchB.status != 'live'){
                    return -1;
                }
                if (matchB.status == 'live' && matchA.status != 'live'){
                    return 1;
                }
                if (matchA.status == 'live' && matchB.status == 'live'){
                    if (matchA.lmtime == 'FT' && matchB.lmtime != 'FT'){
                        return -1;
                    }
                    if (matchB.lmtime == 'FT' && matchA.lmtime != 'FT'){
                        return 1;
                    }
                }

                var ts = matchA.ts - matchB.ts;
                if (ts) return ts;

                var so = matchA.tournament.category.sport.order - matchB.tournament.category.sport.order;
                if (so) return so;

                var mc = matchA.code - matchB.code;
                if (mc) return mc;

                var cn = matchA.tournament.category.name == matchB.tournament.category.name ? 0 : (matchA.tournament.category.name > matchB.tournament.category.name ? 1 : -1);
                if (cn) return cn;

                var tn = matchA.tournament.name == matchB.tournament.name ? 0 : (matchA.tournament.name > matchB.tournament.name ? 1 : -1);
                if (tn) return tn;

                var mn = matchA.name == matchB.name ? 0 : (matchA.name > matchB.name ? 1 : -1);
                if (mn) return mn;

                return 0;
            });

            //var t2 = new Date().getTime();
            //alert('Time to sort live : ' + (t2-t1) + 'ms');
            return matchList;
        };

        var getLiveMatchesBySport = function(liveOnly, sortList, matchStatus){

            //var t1 = new Date().getTime();
            var matchList = getMatches(false, true, matchStatus);

            matchList.sort(function(a, b){
                var matchA = matches[a];
                var matchB = matches[b];

                if (matchA.status == 'live' && matchB.status != 'live'){
                    return -1;
                }
                if (matchB.status == 'live' && matchA.status != 'live'){
                    return 1;
                }
                if (matchA.status == 'live' && matchB.status == 'live'){
                    if (matchA.lmtime == 'FT' && matchB.lmtime != 'FT'){
                        return -1;
                    }
                    if (matchB.lmtime == 'FT' && matchA.lmtime != 'FT'){
                        return 1;
                    }
                }

                var ts = matchA.ts - matchB.ts;
                if (ts) return ts;

                var so = matchA.tournament.category.sport.order - matchB.tournament.category.sport.order;
                if (so) return so;

                var mc = matchA.code - matchB.code;
                if (mc) return mc;

                var cn = matchA.tournament.category.name == matchB.tournament.category.name ? 0 : (matchA.tournament.category.name > matchB.tournament.category.name ? 1 : -1);
                if (cn) return cn;

                var tn = matchA.tournament.name == matchB.tournament.name ? 0 : (matchA.tournament.name > matchB.tournament.name ? 1 : -1);
                if (tn) return tn;

                var mn = matchA.name == matchB.name ? 0 : (matchA.name > matchB.name ? 1 : -1);
                if (mn) return mn;

                return 0;
            });

            var i, m, sp, sportMatches = {}, sportList = [], preList = [], preSports = {};
            for(i = 0; i < matchList.length; i+= 1){
                m = matches[matchList[i]];
                if (!liveOnly || m.live){
                    sp = m.tournament.category.sport;
                    if (!sportMatches[sp.id]){
                        sportMatches[sp.id] = {
                            sport: sp,
                            matches: []
                        };
                    }
                    sportMatches[sp.id].matches.push(m);
                }
            }
            if (sortList){
                for(i = 0; i < sortList.length; i += 1){
                    sp = sortList[i];
                    if (sportMatches[sp] && !preSports[sp]){
                        preList.push(sportMatches[sp]);
                        preSports[sp] = sp;
                    }
                }
            }
            for(sp in sportMatches){
                if (sportMatches.hasOwnProperty(sp) && !preSports[sp]){
                    sportList.push(sportMatches[sp]);
                }
            }
            sportList.sort(function(a, b){
                var spA = a.sport;
                var spB = b.sport;

                if (spA.order != spB.order){
                    return spA.order - spB.order;
                }

                return spA.name > spB.name ? 1 : -1;
            });

            //var t2 = new Date().getTime();
            //alert('Time to sort live : ' + (t2-t1) + 'ms');
            return preList.concat(sportList);
        };

        var getLiveSports = function(){
            var sportList = [];
            Util.foreach(sports, function(sport){
                var nrLive = 0;
                var nrGoLive = 0;
                Util.foreach(sport.categories, function(category){
                    Util.foreach(category.tournaments, function(tournament){
                        Util.foreach(tournament.matches, function(match){
                            if (match.status == "live"){
                                nrLive += 1;
                            } else if (match.willgolive){
                                nrGoLive += 1;
                            }
                        });
                    });
                });
                if (nrLive || nrGoLive){
                    sportList.push({
                        id: sport.id,
                        order: sport.order,
                        name: sport.name,
                        code: sport.code,
                        live: nrLive,
                        golive: nrGoLive
                    });
                }
            });
            sportList.sort(function(a, b){
                return a.order - b.order;
            });

            return sportList;
        };

        var getDefaultSportId = function(){
            var sportList = [];
            Util.foreach(sports, function(sport, sportId){
                sportList.push(sport);
            });
            if (!sportList.length){
                return false;
            }
            sportList.sort(function(a, b){
                return a.order - b.order;
            });
            return sportList[0].id;
        };

        var getSportByCode = function(sportCode){
            var i, sport;
            for(i in sports){
                if (sports.hasOwnProperty(i)){
                    sport = sports[i];
                    if (sport.code == sportCode){
                        return sport;
                    }
                }
            }
            return false;
        };

        var hasMatches = function(sportId){
            if (!sportId){
                return Util.hasProperties(matches);
            }
            if (!sports[sportId]){
                return false;
            }

            var sport = sports[sportId];
            if (!sport.categories){
                return false;
            }
            var categoryId;
            for(categoryId in sport.categories){
                if (sport.categories.hasOwnProperty(categoryId)){
                    if (sport.categories[categoryId].tournaments && Util.hasProperties(sport.categories[categoryId].tournaments)){
                        return true;
                    }
                }
            }
            return false;
        };

        var hasLiveMatches = function(sportId){
            if (!sportId){
                var matchId, match;
                for(matchId in matches){
                    if (matches.hasOwnProperty(matchId)){
                        match = matches[matchId];
                        if (match.live || match.willgolive){
                            return true;
                        }
                    }
                }

                return false;
            }

            if (!sports[sportId]){
                return false;
            }

            var sport = sports[sportId];
            if (!sport.categories){
                return false;
            }
            var categoryId, tournamentId, matchId, match;
            for(categoryId in sport.categories){
                if (sport.categories.hasOwnProperty(categoryId)){
                    if (sport.categories[categoryId].tournaments && Util.hasProperties(sport.categories[categoryId].tournaments)){
                        for(tournamentId in sport.categories[categoryId].tournaments){
                            if (sport.categories[categoryId].tournaments[tournamentId]){
                                for(matchId in sport.categories[categoryId].tournaments[tournamentId].matches){
                                    match = sport.categories[categoryId].tournaments[tournamentId].matches[matchId];
                                    if (match.status == "live"){
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return false;
        };

        var hasPreGameMatches = function(sportId){
            if (!sportId){
                return false;
            }
            if (!sports[sportId]){
                return false;
            }

            var sport = sports[sportId];
            if (!sport.categories){
                return false;
            }
            var categoryId, tournamentId, matchId, match;
            for(categoryId in sport.categories){
                if (sport.categories.hasOwnProperty(categoryId)){
                    if (sport.categories[categoryId].tournaments && Util.hasProperties(sport.categories[categoryId].tournaments)){
                        for(tournamentId in sport.categories[categoryId].tournaments){
                            if (sport.categories[categoryId].tournaments[tournamentId]){
                                for(matchId in sport.categories[categoryId].tournaments[tournamentId].matches){
                                    match = sport.categories[categoryId].tournaments[tournamentId].matches[matchId];
                                    if (match.status == "open" && filterMatch(match)){
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return false;
        };

        var categoryHasPreGameMatches = function(categoryId){
            if (!categories[categoryId]){
                return false;
            }
            var tournamentId, matchId, match;
            if (categories[categoryId].tournaments && Util.hasProperties(categories[categoryId].tournaments)){
                for(tournamentId in categories[categoryId].tournaments){
                    if (categories[categoryId].tournaments[tournamentId]){
                        for(matchId in categories[categoryId].tournaments[tournamentId].matches){
                            match = categories[categoryId].tournaments[tournamentId].matches[matchId];
                            if (match.status == "open" && filterMatch(match)){
                                return true;
                            }
                        }
                    }
                }
            }

            return false;
        };

        var tournamentHasPreGameMatches = function(tournamentId){
            if (!tournaments[tournamentId]){
                return false;
            }
            var matchId, match;
            for(matchId in tournaments[tournamentId].matches){
                match = tournaments[tournamentId].matches[matchId];
                if (match.status == "open" && filterMatch(match)){
                    return true;
                }
            }

            return false;
        };

        var getTournamentMatches = function(tournamentId, status){
            var matchList = [];
            if (!tournaments[tournamentId]){
                return matchList;
            }
            var matchId, match;
            for(matchId in tournaments[tournamentId].matches){
                match = tournaments[tournamentId].matches[matchId];
                if (!status || match.status == status){
                    if (filterMatch(match)){
                        matchList.push(match);
                    }
                }
            }

            return matchList;
        };

        var getTournamentPregameMatches = function(tournamentId){
            return getTournamentMatches(tournamentId, "open");
        };

        var countTournamentMatches = function(tournamentId, status){
            var matchCount = 0;
            if (!tournaments[tournamentId]){
                return matchCount;
            }
            var matchId, match;
            for(matchId in tournaments[tournamentId].matches){
                match = tournaments[tournamentId].matches[matchId];
                if (!status || status == match.status){
                    if (filterMatch(match)){
                        matchCount += 1;
                    }
                }
            }

            return matchCount;
        };

        var countMatches = function(status){
            var count = 0;
            Util.foreach(matches, function(match){
                if ((!status || status == match.status) && filterMatch(match)){
                    count += 1;
                }
            });
            return count;
        };

        var getPregameMatchesOddsLessThan = function(limit){
            var matchList = [];
            var market, found;
            Util.foreach(matches, function(match){
                if (match.status == "open" && filterMatch(match)){
                    if (match.marketTypes && match.marketTypes[10] && match.marketTypes[10][''] && match.marketTypes[10]['']['market']){
                        market = match.marketTypes[10]['']['market'];
                        if (market.status == "open"){
                            found = false;
                            Util.foreach(market.selections, function(sel){
                                if (sel.odds && sel.odds <= limit){
                                    found = true;
                                }
                            });
                            if (found){
                                matchList.push(match);
                            }
                        }
                    }
                }
            });
            matchList.sort(function(matchA, matchB){
                var sportA = matchA.tournament.category.sport;
                var sportB = matchB.tournament.category.sport;
                if (sportA.id != sportB.id){
                    return sportA.order == sportB.order ? sportA.id - sportB.id : sportA.order - sportB.order;
                }
                var ts = matchA.ts - matchB.ts;
                if (ts) return ts;

                var mc = matchA.code - matchB.code;
                if (mc) return mc;

                var cn = matchA.tournament.category.name == matchB.tournament.category.name ? 0 : (matchA.tournament.category.name > matchB.tournament.category.name ? 1 : -1);
                if (cn) return cn;

                var tn = matchA.tournament.name == matchB.tournament.name ? 0 : (matchA.tournament.name > matchB.tournament.name ? 1 : -1);
                if (tn) return tn;

                var mn = matchA.name == matchB.name ? 0 : (matchA.name > matchB.name ? 1 : -1);
                if (mn) return mn;

                return 0;
            });

            return matchList;
        };

        var countInPlayMatches = function(){
            var matchId, match, count = 0;
            for(matchId in matches){
                if (matches.hasOwnProperty(matchId)){
                    match = matches[matchId];
                    if (match.live){
                        count += 1;
                    }
                }
            }

            return count;
        };

        var getAllSports = function(){
            var liveSports = {};
            var matchSports = {};
            var outrightSports = {};
            var hasLive = false;
            var hasMatch = false;
            var hasOutright = false;
            var tournament;
            sportsLoop:
            for(var sportId in sports){
                for(var categoryId in sports[sportId].categories){
                    for(var tournamentId in sports[sportId].categories[categoryId].tournaments){
                        tournament = sports[sportId].categories[categoryId].tournaments[tournamentId];
                        if ('nrl' in tournament && 'nrp' in tournament){
                            if ('nrl' in tournament && tournament.nrl > 0){
                                liveSports[sportId] = sportId;
                                hasLive = true;
                            }
                            if ('nrp' in tournament && tournament.nrp > 0){
                                matchSports[sportId] = sportId;
                                hasMatch = true;
                            }
                            if (liveSports[sportId] && matchSports[sportId]){
                                continue sportsLoop;
                            }
                        } else {
                            for (var matchId in tournament.matches){
                                var match = sports[sportId].categories[categoryId].tournaments[tournamentId].matches[matchId];
                                if (match.status == "live"){
                                    liveSports[sportId] = sportId;
                                    hasLive = true;
                                } else {
                                    matchSports[sportId] = sportId;
                                    hasMatch = true;
                                }
                                if (liveSports[sportId] && matchSports[sportId]){
                                    continue sportsLoop;
                                }
                            }
                        }
                    }
                }
            }
            for(var sportId in outrights){
                hasOutright = true;
                outrightSports[sportId] = sportId;
            }

            return {
                live: hasLive ? liveSports : false,
                match: hasMatch ? matchSports : false,
                outright: hasOutright ? outrightSports : false
            };
        };

        var hasOutrights = function(sportId){
            if (!sportId){
                return Util.hasProperties(outrights);
            }
            if (!sports[sportId]){
                return false;
            }

            return outrightCategories[sportId] && Util.hasProperties(outrightCategories[sportId]);
            var sport = sports[sportId];
            if (!sport.categories){
                return false;
            }
            var categoryId;
            for(categoryId in sport.categories){
                if (sport.categories.hasOwnProperty(categoryId)){
                    if (sport.categories[categoryId].outrights && Util.hasProperties(sport.categories[categoryId].outrights)){
                        return true;
                    }
                }
            }
            return false;
        };

        var getDefaultMatchSportId = function(){
            var sportList = [];
            Util.foreach(sports, function(sport){
                if (hasMatches(sport.id)){
                    sportList.push(sport);
                }
            });
            if (!sportList.length){
                return false;
            }
            sportList.sort(function(a, b){
                return a.order - b.order;
            });
            return sportList[0].id;
        };

        var getDefaultOutrightSportId = function(){
            var sportList = [];
            Util.foreach(sports, function(sport){
                if (hasOutrights(sport.id)){
                    sportList.push(sport);
                }
            });
            if (!sportList.length){
                return false;
            }
            sportList.sort(function(a, b){
                return a.order - b.order;
            });
            return sportList[0].id;
        };

        var getMarketInfoByType = function(typeId){
            var i, marketType;
            for(i in marketTypes){
                if (marketTypes.hasOwnProperty(i)){
                    marketType = marketTypes[i];
                    if (marketType.market_type == typeId){
                        return marketType;
                    }
                }
            }
            return false;
        };

        var updateMatch = function(matchId){
            var match = matches[matchId];
            match.bets = match.bet && (match.status === 'open' || (match.status === 'live' && match.livebet === 'started'));
        };

        var reloadBetData = function(){
            beforeReloadEvent.fire();
            ZAPNET.Events.pause();
            ZAPNET.LoadBetDb({
                success: function(o){
                    ZAPNET_BET_DATA = eval('(' + o.responseText + ')');
                    init();
                    ZAPNET.Events.play();
                    reloadEvent.fire();
                },
                failure: function(o){
                    setTimeout(function(){
                        window.location.reload();
                    }, 5000);
                },
                cache: false,
                timeout: 900000
            });
        };

        var getGoals = function(score){
            if (!score){
                return false;
            }
            var goals = score.split(':');
            if (goals.length !== 2){
                return false;
            }
            var goal1 = parseInt(goals[0]);
            var goal2 = parseInt(goals[1]);
            if (goal1 !== 0 && !goal1){
                return false;
            }
            if (goal2 !== 0 && !goal2){
                return false;
            }
            return [goal1, goal2];
        };

        var getGoalTeam = function(score1, score2){
            var goals1 = getGoals(score1);
            var goals2 = getGoals(score2);
            if (!goals1 || !goals2){
                return false;
            }
            if (+goals1[0] + 1 == goals2[0] && goals1[1] == goals2[1]){
                return 'home';
            }
            if (+goals1[1] + 1 == goals2[1] && goals1[0] == goals2[0]){
                return 'away';
            }
            return false;
        };

        var isReady = function(){
            return ready;
        };

        var setReady = function(r){
            var prevReady = ready;
            ready = r;
            if (ready && !prevReady){
                ZAPNET.BetDBReadyEvent.fire();
            }
        };

        var handleEvents = function(events){

            var updatedMatchMap = {};
            var updateOutrightMap = {};
            var updateMatchMarkets = {};
            var updateMatchMarketStatus = {};
            var oddsChanges = false;
            var outrightOddsChanges = false;
            var outrightChanges = false;
            var matchCache = false;
            var scheduleChange = false;
            var matchRemoved = false;
            var goalEvents = [];

            var completeEvents = function(){
                if (ready){
                    finishEvents();
                } else {
                    ready = true;
                    ZAPNET.BetDBReadyEvent.fire();
                }

                updatedMatchMap = {};
                updateOutrightMap = {};
                updateMatchMarkets = {};
                updateMatchMarketStatus = {};
                oddsChanges = false;
                outrightOddsChanges = false;
                outrightChanges = false;
                matchCache = false;
                scheduleChange = false;
                matchRemoved = false;
                goalEvents = [];
            };

            var doProcessEvent = function(event, silent){
                var id, data, oldValue, newValue, sc, selId;
                if (event.o == 'selection'){
                    id = event.oid;
                    newValue = event.v;
                    if (selections[event.oid]){
                        oldValue = selections[id].odds;
                        if (newValue != oldValue && !silent){
                            matchOddsChangeEvent.fire({
                                id: id,
                                old: oldValue,
                                odds: newValue
                            });
                            oddsChanges = true;
                        }
                        selections[event.oid].odds = newValue;
                    }
                } else if (event.o == 'outright'){
                    id = event.oid;
                    if (event.t == 'close'){
                        sc = removeOutright(id);
                        if (sc){
                            scheduleChange = true;
                        }
                        if (updateOutrightMap[id]){
                            delete updateOutrightMap[id];
                        }
                        outrightChanges = true;
                    } else if (event.t == 'open' || event.t == 'info'){
                        data = eval('(' + event.d + ')');
                        sc = addOutright(data);
                        if (sc){
                            scheduleChange = true;
                        }
                        updateOutrightMap[id] = id;
                        outrightChanges = true;
                    } else {
                        newValue = event.v;
                        if (outrightCompetitors[id]){
                            oldValue = outrightCompetitors[id].odds;
                            if (newValue != oldValue && !silent){
                                outrightOddsChangeEvent.fire({
                                    id: id,
                                    old: oldValue,
                                    odds: newValue
                                });
                                outrightOddsChanges = true;
                            }
                            outrightCompetitors[id].odds = newValue;
                        }
                    }
                } else if (event.o == 'match') {
                    id = event.oid;
                    if (event.t == 'close'){
                        sc = removeMatch(id);
                        if (sc){
                            scheduleChange = true;
                        }
                        if (!silent){
                            matchRemovedEvent.fire(id);
                            matchRemoved = true;
                        }
                        matchCache = true;
                        if (updatedMatchMap[id]){
                            delete updatedMatchMap[id];
                        }
                    } else if (event.t == 'open'){
                        id = event.oid;
                        data = eval('(' + event.d + ')');
                        sc = addMatch(data);
                        if (sc){
                            scheduleChange = true;
                        }
                        matchCache = true;
                        updateMatch(id);
                        updatedMatchMap[id] = id;
                        matchStatusChangeEvent.fire(id);
                    } else if (event.t == 'info' && matches[id]){
                        data = eval('(' + event.d + ')');
                        if (matches[id].status != data.status ||
                            matches[id].live != (data.status === 'live') ||
                            (data.ts && matches[id].ts != data.ts)){
                                matchCache = true;
                        }

                        var matchStatusChanged = false;
                        if (matches[id].status != data.status){
                            matchStatusChanged = true;
                        }

                        if ('name' in data){
                            matches[id].status = data.status;
                            matches[id].live = data.status === 'live';
                            matches[id].bet = data.bet;
                            matches[id].willgolive = data.willgolive == '1' || data.willgolive === true;
                            matches[id].bets = data.bets;
                            matches[id].neutral = data.neutral;
                            matches[id].tvchn = data.tvchn;
                            matches[id].as = data.as;
                            matches[id].pl = data.pl;
                            // matches[id].name = data.name;
                            // matches[id].competitors = data.competitors;
                            matches[id].code = data.code;
                        }

                        if ('lbs' in data){
                            if (matches[id].livebet != data.lbs){
                                matchStatusChanged = true;
                            }
                            matches[id].livebet = data.lbs;
                        }
                        if (data.ts){
                            matches[id].ts = data.ts;
                        }
                        if (data.sc){
                            if (matches[id].score != data.sc){
                                var goalTeam = getGoalTeam(matches[id].score, data.sc);
                                if (goalTeam){
                                    goalEvents.push({
                                        matchId: id,
                                        team: goalTeam
                                    });
                                }
                            }
                            matches[id].score = data.sc;
                        }
                        if (data.st){
                            matches[id].lstatus = data.st;
                        }
                        if ('mco' in data){
                            if (data.mco != matches[id].mco){
                                matches[id].mco = data.mco;
                                Util.foreach(matches[id].markets, function(market){
                                    if (+data.mco && +data.mco > 0){
                                        market.mincomb = Math.min(market.selmc, +data.mco);
                                    } else {
                                        market.mincomb = market.selmc;
                                    }
                                });
                            }
                        }
                        if ('ss' in data){
                            matches[id].setscores = data.ss;
                        }
                        if (data.mt){
                            matches[id].lmtime = data.mt;
                        }
                        if (data.dt){
                            matches[id].ldata = eval('(' + data.dt + ')');
                        }
                        if (data.crd){
                            matches[id].livecards = data.crd;
                            matches[id].cards = getMatchCards(data.crd);
                        }
                        if (data.crn){
                            matches[id].livecorners = data.crn;
                            matches[id].corners = getMatchCorners(data.crn);
                        }
                        updateMatch(id);
                        updatedMatchMap[id] = id;
                        if (matchStatusChanged){
                            matchStatusChangeEvent.fire(id);
                        }
                    }
                } else if (event.o == 'market'){
                    if (markets[event.oid] && markets[event.oid].match){
                        id = markets[event.oid].match.id;
                        // updatedMatchMap[id] = id;
                        if (markets[event.oid].type){
                            if (!updateMatchMarkets[id]){
                                updateMatchMarkets[id] = {};
                            }
                            updateMatchMarkets[id][markets[event.oid].type] = markets[event.oid].type;
                        }
                        if (Util.inArray(event.t, ['close', 'suspend', 'open'])){
                            updateMatchMarketStatus[id] = id;
                        }
                    }
                    if (event.t == 'close'){
                        if (markets[event.oid]){
                            removeMarket(event.oid);
                        }
                    } else if (event.t == 'suspend'){
                        if (markets[event.oid]){
                            suspendMarket(event.oid);
                        } else {
                            data = event.d ? eval('(' + event.d + ')') : false;
                            if (data){
                                if (data.match_id && matches[data.match_id]){
                                    if (!addMarket(data)){
                                        //Util.error('No match to add suspended market ' + event.oid);
                                    }
                                    updatedMatchMap[data.match_id] = data.match_id;
                                }
                            } else {
                                //Util.error('No market for suspend: ' + event.oid);
                            }
                        }
                    } else if (event.t == 'open'){
                        data = eval('(' + event.d + ')');
                        if (markets[event.oid]){
                            openMarket(event.oid);
                        } else if (data) {
                            if (data.match_id && matches[data.match_id]){
                                if (!addMarket(data)){
                                    //Util.error('No match to add open market ' + event.oid);
                                }
                                updatedMatchMap[data.match_id] = data.match_id;
                                updateMatchMarketStatus[data.match_id] = data.match_id;
                            }
                        } else {
                            //Util.error('No market for open: ' + event.oid);
                        }
                        if (markets[event.oid]){
                            if (markets[event.oid].status !== 'open'){
                                suspendMarket(event.oid);
                            }
                        }
                    } else if (event.t == 'change'){
                        data = eval('(' + event.d + ')');
                        if (!markets[event.oid]){
                            //Util.error('No market for update: ' + event.oid);
                            return;
                        }
                        if (!data.odds || !data.status){
                            //Util.error('No data for update: ' + event.oid);
                            return;
                        }
                        for(selId in data.odds){
                            if (!data.odds.hasOwnProperty(selId)){
                                continue;
                            }
                            newValue = data.odds[selId];
                            if (selections[selId]){
                                oldValue = selections[selId].odds;
                                if (newValue >= 1 && oldValue >= 1 && newValue != oldValue){
                                    selections[selId].dir = newValue > oldValue ? 'up' : 'down';
                                }
                                if (newValue != oldValue && !silent){
                                    matchOddsChangeEvent.fire({
                                        id: selId,
                                        old: oldValue,
                                        odds: newValue
                                    });
                                    oddsChanges = true;
                                }
                                selections[selId].odds = newValue;
                            }
                        }
                        if (data.status != markets[event.oid].status){
                            updateMatchMarketStatus[id] = id;
                        }
                        if (data.status == 'open'){
                            openMarket(event.oid);
                        } else if (data.status == 'suspended'){
                            suspendMarket(event.oid);
                        }
                    }
                } else if (event.o == 'coupon'){
                    if (!silent){
                        reloadBetData();
                    }
                }

                ZAPNET_LAST_ODDS_EVENT_ID_PROCESSED = event.id;
            };

            var postponedEventAction = function(fn, delay){
                delay = delay || 3500;
                if (ZAPNET.Events.isActive()){
                    setTimeout(function(){
                        if (ZAPNET.Events.isActive()){
                            fn();
                        }
                    }, delay);
                }
            };

            var finishEvents = function(doneFn){
                if (matchCache){
                    clearMatchCache();
                }

                var updatedMatchesList = $P.array_values(updatedMatchMap);
                var updatedMatches = [];
                Util.foreach(updatedMatchesList, function(matchId){
                    if (ZAPNET.BetDB.matches[matchId]){
                        updatedMatches.push(matchId);
                    }
                });
                Util.foreach(updateMatchMarkets, function(match, matchId){
                    Util.foreach(match, function(marketType){
                        matchMarketChangeEvent.fire([matchId, marketType]);
                    });
                });
                Util.foreach(updateMatchMarketStatus, function(matchId, matchId){
                    matchMarketStatusChangeEvent.fire(matchId);
                });
                if (updatedMatches.length){
                    Util.foreach(updatedMatches, function(matchId){
                        matchChangedEvent.fire(matchId);
                    });
                    if (oddsChanges){
                        postponedEventAction(function(){
                            matchesChangedEvent.fire(updatedMatches);
                            Util.foreach(goalEvents, function(goal){
                                scoreChangedEvent.fire(goal);
                            });
                        });
                    } else {
                        matchesChangedEvent.fire(updatedMatches);
                        Util.foreach(goalEvents, function(goal){
                            scoreChangedEvent.fire(goal);
                        });
                    }
                } else if (matchRemoved){
                    if (oddsChanges){
                        postponedEventAction(function(){
                            matchesRemovedEvent.fire();
                            matchesChangedEvent.fire([]);
                        });
                    } else {
                        matchesRemovedEvent.fire();
                        matchesChangedEvent.fire([]);
                    }
                }

                var updateOutrights = $P.array_values(updateOutrightMap);
                if (updateOutrights.length){
                    Util.foreach(updateOutrights, function(outrightId){
                        //outrightChangedEvent.fire(outrightId);
                    });
                    if (outrightOddsChanges){
                        postponedEventAction(function(){
                            //outrightsChangedEvent.fire(updateOutrights);
                        });
                    } else {
                        //outrightsChangedEvent.fire(updateOutrights);
                    }
                }

                if (scheduleChange){
                    scheduleChangedEvent.fire();
                }

                if (doneFn){
                    doneFn();
                }
            };

            var processBetEvent = function(event){
                betEvent.fire(event);
            };

            var processInfoEvent = function(event){
                infoEvent.fire(event);
            };

            var processEvent = function(event){
                doProcessEvent(event, !ready);
            };

            if (events){
                Util.foreach(events, function(event){
                    processEvent(event);
                });
                completeEvents();
                return;
            }

            if (Util.countProperties(sports) || Util.countProperties(outrights)){
                ZAPNET.Events.subscribe(processEvent, 'sports');
            } else {
                scheduleChangedEvent.subscribe(function(){
                    ZAPNET.Events.subscribe(processEvent, 'sports');
                });
            }
            ZAPNET.Events.subscribe(processBetEvent, 'bets');
            ZAPNET.Events.subscribe(processInfoEvent, 'account');
            ZAPNET.Events.eventsProcessed.subscribe(completeEvents);
        };

        function startEvents(){
            if (window.ZAPNET_BET_DATA && window.ZAPNET_BET_DATA.events && window.ZAPNET_BET_DATA.events.length){
                handleEvents(ZAPNET_BET_DATA);
                schedule.last_event_id = ZAPNET_BET_DATA.events[ZAPNET_BET_DATA.events.length - 1].id;
            }
            ZAPNET.Events.setLastEvent(schedule.last_event_id);
            handleEvents();
        };

        function reInit(){
            init();
            startEvents();
        };

        init(noStart);
        if (!noStart){
            startEvents();
        }

        DB = {
            sports: sports,
            sportsByCode: sportsByCode,
            matchesSports: matchesSports,
            categories: categories,
            tournaments: tournaments,
            matches: matches,
            matchcodes: matchcodes,
            markets: markets,
            marketTypes: marketTypes,
            marketTypesById: marketTypesById,
            marketGroups: marketGroups,
            featuredLeagues: featuredLeagues,
            selections: selections,
            outrights: outrights,
            outrightsById: outrightsById,
            outrightCategories: outrightCategories,
            outrightCompetitors: outrightCompetitors,
            outrightIncompatibles: outrightIncompatibles,
            outrightCompatibles: outrightCompatibles,
            pools: pools,

            addMarket: addMarket,
            removeMarket: removeMarket,
            suspendMarket: suspendMarket,
            openMarket: openMarket,
            updateMatch: updateMatch,
            removeMatch: removeMatch,
            addMatches: addMatch,
            findSport: findSport,
            isReady: isReady,
            setReady: setReady,
            reInit: reInit,

            setTimeLimit: setTimeLimit,
            getTimeLimit: getTimeLimit,
            getMatchesByTime: getMatchesByTime,
            getMatchesByLeague: getMatchesByLeague,
            getTopLeagueMatches: getTopLeagueMatches,
            getLiveMatches: getLiveMatches,
            getLiveMatchesBySport: getLiveMatchesBySport,
            getLiveSports: getLiveSports,
            hasLiveMatches: hasLiveMatches,
            countInPlayMatches: countInPlayMatches,
            getDefaultSportId: getDefaultSportId,
            getDefaultMatchSportId: getDefaultMatchSportId,
            getDefaultOutrightSportId: getDefaultOutrightSportId,
            getSportByCode: getSportByCode,
            getMarketInfoByType: getMarketInfoByType,
            hasMatches: hasMatches,
            getAllSports: getAllSports,
            hasPreGameMatches: hasPreGameMatches,
            categoryHasPreGameMatches: categoryHasPreGameMatches,
            tournamentHasPreGameMatches: tournamentHasPreGameMatches,
            getTournamentPregameMatches: getTournamentPregameMatches,
            getTournamentMatches: getTournamentMatches,
            countTournamentMatches: countTournamentMatches,
            getPregameMatchesOddsLessThan: getPregameMatchesOddsLessThan,
            countMatches: countMatches,
            hasOutrights: hasOutrights,
            getMarketSelections: getMarketSelections,
            getMarketTypeSelections: getMarketTypeSelections,
            getMatchByCode: getMatchByCode,
            getBetSelection: getBetSelection,
            getExtraSelection: getExtraSelection,
            getFeaturedLeagues: getFeaturedLeagues,


            loadMatch: loadMatch,
            loadMarket: loadMarket,
            loadExtraSports: loadExtraSports,

            loadMatches: loadMatches,
            loadTournaments: loadTournaments,
            loadCategories: loadCategories,
            loadSports: loadSports,
            loadOutrights: loadOutrights,
            loadBet: loadBet,
            load: load,
            addPersistData: addPersistData,
            clear: clearDb,

            matchOddsChangeEvent: matchOddsChangeEvent,
            outrightOddsChangeEvent: outrightOddsChangeEvent,
            matchRemovedEvent: matchRemovedEvent,
            matchStatusChangeEvent: matchStatusChangeEvent,
            matchesRemovedEvent: matchesRemovedEvent,
            selectionRemovedEvent: selectionRemovedEvent,
            matchesChangedEvent: matchesChangedEvent,
            matchChangedEvent: matchChangedEvent,
            outrightsChangedEvent: outrightsChangedEvent,
            outrightChangedEvent: outrightChangedEvent,
            outrightSelectionRemovedEvent: outrightSelectionRemovedEvent,
            scheduleChangedEvent: scheduleChangedEvent,
            scoreChangedEvent: scoreChangedEvent,
            matchMarketChangeEvent: matchMarketChangeEvent,
            matchMarketStatusChangeEvent: matchMarketStatusChangeEvent,
            reloadEvent: reloadEvent,
            beforeReloadEvent: beforeReloadEvent,
            betEvent: betEvent,
            infoEvent: infoEvent,
            errorEvent: errorEvent
        };

        return DB;
    };

    ZAPNET.LoadBetMarkets = function(cb){
        cb();
        return;
        YAHOO.util.Connect.asyncRequest('GET', '/bet/markets.js', {
            success: function(o){
                ZAPNET_BET_SCHEDULE_MARKETS = eval('(' + o.responseText + ')');
                cb();
            },
            failure: function(){
                cb();
            }
        });
    };

    ZAPNET.LoadBetDbMarkets = function(callback, url){
        YAHOO.util.Connect.asyncRequest('GET', '/bet/markets.js', callback);
    };

    ZAPNET.LoadBetDb = function(callback, url){
        if (!url){
            if (ZAPNET_CONSTANTS.BET_DB_REMOTE){
                url = ZAPNET_CONSTANTS.BET_DB_REMOTE + 'bet/rodds.js';
                callback = {
                    success: callback.success,
                    failure: function(){
                        setTimeout(function(){
                            ZAPNET.LoadBetDb(callback, '/bet/odds.js');
                        }, 1000);
                    },
                    cache: false
                };
            } else {
                url = '/bet/odds.js';
            }
        }
        ZAPNET.LoadBetMarkets(function(){
            YAHOO.util.Connect.asyncRequest('GET', url, callback);
        });
    };

    ZAPNET.LoadBetDbPart = function(callback, url){
        if (!url){
            if (ZAPNET_CONSTANTS.BET_DB_REMOTE){
                url = ZAPNET_CONSTANTS.BET_DB_REMOTE + 'bet/roddspart.js';
                callback = {
                    success: callback.success,
                    failure: function(){
                        ZAPNET.LoadBetDb(callback, '/bet/oddspart.js');
                    },
                    cache: false
                };
            } else {
                url = '/bet/oddspart.js';
            }
        }
        ZAPNET.LoadBetMarkets(function(){
            YAHOO.util.Connect.asyncRequest('GET', url, callback);
        });
    };

    ZAPNET.LoadBetDbSports = function(callback, url){
        if (!url){
            url = '/bet/sports.js';
            /*
            if (ZAPNET_CONSTANTS.BET_DB_REMOTE){
                url = ZAPNET_CONSTANTS.BET_DB_REMOTE + 'bet/sports.js';
                callback = {
                    success: callback.success,
                    failure: function(){
                        setTimeout(function(){
                            ZAPNET.LoadBetDb(callback, '/bet/sports.js');
                        }, 1000);
                    },
                    cache: false
                };
            } else {

            }
            */
        }
        YAHOO.util.Connect.asyncRequest('GET', url, callback);
    };

    ZAPNET.LoadBetSchedule = function(callback, url){
        if (!url){
            if (ZAPNET_CONSTANTS.BET_DB_REMOTE){
                url = ZAPNET_CONSTANTS.BET_DB_REMOTE + 'bet/rsched.js';
                callback = {
                    success: callback.success,
                    failure: function(){
                        ZAPNET.LoadBetDb(callback, '/bet/sched.js');
                    },
                    cache: false
                };
            } else {
                url = '/bet/sched.js';
            }
        }
        YAHOO.util.Connect.asyncRequest('GET', url, callback);
    };

    ZAPNET.LoadActivePools = function(callback, url){
        if (!url){
               url = '/terminal/getpools.js';
        }
        YAHOO.util.Connect.asyncRequest('GET', url, callback);
    };
}());

