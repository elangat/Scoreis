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
        MARKET_FIRST_TO_SCORE = '41',
        MARKET_GOALS_HOME = '48',
        MARKET_GOALS_AWAY = '49',
        MARKET_WINNING_MARGIN = '222',

        LIVE_MARKET_MATCH_ODDS = '2002',
        LIVE_MARKET_WHICH_TEAM_HAS_KICKOFF = '1002',
        LIVE_MARKET_DOUBLE_CHANCE = '1027',
        LIVE_MARKET_TOTALS_UNDER_OVER = '2005',
        LIVE_MARKET_GOAL_NO_GOAL = '1030',
        LIVE_MARKET_CORRECT_SCORE = '1026',
        LIVE_MARKET_TOTAL_GOALS = '1140',
        LIVE_MARKET_UNDER_OVER = '1139',
        LIVE_MARKET_MATCHBET_TOTALS = '1183',
        LIVE_MARKET_MATCH_ODDS_2WAY = '1037',
        LIVE_MARKET_MATCH_ODDS_2WAY_TENNIS = '1010',
        LIVE_MARKET_REST_OF_MATCH = '1004',
        LIVE_MARKET_NEXT_GOAL = '1013';

    ZAPNET.COUPONS = {};

    var CouponHandlers = {
        marketHeaders: function(markets, rowTop, rowBot, skipSep){
            var sep = false, i = rowTop.cells.length, j = rowBot.cells.length;
            Util.foreach(markets, function(market){
                if (!skipSep && sep){
                    var sepEl = rowTop.insertCell(i++);
                    sepEl.rowSpan = 2;
                    sepEl.innerHTML = '&nbsp;';
                    Dom.addClass(sepEl, 'spacing');
                }
                sep = true;
                var nameEl = rowTop.insertCell(i++);
                nameEl.innerHTML = market.name;
                var outcomes = market.headers ? market.headers : market.outcomes;
                nameEl.colSpan = outcomes.length;
                var tdN = 0;
                Util.foreach(outcomes, function(outcome){
                    var outEl = rowBot.insertCell(j++);
                    outEl.innerHTML = outcome;
                    if (tdN){
                        Dom.addClass(outEl, 'sel-in');
                    }
                    tdN += 1;
                });
            });
        },
        getNoOfferElement: function(){
            var selectionEl = Util.div('selection selection-na');
            selectionEl.innerHTML = 'N/O';
            return selectionEl;
        },
        getEmptyElement: function(){
            var selectionEl = Util.div('selection selection-na selection-hd');
            selectionEl.innerHTML = '&nbsp;';
            return selectionEl;
        },
        getSelectionElement: function(match, market, outcome, special){
            if (!match.marketTypes[market]){
                return CouponHandlers.getNoOfferElement();
            }
            special = special || '';
            if (!match.marketTypes[market][special]){
                return CouponHandlers.getNoOfferElement();
            }
            if (match.marketTypes[market][special].market.status != 'open'){
                return CouponHandlers.getNoOfferElement();
            }
            var selection = match.marketTypes[market][special].outcomes[outcome];
            if (!selection){
                return CouponHandlers.getNoOfferElement();
            }
            var selectionEl = Util.div('selection');
            if (ZAPNET.selectedSelections[selection.id]){
                Dom.addClass(selectionEl, 'selection-on');
            }
            Dom.setAttribute(selectionEl, 'sid', selection.id);
            var odds = selection.odds >= 10 && selection.odds == Math.round(selection.odds) ? Math.round(selection.odds) : selection.odds;
            if (odds > 1){
                selectionEl.innerHTML = '<div class="bg"></div><div class="sel-odds">' + odds + '</div>';
            } else {
                selectionEl.innerHTML = 'N/O';
                Dom.addClass(selectionEl, 'selection-na');
            }
            return selectionEl;
        },
        getMarketId: function(match, market){
            if (!market){
                return null;
            }
            var isLive = false;
            if (match.live){
                isLive = true;
            } else {
                if (market.altid && match.marketTypes[market.altid]){
                    return market.altid;
                } else if (match.marketTypes[market.id]) {
                    return market.id;
                }
                var now = Util.getServerTime();
                if (now > match.ts){
                    isLive = true;
                }
            }
            if (isLive && (market.liveid || market.altliveid)){
                if (match.marketTypes[market.liveid]){
                    return market.liveid;
                } else if (market.altliveid && match.marketTypes[market.altliveid]){
                    return market.altliveid;
                }
            }
            return null;
        },
        getSubMarketId: function(match, market){
            if (!market){
                return null;
            }
            if (match.live && market.liveperiodid){
                return market.liveperiodid[match.lstatus] ? market.liveperiodid[match.lstatus] : null;
            }
            return match.live && market.liveid ? market.liveid : (market.altid && match.marketTypes[market.altid] ? market.altid : market.id);
        },
        marketSelections: function(row, match, markets){
            var sep = false, outEl, i = row.cells.length, special, vSpecial = false;
            Util.foreach(markets, function(market){
                var marketId = CouponHandlers.getMarketId(match, market);
                if (sep){
                    var sepEl = row.insertCell(i++);
                    sepEl.innerHTML = '&nbsp;';
                    Dom.addClass(sepEl, 'spacing');
                }
                sep = true;
                if (market.headers && market.headers.length > market.outcomes.length){
                    outEl = row.insertCell(i++);
                    Dom.addClass(outEl, 'handicap');
                    special = '&nbsp;';
                    if (match.marketTypes[marketId]){
                        var specials = CouponHandlers.getTopMarkets(match.marketTypes[marketId], 1);
                        if (specials.length){
                            special = specials[0];
                            vSpecial = specials[0];
                        }
                    }
                    outEl.innerHTML = special;
                }
                Util.foreach(market.outcomes, function(outcome){
                    var outEl = row.insertCell(i++);
                    var special = vSpecial !== false ? vSpecial : (market.special ? market.special : null);
                    outEl.appendChild(CouponHandlers.getSelectionElement(match, marketId, outcome, special));
                });
            });
        },
        formatLiveScore: function(match){
            var gamescore = ' ' + (match.ldata && match.ldata.gamescore ? match.ldata.gamescore : '');
            var tiebreak = match.ldata && match.ldata.tiebreak && match.ldata.tiebreak == 'true' ? '(TB)': '';
            if (!match.setscores || match.setscores == match.score){
                return match.lmtime + ' ' + match.score + gamescore + tiebreak;
            }
            var html = [];
            //var lmTime = match.lsrc == 3 && match.lmtime == 'HT' ? '<span style="font-size: 80%">2ND HALF<br/>BETS</span>' : match.lmtime;
            var lmTime = match.lmtime;
            html.push('<div style="height: 12px; line-height: 12px;">');
            html.push(lmTime, ' ', match.score, gamescore + tiebreak);
            html.push('</div><div style="height: 12px; line-height: 12px;">');
            html.push(match.setscores);
            html.push('</div>');
            return html.join('');
        },
        formatLiveSetScores: function(match){
            var gamescore = ' ' + (match.ldata && match.ldata.gamescore ? match.ldata.gamescore : '');
            var tiebreak = match.ldata && match.ldata.tiebreak && match.ldata.tiebreak == 'true' ? '(TB)': '';
            if (match.gamescore && (!match.setscores || match.setscores == match.score)){
                return gamescore + '' + tiebreak;
            }
            if (match.ldata && match.setscores && match.ldata.gamescore){
                return match.setscores + ' /' + gamescore + tiebreak;
            }
            if (!match.setscores){
                return '';
            }
            return match.setscores;
        },
        formatLiveTime: function(match){
            // Deprecated - Half-Time betting feature
            // var lmTime = match.lsrc == 3 && match.lmtime == 'HT' ? '<span style="font-size: 80%">'+Util.t("2ND HALF")+'<br/>'+Util.t("BETS")+'</span>' : match.lmtime;
            var lmTime = match.lmtime;
            return lmTime + ' <span class="score">' + match.score + '</span>';
        },
        formatLiveData: function(match, side){
            var team = side == 0 ? 'home' : 'away';
            var html = [];
            if (match.cards[team].yellow > 0){
                html.push('<span class="yellow">', match.cards[team].yellow, '</span>');
            }
            if (match.cards[team].yellowred > 0){
                html.push('<span class="yellowred">', match.cards[team].yellowred, '</span>');
            }
            if (match.cards[team].red > 0){
                html.push('<span class="red">', match.cards[team].red, '</span>');
            }
            if (match.corners[team] > 0){
                html.push('<span class="corner">', match.corners[team], '</span>');
            }

            return html.join('');
        },
        setupInfo: function(match, fav, code, league, status/*, leagueColor*/, time, setscores){
            if (!match){
                return;
            }
            code.innerHTML = match.code;
            Dom.addClass(code, 'info');
            if (league){
                Dom.addClass(league, 'info league-code flag-bg flag-bg-' + match.tournament.category.code);
                Dom.setAttribute(league, 'title', match.tournament.category.name + ' :: ' + $P.trim(match.tournament.name.replace(match.tournament.category.name, '')));
                league.innerHTML = match.tournament.code ? match.tournament.code : match.tournament.category.name.substr(0, 5);
            }
            Dom.addClass(time, 'time info');
            Dom.addClass(fav, 'fav-match');
//            leagueColor.innerHTML = '&nbsp;';
            status.innerHTML = '&nbsp;';
            fav.innerHTML = '&nbsp;&nbsp;';
            if (match.neutral){
                status.innerHTML = '<img src="' + window.ZAPNET_RESOURCE_LOCATION + '/images/kiosk/neutral.png" title="Neutral Ground" style="cursor: pointer;"/>';
            }
//            var colors;
//            if (match.tournament.color){
//                colors = match.tournament.color.split('/');
//                if (colors.length == 2){
//                    Dom.setStyle(leagueColor, 'background-color', colors[1]);
//                    Dom.setStyle(league, 'border-left-color', colors[1]);
//                } else {
//                    Dom.setStyle(league, 'border-left', '0');
//                }
//            } else {
//                Dom.setStyle(league, 'border-left', '0');
//            }
            if (match.status == 'live'){
                if (setscores){
                    time.innerHTML = CouponHandlers.formatLiveTime(match);
                    setscores.innerHTML = CouponHandlers.formatLiveSetScores(match);
                } else {
                    time.innerHTML = CouponHandlers.formatLiveScore(match);
                }
                if (match.livebet == 'started'){
                    status.className = 'status betstart';
                } else {
                    status.className = 'status betstop';
                }
            } else {
                if(ZAPNET_BETBUILDER && ZAPNET.Smartstream && ZAPNET_BBMATCHES[match.id]){
                    status.className = 'status hasbetbuilder';
                } else if (match.willgolive){
                    status.className = 'status willgolive';
                } else {
                    status.className = 'status';
                }
                time.innerHTML = $P.date('d/m H:i', match.ts);
            }
        },
        getTopMarkets: function(markets, nrMarkets){
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
                for(sId in markets[special].market.selections){
                    if (markets[special].market.selections.hasOwnProperty(sId)){
                        sel = markets[special].market.selections[sId];
                        if (sel.odds >= 1){
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
        isMarketOpen: function(market, suspendok){
            var sp, special, sId, odds, status, match;
            for(sp in market){
                if (market.hasOwnProperty(sp)){
                    special = market[sp];
                    if (special.market && special.market.status && special.market.selections){
                        status = special.market.status;
                        if (status == 'open' || (suspendok && status == 'suspended')){
                            match = special.market.match;
                            if ((match.live && !special.market.live) || (!match.live && special.market.live)){
                                return false;
                            }
                            for(sId in special.market.selections){
                                if (special.market.selections.hasOwnProperty(sId) && special.market.selections[sId].odds){
                                    odds = parseFloat(special.market.selections[sId].odds);
                                    if (odds && odds > 1){
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return false;
        },
        setupMoreMarkets: function(el, match, markets){
            var curMarkets = 0, i, market, marketId, remMarkets, allMarkets = 0;
            if (match.nrm){
                allMarkets = match.nrm;
            } else {
                Util.foreach(match.marketTypes, function(matchMarket){
                    if (CouponHandlers.isMarketOpen(matchMarket)){
                        allMarkets += 1;
                    }
                });
            }
            for(i = 0; i < markets.length; i += 1){
                market = markets[i];
                marketId = match.live && market.liveid ? market.liveid : market.id;
                if (match.marketTypes[marketId] && CouponHandlers.isMarketOpen(match.marketTypes[marketId])){
                    curMarkets += 1;
                }
            }
            remMarkets = Math.max(0, allMarkets - curMarkets);
            if (remMarkets == 0){
                Dom.removeClass(el, 'more-markets');
            } else {
                Dom.addClass(el, 'more-markets');
                el.innerHTML = '+' + remMarkets;
            }
        },
        showMatchTeamName: function(match, side){
            if (match.status == 'live'){
                var html = [], i;
                var team = side == 0 ? 'home' : 'away';
                var reds;
//                html.push('<span class="live-team live-team-');
//                html.push(side);
//                html.push('">');
                if (side == 0){
                    reds = +match.cards[team].red + +match.cards[team].yellowred;
                    if (reds > 0){
                        for(i = 0; i < reds; i += 1){
                            html.push('<img src="');
                            html.push(window.ZAPNET_RESOURCE_LOCATION);
                            html.push('/images/kiosk/redcard.png"/>&nbsp;');
                        }
                    }
                    if (match.ldata && match.ldata.server && match.ldata.server == '1'){
                        html.push('<img src="');
                        html.push(window.ZAPNET_RESOURCE_LOCATION);
                        html.push('/images/kiosk/tennis_server.png"/>&nbsp;');
                    }
                }
//                html.push('<span class="live-team-name">');
                var teamName = match.competitors[side];
                try{
                    if (match.live){
                        teamName = teamName.replace(/\s*\([0-9+]+\)/, '');
                    }
                }catch (e){}
                html.push(teamName);
//                html.push('</span>');
                if (side == 1){
                    if (match.ldata && match.ldata.server && match.ldata.server == '2'){
                        html.push('&nbsp;<img src="');
                        html.push(window.ZAPNET_RESOURCE_LOCATION);
                        html.push('/images/kiosk/tennis_server.png"/>');
                    }
                    reds = +match.cards[team].red + +match.cards[team].yellowred;
                    if (reds > 0){
                        for(i = 0; i < reds; i += 1){
                            html.push('&nbsp;<img src="');
                            html.push(window.ZAPNET_RESOURCE_LOCATION);
                            html.push('/images/kiosk/redcard.png"/>');
                        }
                    }
                }
//                html.push('<span class="live-team-info"><span class="live-team-card live-team-yellow cards-');
//                html.push(match.cards[team].yellow);
//                html.push('">');
//                html.push(match.cards[team].yellow);
//                html.push('</span><span class="live-team-card live-team-yellowred cards-');
//                html.push(match.cards[team].yellowred);
//                html.push('">');
//                html.push(match.cards[team].yellowred);
//                html.push('</span><span class="live-team-card live-team-red cards-');
//                html.push(match.cards[team].red);
//                html.push('">');
//                html.push(match.cards[team].red);
//                html.push('</span>');
//                html.push('</span></span>');
                return html.join('');
            } else {
                return match.competitors[side];
            }
        },
        showMatchName: function(match){
            if (match.status == 'live'){
                return CouponHandlers.showMatchTeamName(match, 0) + ' v ' + CouponHandlers.showMatchTeamName(match, 1);
            } else {
                return match.competitors[0] + ' v ' + match.competitors[1];
            }
        },
        showLiveMatchScore: function(match){
            if (match.status == 'live'){
                var morescores = match.setscores && match.setscores != match.score ? match.setscores : '';
                var tiebreak = match.ldata && match.ldata.tiebreak && match.ldata.tiebreak == 'true' ? '(TB)': '';
                var gamescore = match.ldata && match.ldata.gamescore ? '/' + match.ldata.gamescore : '';
                morescores += gamescore;
                morescores += tiebreak;
                if (morescores){
                    morescores = '&nbsp;&nbsp;(' + morescores + ')';
                }
                return CouponHandlers.showMatchTeamName(match, 0) + ' <span class="live-score">' + match.score + '</span> ' + CouponHandlers.showMatchTeamName(match, 1) + morescores;
            } else {
                return CouponHandlers.showMatchName(match);
            }
        },

        StandardCoupon: {
            header: function(table, markets){
                var i = 0, j = 0,
                    thead = Util.elem('thead', 'coupon-head'),
                    rowTop = table.insertRow(table.rows.length),
                    rowBot = table.insertRow(table.rows.length),
                    fav = rowTop.insertCell(i++),
                    code = rowTop.insertCell(i++),
                    league = rowTop.insertCell(i++),
                    status = rowTop.insertCell(i++),
                    moremkts = rowTop.insertCell(i++),
                    time = rowTop.insertCell(i++),
                    matchCell = rowTop.insertCell(i++);

                rowTop.parentNode.removeChild(rowTop);
                rowBot.parentNode.removeChild(rowBot);
                thead.appendChild(rowTop);
                thead.appendChild(rowBot);
                table.appendChild(thead);
                fav.innerHTML = 'F';
                moremkts.innerHTML = '&nbsp;';
                code.innerHTML = Util.t('Code');
                league.innerHTML = Util.t('League');
                status.innerHTML = Util.t('Info');
                time.innerHTML = Util.t('Kick Off');
                matchCell.innerHTML = Util.t('Match');
                fav.rowSpan = 2;
                moremkts.rowSpan = 2;
                code.rowSpan = 2;
                league.rowSpan = 2;
                //league.colSpan = 2;
                status.rowSpan = 2;
                time.rowSpan = 2;
                matchCell.rowSpan = 2;

                Dom.addClass(code, 'info');
                Dom.addClass(league, 'league-header');
                Dom.addClass(time, 'time-header');

                CouponHandlers.marketHeaders(markets, rowTop, rowBot);

                Dom.addClass(rowTop, 'coupon-head coupon-head-top');
                Dom.addClass(rowBot, 'coupon-head');

                return thead;
            },
            row: function(table, match, markets){
                var i = 0,
                    row = table.insertRow(table.rows.length),
                    fav = row.insertCell(i++),
                    code = row.insertCell(i++),
                    //leagueColor = row.insertCell(i++),
                    league = row.insertCell(i++),
                    status = row.insertCell(i++),
                    moremkts = row.insertCell(i++),
                    time = row.insertCell(i++),
                    matchCell = row.insertCell(i++);

                CouponHandlers.setupInfo(match, fav, code, league, status/*, leagueColor*/, time);
                matchCell.innerHTML = CouponHandlers.showMatchName(match);
                Dom.addClass(matchCell, 'match-teams');
                Dom.addClass(matchCell, 'match-teams-match');

                CouponHandlers.setupMoreMarkets(moremkts, match, markets);
                CouponHandlers.marketSelections(row, match, markets);

                //Dom.addClass(row, 'r' + ((table.rows.length - 1) % 2));

                return row;
            }
        },
        MatchOddsCoupon: {
            header: function(table, markets){
                var i = 0, j = 0,
                    thead = Util.elem('thead', 'coupon-head'),
                    rowTop = table.insertRow(table.rows.length),
                    rowBot = table.insertRow(table.rows.length),
                    fav = rowTop.insertCell(i++),
                    code = rowTop.insertCell(i++),
                    league = rowTop.insertCell(i++),
                    status = rowTop.insertCell(i++),
                    moremkts = rowTop.insertCell(i++),
                    time = rowTop.insertCell(i++),
                    out1 = rowTop.insertCell(i++),
                    homeTeam = rowTop.insertCell(i++),
                    outX = rowTop.insertCell(i++),
                    awayTeam = rowTop.insertCell(i++),
                    out2 = rowTop.insertCell(i++),
                    sepEl = markets.length > 1 ? rowTop.insertCell(i++) : null;

                rowTop.parentNode.removeChild(rowTop);
                rowBot.parentNode.removeChild(rowBot);
                thead.appendChild(rowTop);
                thead.appendChild(rowBot);
                table.appendChild(thead);
                fav.innerHTML = 'F';
                moremkts.innerHTML = '&nbsp;';
                code.innerHTML = Util.t('Code');
                league.innerHTML = Util.t('League');
                status.innerHTML = Util.t('Info');
                time.innerHTML = Util.t('Kick Off');
                homeTeam.innerHTML = Util.t('Home Team');
                awayTeam.innerHTML = Util.t('Away Team');
                out1.innerHTML = '1';
                outX.innerHTML = 'X';
                out2.innerHTML = '2';
                if (sepEl){
                    sepEl.innerHTML = '&nbsp;';
                    sepEl.rowSpan = 2;
                    Dom.addClass(sepEl, 'spacing');
                }
                fav.rowSpan = 2;
                moremkts.rowSpan = 2;
                code.rowSpan = 2;
                league.rowSpan = 2;
                //league.colSpan = 2;
                status.rowSpan = 2;
                time.rowSpan = 2;
                homeTeam.rowSpan = 2;
                awayTeam.rowSpan = 2;
                out1.rowSpan = 2;
                outX.rowSpan = 2;
                out2.rowSpan = 2;

                Dom.addClass(code, 'info');
                Dom.addClass(league, 'league-header');
                Dom.addClass(time, 'time-header');

                markets = markets.slice(1);

                CouponHandlers.marketHeaders(markets, rowTop, rowBot);

                Dom.addClass(rowTop, 'coupon-head coupon-head-top');
                Dom.addClass(rowBot, 'coupon-head');

                return thead;
            },
            row: function(table, match, markets){
                var i = 0,
                    row = table.insertRow(table.rows.length),
                    fav = row.insertCell(i++),
                    code = row.insertCell(i++),
                    //leagueColor = row.insertCell(i++),
                    league = row.insertCell(i++),
                    status = row.insertCell(i++),
                    moremkts = row.insertCell(i++),
                    time = row.insertCell(i++),
                    out1 = row.insertCell(i++),
                    homeTeam = row.insertCell(i++),
                    outX = row.insertCell(i++),
                    awayTeam = row.insertCell(i++),
                    out2 = row.insertCell(i++),
                    sepEl = markets.length > 1 ? row.insertCell(i++) : null,
                    market, colors;

                row.parentNode.removeChild(row);
                $('tbody', table, true).appendChild(row);
                CouponHandlers.setupInfo(match, fav, code, league, status/*, leagueColor*/, time);
                homeTeam.innerHTML = CouponHandlers.showMatchTeamName(match, 0);
                awayTeam.innerHTML = CouponHandlers.showMatchTeamName(match, 1);
                Dom.addClass(homeTeam, 'match-teams');
                Dom.addClass(awayTeam, 'match-teams');
                Dom.addClass(homeTeam, 'match-teams-home');
                Dom.addClass(awayTeam, 'match-teams-away');
                CouponHandlers.setupMoreMarkets(moremkts, match, markets);

                if (sepEl){
                    sepEl.innerHTML = '&nbsp;';
                    Dom.addClass(sepEl, 'spacing');
                }

                market = markets[0];
                var marketId = CouponHandlers.getMarketId(match, market);

                out1.appendChild(CouponHandlers.getSelectionElement(match, marketId, '1'));
                outX.appendChild(CouponHandlers.getSelectionElement(match, marketId, 'X'));
                out2.appendChild(CouponHandlers.getSelectionElement(match, marketId, '2'));

                markets = markets.slice(1);
                CouponHandlers.marketSelections(row, match, markets);

                //Dom.addClass(row, 'r' + ((table.rows.length - 1) % 2));

                return row;
            }
        },
        MatchOddsTwoWayCoupon: {
            header: function(table, markets, headers){
                var i = 0, j = 0,
                    thead = Util.elem('thead', 'coupon-head'),
                    rowTop = table.insertRow(table.rows.length),
                    rowBot = table.insertRow(table.rows.length),
                    fav = rowTop.insertCell(i++),
                    code = rowTop.insertCell(i++),
                    league = rowTop.insertCell(i++),
                    status = rowTop.insertCell(i++),
                    moremkts = rowTop.insertCell(i++),
                    time = rowTop.insertCell(i++),
                    out1 = rowTop.insertCell(i++),
                    homeTeam = rowTop.insertCell(i++),
                    awayTeam = rowTop.insertCell(i++),
                    out2 = rowTop.insertCell(i++),
                    sepEl = markets.length > 1 ? rowTop.insertCell(i++) : null;

                rowTop.parentNode.removeChild(rowTop);
                rowBot.parentNode.removeChild(rowBot);
                thead.appendChild(rowTop);
                thead.appendChild(rowBot);
                table.appendChild(thead);
                fav.innerHTML = 'F';
                moremkts.innerHTML = '&nbsp;';
                code.innerHTML = Util.t('Code');
                league.innerHTML = Util.t('League');
                status.innerHTML = Util.t('Info');
                time.innerHTML = Util.t('Kick Off');
                homeTeam.innerHTML = headers ? headers[1] : Util.t('Home Team');
                awayTeam.innerHTML = headers ? headers[2] : Util.t('Home Team');
                out1.innerHTML = '1';
                out2.innerHTML = '2';
                if (sepEl){
                    sepEl.innerHTML = '&nbsp;';
                    sepEl.rowSpan = 2;
                    Dom.addClass(sepEl, 'spacing');
                }
                fav.rowSpan = 2;
                moremkts.rowSpan = 2;
                code.rowSpan = 2;
                league.rowSpan = 2;
                //league.colSpan = 2;
                status.rowSpan = 2;
                time.rowSpan = 2;
                homeTeam.rowSpan = 2;
                awayTeam.rowSpan = 2;
                out1.rowSpan = 2;
                out2.rowSpan = 2;

                Dom.addClass(code, 'info');
                Dom.addClass(league, 'league-header');
                Dom.addClass(time, 'time-header');

                markets = markets.slice(1);

                CouponHandlers.marketHeaders(markets, rowTop, rowBot);

                Dom.addClass(rowTop, 'coupon-head coupon-head-top');
                Dom.addClass(rowBot, 'coupon-head');

                return thead;
            },
            row: function(table, match, markets){
                var i = 0,
                    row = table.insertRow(table.rows.length),
                    fav = row.insertCell(i++),
                    code = row.insertCell(i++),
                    //leagueColor = row.insertCell(i++),
                    league = row.insertCell(i++),
                    status = row.insertCell(i++),
                    moremkts = row.insertCell(i++),
                    time = row.insertCell(i++),
                    out1 = row.insertCell(i++),
                    homeTeam = row.insertCell(i++),
                    awayTeam = row.insertCell(i++),
                    out2 = row.insertCell(i++),
                    sepEl = markets.length > 1 ? row.insertCell(i++) : null,
                    market, colors;

                CouponHandlers.setupInfo(match, fav, code, league, status/*, leagueColor*/, time);
                homeTeam.innerHTML = CouponHandlers.showMatchTeamName(match, 0);
                awayTeam.innerHTML = CouponHandlers.showMatchTeamName(match, 1);
                Dom.addClass(homeTeam, 'match-teams');
                Dom.addClass(awayTeam, 'match-teams');
                Dom.addClass(homeTeam, 'match-teams-home');
                Dom.addClass(awayTeam, 'match-teams-away');
                CouponHandlers.setupMoreMarkets(moremkts, match, markets);

                if (sepEl){
                    sepEl.innerHTML = '&nbsp;';
                    Dom.addClass(sepEl, 'spacing');
                }

                market = markets[0];
                var marketId = CouponHandlers.getMarketId(match, market);
                out1.appendChild(CouponHandlers.getSelectionElement(match, marketId, '1'));
                out2.appendChild(CouponHandlers.getSelectionElement(match, marketId, '2'));

                markets = markets.slice(1);
                CouponHandlers.marketSelections(row, match, markets);

                //Dom.addClass(row, 'r' + ((table.rows.length - 1) % 2));

                return row;
            }
        },
        LiveBettingCoupon: {
            header: function(table, markets){
                var i = 0, j = 0,
                    thead = Util.elem('thead', 'coupon-head'),
                    rowTop = table.insertRow(table.rows.length),
                    rowBot = table.insertRow(table.rows.length),
                    code = rowTop.insertCell(i++),
                    sport = rowTop.insertCell(i++),
                    league = rowTop.insertCell(i++),
                    status = rowTop.insertCell(i++),
                    moremkts = rowTop.insertCell(i++),
                    time = rowTop.insertCell(i++),
                    matchCell = rowTop.insertCell(i++);

                rowTop.parentNode.removeChild(rowTop);
                rowBot.parentNode.removeChild(rowBot);
                thead.appendChild(rowTop);
                thead.appendChild(rowBot);
                table.appendChild(thead);
                code.innerHTML = Util.t('Code');
                moremkts.innerHTML = '&nbsp;';
                sport.innerHTML = Util.t('Sport');
                league.innerHTML = Util.t('League');
                status.innerHTML = Util.t('Status');
                time.innerHTML = Util.t('Kick Off');
                matchCell.innerHTML = Util.t('Match');
                matchCell.colSpan = 2;
                sport.rowSpan = 2;
                code.rowSpan = 2;
                moremkts.rowSpan = 2;
                league.rowSpan = 2;
                //league.colSpan = 2;
                status.rowSpan = 2;
                time.rowSpan = 2;
                matchCell.rowSpan = 2;

                Dom.addClass(code, 'info');
                Dom.addClass(league, 'league-header');
                Dom.addClass(time, 'time-header');

                var submarkets = [];
                Util.foreach(markets, function(market){
                    var k, nrMarkets = market.markets ? market.markets : 1;
                    for(k = 0 ; k < nrMarkets; k ++){
                        submarkets.push(market);
                    }
                });

                CouponHandlers.marketHeaders(submarkets, rowTop, rowBot);

                Dom.addClass(rowTop, 'coupon-head coupon-head-top');
                Dom.addClass(rowBot, 'coupon-head');

                return thead;
            },
            row: function(table, match, markets, refRow){
                var r1 = 0, r2 = 0, row2,
                    tbody = Util.elem('tbody'),
                    row = table.insertRow(table.rows.length),
                    code = row.insertCell(r1++),
                    sport = row.insertCell(r1++),
                    //leagueColor = row.insertCell(r1++),
                    league = row.insertCell(r1++),
                    status = row.insertCell(r1++),
                    moremkts = row.insertCell(r1++),
                    time = row.insertCell(r1++),
                    matchCell = row.insertCell(r1++),
                    market, colors, period, setScoresCell, periodCell;

                var sportCode = match.tournament.category.sport.code;
                var secondRow = !refRow && match.live;
                row.parentNode.removeChild(row);
                tbody.appendChild(row);
                table.appendChild(tbody);
                if (secondRow){
                    row2 = table.insertRow(table.rows.length);
                    row2.parentNode.removeChild(row2)
                    tbody.appendChild(row2);
                    setScoresCell = row2.insertCell(r2++);
                    periodCell = row2.insertCell(r2++);
                    setScoresCell.innerHTML = '&nbsp;';
                    periodCell.innerHTML = '&nbsp;';
                    Dom.addClass(periodCell, 'bet-period');
                    Dom.addClass(setScoresCell, 'setscores');
                    code.rowSpan = 2;
                    sport.rowSpan = 2;
                    league.rowSpan = 2;
                    status.rowSpan = 2;
                    moremkts.rowSpan = 2;
                    time.rowSpan = 2;
                    if (sportCode == 'soccer' && match.lstatus == '1p'){
                        period = 'HT';
                    } else if (sportCode == 'soccer' && $P.in_array(match.lstatus, ['awaiting_ot', 'ot', '1p_ot', 'ot_ht', '2p_ot'])){
                        period = 'OT';
                    } else if ($P.in_array(sportCode, ['tennis', 'volleyball']) && $P.in_array(match.lstatus, ['1set', '2set', '3set', '4set', '5set'])){
                        period = 'Set ' + match.lstatus.substr(0, 1);
                    } else if (sportCode == 'volleyball' && $P.in_array(match.lstatus, ['pause1', 'pause2', 'pause3', 'pause4'])){
                        period = 'Set ' + (match.lstatus.substr(5) + 1);
                    }
                    if (period){
                        periodCell.innerHTML = period;
                    }
                    Dom.addClass(row, 'l1');
                    Dom.addClass(row2, 'l2');
                }

                CouponHandlers.setupInfo(match, Util.div(), code, league, status/*, leagueColor*/, time, setScoresCell);
                matchCell.innerHTML = CouponHandlers.showMatchName(match);
                matchCell.colSpan = 2;
                Dom.addClass(matchCell, 'match-teams');
                Dom.addClass(matchCell, 'match-teams-match');
                Dom.addClass(sport, 'sport sport-' + match.tournament.category.sport.code);
                sport.innerHTML = match.tournament.category.sport.name;
                CouponHandlers.setupMoreMarkets(moremkts, match, markets);

                var mSep = false;
                Util.foreach(markets, function(market){
                    var sportmarket = market.sportmarkets[match.tournament.category.sport.code] ? market.sportmarkets[match.tournament.category.sport.code] : false;
                    var marketId = CouponHandlers.getMarketId(match, sportmarket);
                    var marketId2 = secondRow && sportmarket && sportmarket.submarkets ? CouponHandlers.getSubMarketId(match, sportmarket.submarkets) : false;
                    if (mSep){
                        var sepEl = row.insertCell(r1++);
                        sepEl.innerHTML = '&nbsp;';
                        Dom.addClass(sepEl, 'spacing');
                        if (secondRow){
                            sepEl.rowSpan = 2;
                        }
                    }
                    mSep = true;
                    var matchMarket = match.marketTypes[marketId];
                    var matchMarket2 = marketId2 ? match.marketTypes[marketId2] : false;
                    var submarkets = 0;
                    if (matchMarket || (secondRow && matchMarket2)){
                        var sep = false;
                        var marketList = CouponHandlers.getTopMarkets(matchMarket, markets.markets);
                        var marketList2 = secondRow && matchMarket2 ? CouponHandlers.getTopMarkets(matchMarket2, markets.markets) : false;
                        if (secondRow && matchMarket2 && market.name == 'Match Odds' && sportCode == 'tennis'){
                            marketList2 = [match.lstatus.substr(0, 1)];
                        }
                        if (!marketList || !marketList.length){
                            marketList = [''];
                        }
                        Util.foreach(marketList, function(special, mi){
                            if (submarkets >= market.markets){
                                return;
                            }
                            if (sep){
                                var sepEl = row.insertCell(r1++);
                                sepEl.innerHTML = '&nbsp;';
                                Dom.addClass(sepEl, 'spacing');
                                if (secondRow){
                                    sepEl.rowSpan = 2;
                                }
                            }
                            sep = true;
                            if (market.hasSpecial){
                                var outEl = row.insertCell(r1++);
                                outEl.innerHTML = Util.formatHandicap(special);
                                Dom.addClass(outEl, 'handicap');
                            }
                            var selCount = 0, j;
                            var outcomes = match.live && market.liveoutcomes ? market.liveoutcomes : market.outcomes;
                            Util.foreach(outcomes, function(outcome){
                                outEl = row.insertCell(r1++);
                                if (outcome == 'X' && marketId == LIVE_MARKET_WHICH_TEAM_HAS_KICKOFF){
                                    outEl.innerHTML = '<div class="market-cell-label">KICK<br/>OFF</div>';
                                } else {
                                    outEl.appendChild(CouponHandlers.getSelectionElement(match, marketId, outcome, special));
                                }
                                selCount += 1;
                            });
                            for(j = selCount; j < outcomes.length; j += 1){
                                outEl = row.insertCell(r1++);
                                outEl.appendChild(CouponHandlers.getNoOfferElement());
                            }
                            if (secondRow){
                                var special2 = marketList2 && marketList2[mi] ? marketList2[mi] : false;
                                if (market.hasSpecial){
                                    outEl = row2.insertCell(r2++);
                                    outEl.innerHTML = special2 ? Util.formatHandicap(special2) : '&nbsp;';
                                    Dom.addClass(outEl, 'handicap');
                                }
                                selCount = 0;
                                var outcomes = match.live && market.liveoutcomes ? market.liveoutcomes : market.outcomes;
                                if (marketId2 && special !== false){
                                    Util.foreach(outcomes, function(outcome){
                                        outEl = row2.insertCell(r2++);
                                        if (market.name == 'Next Goal' && sportCode == 'tennis' && outcome == 'X'){
                                            outEl.innerHTML = special2 ?  'Game ' + special2 : '&nbsp;';
                                            Dom.addClass(outEl, 'game-special');
                                        } else {
                                            outEl.appendChild(CouponHandlers.getSelectionElement(match, marketId2, outcome, special2));
                                        }
                                        selCount += 1;
                                    });
                                }
                                for(j = selCount; j < outcomes.length; j += 1){
                                    outEl = row2.insertCell(r2++);
                                    outEl.appendChild(CouponHandlers.getEmptyElement());
                                }
                            }
                            submarkets += 1;
                        });
                    }
                    while(submarkets < market.markets){
                        if (sep){
                            sepEl = row.insertCell(r1++);
                            sepEl.innerHTML = '&nbsp;';
                            Dom.addClass(sepEl, 'spacing');
                            if (secondRow){
                                sepEl.rowSpan = 2;
                            }
                        }
                        sep = true;
                        if (market.hasSpecial){
                            var outEl = row.insertCell(r1++);
                            outEl.innerHTML = '&nbsp;';
                            Dom.addClass(outEl, 'handicap');
                            if (secondRow){
                                outEl.rowSpan = 2;
                            }
                        }
                        Util.foreach(market.outcomes, function(outcome){
                            outEl = row.insertCell(r1++);
                            outEl.innerHTML = '<div class="selection selection-na selection-hd"></div>';
                            if (secondRow){
                                outEl = row2.insertCell(r2++);
                                outEl.innerHTML = '<div class="selection selection-na selection-hd"></div>';
                            }
                            //outEl.appendChild(CouponHandlers.getNoOfferElement());
                        });
                        submarkets += 1;
                    }
                });

                return tbody;
            }
        },
        LiveTVCoupon: {
            header: function(table, markets){
                var i = 0, j = 0,
                    thead = Util.elem('thead', 'coupon-head'),
                    rowTop = table.insertRow(table.rows.length),
                    rowBot = table.insertRow(table.rows.length),
                    left = rowTop.insertCell(i++);
                    //out1 = rowTop.insertCell(i++),
                    //homeTeam = rowTop.insertCell(i++),
                    //outX = rowTop.insertCell(i++),
                    //awayTeam = rowTop.insertCell(i++),
                    //out2 = rowTop.insertCell(i++),
                    //sepEl = markets.length > 1 ? rowTop.insertCell(i++) : null;

                rowTop.parentNode.removeChild(rowTop);
                rowBot.parentNode.removeChild(rowBot);
                thead.appendChild(rowTop);
                thead.appendChild(rowBot);
                table.appendChild(thead);
                if (ZAPNET_LIVETV_SETTINGS && !ZAPNET_LIVETV_SETTINGS.SHOW_FLAGS){
                    left.colSpan = 6;
                } else {
                    left.colSpan = 7;
                }

                Dom.addClass(left, 'empty coupon-page-title');
                left.rowSpan = 2;

                markets = markets.slice(0);

                var submarkets = [];
                Util.foreach(markets, function(market){
                    var k;
                    if (markets.markets){
                        for(k = 0 ; k < market.markets; k ++){
                            submarkets.push(market);
                        }
                    } else {
                        submarkets.push(market);
                    }
                });

                CouponHandlers.marketHeaders(submarkets, rowTop, rowBot, true);

                Dom.addClass(rowTop, 'coupon-head coupon-head-top');
                Dom.addClass(rowBot, 'coupon-head');

                return thead;
            },
            row: function(table, match, markets){
                var r1 = 0, r2 = 0, r3 = 0,
                    tbody = Util.elem('tbody'),
                    row = table.insertRow(table.rows.length),
                    row2 = table.insertRow(table.rows.length),
                    row3 = table.insertRow(table.rows.length),
                    code = row.insertCell(r1++),
                    sport = row.insertCell(r1++),
                    league = row.insertCell(r1++),
                    status = row.insertCell(r1++),
                    time = row.insertCell(r1++),
                    homeTeam = row.insertCell(r1++),
                    score = row.insertCell(r1++),
                    awayTeam = row2.insertCell(r2++),
                    periodTd = row2.insertCell(r2++),
                    //sepEl = markets.length > 1 ? row.insertCell(r1++) : null,
                    setscores = row3.insertCell(r3++),
                    extraLabel, market, colors;

                if (ZAPNET_LIVETV_SETTINGS && !ZAPNET_LIVETV_SETTINGS.SHOW_FLAGS){
                    league.parentNode.removeChild(league);
                    league = null;
                    r1--;
                }

                var isDraw = function(score){
                    if (!score){
                        return true;
                    }
                    var goals = score.split(':');
                    if (goals.length != 2){
                        return true;
                    }
                    return goals[0] == goals[1];
                };
                Dom.addClass(score, 'match-score');
                Dom.addClass(setscores, 'setscores');
                var oddsRows = 1;
                var period = '&nbsp;';
                var sportCode = match.tournament.category.sport.code;
                if (sportCode == 'soccer' && match.live){
                    if (match.lstatus == '1p'){
                        period = 'HT';
                        oddsRows += 1;
                    }
                    if (!isDraw(match.score) && Util.countProperties(ZAPNET.COUPONS.LIVE_COUPON.markets) < 4){
                        oddsRows += 1;
                        if (oddsRows == 2){
                            period = 'REST';
                        }
                    }
                } else if ($P.in_array(sportCode, ['tennis', 'volleyball']) && match.live && $P.in_array(match.lstatus, ['1set', '2set', '3set', '4set', '5set'])){
                    oddsRows = 2;
                    period = 'Set ' + match.lstatus.substr(0, 1);
                } else if (sportCode == 'volleyball' && $P.in_array(match.lstatus, ['pause1', 'pause2', 'pause3', 'pause4'])){
                    oddsRows = 2;
                    period = 'Set ' + (match.lstatus.substr(5) + 1);
                }
                if (oddsRows == 3){
                    extraLabel = row3.insertCell(r3++);
                    Dom.addClass(extraLabel, 'extra');
                    extraLabel.innerHTML = 'REST';
                } else {
                    periodTd.rowSpan = '2';
                }

                Dom.addClass(periodTd, 'period');
                periodTd.innerHTML = period;

                setscores.innerHTML = '&nbsp;';
                CouponHandlers.setupInfo(match, Util.div(), code, league, status/*, leagueColor*/, time, score, setscores);
                homeTeam.innerHTML = CouponHandlers.showMatchTeamName(match, 0);
                awayTeam.innerHTML = CouponHandlers.showMatchTeamName(match, 1);
                Dom.addClass(homeTeam, 'match-teams');
                Dom.addClass(awayTeam, 'match-teams');
                Dom.addClass(homeTeam, 'match-teams-home');
                Dom.addClass(awayTeam, 'match-teams-away');
                Dom.addClass(sport, 'sport sport-' + match.tournament.category.sport.code);
                sport.innerHTML = '&nbsp;';

                code.rowSpan = 3;
                sport.rowSpan = 3;
                if (league){
                    league.rowSpan = 3;
                }
                status.rowSpan = 3;
                time.rowSpan = 3;

                row.parentNode.removeChild(row);
                row2.parentNode.removeChild(row2);
                row3.parentNode.removeChild(row3);
                tbody.appendChild(row);
                tbody.appendChild(row2);
                tbody.appendChild(row3);
                table.appendChild(tbody);

                var mSep = false;
                var marketColN = 0;
                Util.foreach(markets, function(market){
                    var sportmarket = null;
                    if (market.sportmarkets && market.sportmarkets[match.tournament.category.sport.code]){
                        sportmarket = market.sportmarkets[match.tournament.category.sport.code];
                    }
                    var marketId = CouponHandlers.getMarketId(match, sportmarket);
                    var marketId2 = sportmarket && sportmarket.submarkets ? CouponHandlers.getSubMarketId(match, sportmarket.submarkets) : false;
                    var marketId3 = sportmarket && sportmarket.extramarkets ? CouponHandlers.getSubMarketId(match, sportmarket.extramarkets) : false;
                    var marketLabel = false;
                    if (oddsRows == 3 && marketColN == 1){
                        marketLabel = 'REST of HT';
                    } else if (oddsRows == 2 && marketId3 && !marketId2){
                        marketId2 = marketId3;
                        marketId3 = false;
                    }
                    mSep = true;
                    var nrMarkets = market.markets ? market.markets : 1;
                    var matchMarket = match.marketTypes[marketId];
                    var matchMarket2 = marketId2 ? match.marketTypes[marketId2] : false;
                    var matchMarket3 = marketId3 ? match.marketTypes[marketId3] : false;
                    var submarkets = 0;
                    var colClass = (marketColN % 2 === 1) ? 'odd-col' : false;
                    if (matchMarket || matchMarket2 || matchMarket3 || marketLabel){
                        var sep = false;
                        var markets1 = false,
                            markets2 = false,
                            markets3 = false;
                        if (matchMarket){
                            markets1 = CouponHandlers.getTopMarkets(matchMarket, markets.markets ? markets.markets : 1);
                        }
                        if (matchMarket2){
                            markets2 = CouponHandlers.getTopMarkets(matchMarket2, markets.markets ? markets.markets : 1);
                        }
                        if (matchMarket3){
                            markets3 = CouponHandlers.getTopMarkets(matchMarket3, markets.markets ? markets.markets : 1);
                        }
                        if (!markets1 || !markets1.length){
                            markets1 = [''];
                        }
                        Util.foreach(markets1, function(special, mi){
                            if (submarkets >= nrMarkets){
                                return;
                            }
                            var special2 = markets2 && mi in markets2 ? markets2[mi] : false;
                            var special3 = markets3 && mi in markets3 ? markets3[mi] : false;
                            var sep = true;
                            var selCount = 0, j;
                            var outcomes = match.live && market.liveoutcomes ? market.liveoutcomes : market.outcomes;
                            if (market.hasSpecial){
                                var outEl = row.insertCell(r1++);
                                outEl.rowSpan = oddsRows == 1 ? 3 : 1;
                                outEl.innerHTML = Util.formatHandicap(special);
                                if (colClass){
                                    Dom.addClass(outEl, colClass);
                                }
                                Dom.addClass(outEl, 'handicap');
                                if (oddsRows > 1){
                                    var outEl2 = row2.insertCell(r2++);
                                    outEl2.rowSpan = oddsRows == 3 ? 1 : 2;
                                    Dom.addClass(outEl2, 'handicap');
                                    outEl2.innerHTML = special2 === false ? '&nbsp;' : Util.formatHandicap(special2);
                                    if (colClass){
                                        Dom.addClass(outEl2, colClass);
                                    }
                                    if (oddsRows > 2){
                                        var outEl3 = row3.insertCell(r3++);
                                        if (marketLabel){
                                            Dom.addClass(outEl3, 'extra');
                                            Dom.setStyle(outEl3, 'text-align', 'right');
                                            outEl3.innerHTML = marketLabel;
                                            outEl3.colSpan = outcomes.length + 1;
                                        } else {
                                            Dom.addClass(outEl3, 'handicap');
                                            outEl3.innerHTML = special3 === false ? '&nbsp;' : Util.formatHandicap(special3);
                                        }
                                        if (colClass){
                                            Dom.addClass(outEl3, colClass);
                                        }
                                    }
                                }
                                sep = false;
                            }
                            Util.foreach(outcomes, function(outcome){
                                outEl = row.insertCell(r1++);
                                outEl.rowSpan = oddsRows == 1 ? 3 : 1;
                                outEl.appendChild(CouponHandlers.getSelectionElement(match, marketId, outcome, special));
                                if (!sep){
                                    Dom.addClass(outEl, 'sel-in');
                                }
                                if (colClass){
                                    Dom.addClass(outEl, colClass);
                                }
                                selCount += 1;
                                if (oddsRows > 1){
                                    outEl2 = row2.insertCell(r2++);
                                    outEl2.rowSpan = oddsRows == 3 ? 1 : 2;
                                    if (colClass){
                                        Dom.addClass(outEl2, colClass);
                                    }
                                    if (market.name == 'Next Goal' && sportCode == 'tennis' && outcome == 'X'){
                                        outEl2.innerHTML = special2 ?  'Game ' + special2 : '&nbsp;';
                                        Dom.addClass(outEl2, 'game-special');
                                    } else {
                                        if (special2 === false){
                                            outEl2.innerHTML = '&nbsp;';
                                        } else {
                                            outEl2.appendChild(CouponHandlers.getSelectionElement(match, marketId2, outcome, special2));
                                        }
                                    }
                                    if (!sep){
                                        Dom.addClass(outEl2, 'sel-in');
                                    }
                                    if (oddsRows > 2 && !marketLabel){
                                        outEl3 = row3.insertCell(r3++);
                                        if (colClass){
                                            Dom.addClass(outEl3, colClass);
                                        }
                                        if (special3 === false){
                                            outEl3.innerHTML = '&nbsp;';
                                        } else {
                                            outEl3.appendChild(CouponHandlers.getSelectionElement(match, marketId3, outcome, special3));
                                        }
                                        if (!sep){
                                            Dom.addClass(outEl3, 'sel-in');
                                        }
                                    }
                                }
                                sep = false;
                            });
                            for(j = selCount; j < outcomes.length; j += 1){
                                outEl = row.insertCell(r1++);
                                outEl.rowSpan = oddsRows == 1 ? 3 : 1;
                                outEl.appendChild(CouponHandlers.getNoOfferElement());
                                if (!sep){
                                    Dom.addClass(outEl, 'sel-in');
                                }
                                if (colClass){
                                    Dom.addClass(outEl, colClass);
                                }
                                if (oddsRows > 1){
                                    var outEl2 = row2.insertCell(r2++);
                                    outEl2.rowSpan = oddsRows == 3 ? 1 : 2;
                                    outEl2.innerHTML = '&nbsp;';
                                    if (!sep){
                                        Dom.addClass(outEl2, 'sel-in');
                                    }
                                    if (colClass){
                                        Dom.addClass(outEl2, colClass);
                                    }
                                    if (special2 === false){
                                        outEl2.innerHTML = '&nbsp;';
                                    } else {
                                        outEl2.appendChild(CouponHandlers.getNoOfferElement());
                                    }
                                    if (marketLabel){
                                        outEl3 = row3.insertCell(r3++);
                                        outEl3.innerHTML = 'marketLabel';
                                        Dom.addClass(outEl3, 'extra');
                                    }
                                }
                                sep = false;
                            }
                            submarkets += 1;
                            marketColN += 1;
                        });
                    }
                    while(submarkets < nrMarkets){
                        sep = true;
                        if (market.hasSpecial){
                            var outEl = row.insertCell(r1++);
                            outEl.innerHTML = '&nbsp;';
                            outEl.rowSpan = 3;
                            Dom.addClass(outEl, 'handicap');
                            if (colClass){
                                Dom.addClass(outEl, colClass);
                            }
                            sep = false;
                        }
                        Util.foreach(market.outcomes, function(outcome){
                            outEl = row.insertCell(r1++);
                            outEl.rowSpan = 3;
                            outEl.innerHTML = '&nbsp;';
                            if (!sep){
                                Dom.addClass(outEl, 'sel-in');
                            }
                            if (colClass){
                                Dom.addClass(outEl, colClass);
                            }
                            //outEl.appendChild(CouponHandlers.getNoOfferElement());
                            sep = false;
                        });
                        submarkets += 1;
                        marketColN += 1;
                    }
                });

                return tbody;
            }
        },
        CorrectScoreCoupon: {
            header: function(table, markets){
                var i = 0, j = 0,
                    thead = Util.elem('thead', 'coupon-head'),
                    rowTop = table.insertRow(table.rows.length),
                    rowBot = table.insertRow(table.rows.length),
                    fav = rowTop.insertCell(i++),
                    code = rowTop.insertCell(i++),
                    league = rowTop.insertCell(i++),
                    status = rowTop.insertCell(i++),
                    moremkts = rowTop.insertCell(i++),
                    time = rowTop.insertCell(i++),
                    matchCell = rowTop.insertCell(i++);

                rowTop.parentNode.removeChild(rowTop);
                rowBot.parentNode.removeChild(rowBot);
                thead.appendChild(rowTop);
                thead.appendChild(rowBot);
                table.appendChild(thead);
                fav.innerHTML = 'F';
                moremkts.innerHTML = '&nbsp;';
                code.innerHTML = Util.t('Code');
                league.innerHTML = Util.t('League');
                status.innerHTML = Util.t('Info');
                time.innerHTML = Util.t('Kick Off');
                matchCell.innerHTML = Util.t('Match');
                fav.rowSpan = 2;
                moremkts.rowSpan = 2;
                code.rowSpan = 2;
                league.rowSpan = 2;
                //league.colSpan = 2;
                status.rowSpan = 2;
                time.rowSpan = 2;
                matchCell.rowSpan = 2;

                Dom.addClass(code, 'info');
                Dom.addClass(league, 'league-header');
                Dom.addClass(time, 'time-header');

                CouponHandlers.marketHeaders(markets, rowTop, rowBot);

                Dom.addClass(rowTop, 'coupon-head coupon-head-top');
                Dom.addClass(rowBot, 'coupon-head');

                return thead;
            },
            row: function(table, match, markets){
                var i = 0,
                    row = table.insertRow(table.rows.length),
                    fav = row.insertCell(i++),
                    code = row.insertCell(i++),
                    //leagueColor = row.insertCell(i++),
                    league = row.insertCell(i++),
                    status = row.insertCell(i++),
                    moremkts = row.insertCell(i++),
                    time = row.insertCell(i++),
                    matchCell = row.insertCell(i++),
                    market = markets[0],
                    marketId = CouponHandlers.getMarketId(match, market);

                CouponHandlers.setupInfo(match, fav, code, league, status/*, leagueColor*/, time);
                matchCell.innerHTML = CouponHandlers.showMatchTeamName(match, 0) + '<br/>' +
                                      CouponHandlers.showMatchTeamName(match, 1);
                Dom.addClass(matchCell, 'match-teams');
                Dom.addClass(matchCell, 'match-teams-match');
                CouponHandlers.setupMoreMarkets(moremkts, match, markets);

                Util.foreach(market.outcomes, function(outcome){
                    var outEl = row.insertCell(i++);
                    var topEl = CouponHandlers.getSelectionElement(match, marketId, outcome);
                    outEl.appendChild(topEl);
                    var outRev = outcome.split('').reverse().join('');
                    if (outRev != outcome){
                        Dom.setStyle(topEl, 'margin-bottom', '1px');
                        outEl.appendChild(CouponHandlers.getSelectionElement(match, marketId, outRev));
                    }
                });

                //Dom.addClass(row, 'r' + ((table.rows.length - 1) % 2));

                return row;
            }
        },

        HandicapCoupon: {
            header: function(table, markets){
                var i = 0, j = 0,
                    thead = Util.elem('thead', 'coupon-head'),
                    rowTop = table.insertRow(table.rows.length),
                    rowBot = table.insertRow(table.rows.length),
                    fav = rowTop.insertCell(i++),
                    code = rowTop.insertCell(i++),
                    league = rowTop.insertCell(i++),
                    status = rowTop.insertCell(i++),
                    moremkts = rowTop.insertCell(i++),
                    time = rowTop.insertCell(i++),
                    matchCell = rowTop.insertCell(i++);

                rowTop.parentNode.removeChild(rowTop);
                rowBot.parentNode.removeChild(rowBot);
                thead.appendChild(rowTop);
                thead.appendChild(rowBot);
                table.appendChild(thead);
                fav.innerHTML = 'F';
                moremkts.innerHTML = '&nbsp;';
                code.innerHTML = Util.t('Code');
                league.innerHTML = Util.t('League');
                status.innerHTML = Util.t('Info');
                time.innerHTML = Util.t('Kick Off');
                matchCell.innerHTML = Util.t('Match');
                fav.rowSpan = 2;
                moremkts.rowSpan = 2;
                code.rowSpan = 2;
                league.rowSpan = 2;
                //league.colSpan = 2;
                status.rowSpan = 2;
                time.rowSpan = 2;
                matchCell.rowSpan = 2;

                Dom.addClass(code, 'info');
                Dom.addClass(league, 'league-header');
                Dom.addClass(time, 'time-header');

                var submarkets = [];
                Util.foreach(markets, function(market){
                    var k;
                    for(k = 0 ; k < market.markets; k ++){
                        submarkets.push(market);
                    }
                });

                CouponHandlers.marketHeaders(submarkets, rowTop, rowBot);

                Dom.addClass(rowTop, 'coupon-head coupon-head-top');
                Dom.addClass(rowBot, 'coupon-head');

                return thead;
            },
            row: function(table, match, markets){
                var i = 0,
                    row = table.insertRow(table.rows.length),
                    fav = row.insertCell(i++),
                    code = row.insertCell(i++),
                    //leagueColor = row.insertCell(i++),
                    league = row.insertCell(i++),
                    status = row.insertCell(i++),
                    moremkts = row.insertCell(i++),
                    time = row.insertCell(i++),
                    matchCell = row.insertCell(i++);

                CouponHandlers.setupInfo(match, fav, code, league, status/*, leagueColor*/, time);
                matchCell.innerHTML = CouponHandlers.showMatchName(match);
                Dom.addClass(matchCell, 'match-teams');
                Dom.addClass(matchCell, 'match-teams-match');
                CouponHandlers.setupMoreMarkets(moremkts, match, markets);

                var mSep = false;
                Util.foreach(markets, function(market){
                    var marketId = CouponHandlers.getMarketId(match, market);
                    if (mSep){
                        var sepEl = row.insertCell(i++);
                        sepEl.innerHTML = '&nbsp;';
                        Dom.addClass(sepEl, 'spacing');
                    }
                    mSep = true;
                    var matchMarket = match.marketTypes[marketId];
                    var submarkets = 0;
                    if (matchMarket){
                        var sep = false;
                        var marketList = CouponHandlers.getTopMarkets(matchMarket, market.markets ? market.markets : 1);
                        Util.foreach(marketList, function(special){
                            if (submarkets >= market.markets){
                                return;
                            }
                            if (sep){
                                var sepEl = row.insertCell(i++);
                                sepEl.innerHTML = '&nbsp;';
                                Dom.addClass(sepEl, 'spacing');
                            }
                            sep = true;
                            var outEl = row.insertCell(i++);
                            outEl.innerHTML = Util.formatHandicap(special);
                            Dom.addClass(outEl, 'handicap');
                            var selCount = 0, j;
                            Util.foreach(market.outcomes, function(outcome){
                                outEl = row.insertCell(i++);
                                outEl.appendChild(CouponHandlers.getSelectionElement(match, marketId, outcome, special));
                                selCount += 1;
                            });
                            for(j = selCount; j < market.outcomes.length; j += 1){
                                outEl = row.insertCell(i++);
                                outEl.appendChild(CouponHandlers.getNoOfferElement());
                            }
                            submarkets += 1;
                        });
                    }
                    while(submarkets < market.markets){
                        if (sep){
                            sepEl = row.insertCell(i++);
                            sepEl.innerHTML = '&nbsp;';
                            Dom.addClass(sepEl, 'spacing');
                        }
                        sep = true;
                        var outEl = row.insertCell(i++);
                        outEl.innerHTML = '';
                        Dom.addClass(outEl, 'handicap');
                        Util.foreach(market.outcomes, function(outcome){
                            outEl = row.insertCell(i++);
                            outEl.appendChild(CouponHandlers.getNoOfferElement());
                        });
                        submarkets += 1;
                    }
                });

                //Dom.addClass(row, 'r' + ((table.rows.length - 1) % 2));

                return row;
            }
        }
    };

    ZAPNET.COUPONS.MARKET_COUPONS = {
        soccer: {
            MATCH_ODDS: {
                handler: CouponHandlers.MatchOddsCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_ODDS, liveid: LIVE_MARKET_MATCH_ODDS, outcomes: ['1', 'X', '2']},
                    {name: 'Double Chance', id: MARKET_DOUBLE_CHANCE, liveid: LIVE_MARKET_DOUBLE_CHANCE, outcomes: ['1X', '12', 'X2']},
                    {name: 'Under/Over 2.5', id: MARKET_TOTALS_UNDER_OVER, liveid: LIVE_MARKET_TOTALS_UNDER_OVER, special: '2.5', outcomes: ['Under', 'Over']},
                    {name: 'Both Teams to Score', id: MARKET_GOAL_NO_GOAL, liveid: LIVE_MARKET_GOAL_NO_GOAL, outcomes: ['Yes', 'No'], headers: ['Yes', 'No']}
                ]
            },
            HALFTIME_FULLTIME: {
                handler: CouponHandlers.StandardCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Halftime/Fulltime', id: MARKET_HALFTIME_FULLTIME, outcomes: ['1/1', '1/X', '1/2', 'X/1', 'X/X', 'X/2', '2/1', '2/X', '2/2']},
                    {name: 'Highest Scoring Half', id: MARKET_HIGHEST_SCORING_HALF, outcomes: ['1st', '2nd', 'Equal'], headers: ['1st', '2nd', '=']}
                ]
            },
            CORRECT_SCORE: {
                handler: CouponHandlers.CorrectScoreCoupon,
                fullWidth: true,
                markets: [
                    {
                        name: 'Correct Score', id: MARKET_CORRECT_SCORE, liveid: LIVE_MARKET_CORRECT_SCORE,
                        outcomes: ['1:0', '2:0', '2:1', '3:0', '3:1', '3:2', '4:0', '4:1', '4:2', '5:0', '5:1', '6:0', '0:0', '1:1', '2:2', '3:3'],
                        headers:  ['1-0', '2-0', '2-1', '3-0', '3-1', '3-2', '4-0', '4-1', '4-2', '5-0', '5-1', '6-0', '0-0', '1-1', '2-2', '3-3']
                    }
                ]
            },
            GOALS: {
                handler: CouponHandlers.StandardCoupon,
                fullWidth: true,
                markets: [
                    /*{name: 'Under/Over 1.5', id: MARKET_TOTALS_UNDER_OVER, special: '1.5', outcomes: ['Under', 'Over']},
                    {name: 'Under/Over 2.5', id: MARKET_TOTALS_UNDER_OVER, special: '2.5', outcomes: ['Under', 'Over']},
                    {name: 'Under/Over 3.5', id: MARKET_TOTALS_UNDER_OVER, special: '3.5', outcomes: ['Under', 'Over']},*/
                    {name: 'Total Goals (Aggr)', id: MARKET_TOTAL_GOALS_AGGR, outcomes: ['0-1 goals', '2-3 goals', '4-5 goals', '6+'], headers: ['0-1', '2-3', '4-5', '6+']},
                    {name: 'Total Goals', id: MARKET_TOTAL_GOALS, liveid: LIVE_MARKET_TOTAL_GOALS, outcomes: ['0', '1', '2', '3', '4', '5', '6+']}
                ]
            },
            TEAM_SCORING: {
                handler: CouponHandlers.StandardCoupon,
                fullWidth: true,
                markets: [
                    {name: 'First Team To Score', id: MARKET_FIRST_TO_SCORE, outcomes: ['1', 'None', '2'], headers: ['Home', 'None', 'Away']},
                    {name: 'Home Team Goals', id: MARKET_GOALS_HOME, outcomes: ['0', '1', '2', '3+']},
                    {name: 'Away Team Goals', id: MARKET_GOALS_AWAY, outcomes: ['0', '1', '2', '3+']},
                    {name: 'Winning Margins', id: MARKET_WINNING_MARGIN, outcomes: ['HT > 2', 'HT 2', 'HT 1', 'X', 'AT 1', 'AT 2', 'AT > 2']}
                ]
            },
            COMBINATIONS: {
                handler: CouponHandlers.StandardCoupon,
                fullWidth: true,
                markets: [
                    {name: 'FT 1X2 & Under/Over 2.5', id: MARKET_MATCHBET_TOTALS, liveid: LIVE_MARKET_MATCHBET_TOTALS, special: '2.5', outcomes: ['Under and home', 'Under and draw', 'Under and away', 'Over and home', 'Over and draw', 'Over and away'], headers: ['1 & U', 'X & U', '2 & U', '1 & O', 'X & O', '2 & O']},
                    {name: 'First To Score + Match Odds', id: MARKET_MATCHFLOW, outcomes: ['Hometeam scores first and home', 'Hometeam scores first and draw', 'Hometeam scores first and away', 'Awayteam scores first and home', 'Awayteam scores first and draw', 'Awayteam scores first and away', 'No goal'], headers: ['HF + 1', 'HF + X', 'HF + 2', 'AF + 1', 'AF + X', 'AF + 2', 'NG']}
                ]
            },
            HALF_1ST: {
                handler: CouponHandlers.MatchOddsCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Match Odds', id: MARKET_1ST_MATCH_ODDS, outcomes: ['1', 'X', '2']},
                    {name: '1st Under/Over 0.5', id: MARKET_1ST_UNDER_OVER, special: '0.5', outcomes: ['Under', 'Over']},
                    {name: '1st Under/Over 1.5', id: MARKET_1ST_UNDER_OVER, special: '1.5', outcomes: ['Under', 'Over']},
                    {name: '1st Under/Over 2.5', id: MARKET_1ST_UNDER_OVER, special: '2.5', outcomes: ['Under', 'Over']},
                    {name: '1st Odd/Even Goals', id: MARKET_1ST_ODD_EVEN_GOALS, outcomes: ['Odd', 'Even']},
                    {name: 'Total Corners', id: MARKET_1ST_CORNER_TOTAL, outcomes: ['0-4', '5-6', '7+']}
                ]
            },
            HALF_2ND: {
                handler: CouponHandlers.MatchOddsCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Match Odds', id: MARKET_2ND_MATCH_ODDS, outcomes: ['1', 'X', '2']},
                    {name: '2nd Under/Over 0.5', id: MARKET_2ND_UNDER_OVER, special: '0.5', outcomes: ['Under', 'Over']},
                    {name: '2nd Under/Over 1.5', id: MARKET_2ND_UNDER_OVER, special: '1.5', outcomes: ['Under', 'Over']},
                    {name: '2nd Under/Over 2.5', id: MARKET_2ND_UNDER_OVER, special: '2.5', outcomes: ['Under', 'Over']},
                    {name: '2nd Odd/Even Goals', id: MARKET_2ND_ODD_EVEN_GOALS, outcomes: ['Odd', 'Even']},
                    {name: 'Total Corners', id: MARKET_2ND_CORNER_TOTAL, outcomes: ['0-4', '5-6', '7+']}
                ]
            },
            ASIAN_HANDICAP: {
                handler: CouponHandlers.HandicapCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Asian Handicap', id: MARKET_ASIAN_HANDICAP, markets: 3, outcomes: ['1', '2'], headers: ['&nbsp;', '1', '2']},
                    {name: 'Under/Over', id: MARKET_ASIAN_TOTALS, markets: 3, outcomes: ['Under', 'Over'], headers: ['&nbsp;', 'Under', 'Over']},
                ]
            },
            EUROPEAN_HANDICAP: {
                handler: CouponHandlers.HandicapCoupon,
                fullWidth: true,
                markets: [
                    {name: 'European Handicap', id: MARKET_EUROPEAN_HANDICAP, markets: 3, outcomes: ['1', 'X', '2'], headers: ['&nbsp;', '1', 'X', '2']}
                ]
            }
        },
        'virtual-football': {
            MATCH_ODDS: {
                handler: CouponHandlers.MatchOddsCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_ODDS, liveid: LIVE_MARKET_MATCH_ODDS, outcomes: ['1', 'X', '2']},
                    {name: 'Double Chance', id: MARKET_DOUBLE_CHANCE, liveid: LIVE_MARKET_DOUBLE_CHANCE, outcomes: ['1X', '12', 'X2']},
                    {name: 'Under/Over 2.5', id: MARKET_TOTALS_UNDER_OVER, liveid: LIVE_MARKET_TOTALS_UNDER_OVER, special: '2.5', outcomes: ['Under', 'Over']},
                    {name: 'Both Teams to Score', id: MARKET_GOAL_NO_GOAL, liveid: LIVE_MARKET_GOAL_NO_GOAL, outcomes: ['Yes', 'No'], headers: ['Yes', 'No']}
                ]
            },
            HALFTIME_FULLTIME: {
                handler: CouponHandlers.StandardCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Halftime/Fulltime', id: MARKET_HALFTIME_FULLTIME, outcomes: ['1/1', '1/X', '1/2', 'X/1', 'X/X', 'X/2', '2/1', '2/X', '2/2']},
                    {name: 'Highest Scoring Half', id: MARKET_HIGHEST_SCORING_HALF, outcomes: ['1st', '2nd', 'Equal'], headers: ['1st', '2nd', '=']}
                ]
            },
            CORRECT_SCORE: {
                handler: CouponHandlers.CorrectScoreCoupon,
                fullWidth: true,
                markets: [
                    {
                        name: 'Correct Score', id: MARKET_CORRECT_SCORE, liveid: LIVE_MARKET_CORRECT_SCORE,
                        outcomes: ['1:0', '2:0', '2:1', '3:0', '3:1', '3:2', '4:0', '4:1', '4:2', '5:0', '5:1', '6:0', '0:0', '1:1', '2:2', '3:3'],
                        headers:  ['1-0', '2-0', '2-1', '3-0', '3-1', '3-2', '4-0', '4-1', '4-2', '5-0', '5-1', '6-0', '0-0', '1-1', '2-2', '3-3']
                    }
                ]
            }
        },
        'virtual-football-league': {
            MATCH_ODDS: {
                handler: CouponHandlers.MatchOddsCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_ODDS, liveid: LIVE_MARKET_MATCH_ODDS, outcomes: ['1', 'X', '2']},
                    {name: 'Double Chance', id: MARKET_DOUBLE_CHANCE, liveid: LIVE_MARKET_DOUBLE_CHANCE, outcomes: ['1X', '12', 'X2']},
                    {name: 'Under/Over 2.5', id: MARKET_TOTALS_UNDER_OVER, liveid: LIVE_MARKET_TOTALS_UNDER_OVER, special: '2.5', outcomes: ['Under', 'Over']},
                    {name: 'Both Teams to Score', id: MARKET_GOAL_NO_GOAL, liveid: LIVE_MARKET_GOAL_NO_GOAL, outcomes: ['Yes', 'No'], headers: ['Yes', 'No']}
                ]
            },
            CORRECT_SCORE: {
                handler: CouponHandlers.CorrectScoreCoupon,
                fullWidth: true,
                markets: [
                    {
                        name: 'Correct Score', id: MARKET_CORRECT_SCORE, liveid: LIVE_MARKET_CORRECT_SCORE,
                        outcomes: ['1:0', '2:0', '2:1', '3:0', '3:1', '3:2', '4:0', '4:1', '4:2', '5:0', '5:1', '6:0', '0:0', '1:1', '2:2', '3:3'],
                        headers:  ['1-0', '2-0', '2-1', '3-0', '3-1', '3-2', '4-0', '4-1', '4-2', '5-0', '5-1', '6-0', '0-0', '1-1', '2-2', '3-3']
                    }
                ]
            }
        },
        'virtual-soccerbet-league': {
            MATCH_ODDS: {
                handler: CouponHandlers.MatchOddsCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_ODDS, liveid: LIVE_MARKET_MATCH_ODDS, outcomes: ['1', 'X', '2']},
                    {name: 'Double Chance', id: MARKET_DOUBLE_CHANCE, liveid: LIVE_MARKET_DOUBLE_CHANCE, outcomes: ['1X', '12', 'X2']},
                    {name: 'Under/Over 2.5', id: MARKET_TOTALS_UNDER_OVER, liveid: LIVE_MARKET_TOTALS_UNDER_OVER, special: '2.5', outcomes: ['Under', 'Over']},
                    {name: 'Both Teams to Score', id: MARKET_GOAL_NO_GOAL, liveid: LIVE_MARKET_GOAL_NO_GOAL, outcomes: ['Yes', 'No'], headers: ['Yes', 'No']}
                ]
            },
            HALFTIME_FULLTIME: {
                handler: CouponHandlers.StandardCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Halftime/Fulltime', id: MARKET_HALFTIME_FULLTIME, outcomes: ['1/1', '1/X', '1/2', 'X/1', 'X/X', 'X/2', '2/1', '2/X', '2/2']},
                    {name: 'Highest Scoring Half', id: MARKET_HIGHEST_SCORING_HALF, outcomes: ['1st', '2nd', 'Equal'], headers: ['1st', '2nd', '=']}
                ]
            },
            CORRECT_SCORE: {
                handler: CouponHandlers.CorrectScoreCoupon,
                fullWidth: true,
                markets: [
                    {
                        name: 'Correct Score', id: MARKET_CORRECT_SCORE, liveid: LIVE_MARKET_CORRECT_SCORE,
                        outcomes: ['1:0', '2:0', '2:1', '3:0', '3:1', '3:2', '4:0', '4:1', '4:2', '5:0', '5:1', '6:0', '0:0', '1:1', '2:2', '3:3'],
                        headers:  ['1-0', '2-0', '2-1', '3-0', '3-1', '3-2', '4-0', '4-1', '4-2', '5-0', '5-1', '6-0', '0-0', '1-1', '2-2', '3-3']
                    }
                ]
            }
        },
        basketball: {
            MATCH_ODDS: {
                handler: CouponHandlers.MatchOddsTwoWayCoupon,
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_ODDS_2WAY, outcomes: ['1', '2']},
                    {name: 'Under/Over', id: MARKET_UNDER_OVER, outcomes: ['Under', 'Over'], headers: ['&nbsp;', 'Under', 'Over']}
                ]
            },
            HANDICAP: {
                handler: CouponHandlers.HandicapCoupon,
                fullWidth: true,
                markets: [
                    {name: 'Handicap', id: MARKET_ASIAN_HANDICAP, markets: 3, outcomes: ['1', '2'], headers: ['&nbsp;', '1', '2']},
                    {name: '1st Half Handicap', id: MARKET_1ST_ASIAN_HANDICAP, markets: 1, outcomes: ['1', '2'], headers: ['&nbsp;', '1', '2']}
                ]
            }
        },
        baseball: {
            MATCH_ODDS: {
                handler: CouponHandlers.MatchOddsTwoWayCoupon,
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_ODDS_2WAY, outcomes: ['1', '2']},
                    {name: 'Under/Over', id: MARKET_UNDER_OVER, outcomes: ['Under', 'Over'], headers: ['&nbsp;', 'Under', 'Over']}
                ]
            }
        },
        'ice-hockey': {
            MATCH_ODDS: {
                handler: CouponHandlers.MatchOddsCoupon,
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_HANDICAP, outcomes: ['1', 'X', '2']},
                    {name: 'Under/Over', id: MARKET_UNDER_OVER, outcomes: ['Under', 'Over'], headers: ['&nbsp;', 'Under', 'Over']}
                ]
            }
        },
        tennis: {
            MATCH_ODDS: {
                handler: CouponHandlers.MatchOddsTwoWayCoupon,
                headers: {
                    1: 'Player(s) 1',
                    2: 'Player(s) 2'
                },
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_ODDS_2WAY, outcomes: ['1', '2']},
                    {name: 'Under/Over', id: MARKET_UNDER_OVER, outcomes: ['Under', 'Over'], headers: ['&nbsp;', 'Under', 'Over']}
                ]
            }
        },
        handball: {
            MATCH_ODDS: {
                handler: CouponHandlers.MatchOddsCoupon,
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_HANDICAP, outcomes: ['1', 'X', '2']}
                ]
            }
        },
        golf: {
            MATCH_ODDS: {
                handler: CouponHandlers.MatchOddsTwoWayCoupon,
                headers: {
                    1: 'Player 1',
                    2: 'Player 2'
                },
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_ODDS_2WAY, outcomes: ['1', '2']},
                    {name: 'Under/Over', id: MARKET_UNDER_OVER, outcomes: ['Under', 'Over'], headers: ['&nbsp;', 'Under', 'Over']}
                ]
            }
        },
        motorsport: {
            MATCH_ODDS: {
                handler: CouponHandlers.MatchOddsTwoWayCoupon,
                headers: {
                    1: 'Driver 1',
                    2: 'Driver 2'
                },
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_ODDS_2WAY, outcomes: ['1', '2']}
                ]
            }
        },
        rugby: {
            MATCH_ODDS: {
                handler: CouponHandlers.MatchOddsCoupon,
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_HANDICAP, outcomes: ['1', 'X', '2']},
                ]
            }
        },
        'american-football': {
            MATCH_ODDS: {
                handler: CouponHandlers.MatchOddsTwoWayCoupon,
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_ODDS_2WAY, outcomes: ['1', '2']},
                    {name: 'Under/Over', id: MARKET_UNDER_OVER, outcomes: ['Under', 'Over'], headers: ['&nbsp;', 'Under', 'Over']}
                ]
            }
        },
        snooker: {
            MATCH_ODDS: {
                handler: CouponHandlers.MatchOddsTwoWayCoupon,
                headers: {
                    1: 'Player 1',
                    2: 'Player 2'
                },
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_ODDS_2WAY, outcomes: ['1', '2']},
                    {name: 'Under/Over', id: MARKET_UNDER_OVER, outcomes: ['Under', 'Over'], headers: ['&nbsp;', 'Under', 'Over']}
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
                handler: CouponHandlers.MatchOddsTwoWayCoupon,
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_ODDS_2WAY, outcomes: ['1', '2']},
                    {name: 'Under/Over', id: MARKET_UNDER_OVER, outcomes: ['Under', 'Over'], headers: ['&nbsp;', 'Under', 'Over']}
                ]
            }
        },
        futsal: {
            MATCH_ODDS: {
                handler: CouponHandlers.MatchOddsCoupon,
                markets: [
                    {name: 'Match Odds', id: MARKET_MATCH_HANDICAP, outcomes: ['1', '2']},
                    {name: 'Under/Over', id: MARKET_UNDER_OVER, outcomes: ['Under', 'Over'], headers: ['&nbsp;', 'Under', 'Over']}
                ]
            }
        }
    };

    ZAPNET.COUPONS.LIVE_COUPON = {
        handler: CouponHandlers.LiveBettingCoupon,
        fullWidth: true,
        live: true,
        markets: [
            {name: 'Match Odds', markets: 1, outcomes: ['1', 'X', '2'],
                sportmarkets: {
                    soccer: {id: MARKET_MATCH_ODDS, liveid: LIVE_MARKET_MATCH_ODDS, hasdraw: true},
                    basketball: {id: MARKET_MATCH_ODDS_2WAY, liveid: LIVE_MARKET_MATCH_ODDS_2WAY, hasdraw: false},
                    tennis: {id: MARKET_MATCH_ODDS_2WAY, liveid: LIVE_MARKET_MATCH_ODDS_2WAY_TENNIS, hasdraw: false},
                    volleyball: {id: MARKET_MATCH_ODDS_2WAY, liveid: LIVE_MARKET_MATCH_ODDS_2WAY, hasdraw: false},
                    baseball: {id: MARKET_MATCH_ODDS_2WAY, liveid: LIVE_MARKET_MATCH_ODDS_2WAY, hasdraw: false},
                    'ice-hockey': {id: MARKET_MATCH_ODDS, liveid: LIVE_MARKET_MATCH_ODDS, hasdraw: true},
                    handball: {id: MARKET_MATCH_ODDS, liveid: LIVE_MARKET_MATCH_ODDS, hasdraw: true},
                    'american-football': {id: MARKET_MATCH_ODDS_2WAY, liveid: LIVE_MARKET_MATCH_ODDS, hasdraw: false},
                    'virtual-football': {id: MARKET_MATCH_ODDS, liveid: LIVE_MARKET_MATCH_ODDS, hasdraw: true},
                    'virtual-football-league': {id: MARKET_MATCH_ODDS, liveid: LIVE_MARKET_MATCH_ODDS, hasdraw: true},
                    'virtual-soccerbet-league': {id: MARKET_MATCH_ODDS, liveid: LIVE_MARKET_MATCH_ODDS, hasdraw: true}
                }
            },
            {name: 'Under/Over', markets: 1, outcomes: ['Under', 'Over'], headers: ['&nbsp;', 'Under', 'Over'], hasSpecial: true,
                sportmarkets: {
                    soccer: {id: MARKET_TOTALS_UNDER_OVER, liveid: LIVE_MARKET_TOTALS_UNDER_OVER},
                    basketball: {id: MARKET_UNDER_OVER, liveid: LIVE_MARKET_TOTALS_UNDER_OVER},
                    tennis: {id: MARKET_UNDER_OVER, liveid: 0},
                    volleyball: {id: MARKET_UNDER_OVER, liveid: LIVE_MARKET_UNDER_OVER},
                    baseball: {id: MARKET_UNDER_OVER, liveid: LIVE_MARKET_UNDER_OVER},
                    'ice-hockey': {id: MARKET_TOTALS_UNDER_OVER, liveid: LIVE_MARKET_TOTALS_UNDER_OVER},
                    handball: {id: MARKET_TOTALS_UNDER_OVER, liveid: LIVE_MARKET_TOTALS_UNDER_OVER},
                    'american-football': {id: MARKET_UNDER_OVER, liveid: LIVE_MARKET_UNDER_OVER},
                    'virtual-football': {id: MARKET_TOTALS_UNDER_OVER, liveid: LIVE_MARKET_TOTALS_UNDER_OVER},
                    'virtual-football-league': {id: MARKET_TOTALS_UNDER_OVER, liveid: LIVE_MARKET_TOTALS_UNDER_OVER},
                    'virtual-soccerbet-league': {id: MARKET_TOTALS_UNDER_OVER, liveid: LIVE_MARKET_TOTALS_UNDER_OVER}
                }
            },
            {name: 'Rest of Match', markets: 1, outcomes: ['1', 'X', '2'],
                sportmarkets: {
                    soccer: {id: 0, liveid: LIVE_MARKET_REST_OF_MATCH, hasdraw: true},
                    basketball: {id: 0, liveid: LIVE_MARKET_MATCH_ODDS_2WAY, hasdraw: false},
                    tennis: {id: 0, liveid: LIVE_MARKET_MATCH_ODDS_2WAY_TENNIS, hasdraw: false},
                    volleyball: {id: 0, liveid: LIVE_MARKET_MATCH_ODDS_2WAY_TENNIS, hasdraw: false},
                    baseball: {id: 0, liveid: LIVE_MARKET_MATCH_ODDS_2WAY, hasdraw: false},
                    'ice-hokey': {id: 0, liveid: LIVE_MARKET_REST_OF_MATCH, hasdraw: true},
                    handball: {id: 0, liveid: LIVE_MARKET_REST_OF_MATCH, hasdraw: true},
                    'american-football': {id: 0, liveid: LIVE_MARKET_MATCH_ODDS, hasdraw: false},
                    'virtual-football': {id: 0, liveid: LIVE_MARKET_REST_OF_MATCH, hasdraw: true},
                    'virtual-football-league': {id: 0, liveid: LIVE_MARKET_REST_OF_MATCH, hasdraw: true},
                    'virtual-soccerbet-league': {id: 0, liveid: LIVE_MARKET_REST_OF_MATCH, hasdraw: true}
                }
            },
            {name: 'Next Goal', markets: 1, outcomes: ['1', 'None', '2'], liveoutcomes: ['1', 'X', '2'], headers: ['1', 'X', '2'],
                sportmarkets: {
                    soccer: {id: MARKET_FIRST_TO_SCORE, liveid: LIVE_MARKET_NEXT_GOAL, hasdraw: true},
                    basketball: {id: MARKET_MATCH_ODDS_2WAY, liveid: LIVE_MARKET_MATCH_ODDS_2WAY, hasdraw: false},
                    tennis: {id: MARKET_MATCH_ODDS_2WAY, liveid: LIVE_MARKET_MATCH_ODDS_2WAY_TENNIS, hasdraw: false},
                    volleyball: {id: MARKET_MATCH_ODDS_2WAY, liveid: LIVE_MARKET_MATCH_ODDS_2WAY_TENNIS, hasdraw: false},
                    baseball: {id: MARKET_MATCH_ODDS_2WAY, liveid: LIVE_MARKET_MATCH_ODDS_2WAY, hasdraw: false},
                    'ice-hockey': {id: MARKET_FIRST_TO_SCORE, liveid: LIVE_MARKET_NEXT_GOAL, hasdraw: true},
                    handball: {id: MARKET_FIRST_TO_SCORE, liveid: LIVE_MARKET_NEXT_GOAL, hasdraw: true},
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

    ZAPNET.COUPONS.MARKET_BUTTONS = {
        soccer: [
            {label: "Match Odds", value: "match-odds", checked: true},
            {label: "Combinations", value: 'combinations'},
            {label: "Asian Handicap", value: "asian-handicap"},
            {label: "European Handicap", value: "european-handicap"},
            {label: "Correct Score", value: "correct-score"},
            {label: "Goals", value: "goals"},
            {label: "Team Scoring", value: "team-scoring"},
            {label: "1st Half", value: "1st-half"},
            {label: "2nd Half", value: "2nd-half"},
            {label: "Halftime/Fulltime", value: "halftime-fulltime"}
        ],
        'virtual-football': [
            {label: "Match Odds", value: "match-odds", checked: true},
            {label: "Correct Score", value: "correct-score"},
            {label: "Halftime/Fulltime", value: "halftime-fulltime"}
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
            {label: "Handicap", value: "handicap"}
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

    ZAPNET.COUPONS.CouponHandlers = CouponHandlers;

    ZAPNET.COUPONS.Util = function(){
        ZAPNET.COUPONS.stopOddsChangeAnimation = function(el){
            var odds = Dom.getAttribute(el, 'odds');
            if (!odds){
                return;
            }
            el.innerHTML = odds;
            if (odds > 1){
                Dom.removeClass(el, 'selection-na');
            } else {
                Dom.removeClass(el, 'selection-on');
                Dom.addClass(el, 'selection-na');
            }
            if (!el.oddsChangeAnim){
                return;
            }
            el.oddsChangeAnim.onComplete.unsubscribeAll();
            el.oddsChangeAnim.stop();
            delete el.oddsChangeAnim;

            var bg = $('div.bg', el, true);
            if (bg){
                bg.parentNode.removeChild(bg);
            }
            var arr = $('span.odds-arrow', el, true);
            if (arr){
                arr.parentNode.removeChild(arr);
            }
        };

        ZAPNET.COUPONS.showOddsChange = function(selEl, odds, dir){
            ZAPNET.COUPONS.stopOddsChangeAnimation(selEl);
            selEl.innerHTML = '<div class="bg bg-odds-' + dir + '"></div><div class="sel-odds"><span>' + odds + '</span><span class="odds-arrow odds-' + dir + '"></span></div>';
            Dom.setAttribute(selEl, 'odds', odds);
            var bg = $('div.bg', selEl, true);
            Dom.setStyle(bg, 'opacity', '0.5');
            /*
            var myAnim = new YAHOO.util.Anim(bg, {
                opacity: {
                    to: 0.2
                }
            }, 0.5, YAHOO.util.Easing.easeOut);
            myAnim.onComplete.subscribe(function(){
                myAnim.attributes.opacity.to = myAnim.attributes.opacity.to == 0.2 ? 0.5 : 0.2;
                myAnim.animate();
            });
            myAnim.animate();
            selEl.oddsChangeAnim = myAnim;
            */
            setTimeout(function(){
                ZAPNET.COUPONS.stopOddsChangeAnimation(selEl);
            }, 3500);
        };

        ZAPNET.COUPONS.oddsChange = function(type, selectionId, odds, dir){
            var couponEls = $('.' + type + '-coupon');
            Util.foreach(couponEls, function(couponEl){
                var selEl = $('table.coupon div[sid="' + selectionId + '"].selection', couponEl, true);
                if (selEl){
                    if (odds > 1){
                        var match = false;
                        if (ZAPNET.BetDB.selections[selectionId]){
                            match = ZAPNET.BetDB.selections[selectionId].market.match;
                            if (match.bets){
                                ZAPNET.COUPONS.showOddsChange(selEl, odds, dir);
                            } else {
                                Dom.setAttribute(selEl, 'odds', odds);
                                ZAPNET.COUPONS.stopOddsChangeAnimation(selEl);
                            }
                        }
                    } else {
                        Dom.removeClass(selEl, 'selection-on');
                        Dom.addClass(selEl, 'selection-na');
                        selEl.innerHTML = 'N/O';
                        Dom.setAttribute(selEl, 'odds', 0);
                    }
                }
            });
        };

        ZAPNET.BetDBReadyEvent.subscribe(function(){
            ZAPNET.BetDB.matchOddsChangeEvent.subscribe(function(data){
                var dir = data.odds < data.old ? 'down' : 'up';
                ZAPNET.COUPONS.oddsChange('matches', data.id, data.odds, dir);
            });

            ZAPNET.BetDB.outrightOddsChangeEvent.subscribe(function(data){
                var dir = data.odds < data.old ? 'down' : 'up';
                ZAPNET.COUPONS.oddsChange('outrights', data.id, data.odds, dir);
            });

            var resizeRes = window.ZAPNET_LIVETV_SETTINGS && ZAPNET_LIVETV_SETTINGS.FOURTHCOLRES ? ZAPNET_LIVETV_SETTINGS.FOURTHCOLRES : 1450;
            if (Dom.getViewportWidth() < resizeRes && !window.ZAPNET_SKIP_COUPON_RESIZE){
                ZAPNET.COUPONS.LIVE_COUPON.markets.splice(2, 1);
            }
        });

        return {
            oddsChange: ZAPNET.COUPONS.oddsChange
        };
    }();

}());