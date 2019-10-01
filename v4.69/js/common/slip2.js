(function(){

    var PRINT_TO_PRINTER = (window.location.search == '?p=1' || window.location.search == '?p=2' || window.location.search == '?p=3');
    var SPECIAL_PRINT_TO_PRINTER = (window.location.search == '?p=2');
    var SPECIAL_PRINT_GRAY = (window.location.search == '?p=3');

    var Event = YAHOO.util.Event,
        Dom = YAHOO.util.Dom,
        $ = YAHOO.util.Selector.query,
        Util = ZAPNET.util;

    var MIN_LINE_STAKE = ZAPNET_CONSTANTS.MIN_LINE_STAKE,
        MIN_SLIP_STAKE = ZAPNET_CONSTANTS.MIN_TOTAL_STAKE,
        MAX_SELECTIONS = ZAPNET_CONSTANTS.MAX_SELECTIONS,
        MAX_PAYOUT = ZAPNET_CONSTANTS.MAX_PAYOUT ? ZAPNET_CONSTANTS.MAX_PAYOUT : false,
        PAYOUT_BONUS = ZAPNET_CONSTANTS.BONUS ? ZAPNET_CONSTANTS.BONUS : false,
        PAYOUT_BONUS_MIN_ODDS = ZAPNET_CONSTANTS.BONUS_MINODDS ? ZAPNET_CONSTANTS.BONUS_MINODDS : 1.2,
        MAX_PAYOUT_BONUS = ZAPNET_CONSTANTS.MAX_BONUS ? ZAPNET_CONSTANTS.MAX_BONUS : false;

    ZAPNET.SELECTION_OK = 0;
    ZAPNET.SELECTION_NOT_AVAILABLE = 1;
    ZAPNET.SELECTION_ODDS_CHANGE = 2;
    ZAPNET.SELECTION_NO_BETS = 3;
    ZAPNET.MULTI_MATCH_SELECTIONS = 4;
    ZAPNET.MAX_SELECTIONS =5;

    var SELECTION_OUT_OF_RULES = ZAPNET_CONSTANTS.OUT_OF_RULES;
    var CYPRUS_RULE = ZAPNET_CONSTANTS.CYPRUS_RULE;
    var MATCH_MULTI_SELECTIONS = ZAPNET_CONSTANTS.SLIP_MATCHMULTI;
    var COMP_TYPES = {
        '1': 'Singles',
        '2': 'Doubles',
        '3': 'Trebles'
    };

    ZAPNET.BettingSlip = function(config){
        var dom = {
                pageFooter: Dom.get('ft'),
                slip: Dom.get('slip'),
                errors: Dom.get('slip-errors'),
                print: Dom.get('print'),
                printSlip: $('#print #print-coupon', null, true),
                topEmpty: $('#slip .top .empty', null, true),
                topInfo: $('#slip .top .info', null, true),
                topInfoLabel: $('#slip .top .info .label', null, true),
                topInfoAmount: $('#slip .top .info .amount', null, true),
                topInfoOdds: $('#slip .top .info .odds', null, true),
                bottom: $('#slip .bottom', null, true),
                opener: $('#slip .bottom .expand', null, true),
                content: $('#slip .content', null, true),
                stake: $('#slip .content .totals .total-cost .value', null, true),
                nrLines: $('#slip .content .totals .nr-lines', null, true),
                payout: $('#slip .content .totals .payout .value', null, true),
                selections: $('#slip .content .selections', null, true),
                menu: $('#slip .content .menu', null, true),
                systems: $('#slip .content .systems', null, true),
                groups: $('#slip .content .groups', null, true),
                groupSystems: $('#slip .content .group-systems', null, true),
                selectionPager: $('#slip .content .selections .pager', null, true),
                selectionsCurrentPage: Dom.get('selections-current-page'),
                selectionsTotalPages: Dom.get('selections-total-pages'),
                linesMode: $('#slip .linesmode', null, true),
                printFrame: $('#printframe iframe', null, true),
                submit: $('#slip .submitslip', null, true),
                cancel: $('#slip .clearslip', null, true),
                expandMask: $('#slip .bottom .expand-mask', null, true),
                expand: $('#slip .bottom .expand', null, true)
            },
            cfg = config || {
                acceptbet: false,
                fixHeight: true
            },
            matches = [],
            selections = [],
            systems = [],
            groups = [],
            groupSystems = [],
            splitSystem = null,
            multiSystem = null,
            betDB = ZAPNET.BetDB,
            systemReference = null,
            systemInfo = {},
            baseSystems = {},
            singleStake = null,
            selectedTab = 'SINGLE',
            lastGroup = 'a',
            nrGroups = 0,
            isSlipClosed = true,
            currentSelectionPage = 1,
            totalSelectionPages = 1,
            linesMode = '@',
            dirty = false,
            totalAmount = 0,
            combineCache = {},
            outrightsSlip = false,
            betTerminalCode = null,
            sellSlips = false,
            slipBusy = false,
            slipHasLineSubsets = false,
            lastSlipData = null,
            shakable = false,
            authCheck = false,
            maxPossiblePayout = null,
            totalPossiblePayout = 0,
            slipError = false,
            confirmPlacebet = false,
            acceptOddsChanges = false,
            showPrintSlipEvent = new YAHOO.util.CustomEvent('Show Print Slip'),
            selectionRemovedEvent = new YAHOO.util.CustomEvent('Remove Selection'),
            outrightRemovedEvent = new YAHOO.util.CustomEvent('Remove Outright'),
            selectionAddedEvent = new YAHOO.util.CustomEvent('Add Selection'),
            outrightAddedEvent = new YAHOO.util.CustomEvent('Add Outright'),
            betsPlacedEvent = new YAHOO.util.CustomEvent('Bets Placed', this, false, YAHOO.util.CustomEvent.FLAT),
            betbookEvent = new YAHOO.util.CustomEvent('Bet Booking', this, false, YAHOO.util.CustomEvent.FLAT),
            betsSentEvent = new YAHOO.util.CustomEvent('Bets Sent', this, false, YAHOO.util.CustomEvent.FLAT),
            betsResponseEvent = new YAHOO.util.CustomEvent('Bets Response', this, false, YAHOO.util.CustomEvent.FLAT),
            messageEvent = new YAHOO.util.CustomEvent('Slip Message', this, false, YAHOO.util.CustomEvent.FLAT),
            errorEvent = new YAHOO.util.CustomEvent('Slip Error', this, false, YAHOO.util.CustomEvent.FLAT),
            changeEvent = new YAHOO.util.CustomEvent('Change Error', this, false, YAHOO.util.CustomEvent.FLAT),
            renderEvent = new YAHOO.util.CustomEvent('Render', this, false, YAHOO.util.CustomEvent.FLAT),
            requestAuthEvent = new YAHOO.util.CustomEvent('Request Authorisation', this, false, YAHOO.util.CustomEvent.FLAT),
            slipClosedEvent = new YAHOO.util.CustomEvent('Slip Close', this, false, YAHOO.util.CustomEvent.FLAT),

        calculateAccumulatorOdds = function(){
            var i, odds = 1;

            for(i = 0; i < selections.length; i += 1){
                odds *= selections[i].odds;
            }

            return Util.formatOdds(odds);
        },

        fixSelectionPages = function(){
            var i, totalSels = selections.length;
            if (totalSels < 1){
                return;
            }
            Dom.setStyle(dom.content, 'display', 'block');
            Dom.setStyle(dom.selections, 'height', 'auto');
            for(i = 0; i < totalSels; i += 1){
                Dom.setStyle(selections[i].el, 'display', 'block');
            }
            Dom.setStyle(dom.selectionPager, 'display', 'none');
            var slipRegion = Dom.getRegion(dom.bottom);
            var footerY = Dom.getY(dom.pageFooter);
            var selHeight = Util.getDimensions(selections[0].el).height;
            if (slipRegion.bottom > footerY){
                Dom.setStyle(dom.selectionPager, 'display', 'block');
                slipRegion = Dom.getRegion(dom.bottom);
                var diff = slipRegion.bottom - footerY;
                var nrPageSels = totalSels - Math.ceil(diff / selHeight);
                totalSelectionPages = Math.ceil(totalSels/nrPageSels);
                currentSelectionPage = Math.min(currentSelectionPage, totalSelectionPages);
                var shownFrom = (currentSelectionPage - 1) * nrPageSels;
                var shownTo = currentSelectionPage * nrPageSels - 1;
                for(i = 0; i < totalSels; i += 1){
                    Dom.setStyle(selections[i].el, 'display', i >= shownFrom && i <= shownTo ? 'block' : 'none');
                }
                Dom.setStyle(dom.selections, 'height', (nrPageSels * selHeight) + 'px')
            } else {
                currentSelectionPage = 1;
                totalSelectionPages = 1;
            }
            dom.selectionsCurrentPage.innerHTML = currentSelectionPage;
            dom.selectionsTotalPages.innerHTML = totalSelectionPages;
            Dom.setStyle(dom.content, 'display', '');
        },

        generateCombinations = function(array, r) {
            function equal(a, b) {
                for (var i = 0; i < a.length; i++) {
                    if (a[i] != b[i]) return false;
                }
                return true;
            }
            function values(i, a) {
                var ret = [];
                for (var j = 0; j < i.length; j++) ret.push(a[i[j]]);
                return ret;
            }
            var n = array.length;
            var indices = [];
            for (var i = 0; i < r; i++) indices.push(i);
            var xfinal = [];
            for (i = n - r; i < n; i++) xfinal.push(i);
            var all = [];
            while (!equal(indices, xfinal)) {
                all.push(values(indices, array));
                i = r - 1;
                while (indices[i] == n - r + i) i -= 1;
                indices[i] += 1;
                for (var j = i + 1; j < r; j++) indices[j] = indices[i] + j - i;
            }
            all.push(values(indices, array));

            return all;
        },

        combine = function(a, ns){
            var len = a.length;
            var combo, pcombos, combos = [], k, i, j, arr, all = [], entry;

            for (k = 0; k < ns.length; k += 1){
                var n = ns[k];
                var idx = n + '/' + len;
                if (combineCache[idx]){
                    pcombos = combineCache[idx];
                } else {
                    arr = [];
                    for(i = 0; i < len; i += 1){
                        arr.push(i);
                    }
                    pcombos = generateCombinations(arr, n);
                    combineCache[idx] = pcombos;
                }
                combos = combos.length ? combos.concat(pcombos) : pcombos;
            }

            for(i = 0; i < combos.length; i += 1){
                combo = combos[i];
                entry = [];
                for(j = 0; j < combo.length; j += 1){
                    entry.push(a[combo[j]]);
                }
                all.push(entry);
            }

            return all;
        },

        getSelectionCombinations = function(superline, combs){
            var result = [];
            if (!superline[0]){
                return result;
            }
            var entry = superline[0];
            var selLineCombs;
            var i, j, k, l, sel, selLine, selection, betline, comb;
            var betlines = entry.alllines ? entry.alllines : entry.betlines;

            if (entry.combine){
                selLine = [];
                for(i = 0; i < betlines.length; i += 1){
                    betline = betlines[i];
                    for(j = 0; j < betline.length; j += 1){
                        selection = betline[j];
                        sel = {
                            id: selection.id,
                            marketId: selection.marketId,
                            mincomb: +selection.mincomb,
                            odds: selection.odds,
                            country: selection.country
                        };
                        selLine.push(sel);
                    }
                }
                if (entry.combineMax < selLine.length){
                    selLineCombs = combine(selLine, [entry.combineMax]);
                } else {
                    selLineCombs = [ selLine ];
                }
                if (combs){
                    for(k = 0; k < combs.length; k += 1){
                        comb = combs[k];
                        for(l = 0; l < selLineCombs.length; l += 1){
                            result.push(comb.concat(selLineCombs[l]));
                        }
                    }
                } else {
                    for(l = 0; l < selLineCombs.length; l += 1){
                        result.push(selLineCombs[l]);
                    }
                }
            } else {
                for(i = 0; i < betlines.length; i += 1){
                    betline = betlines[i];
                    selLine = [];
                    for(j = 0; j < betline.length; j += 1){
                        selection = betline[j];
                        sel = {
                            id: selection.id,
                            marketId: selection.marketId,
                            mincomb: +selection.mincomb,
                            odds: selection.odds,
                            country: selection.country
                        };
                        selLine.push(sel);
                    }
                    if (combs){
                        for(k = 0; k < combs.length; k += 1){
                            comb = combs[k];
                            result.push(comb.concat(selLine));
                        }
                    } else {
                        result.push(selLine);
                    }
                }
            }

            if (superline.length > 1){
                return getSelectionCombinations(superline.slice(1), result);
            } else {
                return result;
            }
        },

        generateSystems = function(bankers, variables, numbers, hideopts, test){
            var numCombs, combinations, pivot, options, minComb,  totallines,
                item, items, optionN, validLines, nrSels, nrBonusSels, invalid, nrVars,
                i, j, k, markets = {}, payout, betPayout, nrCyprus, nrNonCyprus,
                odds, betOdds, lines, betline, sublines, betlines = [],
                submarketId, submarket, submarkets, nrSelsOpts, bonus,
                allOptions, invalidOptions, finalOptions, option;

            minComb = false;
            items = variables.concat(bankers);
            if (SELECTION_OUT_OF_RULES){
                minComb = 1;
            } else {
                for(i = 0; i < items.length; i += 1){
                    for(j = 0; j < items[i].betlines.length; j += 1){
                        for(k = 0; k < items[i].betlines[j].length; k += 1){
                            item = items[i].betlines[j][k];
                            if (item.mincomb && (!minComb || item.mincomb > minComb)){
                                minComb = +item.mincomb;
                            }
                        }
                    }
                }
            }

            nrVars = variables.length;
            if (nrVars){
                numCombs = [];
                if (numbers && numbers.length){
                    for(i = 0; i < numbers.length; i += 1){
                        if (numbers[i] <= nrVars){
                            numCombs.push(numbers[i]);
                        }
                    }
                }
                if (!numCombs.length){
                    numCombs = [nrVars];
                }
                combinations = combine(variables, numCombs);
                for(i = 0; i < combinations.length; i += 1){
                    betline = bankers.concat(combinations[i]);
                    sublines = getSelectionCombinations(betline);
                    betlines = betlines.concat(sublines);
                }
                pivot = nrVars;
                options = [];
                if (!hideopts || !minComb){
                    for(i = 0; i <= nrVars; i += 1){
                        options.push(i);
                    }
                } else {
                    for(i = 0; i < +pivot + bankers.length - minComb + 1; i += 1){
                        optionN = i + +minComb - bankers.length;
                        options.push(optionN);
                    }
                }
            } else {
                betlines = getSelectionCombinations(bankers);
                numCombs = [1];
                options = [0];
                pivot = 1;
            }

            for(i = 0; i < betlines.length; i += 1){
                betline = betlines[i];
                submarkets = {};
                for(j = 0; j < betline.length; j += 1){
                    item = betline[j];
                    if (!submarkets[item.marketId]){
                        submarkets[item.marketId] = {
                            odds: 1,
                            ids: []
                        };
                    }
                    submarkets[item.marketId].ids.push(item.id);
                    submarkets[item.marketId].odds *= item.odds;
                }
                for(submarketId in submarkets){
                    if (submarkets.hasOwnProperty(submarketId)){
                        submarket = submarkets[submarketId];
                        if (!markets[submarketId]){
                            markets[submarketId] = {
                                odds: 0,
                                ids: []
                            };
                        }
                        if (submarket.odds > markets[submarketId].odds){
                            markets[submarketId].odds = submarket.odds;
                            markets[submarketId].ids = submarket.ids;
                        }
                    }
                }
            }

            odds = 0;
            lines = 0;
            bonus = 0;
            validLines = [];
            totallines = 0;
            payout = 0;
            allOptions = {};
            invalidOptions = {};
            for(i = 0; i < betlines.length; i += 1){
                betline = betlines[i];
                betOdds = 1;
                betPayout = 1;
                nrSels = betline.length;
                nrBonusSels = 0;
                nrSelsOpts = nrSels > bankers.length ? nrSels - bankers.length : 0;
                invalid = false;
                nrCyprus = 0;
                nrNonCyprus = 0;
                for(j = 0; j < betline.length; j += 1){
                    item = betline[j];
                    if (nrSels < item.mincomb){
                        if (!SELECTION_OUT_OF_RULES){
                            invalid = true;
                            break;
                        }
                    }
                    if (item.country == 'cyprus'){
                        nrCyprus += 1;
                    } else {
                        nrNonCyprus += 1;
                    }
                    betOdds *= betline[j].odds;
                    if (!markets[item.marketId] || $P.in_array(item.id, markets[item.marketId].ids)){
                        betPayout *= betline[j].odds;
                    } else {
                        betPayout = 0;
                    }
                    if (betline[j].odds >= PAYOUT_BONUS_MIN_ODDS){
                        nrBonusSels += 1;
                    }
                }
                totallines += 1;
                allOptions[nrSelsOpts] = true;
                if (CYPRUS_RULE && nrCyprus > 0 && nrNonCyprus < 3){
                    if (!SELECTION_OUT_OF_RULES){
                        invalid = true;
                    }
                }
                if (invalid){
                    invalidOptions[nrSelsOpts] = true;
                    continue;
                }
                lines += 1;
                odds += betOdds;
                payout += betPayout;
                if (PAYOUT_BONUS){
                    var maxBonusPercent = 0;
                    Util.foreach(PAYOUT_BONUS, function(bonusDef){
                        if (nrBonusSels >= bonusDef.selections && betOdds >= bonusDef.odds && bonusDef.bonus > maxBonusPercent){
                            maxBonusPercent = +bonusDef.bonus;
                        }
                    });
                    if (maxBonusPercent > 0){
                        bonus += betPayout * (maxBonusPercent / 100);
                    }
                }
                validLines.push(betline);
            }

            /*
            finalOptions = [];
            for(i = 0; i < options.length; i += 1){
                option = options[i];
                if (!invalidOptions[option]){
                    finalOptions.push(option);
                }
            }
            */

            if (lines !== totallines){
                lines = 0;
            }

            return {
                pivot: pivot,
                numbers: numCombs,
                options: options,
                odds: odds,
                payout: payout,
                lines: lines,
                bonus: bonus,
                totallines: totallines,
                selections: betlines,
                betlines: validLines,
                alllines: betlines
            };
        },

        getSlipElement = function(className){
            var selEl = Util.div(className),
                deleteEl = Util.div('del'),
                amountEl = Util.div('amount'),
                oddsEl = Util.div('odds');
            Util.addElements(selEl, [oddsEl, amountEl, deleteEl]);
            return selEl;
        },

        setEntryData = function(selection, el){
            var elDom = {
                    amount: $('.amount', el, true),
                    odds: $('.odds', el, true),
                    label: $('.label p', el, true) || $('.label', el, true),
                    title: $('.title', el, true),
                    group: $('.group', el, true),
                    banker: $('.banker', el, true),
                    combine: $('.combine', el, true),
                    systemSelect: $('.system-select', el, true),
                    systemNumbers: $('.system-numbers', el, true),
                    systemSelectCode: $('.system-select .system-code', el, true),
                    betLines: $('.n-lines', el, true)
                },
                data = {
                    amount: selection.amount ? Util.formatAmount(selection.amount) : '',
                    odds: Util.formatOdds(selection.odds),
                    payout: 'payout' in selection ? Util.formatOdds(selection.payout) : Util.formatOdds(selection.odds),
                    originalOdds: selection.originalOdds ? Util.formatOdds(selection.originalOdds) : null,
                    system: selection.system ? selection.system : null,
                    groupClass: selection.group ? 'group group-' + selection.group.toLowerCase() : 'group',
                    systemCode: selection.system ? selection.number + '/' + selection.pivot : null,
                    betLines: 'lines' in selection ? selection.lines + linesMode : null
                };

            if (elDom.amount && data.amount != elDom.amount.innerHTML){
                elDom.amount.innerHTML = data.amount;
            }
            if (elDom.amount){
                if (data.amount){
                    Dom.addClass(elDom.amount, 'amount-active');
                } else {
                    Dom.removeClass(elDom.amount, 'amount-active');
                }
            }

            if (elDom.odds){
                if (data.originalOdds && data.originalOdds != data.payout){
                    elDom.odds.innerHTML = '<div class="newodds">' + data.payout + '</div><div class="oldodds">' + data.originalOdds + '</div>';
                    Dom.addClass(el, 'odds-change');
                } else {
                    elDom.odds.innerHTML = data.payout;
                    Dom.removeClass(el, 'odds-change');
                }
            }
            if (elDom.label && selection.label && elDom.label && selection.label != elDom.label.innerHTML){
                elDom.label.innerHTML = selection.label;
            }
            if (elDom.title && selection.title && selection.title != elDom.title.innerHTML){
                elDom.title.innerHTML = (selection.match.code ? selection.match.code + ' ' : '') + selection.title;
            }
            if (elDom.banker && selection.banker != Dom.hasClass(elDom.banker, 'banker-on')){
                if (selection.banker){
                    Dom.addClass(elDom.banker, 'banker-on');
                } else {
                    Dom.removeClass(elDom.banker, 'banker-on');
                }
            }
            if (elDom.combine){
                if (selection.combine){
                    Dom.addClass(elDom.combine, 'combine-on');
                } else {
                    Dom.removeClass(elDom.combine, 'combine-on');
                }
            }
            if (elDom.group){
                elDom.group.className = data.groupClass;
            }
            if (data.system && elDom.systemSelectCode && data.systemCode != elDom.systemSelectCode.innerHTML){
                elDom.systemSelectCode.innerHTML = data.systemCode;
            }
            if (data.system && elDom.systemSelect && selection.plus != Dom.hasClass(elDom.systemSelect, 'system-select-plus')){
                if (selection.plus){
                    Dom.addClass(elDom.systemSelect, 'system-select-plus');
                } else {
                    Dom.removeClass(elDom.systemSelect, 'system-select-plus');
                }
            }
            if (elDom.betLines && data.betLines != elDom.betLines.innerHTML){
                elDom.betLines.innerHTML = data.betLines;
                if (selection.totallines && selection.totallines > selection.lines){
                    Dom.addClass(elDom.betLines, 'n-lines-subset');
                } else {
                    Dom.removeClass(elDom.betLines, 'n-lines-subset');
                }
            }
            if (elDom.systemNumbers){
                var i, n, sysNum, sysNumWidth = 0,
                    sysNums = $('.system-number', elDom.systemNumbers);
                if (!SELECTION_OUT_OF_RULES && selection.lines == 0){
                    Dom.addClass(el, 'not-available');
                } else {
                    Dom.removeClass(el, 'not-available');
                }
                for(i = 0; i < selection.options.length; i += 1){
                    n = selection.options[i];
                    if (sysNums[i]){
                        sysNum = sysNums[i];
                    } else {
                        sysNum = Util.div('system-number');
                        elDom.systemNumbers.appendChild(sysNum);
                    }
                    Dom.setAttribute(sysNum, 'num', n);
                    sysNum.innerHTML = n;
                    if (!sysNumWidth){
                        sysNumWidth = Util.getDimensions(sysNum).width;
                    }
                    Dom.setStyle(sysNum, 'left', ((i%6)*(sysNumWidth + 2)) + 'px');
                    Dom.setStyle(sysNum, 'top', (Math.floor(i/6) * 26) + 'px');
                    if ($P.in_array(n, selection.numbers)){
                        Dom.addClass(sysNum, 'system-number-selected');
                    } else {
                        Dom.removeClass(sysNum, 'system-number-selected');
                    }
                }
                var height = (Math.ceil((i > 0 ? i : 1) / 6) * 26);
                Dom.setStyle(elDom.systemNumbers, 'height', height + 'px');
                Dom.setStyle(el, 'height', (height + 4) + 'px');
                for(; i < sysNums.length; i += 1){
                    sysNums[i].parentNode.removeChild(sysNums[i]);
                }
            }
        },

        repageSelections = function(){
            var slipRegion = Dom.getRegion(dom.bottom);
            var footerY = Dom.getY(dom.pageFooter);
            if (slipRegion.bottom > footerY){

            }
        },

        getSelectionsPage = function(){
            var lines = Util.div('lines'),
                page = Util.div('page', lines);

            dom.selections.appendChild(page);

            return lines;
        },

        render = function(){
            Dom.removeClass(dom.slip, 'confirm-placebet');

            if (matches.length == 0){
                systemReference = null;
                slipError = '';
                Dom.addClass(dom.slip, 'empty');
                dom.slip.innerHTML = '<div class="empty-slip">' + Util.t('There are no bets in your Betting Slip. To add bets please click on any odds.') + '</div>';
                renderEvent.fire();
                return;
            }

            Dom.removeClass(dom.slip, 'empty');

            var i, j, html = [], match, nrBankers = 0, nrSelections = 0, nrMatches = 0, selection;

            html.push('<div class="slip-content"><div class="nomatches">No. Events: ', matches.length, '</div>');
            if (slipError){
                html.push('<div class="slip-error">', slipError, '</div>');
            }
            for(i = 0; i < matches.length; i += 1){
                match = matches[i];
                nrMatches += 1;
                if (match.banker){
                    nrBankers += 1;
                }
                html.push('<div class="match-line bet-line" mid="', match.id, '"><div class="match-label"><div class="code">', match.match.code);
                html.push('</div><div class="banker"><a class="banker', (match.banker ? ' banker-on' : ''));
                html.push('" href="#"></a></div><div class="header">', match.title, '</div><div class="match-info" title="');
                html.push(match.categoryTitle);
                html.push('"></div></div>');
                for(j = 0; j < match.selections.length; j += 1){
                    selection = match.selections[j];
                    nrSelections += 1;
                    html.push('<div class="bet-line" sid="', selection.id, '"><a href="#" class="del"></a>');
                    html.push('<div class="label"><span class="mark">', Util.t('Mark'), ':&nbsp;</span>', selection.label);
                    html.push('</div><div class="odds">', Util.formatOdds(selection.odds), '</div></div>');
                }
                html.push('</div>');
            }
            var system = false;
            var combine = false;
            var tabs = [];
            if (nrSelections > nrMatches){
                tabs.push('SPLIT COLUMN BET');
                system = splitSystem;
                selectedTab = 'SPLIT COLUMN BET';
            } else if (nrSelections > 1){
                var allowCombos = true;
                if (allowCombos){
                    if (selectedTab != 'COMBINE'){
                        selectedTab = 'MULTIPLE';
                    }
                    tabs.push('MULTIPLE');
                    tabs.push('COMBINE');
                    system = multiSystem;
                    combine = true;
                } else {
                    selectedTab = 'MULTIPLE';
                    tabs.push('MULITPLE');
                    system = multiSystem;
                    combine = false;
                }
            } else {
                selectedTab = 'SINGLE';
                tabs.push('SINGLE');
                system = selection;
            }
            var lineAmount = systemReference && systemReference.amount ? systemReference.amount : 0;
            var maxOdds = (system.payout ? system.payout : system.odds) || 0;
            var amount = lineAmount || 0;
            var stake = system.amount || 0;
            var bonus = system.bonus && amount ? system.bonus * amount : 0;
            if(MAX_PAYOUT_BONUS){
                bonus = Math.min(MAX_PAYOUT_BONUS, bonus);
            }
            var payout = maxOdds * amount + +bonus;
            if (maxPossiblePayout){
                payout = Math.min(payout, maxPossiblePayout);
            }
            var totalStake = 0;
            var totalPayout = 0;
            var totalBonus = 0;
            system.amount = amount;
            systemReference = system;
            if (combine){
                html.push('<div class="tab-holder"><div class="system-head">');
                Util.foreach(tabs, function(tab, i){
                    html.push('<div class="slip-head-tab ', tab, '-head-tab slip-head-tab-', (i+1));
                    if (tab == selectedTab){
                        html.push(' tab-head-selected');
                    }
                    html.push('" tab-type="', tab, '">', Util.t(tab), '</div>');
                });
                html.push('</div></div>');
                html.push('<div class="systems tab-systems">');
            } else {
                html.push('<div class="systems">');
                html.push('<div class="system-head">', Util.t(tabs[0]), '</div>');
            }
            if (selectedTab == 'COMBINE'){
                Dom.removeClass(dom.slip, 'no-bankers');
            } else {
                Dom.addClass(dom.slip, 'no-bankers');
            }

            var allowBets = ((system.mincomb && +system.mincomb === 1) || (system.betlines && system.betlines.length) || (systems.length && systems[0].betlines.length)) ? true : false;
            html.push('<div class="system-content">');
            html.push('<div class="slip-tab main-tab', selectedTab == 'COMBINE' ? '' : ' tab-selected' ,'"><div class="system-lines">');
            html.push('<div class="info-line"><div class="label">', Util.t('Max Odds'), ':</div><div class="value">', Util.formatOdds(system.payout ? system.payout : system.odds), '</div></div>');
            html.push('<div class="info-line"><div class="label">', Util.t('Stake'), ':</div><div class="value"><span id="slip-nr-lines">', (system.lines > 1 ? system.lines + ' x ' : ''), '</span><input id="slip-stake-input" class="amount" type="text" name="perline" ', (allowBets ? '' : ' disabled="disabled"'), ' value="', (allowBets && amount ? Util.formatAmount(amount) : ''),'"/> ', ZAPNET_CONSTANTS.CURRENCY, '</div></div>');
            html.push('<div class="info-line"><div class="label">', Util.t('Total Stake'), ':</div><div class="value"> = <input id="slip-total-stake" class="amount" disabled="disabled" type="text" name="totalstake" value="', stake ? Util.formatAmount(stake) : '','"/> ', ZAPNET_CONSTANTS.CURRENCY, '</div></div>');
            html.push('<div class="info-line"><div class="label">', Util.t('Total Bonus'), ':</div><div class="value"> = <input id="slip-total-bonus" class="amount" disabled="disabled" type="text" name="totalbonus" value="', bonus ? Util.formatAmount(bonus) : '','"/> ', ZAPNET_CONSTANTS.CURRENCY, '</div></div>');
            html.push('<div class="info-line winnings"><div class="label">', Util.t('Max. Pot. Winnings'), ':</div><div class="value"><span id="slip-max-payout">', Util.formatAmount(payout), '</span> ', ZAPNET_CONSTANTS.CURRENCY, '</div></div>');
            html.push('</div></div>');
            if (combine){
                html.push('<div class="slip-tab combine-tab', selectedTab == 'COMBINE' ? ' tab-selected' : '' ,'">');
                html.push('<div class="system-combine-head"><span class="type">', Util.t('Type'), '</span><span class="ncomb">', Util.t('N. Comb.'), '</span><span class="amount">', Util.t('Amount'), '</span></div>');
                var systemNs = {};
                if (nrBankers){
                    systemNs[0] = 1;
                }
                Util.foreach(systems[0].options, function(n){
                    var nLines = baseSystems[n] ? baseSystems[n].lines : '-';
                    if (!systemNs[n]){
                        systemNs[n] = {amount: 0, lines: 0};
                    }
                    systemNs[n].lines = nLines;
                });
                Util.foreach(systems, function(sys){
                    if (sys.amount){
                        Util.foreach(sys.numbers, function(n){
                            if (!systemNs[n]){
                                systemNs[n] = {amount: 0, lines: 0};
                            }
                            systemNs[n].amount = sys.amount;
                        });
                    }
                });

                html.push('<div id="playall-line" class="info-line"><div class="label"><a class="playall" href="#">', Util.t('Play all'), '</a></div><div class="value"><input class="amount"  ', (allowBets ? '' : ' disabled="disabled"'), ' type="text" value=""/> ', ZAPNET_CONSTANTS.CURRENCY, '</div></div>');
                Util.foreach(systemNs, function(multiSys, sys){
                    var n = +sys + nrBankers;
                    var combType = n < 4 ? Util.t(COMP_TYPES[n]) : n + '-' + Util.t('fold');
                    if (multiSys.amount){
                        totalStake += multiSys.amount;
                        totalPayout += multiSys.amount * (multiSys.payout ? multiSys.payout : multiSys.odds);
                        totalBonus += multiSys.bonus ? multiSys.bonus : 0;
                    }
                    html.push('<div class="info-line combine-line" system="', sys, '"><div class="label"><input class="system-select" type="checkbox"/>&nbsp;<span class="comb-type">', combType, '</span></div><span class="n-lines">', multiSys.lines, '&nbsp;x</span><div class="value"><input class="combine-amount" type="text" value="', (multiSys.amount ? Util.formatAmount(multiSys.amount) : ''),'"/> ', ZAPNET_CONSTANTS.CURRENCY, '</div></div>');
                });
                html.push('<div class="info-line"><div class="label">', Util.t('Number of Lines'), ':</div><div class="value"><span id="slip-combine-nr-lines"></span></div></div>');
                html.push('<div class="info-line"><div class="label">', Util.t('Total Stake'), ':</div><div class="value"><input id="slip-combine-total-stake" class="amount" disabled="disabled" type="text" value="', (totalStake ? Util.formatAmount(totalStake) : ''),'"/> ', ZAPNET_CONSTANTS.CURRENCY, '</div></div>');
                html.push('<div class="info-line"><div class="label">', Util.t('Total Bonus'), ':</div><div class="value"><input id="slip-combine-total-bonus" class="amount" disabled="disabled" type="text" value="', (totalBonus ? Util.formatAmount(totalBonus) : ''),'"/> ', ZAPNET_CONSTANTS.CURRENCY, '</div></div>');
                html.push('<div class="info-line winnings"><div class="label">', Util.t('Max. Pot. Winnings'), ':</div><div class="value"><span id="slip-combine-max-payout">', Util.formatAmount(totalPayout + totalBonus), '</span> ', ZAPNET_CONSTANTS.CURRENCY, '</div></div>');
                html.push('</div>');
            }
            html.push('</div></div>');
            html.push('<div class="slip-options"><input type="checkbox" id="slip-accept-odds-changes" ', (acceptOddsChanges ? ' checked="checked"' : ''), '/> <label for="slip-accept-odds-changes">', Util.t('Accept Odds Changes'), '</label></div>');
            html.push('<div class="slip-controls"><a href="#" class="slip-confirm">', Util.t('CONFIRM'), '</a><a href="#" class="slip-cancel">', Util.t('CANCEL'), '</a>');
            html.push('<a href="#" class="slip-submit">', Util.t('CONTINUE'), '</a></div>');
            html.push('<div class="slip-controls-busy">');
            html.push('</div>');
            html.push('</div>');
            dom.slip.innerHTML = html.join('');
            if (slipBusy){
                Dom.addClass(dom.slip, 'busy');
                showSlipBusy();
            }

            dom.nrLines = Dom.get('slip-nr-lines');
            dom.stake = Dom.get('slip-total-stake');
            dom.amount = Dom.get('slip-stake-input');
            dom.payout = Dom.get('slip-max-payout');
            dom.bonus = Dom.get('slip-total-bonus');
            dom.combineNrLines = Dom.get('slip-combine-nr-lines');
            dom.combineStake = Dom.get('slip-combine-total-stake');
            dom.combineBonus = Dom.get('slip-combine-total-bonus');
            dom.combinePayout = Dom.get('slip-combine-max-payout');
            systemReference.amountInput = dom.amount;
            slipError = '';

            if (!PAYOUT_BONUS){
                Dom.setStyle(Dom.getAncestorByClassName(dom.bonus, 'info-line'), 'display', 'none');
                Dom.setStyle(Dom.getAncestorByClassName(dom.combineBonus, 'info-line'), 'display', 'none');
            }

            calculateAmounts();

            renderEvent.fire();
        },

        showSlipBusy = function(){
            var slipControlsBusy = $('div.slip-controls-busy', dom.slip, true);
            slipControlsBusy.innerHTML = '<div class="loader" title="2"><svg version="1.1" id="loader-1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="40px" viewBox="0 0 50 50" style="enable-background:new 0 0 50 50;" xml:space="preserve"><path fill="#000" d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z"><animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.6s" repeatCount="indefinite"/></path></svg></div><div class="loading-label">' + Util.t('Please wait') + '...</div>';
        },

        render2 = function(){
            var i = 0, j = 0,
                selection, selectionEl, selectionEls,
                system, systemEl, systemEls, groupSys,
                group, groupEl, groupEls, groupSystemEl, groupSystemEls,
                match, matchEl,
                slipClass, pageN, pageEl, pageEls;

            if (selections.length){
                Dom.setStyle(dom.topEmpty, 'display', 'none');
                Dom.setStyle(dom.topInfo, 'display', 'block');
                if (selections.length == 1){
                    dom.topInfoLabel.innerHTML = '1 ' + Util.t('Selection');
                } else {
                    dom.topInfoLabel.innerHTML = selections.length + ' ' + Util.t('Selections');
                }
                var totalOdds = calculateAccumulatorOdds();
                dom.topInfoOdds.innerHTML = totalOdds;
                Dom.removeClass(dom.slip, 'empty');
            } else {
                Dom.setStyle(dom.topEmpty, 'display', 'block');
                Dom.setStyle(dom.topInfo, 'display', 'none');
                Dom.addClass(dom.slip, 'empty');
                Dom.replaceClass(dom.opener, 'contract', 'expand');
            }

            slipClass = dom.slip.className;
            Dom.removeClass(dom.slip, 'closed');
            Dom.addClass(dom.slip, 'processing');

            systemEls = $('div.system', dom.systems)
            for(i = 0; i < systems.length; i += 1){
                system = systems[i];
                if (systemEls[i]){
                    systemEl = systemEls[i];
                } else {
                    systemEl = getSlipElement('system bet-line' + (i ? ' deletable' : ''));
                    //Util.addElements(systemEl, [Util.div('n-lines'), Util.div('system-line'), Util.div('system-plus'), Util.div('system-select', [Util.div('system-code'), Util.div('plus')])]);
                    Util.addElements(systemEl, [Util.div('n-lines'), Util.div('system-line'), Util.div('system-plus'), Util.div('system-numbers')]);
                    dom.systems.appendChild(systemEl);
                }
                systemEl.data = system;
                setEntryData(system, systemEl);
                system.el = systemEl;
            }
            for(; i < systemEls.length; i += 1){
                systemEl = systemEls[i];
                systemEl.parentNode.removeChild(systemEl);
            }

            groupEls = $('div.group-line', dom.groups)
            for(i = 0; i < groups.length; i += 1){
                group = groups[i];
                if (groupEls[i]){
                    groupEl = groupEls[i];
                } else {
                    groupEl = getSlipElement('group-line bet-line');
                    //Util.addElements(groupEl, [Util.div('n-lines'), Util.div('banker'), Util.div('group'), Util.div('system-select', [Util.div('system-code'), Util.div('plus')])]);
                    Util.addElements(groupEl, [Util.div('n-lines'), Util.div('banker'), Util.div('group'), Util.div('system-numbers')]);
                    dom.groups.appendChild(groupEl);
                }
                groupEl.data = group;
                setEntryData(group, groupEl);
            }
            for(; i < groupEls.length; i += 1){
                groupEl = groupEls[i];
                groupEl.parentNode.removeChild(groupEl);
            }

            groupSystemEls = $('div.system', dom.groupSystems);
            for(i = 0; i < groupSystems.length; i += 1){
                groupSys = groupSystems[i];
                if (groupSystemEls[i]){
                    groupSystemEl = groupSystemEls[i];
                } else {
                    groupSystemEl = getSlipElement('system bet-line' + (i ? ' deletable' : ''));
                    // Util.addElements(groupSystemEl, [Util.div('n-lines'), Util.div('group-systems'), Util.div('system-select', [Util.div('system-code'), Util.div('plus')])]);
                    Util.addElements(groupSystemEl, [Util.div('n-lines'), Util.div('group-system-line'), Util.div('group-system-plus'), Util.div('system-numbers')]);
                    dom.groupSystems.appendChild(groupSystemEl);
                }
                groupSystemEl.data = groupSys;
                setEntryData(groupSys, groupSystemEl);
                groupSys.el = groupSystemEl;
            }
            for(; i < groupSystemEls.length; i += 1){
                groupSystemEl = groupSystemEls[i];
                groupSystemEl.parentNode.removeChild(groupSystemEl);
            }


            var sysY = Dom.getY(dom.systems),
                botY = Dom.getY(dom.bottom) + Util.getDimensions(dom.bottom).height,
                footerY = Dom.getY(dom.pageFooter),
                contentY = Dom.getY(dom.content),
                selSpace = (footerY - contentY - botY + sysY),
                fullSpace = footerY - contentY,
                pageHeight,
                pageSpace = selSpace,
                mincombEl,
                elems,
                overMax = false;

            dom.selections.innerHTML = '';
            pageEl = getSelectionsPage();
            for(i = 0 ; i < matches.length; i += 1){
                match = matches[i];
                matchEl = Util.div('match bet-line');
                elems = [Util.div('title'), Util.div('banker'), Util.div('group'), Util.div('code')];
                if (match.combineMax && match.combineMax > 1 && match.selections.length > 1){
                    elems.push(Util.div('combine'));
                }
                Util.addElements(matchEl, elems);
                pageEl.appendChild(matchEl);
                matchEl.data = match;
                setEntryData(match, matchEl);
                if (i == 0){
                    Dom.addClass(matchEl, 'match-first');
                }
                match.el = matchEl;
                for(j = 0; j < match.selections.length; j += 1){
                    selection = match.selections[j];
                    selectionEl = getSlipElement('selection bet-line');
                    mincombEl = Util.div('mincomb mincomb-' + selection.mincomb, selection.mincomb <= 3 ? '' : selection.mincomb + '+');
                    Util.addElements(selectionEl, [Util.div('label', Util.elem('p')), mincombEl]);
                    pageEl.appendChild(selectionEl);
                    Dom.setAttribute(selectionEl, 'sid', selection.id);
                    selection.single = true;
                    if (selection.mincomb > 1 || (selection.country == 'cyprus' && CYPRUS_RULE)){
                        if (!SELECTION_OUT_OF_RULES){
                            selection.single = false;
                            Dom.addClass(selectionEl, 'not-available');
                        }
                    }
                    selectionEl.data = selection;
                    setEntryData(selection, selectionEl);
                    selection.el = selectionEl;
                }
                pageHeight = Util.getDimensions(pageEl).height;
                if (cfg.fixHeight){
                    if (pageHeight > pageSpace){
                        overMax = true;
                        Dom.setStyle(dom.selections, 'height', selSpace + 'px');
                        Dom.setStyle(Dom.getAncestorByClassName(pageEl, 'page'), 'height', pageSpace + 'px');
                        pageEl = getSelectionsPage();
                        pageSpace = fullSpace;
                        matchEl.parentNode.removeChild(matchEl);
                        pageEl.appendChild(matchEl);
                        for(j = 0; j < match.selections.length; j += 1){
                            selectionEl = match.selections[j].el;
                            selectionEl.parentNode.removeChild(selectionEl);
                            pageEl.appendChild(selectionEl);
                        }
                    }
                }
            }
            if (selections.length && !overMax){
                Dom.setStyle(dom.selections, 'height', pageHeight + 'px');
            } else if (!selections.length) {
                Dom.setStyle(dom.selections, 'height', 'auto');
            }
            pageEls = $('.page', dom.selections);
            for(i = 1; i < pageEls.length; i += 1){
                Dom.setStyle(pageEls[i], 'left', (-1 * i * 400) + 'px');
            }

            dom.slip.className = slipClass;
            if (!selections.length){
                Dom.addClass(dom.slip, 'closed');
            }

            calculateAmounts();

            if (Dom.hasClass(dom.slip, 'closed') && selections.length){
                shakeSlip();
            }

            if (selections.length){
                Dom.removeClass(dom.slip, 'recover');
            }

            validatePerLine();

            // Dom.get('betslip-date-time').value = $P.date('Y-m-d H:i');

            renderEvent.fire();
        },

        shakeOnChange = function(b){
            shakable = b;
        },

        shakeSlip = function(){
            if (Dom.hasClass(dom.slip, 'highlight') || !shakable){
                return;
            }

            var y = Dom.getX(dom.slip);
            Dom.addClass(dom.slip, 'highlight');
            var count = 10;
            var offset = 5;
            var moveSlip = function(){
                offset = offset > 0 ? -5 : 5;
                Dom.setX(dom.slip, y + offset);
                count -= 1;
                if (count > 0){
                    setTimeout(moveSlip, 100);
                } else {
                    Dom.setStyle(dom.slip, 'left', '');
                    Dom.removeClass(dom.slip, 'highlight');
                }
            };
            moveSlip();
        },

        groupSort = function(a, b){
            return a.group.charCodeAt(0) - b.group.charCodeAt(0);
        },

        processSelections = function(){
            var i, j, nrMatches = matches.length, system, lines, odds,
                match, selection, free = [], bankers = [], pivot,
                systemSchedule, sys, groupBankers = [], sysAmount,
                groupName, newGroups, groupMap, group, groupSystem,
                selectionGroup, selectionGroups = {};

            if (!nrMatches){
                selections = [];
                matches = [];
                systems = [];
                groups = [];
                groupSystems = [];
                render();
                dirty = false;
                saveSessionSlip();
                return;
            }

            dirty = true;
            maxPossiblePayout = MAX_PAYOUT ? MAX_PAYOUT : null;

            for(i = 0 ; i < matches.length; i += 1){
                match = matches[i];
                lines = 0;
                odds = 0;
                match.betlines = [];
                for(j = 0; j < match.selections.length; j += 1){
                    selection = match.selections[j];
                    lines += 1;
                    odds += +selection.odds;
                    if (selection.mincomb > 1){
                        selection.amount = 0;
                    }
                    if (selection.maxPayout && (maxPossiblePayout === null || +selection.maxPayout < +maxPossiblePayout)){
                        maxPossiblePayout = +selection.maxPayout;
                    }
                    match.betlines.push([selection]);
                }
                match.lines = lines;
                match.odds = odds;
                if (match.banker){
                    bankers.push(match);
                } else {
                    free.push(match);
                }
                if (match.group){
                    groupName = match.group;
                    if (!selectionGroups[groupName]){
                        selectionGroups[groupName] = {
                            bankers: [],
                            free: [],
                            nr: 0
                        };
                    }
                    selectionGroups[groupName].nr += 1;
                    if (match.banker){
                        selectionGroups[groupName].bankers.push(match);
                    } else {
                        selectionGroups[groupName].free.push(match);
                    }
                }
            }

            if (nrMatches > 1 || selections.length > 1){
                pivot = free.length ? free.length : nrMatches;
                for(i = 0 ; i < matches.length; i += 1){
                    match = matches[i];
                    for(j = 0; j < match.selections.length; j += 1){
                        match.selections[j].amount = 0;
                    }
                }
                if (nrMatches < selections.length){
                    sysAmount = splitSystem ? splitSystem.amount : 0;
                    splitSystem = generateSystems([], matches, [nrMatches]);
                    splitSystem.amount = sysAmount;
                    systems = [];
                    multiSystem = null;
                } else {
                    splitSystem = null;
                    if (systems.length){
                        for(i = 0; i < systems.length ; i += 1){
                            system = systems[i];
                            for(j = 0; j < system.numbers.length; j += 1){
                                system.numbers[j] = pivot - (system.pivot - system.numbers[j]);
                            }
                            sys = generateSystems(bankers, free, system.numbers, true);
                            system.pivot = sys.pivot;
                            system.options = sys.options;
                            system.numbers = sys.numbers && sys.numbers.length ? sys.numbers : [sys.pivot];
                            system.lines = sys.lines;
                            system.bonus = sys.bonus;
                            system.odds = sys.odds;
                            system.payout = sys.payout;
                            system.totallines = sys.totallines;
                            system.betlines = sys.betlines;
                            system.alllines = sys.alllines;
                        }
                    } else {
                        sys = generateSystems(bankers, free, null, true);
                        system = {
                            options: sys.options,
                            numbers: sys.numbers,
                            pivot: sys.pivot,
                            lines: sys.lines,
                            bonus: sys.bonus,
                            odds: sys.odds,
                            payout: sys.payout,
                            amount: 0,
                            totallines: sys.totallines,
                            betlines: sys.betlines,
                            alllines: sys.alllines
                        };
                        systems.push(system);
                    }

                    sysAmount = multiSystem ? multiSystem.amount : 0;
                    multiSystem = generateSystems([], matches, [nrMatches]);
                    multiSystem.amount = sysAmount;

                    baseSystems = {};
                    if(free.length < 11) {
                        for(i = 0; i <= free.length; i += 1){
                            baseSystems[i] = generateSystems(bankers, free, [i], true);
                        }
                    }
                }
            } else {
                multiSystem = null;
                splitSystem = null;
                systems = [];
            }

            newGroups = [];
            groupMap = {};
            for(i = 0; i < groups.length; i += 1){
                groupName = groups[i].name;
                if (selectionGroups[groupName]){
                    newGroups.push(groups[i]);
                    groupMap[groupName] = groups[i];
                }
            }
            groups = newGroups;
            ZAPNET.testslip = {
                selections: selections,
                groups: groups,
                selectionGroups: selectionGroups,
                systems: systems,
                matches: matches
            };
            //bankers = [];
            free = [];
            groupBankers = [];
            for(groupName in selectionGroups){
                if (selectionGroups.hasOwnProperty(groupName)){
                    selectionGroup = selectionGroups[groupName];
                    if (groupMap[groupName]){
                        group = groupMap[groupName];
                        pivot = selectionGroup.free.length ? selectionGroup.free.length : selectionGroup.nr;
                        for(i = 0; i < group.numbers.length; i += 1){
                            group.numbers[i] = pivot - (group.pivot - group.numbers[i]);
                        }
                        sys = generateSystems(selectionGroup.bankers, selectionGroup.free, group.numbers);
                        group.group = groupName;
                        group.pivot = sys.pivot;
                        group.options = sys.options;
                        group.numbers = sys.numbers && sys.numbers.length ? sys.numbers : [group.pivot];
                        group.lines = sys.lines;
                        group.bonus = sys.bonus;
                        group.odds = sys.odds;
                        group.payout = sys.payout;
                        group.totallines = sys.totallines;
                        group.betlines = sys.betlines;
                        group.alllines = sys.alllines;
                    } else {
                        sys = generateSystems(selectionGroup.bankers, selectionGroup.free);
                        group = {
                            name: groupName,
                            group: groupName,
                            system: sys.name,
                            options: sys.options,
                            numbers: sys.numbers,
                            pivot: sys.pivot,
                            lines: sys.lines,
                            bonus: sys.bonus,
                            odds: sys.odds,
                            payout: sys.payout,
                            totallines: sys.totallines,
                            alllines: sys.alllines,
                            betlines: sys.betlines,
                            amount: 0,
                            banker: false
                        };
                        groups.push(group);
                    }
                    if (group.numbers.length){
                        if (group.banker){
                            groupBankers.push(group);
                            bankers.push(group);
                        } else {
                            free.push(group);
                        }
                    }
                }
            }

            groups.sort(groupSort);

            if (groupBankers.length + free.length > 1){
                if (groupSystems.length){
                    for(i = 0; i < groupSystems.length; i += 1){
                        groupSystem = groupSystems[i];
                        pivot = free.length ? free.length : bankers.length;
                        for(j = 0; j < groupSystem.numbers.length; j += 1){
                            groupSystem.numbers[j] = pivot - (groupSystem.pivot - groupSystem.numbers[j]);
                        }
                        systemSchedule = generateSystems(bankers, free, groupSystem.numbers);
                        sys = systemSchedule;
                        groupSystem.pivot = sys.pivot;
                        groupSystem.options = sys.options;
                        groupSystem.numbers = sys.numbers;
                        groupSystem.lines = sys.lines;
                        groupSystem.odds = sys.odds;
                        groupSystem.bonus = sys.bonus;
                        groupSystem.payout = sys.payout;
                        groupSystem.totallines = sys.totallines;
                        groupSystem.betlines = sys.betlines;
                        groupSystem.alllines = sys.alllines;
                    }
                } else {
                    systemSchedule = generateSystems(bankers, free);
                    sys = systemSchedule;
                    groupSystem = {
                        options: sys.options,
                        numbers: sys.numbers,
                        pivot: sys.pivot,
                        lines: sys.lines,
                        odds: sys.odds,
                        bonus: sys.bonus,
                        payout: sys.payout,
                        totallines: sys.totallines,
                        betlines: sys.betlines,
                        alllines: sys.alllines,
                        amount: 0
                    };
                    groupSystems.push(groupSystem);
                }
            } else {
                groupSystems = [];
            }

            render();

            saveSessionSlip();
        },

        getCountryCode = function(match){
            if (match.live){
                return 'live-' + match.tournament.category.code;
            }
            if (!CYPRUS_RULE){
                return match.tournament.category.code;
            }
            try {
                var home = $P.trim(match.competitors[0]).toUpperCase(),
                    away = $P.trim(match.competitors[1]).toUpperCase(),
                    cyprusTeams = {
                        'OMONOIA': 1,
                        'ANORTHOSIS': 1,
                        'APOLLON LIM.': 1,
                        'APOEL': 1,
                        'APOEL FC': 1,
                        'AEK LAR': 1,
                        'CYPRUS': 1
                    };

                    if (cyprusTeams[home] || cyprusTeams[away] || home.indexOf('CYPRUS') >= 0 || away.indexOf('CYPRUS') >= 0){
                        return 'cyprus';
                    }
            } catch (e){}

            return match.tournament.category.code;
        },

        setSelection = function(selId, selData, doNotProcess){
            if (outrightsSlip && matches.length){
                clear();
            }
            outrightsSlip = false;

            var haveSelection = hasSelection(selId);
            removeSelection(selId);
            if (!betDB.selections[selId] || betDB.selections[selId].odds <= 1){
                if (haveSelection){
                    selectionRemovedEvent.fire(selId);
                }
                return ZAPNET.SELECTION_NOT_AVAILABLE;
            }

            if (MAX_SELECTIONS && selections.length >= MAX_SELECTIONS){
                return ZAPNET.MAX_SELECTIONS;
            }
            var dbSelection = betDB.selections[selId],
                originalOdds = selData && selData.odds && selData.odds != dbSelection.odds ? selData.odds : null,
                originalStake = selData && selData.amount ? +selData.amount : 0,
                isBanker = selData && 'banker' in selData ? selData.banker : false,
                originalGroup = selData && selData.group ? selData.group : null,
                market = dbSelection.market,
                matchId = market.match.id,
                liveScore = market.match.live ? market.match.score : null,
                liveMatch = market.match.live ? ' (Live ' + market.match.lmtime + ': ' + market.match.score + ')' : '',
                matchNotice = market.match.pl && Util.isNumeric(market.match.pl) ? ' (' + Util.t('Match Length') + ': ' + (market.match.pl * 2) + ' ' + Util.t('mins.') + ')' : '',
                countryCode = market.type && (market.type == '993' || market.type == '994')  ? market.match.tournament.category.code : getCountryCode(dbSelection.market.match),
                match = getMatch(matchId),
                selection = {
                    id: selId,
                    matchId: matchId,
                    match: market.match,
                    marketId: market.id,
                    market: market.name,
                    outcome: dbSelection.outcome,
                    label: Util.t(market.name) + (market.special ? ' ' + Util.formatHandicap(market.special) : '') + ': ' + (dbSelection.label ? dbSelection.label : dbSelection.outcome),
                    odds: dbSelection.odds,
                    originalOdds: originalOdds,
                    lines: 1,
                    banker: isBanker,
                    group: originalGroup,
                    amount: originalStake,
                    maxPayout: (dbSelection.market.max_payout && dbSelection.market.payout ? Math.min(dbSelection.market.max_payout, dbSelection.market.payout) : (dbSelection.market.max_payout || dbSelection.market.payout)),
                    country: countryCode,
                    mincomb: +dbSelection.market.mincomb ? +dbSelection.market.mincomb : 1,
                    isExtraSelection: 'isExtraSelection' in dbSelection ? dbSelection.isExtraSelection : false
                };

            /*
            if (!selData && !dbSelection.market.match.bets){
                if (haveSelection){
                    selectionRemovedEvent.fire(selId);
                }
                selectionRemovedEvent.fire(selId);
                return ZAPNET.SELECTION_NO_BETS;
            }
            */

            if (!MATCH_MULTI_SELECTIONS && match){
                return ZAPNET.MULTI_MATCH_SELECTIONS;
            }

            selections.push(selection);
            var title = market.match.name;
            if (market.match.live){
                title = title.replace(/\s*\([0-9+]+\)/, '');
            }
            title = title + matchNotice + liveMatch;
            if (!match){
                match = {
                    id: matchId,
                    match: market.match,
                    categoryTitle: market.match.tournament.name,
                    title: title,
                    score: liveScore,
                    selections: [],
                    odds: dbSelection.odds,
                    originalOdds: originalOdds,
                    lines: 1,
                    banker: isBanker,
                    group: originalGroup,
                    combineMax: 1,
                    combine: false
                };
                matches.push(match);
            }
            match.title = title;
            match.selections.push(selection);

            if (!selData){
                clearOriginalData();
            }
            if (!doNotProcess){
                try{
                    processSelections();
                } catch (e){
                    console.log(e);
                }
            }

            /*
            if (selData && selData.odds){
                if (selData.odds > dbSelection.odds){
                    selectionRemovedEvent.fire(selId);
                    return ZAPNET.SELECTION_ODDS_CHANGE;
                }
            }
            */

            if (Dom.hasClass(dom.slip, 'closed')){
                //flashExpand();
            }

            selectionAddedEvent.fire(selection.id);
            return ZAPNET.SELECTION_OK;
        },

        removeSelection = function(selId){
            if (outrightsSlip){
                return;
            }
            var i, j, match;
            for(i = 0; i < selections.length; i ++){
                if (selections[i].id == selId){
                    match = getMatch(selections[i].matchId);
                    for (j = 0; j < match.selections.length; j += 1){
                        if (match.selections[j].id == selId){
                            match.selections.splice(j, 1);
                            if (!match.selections.length){
                                matches.splice(getMatchIndex(selections[i].matchId), 1);
                            }
                            break;
                        }
                    }
                    selections.splice(i, 1);
                    clearOriginalData();
                    processSelections();
                    selectionRemovedEvent.fire(selId);
                    return;
                }
            }
        },

        removeMatch = function(mId){
            if (outrightsSlip){
                return;
            }
            var i, j = 0, match;
            for(i = 0; i < matches.length; i ++){
                if (matches[i].id == mId){
                    while(matches.length && matches[i] && matches[i].selections.length){
                        removeSelection(matches[i].selections[0].id);
                        j += 1;
                        if (j > 100){
                            return;
                        }
                    }
                    return;
                }
            }
        },

        setSelectionOdds = function(selectionId, odds){
            var selection = getSelection(selectionId);

            if (!selection){
                return false;
            }

            if (selection.odds == odds){
                return false;
            }

            if (odds <= 1){
                removeSelection(selectionId);
                selectionRemovedEvent.fire(selectionId);
                return true;
            }

            selection.originalOdds = selection.originalOdds ? selection.originalOdds : selection.odds;
            selection.odds = odds;

            processSelections();

            return true;
        },

        setOutrightSelection = function(ocId, outrightData){
            if (!outrightsSlip && matches.length){
                clear();
            }
            outrightsSlip = true;

            removeOutrightSelection(ocId);
            if (!betDB.outrightCompetitors[ocId] || betDB.outrightCompetitors[ocId].odds <= 1){
                outrightRemovedEvent.fire(ocId);
                return ZAPNET.SELECTION_NOT_AVAILABLE;
            }

            if (MAX_SELECTIONS && selections.length >= MAX_SELECTIONS){
                return ZAPNET.MAX_SELECTIONS;
            }

            var dbSelection = betDB.outrightCompetitors[ocId],
                originalOdds = outrightData && outrightData.odds && outrightData.odds != dbSelection.odds ? outrightData.odds : null,
                originalStake = outrightData && outrightData.amount ? +outrightData.amount : 0,
                isBanker = outrightData && 'banker' in outrightData ? outrightData.banker : false,
                originalGroup = outrightData && outrightData.group ? outrightData.group : null,
                outright = dbSelection.outright,
                matchId = outright.id,
                match = getMatch(matchId),
                selection = {
                    id: ocId,
                    matchId: matchId,
                    marketId: matchId,
                    match: outright,
                    market: '',
                    outcome: '',
                    label: outright.market + ': ' + dbSelection.name,
                    odds: dbSelection.odds,
                    originalOdds: originalOdds,
                    lines: 1,
                    banker: isBanker,
                    group: originalGroup,
                    amount: originalStake,
                    maxPayout: outright.category.max_payout ? outright.category.max_payout : null,
                    country: '',
                    mincomb: 1
                };
            var i;

            if (!outrightData && ('bets' in outright && !outright.bets)){
                outrightRemovedEvent.fire(ocId);
                return ZAPNET.SELECTION_NOT_AVAILABLE;
            }

            if (betDB.outrightIncompatibles[matchId]){
                for(i = 0; i < matches.length; i += 1){
                    if (betDB.outrightIncompatibles[matchId][matches[i].id]){
                        messageEvent.fire({
                            type: 'error',
                            title: 'Error',
                            message: Util.t('Incompatible Ante Post Selections') + ': <br/>' +
                                '&nbsp;&nbsp;&nbsp;&nbsp;' + outright.category.name + ' ' + outright.name + ' - ' + outright.market + '<br/>' +
                                '&nbsp;&nbsp;&nbsp;&nbsp;' + matches[i].match.category.name + ' ' + matches[i].match.name + ' - ' + matches[i].match.market
                        });
                        removeOutrightSelection(ocId);
                        outrightRemovedEvent.fire(ocId);
                        return ZAPNET.SELECTION_NOT_AVAILABLE;
                    }
                }
            }

            selections.push(selection);
            if (!match){
                match = {
                    id: matchId,
                    match: outright,
                    categoryTitle: outright.category.name,
                    title: outright.name,
                    selections: [],
                    odds: dbSelection.odds,
                    originalOdds: originalOdds,
                    lines: 1,
                    banker: isBanker,
                    group: originalGroup,
                    combineMax: outright.combine && outright.combine > 1 ? outright.combine : 1,
                    combine: false
                };
                matches.push(match);
            }
            match.selections.push(selection);
            if (!outrightData){
                clearOriginalData();
            }
            processSelections();

            if (outrightData && outrightData.odds){
                if (outrightData.odds > dbSelection.odds){
                    outrightRemovedEvent.fire(ocId);
                    return ZAPNET.SELECTION_ODDS_CHANGE;
                }
            }

            if (Dom.hasClass(dom.slip, 'closed')){
                //flashExpand();
            }

            outrightAddedEvent.fire(selection.id);
            return ZAPNET.SELECTION_OK;
        },

        removeOutrightSelection = function(oId){
            if (!outrightsSlip){
                return;
            }
            var i, j, match;
            for(i = 0; i < selections.length; i ++){
                if (selections[i].id == oId){
                    match = getMatch(selections[i].matchId);
                    for (j = 0; j < match.selections.length; j += 1){
                        if (match.selections[j].id == oId){
                            match.selections.splice(j, 1);
                            if (!match.selections.length){
                                matches.splice(getMatchIndex(selections[i].matchId), 1);
                            }
                            break;
                        }
                    }
                    selections.splice(i, 1);
                    clearOriginalData();
                    processSelections();
                    outrightRemovedEvent.fire(oId);
                    return;
                }
            }
        },

        setOutrightOdds = function(selectionId, odds){
            var selection = getSelection(selectionId);

            if (!selection){
                return false;
            }

            if (selection.odds == odds){
                return false;
            }

            if (odds <= 1){
                removeOutrightSelection(selectionId);
                return true;
            }

            selection.originalOdds = selection.originalOdds ? selection.originalOdds : selection.odds;
            selection.odds = odds;

            processSelections();

            return true;
        },

        clearOriginalData = function(){
            Util.foreach(matches, function(match){
                match.originalOdds = null;
            });
            Util.foreach(systems, function(system){
                system.originalOdds = null;
            });
            Util.foreach(groups, function(group){
                group.originalOdds = null;
            });
            Util.foreach(groupSystems, function(groupSystem){
                groupSystem.originalOdds = null;
            });

            Dom.setStyle(dom.errors, 'display', 'none');
        },

        setSystem = function(system, doNotProcess){
            var sys;
            if (systems.length == 1 && +systems[0].amount == 0){
                sys = systems[0];
                sys.odds = system.odds;
                sys.amount = +system.amount;
                sys.numbers = system.numbers;
            } else if (systems.length) {
                sys = systems[systems.length - 1];
                systems.push({
                    system: sys.system,
                    number: sys.number,
                    numbers: system.numbers,
                    pivot: sys.pivot,
                    plus: sys.plus,
                    lines: sys.lines,
                    odds: system.odds,
                    amount: +system.amount
                });
            } else {
                return;
            }

            if (!doNotProcess){
                processSelections();
            }
        },

        setGroup = function(group, doNotProcess){
            var i = 0;
            for(i = 0; i < groups.length; i += 1){
                if (groups[i].name == group.name){
                    groups[i].numbers = group.numbers;
                    groups[i].amount = +group.amount;
                    groups[i].odds = group.odds;
                    groups[i].banker = group.banker;
                }
            }

            if (!doNotProcess){
                processSelections();
            }
        },

        setGroupSystem = function(groupsys, doNotProcess){
            var sys;
            if (groupSystems.length == 1 && +groupSystems[0].amount == 0){
                sys = groupSystems[0];
                sys.odds = groupsys.odds;
                sys.amount = +groupsys.amount;
                sys.numbers = groupsys.numbers;
            } else if (groupSystems.length) {
                sys = groupSystems[groupSystems.length - 1];
                groupSystems.push({
                    system: sys.system,
                    number: sys.number,
                    numbers: groupsys.numbers,
                    pivot: sys.pivot,
                    plus: sys.plus,
                    lines: sys.lines,
                    odds: groupsys.odds,
                    amount: +groupsys.amount
                });
            } else {
                return;
            }

            if (!doNotProcess){
                processSelections();
            }
        },

        getSelection = function(sid){
            var i;
            for(i = 0; i < selections.length; i += 1){
                if (selections[i].id == sid){
                    return selections[i];
                }
            }

            return null;
        },

        getMatch = function(matchId){
            var i;
            for(i = 0; i < matches.length; i += 1){
                if (matches[i].id == matchId){
                    return matches[i];
                }
            }

            return null;
        },
        getMatchIndex = function(matchId){
            var i;
            for(i = 0; i < matches.length; i += 1){
                if (matches[i].id == matchId){
                    return i;
                }
            }

            return -1;
        },

        getGroup = function(groupName){
            var i;
            for(i = 0; i < groups.length; i += 1){
                if (groups[i].name == groupName){
                    return groups[i];
                }
            }

            return null;
        },

        getSelections = function(){
            var i, sels = {};
            for(i = 0; i < selections.length; i += 1){
                sels[selections[i].id] = selections[i].id;
            }

            if (outrightsSlip){
                return {
                    matches: {},
                    outrights: sels
                };
            } else {
                return {
                    matches: sels,
                    outrights: {}
                };
            }
        },

        hasSelection = function(sId){
            var i;
            for(i = 0; i < selections.length; i += 1){
                if (selections[i].id == sId){
                    return true;
                }
            }
            return false;
        },

        hasSelections = function(){
            return selections.length > 0;
        },

        getNumberSelections = function(){
            return selections.length;
        },

        getSingleSelection = function(){
            var i, sel;
            for(i = 0; i < selections.length; i += 1){
                sel = selections[0];
                if (SELECTION_OUT_OF_RULES || sel.single){
                    return sel;
                }
            }
            return false;
        },

        getTotalOdds = function(){
            var sel, totalOdds = totalAmount ? Util.formatOdds(totalPossiblePayout / totalAmount) : (systems && systems.length && systems[0].payout ? systems[0].payout : 0);
            if (!totalOdds && selections.length){
                sel = getSingleSelection();
                if (sel){
                    return sel.odds;
                }
            }
            return totalOdds;
        },

        getMaxPayout = function(){
            return totalPossiblePayout;
        },

        getTotalStake = function(){
            return totalAmount;
        },

        isDirty = function(){
            return dirty;
        },

        hasBets = function(){
            return totalAmount > 0;
        },

        isOutrightsSlip = function(){
            return outrightsSlip && matches.length;
        },

        isMatchesSlip = function(){
            return !outrightsSlip && matches.length;
        },

        setStake = function(amount){
            var i, entry, sel, amountEntries = [],
                nrAmountEntries = 0, totalAmount = 0,
                ratio, entries = selections.concat(systems,groups,groupSystems);

            for(i = 0; i < entries.length; i += 1){
                entry = entries[i];
                if (entry && entry.amount && parseFloat(entry.amount) > 0){
                    amountEntries.push(entry);
                    totalAmount += +entry.amount;
                }
            }
            nrAmountEntries = amountEntries.length;
            if (nrAmountEntries == 0){
                if (systems && systems.length && systems[0].lines){
                    systems[0].amount = amount;
                } else {
                    sel = getSingleSelection();
                    if (sel){
                        sel.amount = amount;
                    }
                }
            } else if (nrAmountEntries == 1){
                entry = amountEntries[0];
                entry.amount = amount;
            } else {
                ratio = amount / totalAmount;
                for(i = 0; i < amountEntries.length; i += 1){
                    entry = amountEntries[i];
                    entry.amount = entry.amount * ratio;
                }
            }

            render();
        },

        clearStake = function(){
            var i, entry, entries = selections.concat(systems,groups,groupSystems);

            for(i = 0; i < entries.length; i += 1){
                entry = entries[i];
                if (entry){
                    entry.amount = 0;
                }
            }

            render();
        },

        show = function(callback){
            Dom.removeClass(dom.slip, 'closed');
            Dom.setStyle(dom.content, 'overflow', 'hidden');
            Dom.setStyle(dom.content, 'height', 'auto');
            var height = Util.getDimensions(dom.content).height;
            Dom.setStyle(dom.content, 'height', '0');
            var time = 0.1 + (Math.min(8,selections.length) * 0.05);
            var animation = new YAHOO.util.Anim(dom.content, {
                height: {
                    to: height
                }
            }, time, YAHOO.util.Easing.easeOut);
            animation.onComplete.subscribe(function(){
                Dom.setStyle(dom.content, 'height', 'auto');
                Dom.setStyle(dom.content, 'overflow', 'visible');
                var pages = $('.page', dom.selections);
                if (pages.length > 1){
                    Util.foreach(pages, function(page, n){
                        Dom.setStyle(page, 'left', '0');
                        if (Dom.hasClass(page, 'page-1')){
                            return;
                        }
                        var animation = new YAHOO.util.Anim(page, {
                            left: {
                                to: -400*n
                            }
                        }, 0.25 , YAHOO.util.Easing.easeOut);
                        animation.animate();
                    });
                }
                if (callback){
                    callback();
                }
            });
            animation.animate();
        },

        hideContent = function(callback, noAnim){
            Dom.setStyle(dom.content, 'overflow', 'hidden');
            Dom.setStyle(dom.content, 'height', 'auto');
            if (!isSlipClosed){
                Dom.addClass(dom.slip, 'closed');
                return;
            }
            if (noAnim){
                Dom.setStyle(dom.content, 'height', 'auto');
                if (isSlipClosed){
                    Dom.addClass(dom.slip, 'closed');
                }
                if (callback){
                    callback();
                }
                return;
            }
            var height = Util.getDimensions(dom.content).height;
            Dom.setStyle(dom.content, 'height', height + 'px');
            var time = 0.1 + (Math.min(8,selections.length) * 0.05);
            var animation = new YAHOO.util.Anim(dom.content, {
                height: {
                    to: 0
                }
            }, time, YAHOO.util.Easing.easeOut);
            animation.onComplete.subscribe(function(){
                Dom.setStyle(dom.content, 'height', 'auto');
                if (isSlipClosed){
                    Dom.addClass(dom.slip, 'closed');
                }
                if (callback){
                    callback();
                }
            });
            animation.animate();
        },

        hide = function(callback){
            var pages = $('.page', dom.selections);
            if (pages.length > 1){
                Util.foreach(pages, function(page, n){
                    if (Dom.hasClass(page, 'page-1')){
                        return;
                    }
                    var animation = new YAHOO.util.Anim(page, {
                        left: {
                            to: 0
                        }
                    }, 0.25 , YAHOO.util.Easing.easeOut);
                    animation.animate();
                });
                setTimeout(function(){
                    hideContent(callback);
                }, 300);
            } else {
                hideContent(callback);
            }

            Dom.setStyle(dom.errors, 'display', 'none');
        },

        clear = function(silent){
            var sId, selection;
            while(selections.length){
                selection = selections[0];
                sId = selection.id;
                if (outrightsSlip){
                    removeOutrightSelection(sId);
                    outrightRemovedEvent.fire(sId);
                } else {
                    removeSelection(sId);
                    selectionRemovedEvent.fire(sId);
                }
            }

            matches = [];
            selections = [];
            systems = [];
            groups = [];
            lastGroup = 'a';
            nrGroups = 0;
            isSlipClosed = true;
            acceptOddsChanges = false;
            currentSelectionPage = 1;
            totalSelectionPages = 1;

            if (!silent){
                processSelections();
            }

            Dom.replaceClass(dom.opener, 'contract', 'expand');
            Dom.addClass(dom.slip, 'empty');
            isSlipClosed = true;
            hideContent(null, true);

            Dom.setStyle(dom.errors, 'display', 'none');
            slipHasLineSubsets = false;
            linesMode = '@';
            selectedTab = 'SINGLE';
            validatePerLine();
        },

        recoverLastSlip = function(){
            clear(true);
            if (!lastSlipData){
                return;
            }
            Util.foreach(lastSlipData.matches, function(match){
                Util.foreach(match.selections, function(selection){
                    if (lastSlipData.type == 'match'){
                        if (setSelection(selection.id, {
                            odds: selection.odds,
                            banker: match.banker,
                            group: match.group,
                            amount: selection.stake
                        }, true) === ZAPNET.SELECTION_OK){
                            selectionAddedEvent.fire(selection.id);
                        }
                    } else {
                        if (setOutrightSelection(selection.id, {
                            odds: selection.odds,
                            banker: match.banker,
                            group: match.group,
                            amount: selection.stake
                        }, true) === ZAPNET.SELECTION_OK){
                            outrightAddedEvent.fire(selection.id);
                        }
                    }
                });
            });
            try {
                processSelections();
            } catch (e){}
            Util.foreach(lastSlipData.systems, function(system){
                setSystem({
                    numbers: system.system,
                    odds: system.odds,
                    amount: system.stake
                });
            });
            Util.foreach(lastSlipData.groups, function(system){
                setGroup({
                    name: system.group,
                    numbers: system.system,
                    amount: system.stake,
                    group: system.group,
                    banker: system.banker,
                    odds: system.odds
                });
            });
            try {
                processSelections();
            } catch (e){}
            Util.foreach(lastSlipData.groupsystems, function(system){
                setGroupSystem({
                    numbers: system.system,
                    odds: system.odds,
                    amount: system.stake
                });
            });

            linesMode = lastSlipData.perline ? '@' : '=';

            try {
                processSelections();
            } catch (e){}
            Dom.removeClass(dom.slip, 'recover');

            if (Dom.hasClass(dom.slip, 'closed')){
                show();
            }
        },

        setupSlip = function(data){
            lastSlipData = data;
            recoverLastSlip();
        },

        flashDiv = function(div, fn){
            var myAnim = new YAHOO.util.ColorAnim(div, {
                backgroundColor: {
                    to: '#ff0000'
                }
            }, 0.5);
            myAnim.onComplete.subscribe(function(){
                myAnim.attributes.backgroundColor.to = myAnim.attributes.backgroundColor.to == '#ff0000' ? '#ffffff' : '#ff0000';
                myAnim.animate();
            });
            myAnim.animate();
            setTimeout(function(){
                myAnim.onComplete.unsubscribeAll();
                myAnim.stop();
                fn();
            }, 3000);
        },

        flashExpand = function(){
            Dom.addClass(dom.slip, 'expand-flash');
            flashDiv(dom.expand, function(){
                Dom.setStyle(dom.expand, 'background-color', 'transparent');
                Dom.removeClass(dom.slip, 'expand-flash');
            });
        },

        addPrintBetLine = function(table, name, lines, amount){
            var j = 0, row, cell;
            row = table.insertRow(table.rows.length);
            Dom.addClass(row,'selection');
            cell = row.insertCell(j++);
            cell.innerHTML = name;
            cell = row.insertCell(j++);
            cell.innerHTML = lines;
            Dom.addClass(cell, 'lines')
            cell = row.insertCell(j++);
            Dom.addClass(cell, 'amount')
            cell.innerHTML = Util.formatAmount(amount, true);
        },

        setSelectionError = function(sId, error){
            var errorEl = Util.div('slip-error', error);
            dom.errors.innerHTML = '';
            dom.errors.appendChild(errorEl);
            Dom.setStyle(dom.errors, 'display', 'block');

            var selection = getSelection(sId);
            var selXY = Dom.getXY(selection.el);
            var errorWH = Util.getDimensions(errorEl);
            var xy = [selXY[0] - errorWH.width - 5, selXY[1] + 1];
            Dom.setXY(errorEl, xy);
        },

        matchChanged = function(matchId){
            return;
            var dbMatch,
                match = getMatch(matchId);

            if (!match){
                return;
            }

            if (!ZAPNET.BetDB.matches[matchId]){
                return;
            }

            dbMatch = ZAPNET.BetDB.matches[matchId];
            if (!dbMatch.live){
                return;
            }
            if (!match.score && !dbMatch.score){
                return;
            }
            if (match.score && dbMatch.score && match.score == dbMatch.score){
                return;
            }

            var matchIndex = getMatchIndex(matchId);
            var i = 0;
            for(i = 0; i < selections.length; ){
                if (selections[i].matchId == matchId){
                    selectionRemovedEvent.fire(selections[i].id);
                    selections.splice(i, 1);
                } else {
                    i += 1;
                }
            }
            matches.splice(matchIndex, 1);
            processSelections();
        },

        saveSessionSlip = function(){
            var evs = [], grps = [], group,
                syss = [], sys, grsys = [], match, sels, sel, i, j,
                callback, data;

            for(i = 0; i < matches.length; i += 1){
                match = matches[i];
            }

            for(i = 0; i < matches.length; i += 1){
                match = matches[i];
                sels = [];
                for(j = 0; j < match.selections.length; j += 1){
                    sel = match.selections[j];
                    sels.push({
                        id: sel.id,
                        odds: sel.odds,
                        stake: sel.amount
                    });
                }
                evs.push({
                    id: match.id,
                    combine: match.combine ? true : false,
                    banker: match.banker,
                    group: match.group,
                    code: match.match.code,
                    selections: sels
                });
            }
            var betSystems;
            if (splitSystem){
                betSystems = [splitSystem];
            } else if (multiSystem && selectedTab == 'MULTIPLE') {
                betSystems = [multiSystem];
            } else {
                betSystems = systems;
            }
            for(i = 0; i < betSystems.length; i += 1){
                sys = betSystems[i];
                if (!sys.amount){
                    continue;
                }
                syss.push({
                    system: sys.numbers.slice(0),
                    stake: sys.amount,
                    lines: sys.lines,
                    odds: sys.odds,
                    payout: sys.payout
                });
            }
            for(i = 0; i < groups.length; i += 1){
                group = groups[i];
                grps.push({
                    group: group.group,
                    banker: group.banker,
                    stake: group.amount,
                    system: group.numbers.slice(0),
                    lines: group.lines,
                    odds: group.odds,
                    payout: group.payout
                });
            }
            for(i = 0; i < groupSystems.length; i += 1){
                sys = groupSystems[i];
                if (!sys.amount){
                    continue;
                }
                grsys.push({
                    system: sys.numbers.slice(0),
                    stake: sys.amount,
                    lines: sys.lines,
                    odds: sys.odds,
                    payout: sys.payout
                });
            }
            var slipData = {
                acceptbet: cfg.acceptbet ? true: false,
                auth: authCheck,
                type: outrightsSlip ? 'outright' : 'match',
                perline: linesMode == '@' ? true : false,
                matches: evs,
                systems: syss,
                groups: grps,
                groupsystems: grsys,
                acceptanyodds: acceptOddsChanges
            };

            lastSlipData = slipData;
            if (ZAPNET_CONSTANTS.BETSLIP_SAVETOSESSION){
                data = YAHOO.lang.JSON.stringify(slipData);
                YAHOO.util.Connect.asyncRequest('POST', '/bet/slipsave.js', callback, data);
            }
        },

        placeBet = function(params){
            Dom.removeClass(dom.slip, 'confirm-placebet');
            if (slipBusy){
                messageEvent.fire({
                    type: 'error',
                    title: 'Busy',
                    message: Util.t('Betting Slip Busy')
                });
                return;
            }
            if (!totalAmount || totalAmount == 0){
                messageEvent.fire({
                    type: 'error',
                    title: Util.t('Betlip Error'),
                    message: Util.t('No bets found on betslip. Please try again')
                });
                return;
            }
            if (totalAmount < MIN_SLIP_STAKE){
                messageEvent.fire({
                    type: 'error',
                    title: Util.t('Minimum Stake'),
                    message: Util.t('Minimum stake is') + ' ' + Util.formatAmount(MIN_SLIP_STAKE, true)
                });
                return;
            }
            var roundAmount = Util.getAmount(totalAmount);
            if (roundAmount != totalAmount){
                messageEvent.fire({
                    type: 'error',
                    title: Util.t('Invalid Stake'),
                    message: Util.t('Invalid bet amount.')
                });
                return;
            }

            var evs = [], grps = [], group, selMarket,
                syss = [], sys, grsys = [], match, sels, sel, i, j,
                callback, data;

            for(i = 0; i < matches.length; i += 1){
                match = matches[i];
                if (match.live && match.livebet == 'stopped'){
                    messageEvent.fire({
                        type: 'error',
                        title: 'Betting Suspended',
                        message: Util.t('Betting is suspended for some of your selections')
                    });
                    return;
                }
            }

            for(i = 0; i < matches.length; i += 1){
                match = matches[i];
                sels = [];
                for(j = 0; j < match.selections.length; j += 1){
                    sel = match.selections[j];
                    if (sel.isExtraSelection){
                        selMarket = ZAPNET.BetDB.markets[sel.marketId] ? ZAPNET.BetDB.markets[sel.marketId] : false;
                        if (!selMarket){
                            messageEvent.fire({
                                type: 'error',
                                title: 'Market Missing',
                                message: Util.t('A required market is missing')
                            });
                            return;
                        }
                        sels.push({
                            mrid: selMarket.id,
                            oc: sel.outcome,
                            odds: sel.odds,
                            stake: sel.amount
                        });
                    } else {
                        sels.push({
                            id: sel.id,
                            odds: sel.odds,
                            stake: sel.amount
                        });
                    }
                }
                evs.push({
                    id: match.id,
                    combine: match.combine ? true : false,
                    banker: match.banker,
                    group: match.group,
                    code: match.match.code,
                    selections: sels
                });
            }
            var betSystems;
            if (splitSystem){
                betSystems = [splitSystem];
            } else if (multiSystem && selectedTab == 'MULTIPLE') {
                betSystems = [multiSystem];
            } else {
                betSystems = systems;
            }
            for(i = 0; i < betSystems.length; i += 1){
                sys = betSystems[i];
                if (!sys.amount){
                    continue;
                }
                syss.push({
                    system: sys.numbers.slice(0),
                    stake: sys.amount,
                    lines: sys.lines,
                    odds: sys.odds,
                    payout: sys.payout
                });
            }
            for(i = 0; i < groups.length; i += 1){
                group = groups[i];
                grps.push({
                    group: group.group,
                    banker: group.banker,
                    stake: group.amount,
                    system: group.numbers.slice(0),
                    lines: group.lines,
                    odds: group.odds,
                    payout: group.payout
                });
            }
            for(i = 0; i < groupSystems.length; i += 1){
                sys = groupSystems[i];
                if (!sys.amount){
                    continue;
                }
                grsys.push({
                    system: sys.numbers.slice(0),
                    stake: sys.amount,
                    lines: sys.lines,
                    odds: sys.odds,
                    payout: sys.payout
                });
            }
            callback = {
                success: function(o){
                    slipBusy = false;
                    Dom.removeClass(dom.slip, 'busy');
                    betsResponseEvent.fire();
                    var result = YAHOO.lang.JSON.parse(o.responseText);
                    if (result.error){
                        var errorMsg = '';
                        if (result.errorlist){
                            errorMsg = Util.t('Error') + ': ' + Util.t('Betting Slip could not be placed') + '<br/>';
                            Util.foreach(result.errorlist, function(error){
                                errorMsg += '<br/>' + Util.t(error);
                            });
                        } else {
                            errorMsg = result.error;
                        }
                        if (result.errors){
                            Util.foreach(result.errors, function(error){
                                if (error.object == 'betslip'){
                                    if (error.type == 'betlimit' && error.amount > 0){
                                        setStake(error.amount);
                                    }
                                }
                            });
                        }
                        messageEvent.fire({
                            type: 'error',
                            title: Util.t('Betting Slip Error'),
                            message: Util.t(errorMsg)
                        });
                        return;
                    }
                    if (result.authorise){
                        requestAuthEvent.fire(result.authorise);
                        return;
                    }
                    if (result.errors){
                        Util.foreach(result.errors, function(error){
                            errorEvent.fire(error);
                            if (error.object == 'selection'){
                                if (error.type == 'odds'){
                                    //setSelectionError(error.id, 'Odds Change');
                                }
                            }
                            if (error.object == 'betslip'){
                                if (error.type == 'betlimit' && error.amount > 0){
                                    setStake(error.amount);
                                }
                            }
                        });
                        messageEvent.fire({
                            type: 'error',
                            title: 'Bet Error',
                            message: Util.t('You bets could not be placed')
                        });
                        return;
                    }
                    if (result.betbook){
                        clear();
                        dirty = false;
                        betbookEvent.fire(result.betbook);
                        clear();
                        slipClosedEvent.fire();
                        Dom.addClass(dom.slip, 'recover');
                    } else if (result.id){
                        dirty = false;
                        betsPlacedEvent.fire(result);
                        clear();
                        slipClosedEvent.fire();
                        Dom.addClass(dom.slip, 'recover');
                    }
                },
                failure: function(o){
                    slipBusy = false;
                    Dom.removeClass(dom.slip, 'busy');
                    betsResponseEvent.fire();
                    Util.error('SLIP PLACE PROBLEM: ' + o.responseText);
                    messageEvent.fire({
                        type: 'error',
                        title: Util.t('Betting Slip Error'),
                        message: Util.t(Util.t('Error') + ': ' + Util.t('Betting Slip could not be placed'))
                    });
                },
                cache: false,
                timeout: 180000
            };
            var slipData = {
                acceptbet: cfg.acceptbet ? true: false,
                auth: authCheck,
                type: outrightsSlip ? 'outright' : 'match',
                perline: linesMode == '@' ? true : false,
                matches: evs,
                systems: syss,
                groups: grps,
                groupsystems: grsys,
                acceptanyodds: acceptOddsChanges
            };

            if (betTerminalCode){
                slipData.btid = betTerminalCode;
            }
            if (sellSlips){
                slipData.sell = true;
            }

            if (params){
                Util.foreach(params, function(value, key){
                   slipData[key] = value;
                });
            }
            data = YAHOO.lang.JSON.stringify(slipData);
            lastSlipData = slipData;
            YAHOO.util.Connect.asyncRequest('POST', '/bet/new.js', callback, data);
            betsSentEvent.fire();
            slipBusy = true;
            Dom.addClass(dom.slip, 'busy');
            showSlipBusy();
        },

        placeSmsBet = function(sms){
            var callback = {
                success: function(o){
                    betsResponseEvent.fire();
                    var result = YAHOO.lang.JSON.parse(o.responseText);
                    if (result.error){
                        var errorMsg = '';
                        if (result.errorlist){
                            errorMsg = Util.t('Error') + ': ' + Util.t('Betting Slip could not be placed') + '<br/>';
                            Util.foreach(result.errorlist, function(error){
                                errorMsg += '<br/>' + Util.t(error);
                            });
                        } else {
                            errorMsg = result.error;
                        }
                        messageEvent.fire({
                            type: 'error',
                            title: Util.t('Betting Slip Error'),
                            message: Util.t(errorMsg)
                        });
                        return;
                    }
                    if (result.authorise){
                        requestAuthEvent.fire(result.authorise);
                        return;
                    }
                    if (result.errors){
                        Util.foreach(result.errors, function(error){
                            errorEvent.fire(error);
                            if (error.object == 'selection'){
                                if (error.type == 'odds'){
                                    //setSelectionError(error.id, 'Odds Change');
                                }
                            }
                        });
                        messageEvent.fire({
                            type: 'error',
                            title: 'Bet Error',
                            message: Util.t('You bets could not be placed')
                        });
                        return;
                    }
                    if (result.betbook){
                        clear();
                        dirty = false;
                        betbookEvent.fire(result.betbook);
                        clear();
                        slipClosedEvent.fire();
                        Dom.addClass(dom.slip, 'recover');
                    } else if (result.id){
                        dirty = false;
                        betsPlacedEvent.fire(result);
                        clear();
                        slipClosedEvent.fire();
                        Dom.addClass(dom.slip, 'recover');
                    }
                },
                failure: function(o){
                    betsResponseEvent.fire();
                    Util.error('SLIP PLACE PROBLEM: ' + o.responseText);
                    messageEvent.fire({
                        type: 'error',
                        title: Util.t('Betting Slip Error'),
                        message: Util.t(Util.t('Error') + ': ' + Util.t('Betting Slip could not be placed'))
                    });
                },
                cache: false,
                timeout: 180000
            };
            YAHOO.util.Connect.asyncRequest('POST', '/bet/new.js', callback, 'sms=' + escape(sms));
            betsSentEvent.fire();
        },

        print = function(slip, printDoneFn, retries){
            var brUrl = '/bet/print/barcode/' + slip.code + (slip.vc ? '*' + slip.vc : '') + (SPECIAL_PRINT_GRAY ? '?gr=1' : '');
            var qrUrl = '/bet/qr.png?id=' + slip.code + (SPECIAL_PRINT_GRAY ? '&gr=1' : '');
            var sliphtml = (slip.sliphtml ? slip.sliphtml : '') + '';
            sliphtml = sliphtml.replace(new RegExp('/bet/print/barcode/[0-9*]+'), brUrl);
            sliphtml = sliphtml.replace(new RegExp('/bet/qr.png\\?id=[0-9]+'), qrUrl);

            if (PRINT_TO_PRINTER){
                dom.print.innerHTML = sliphtml + (SPECIAL_PRINT_TO_PRINTER ? '&nbsp;<br/>&nbsp;<br/>&nbsp;<br/>&nbsp;<br/>&nbsp;<br/>.' : '');
            } else {
                dom.printSlip = dom.printFrame.contentWindow.document.getElementById('print');
                dom.printSlip.innerHTML = sliphtml;
            }

            if (PRINT_TO_PRINTER){
                var images = [];
                images.push(brUrl);
                if (slip.status !== 'new'){
                    images.push(qrUrl);
                }
                if (slip.logo){
                    images.push(slip.logo);
                }
                var imageprefetch = Dom.get('imageprefetch');
                if (imageprefetch){
                    imageprefetch.innerHTML = '';
                    Util.foreach(images, function(image){
                        imageprefetch.innerHTML += '<img src="' + image + '"/>';
                    });
                }
                Util.loadImages(images, function(success){
                    if (success){
                        Util.print();
                        dom.print.innerHTML = '----';
                        if (imageprefetch){
                            imageprefetch.innerHTML = '';
                        }
                        if (printDoneFn){
                            printDoneFn();
                        }
                    } else {
                        var nrRetries = retries ? retries : 0;
                        nrRetries += 1;
                        if (nrRetries < 3){
                            return setTimeout(function(){
                                print(slip, printDoneFn, nrRetries);
                            }, 500);
                        }
                    }
                });
            } else {
                var printEl = Util.div('printslip', 'Print Slip');
                dom.printSlip.parentNode.parentNode.appendChild(printEl);
                Event.on(printEl, 'click', function(){
                    printEl.parentNode.removeChild(printEl);
                    dom.printFrame.contentWindow.print();
                    if (printDoneFn){
                        printDoneFn();
                    }
                });
                showPrintIframe();
            }
        },

        showPrintIframe = function(){
            showPrintSlipEvent.fire();
        },

        calculateAmounts = function(){
            var i, amount = 0, lines = 0, payout = 0, bonus = 0, entry, lineAmount,
                revalidate = false, hasLineSubset = false,
                entries = [systemReference];

            for(i = 0; i < entries.length; i += 1){
                entry = entries[i];
                if (entry && entry.lines && entry.amount && entry.odds){
                    lines += entry.lines;
                    lineAmount = entry.amount / (linesMode == '@' ? 1 : entry.lines);
                    if (lineAmount < MIN_LINE_STAKE){
                        entry.amount = 0;
                        revalidate = true;
                        messageEvent.fire({
                            type: 'error',
                            title: Util.t('Minimum line stake'),
                            message: Util.t('Minimum stake per line is') + ' ' + Util.formatAmount(MIN_LINE_STAKE, true)
                        });
                    } else {
                        amount += (linesMode == '@' ? entry.lines : 1) * entry.amount;
                    }
                    payout += (entry.amount * (entry.payout ? entry.payout : entry.odds)) / (linesMode == '=' ? entry.lines : 1);
                    if (entry.bonus){
                        bonus += (entry.amount * entry.bonus) / (linesMode == '=' ? entry.lines : 1);
                    }
                }
            }

            totalAmount = amount;
            if(MAX_PAYOUT_BONUS){
               bonus = Math.min(MAX_PAYOUT_BONUS, bonus);
            }
            payout += bonus;
            if (MAX_PAYOUT){
                maxPossiblePayout = Math.min(MAX_PAYOUT, maxPossiblePayout);
            }
            totalPossiblePayout = maxPossiblePayout && maxPossiblePayout < payout ? maxPossiblePayout : payout;
            dom.nrLines.innerHTML = lines > 1 ? lines + ' x ' : '';
            dom.stake.value = Util.formatAmountCommas(amount, false);
            dom.bonus.value = Util.formatAmountCommas(bonus, false);
            dom.payout.innerHTML = Util.formatAmountCommas(totalPossiblePayout, false, false);

            singleStake = amount;

            if (revalidate){
                processSelections();
            }
            changeEvent.fire();
        },

        amountChanged = function(el, value){
            var lineAmount;

            if (!systemReference){
                return;
            }

            value = parseFloat(value) || 0;
            lineAmount = linesMode == '@' ? +value : value / systemReference.lines;

            if (lineAmount > 0 && lineAmount < MIN_LINE_STAKE){
                value = systemReference.amount;
                messageEvent.fire({
                    type: 'error',
                    title: Util.t('Minimum line stake'),
                    message: Util.t('Minimum stake per line is') + ' ' + Util.formatAmount(MIN_LINE_STAKE, true)
                });
            }

            if (systemReference){
                systemReference.amount = value;
                if (systemReference.amountInput){
                    if (systemReference.amount){
                        systemReference.amountInput.value = Util.formatAmountCommas(systemReference.amount, false);
                    } else {
                        systemReference.amountInput.value = '';
                    }
                }
            }

            calculateAmounts();
        },

        amountKeyPressed = function(el, value){
            var lineAmount;

            if (!systemReference){
                return;
            }

            value = parseFloat(value) || 0;
            lineAmount = linesMode == '@' ? +value : value / systemReference.lines;

            if (lineAmount > 0 && lineAmount < MIN_LINE_STAKE){
                return;
            }

            if (systemReference){
                systemReference.amount = value;
            }

            calculateAmounts();
        },

        calculateCombineAmounts = function(){
            var combineLines = $('div.combine-line', dom.slip);
            var amounts = {}, amountKey;

            Util.foreach(combineLines, function(line){
                var checkbox = $('input.system-select', line, true);
                if (!checkbox.checked){
                    return;
                }
                var amountEl = $('input.combine-amount', line, true);
                var amount = amountEl.value;
                var system = Dom.getAttribute(line, 'system');
                if (amount && Util.isNumeric(amount) && amount > 0){
                    amountKey = parseInt(+amount * 100) / 100;
                    if (!amounts[amountKey]){
                        amounts[amountKey] = [];
                    }
                    amounts[amountKey].push(system);
                }
            });

            var i = 0, system, sys, match;
            var stake = 0, payout = 0, bonus = 0;
            var nrBankers = 0, nrLines = 0, sysPayout = 0, sysOdds = 0, sysBonus = 0;
            var bankers = [];
            var free = [];
            var nrTotalLines = 0;
            for(i = 0; i < matches.length; i += 1){
                match = matches[i];
                if (match.banker){
                    nrBankers += 1;
                    bankers.push(match);
                } else {
                    free.push(match);
                }
            }
            i = 0;
            Util.foreach(amounts, function(numbers, amount){
                if (systems[i]){
                    system = systems[i];
                } else {
                    sys = system;
                    system = {
                        system: sys.system,
                        number: sys.number,
                        numbers: sys.numbers,
                        pivot: sys.pivot,
                        plus: sys.plus,
                        lines: sys.lines,
                        bonus: sys.bonus,
                        odds: sys.odds,
                        payout: sys.payout,
                        amount: 0
                    };
                    systems.push(system);
                }
                nrLines = 0;
                sysPayout = 0;
                sysBonus = 0;
                sysOdds = 0;
                Util.foreach(numbers, function(number){
                    if (!baseSystems[number]){
                        baseSystems[number] = generateSystems(bankers, free, [number], true);
                    }
                    sys = baseSystems[number];
                    nrLines += sys.lines;
                    sysPayout += sys.payout ? sys.payout : sys.odds;
                    sysBonus += sys.bonus ? +sys.bonus : 0;
                    sysOdds += sys.odds;
                });
                nrTotalLines += nrLines;
                system.lines = nrLines;
                system.bonus = sysBonus;
                system.payout = sysPayout;
                system.odds = sysOdds;
                system.amount = +amount;
                system.numbers = numbers;
                stake += +amount * +system.lines;
                payout += +(system.amount * (system.payout ? system.payout : payout.odds)) / (linesMode == '=' ? system.lines : 1);
                if (sysBonus){
                    bonus += (system.amount * sysBonus) / (linesMode == '=' ? system.lines : 1);
                }

                i += 1;
            });
            if (i > 0){
                systems.splice(i, systems.length - i);
            }
            if(MAX_PAYOUT_BONUS){
                bonus = Math.min(MAX_PAYOUT_BONUS, bonus);
            }
            payout += bonus;
            totalPossiblePayout = maxPossiblePayout && maxPossiblePayout < payout ? maxPossiblePayout : payout;
            totalAmount = stake;
            dom.combineNrLines.innerHTML = nrTotalLines;
            dom.combineStake.value = Util.formatAmount(totalAmount, false);
            dom.combineBonus.value = Util.formatAmount(bonus, false);
            dom.combinePayout.innerHTML = Util.formatAmount(totalPossiblePayout, false);
        },

        combineAmountChanged = function(el, value){

            calculateCombineAmounts();
        },

        combineAmountKeyPressed = function(el, value){
            var line = Dom.getAncestorByClassName(el, 'combine-line');
            var checkbox = $('input.system-select', line, true);
            if (value && $P.trim(value).length){
                checkbox.checked = true;
            } else {
                checkbox.checked = false;
            }
            calculateCombineAmounts();
        },

        combinePlayAll = function(){
            var playAllLine = Dom.get('playall-line');
            var amountEl = $('input.amount', playAllLine, true);
            if (amountEl.value && Util.isNumeric(amountEl.value)){
                var amountEls = $('div.combine-line input.combine-amount', dom.slip);
                Util.foreach(amountEls, function(el){
                    el.value = amountEl.value;
                });
                var checkboxes = $('div.combine-line input.system-select', dom.slip);
                Util.foreach(checkboxes, function(cb){
                    cb.checked = true;
                });
            }
            calculateCombineAmounts();
        },

        bankerSort = function(a, b){
            if (a.banker && !b.banker){
                return -1;
            } else if (!a.banker && b.banker){
                return 1;
            }
            return 0;
        },

        groupsSort = function(a, b){
            if (a.group == b.group){
                return bankerSort(a,b);
            }
            return a.group.charCodeAt(0) - b.group.charCodeAt(0);
        },

        getNumberOfGroups = function(el){
            var groupCodes = {}, nrGroups = 0;
            Util.foreach(matches, function(match){
                if (match.el === el){
                    return;
                }
                if (match.group){
                    if (groupCodes[match.group]){
                        groupCodes[match.group] += 1;
                    } else {
                        groupCodes[match.group] = 1;
                        nrGroups += 1;
                    }
                }
            });

            return nrGroups;
        },

        groupClicked = function(selection, el){
            var nrGroups = getNumberOfGroups(el.parentNode);
            if (Dom.hasClass(el, 'group-a') && nrGroups > 0){
                Dom.replaceClass(el, 'group-a', 'group-b');
                selection.group = 'b';
                lastGroup = 'b';
            } else if (Dom.hasClass(el, 'group-b') && nrGroups > 1){
                Dom.replaceClass(el, 'group-b', 'group-c');
                selection.group = 'c';
                lastGroup = 'c';
            } else if (Dom.hasClass(el, 'group-c') && nrGroups > 2){
                Dom.replaceClass(el, 'group-c', 'group-d');
                selection.group = 'd';
                lastGroup = 'd';
            } else if (Dom.hasClass(el, 'group-d') && nrGroups > 3){
                Dom.replaceClass(el, 'group-d', 'group-e');
                selection.group = 'e';
                lastGroup = 'e';
            } else if (Dom.hasClass(el, 'group-e') && nrGroups > 3){
                Dom.replaceClass(el, 'group-e', 'group-f');
                selection.group = 'f';
                lastGroup = 'f';
            } else if (Dom.hasClass(el, 'group-f') && nrGroups > 3){
                Dom.replaceClass(el, 'group-f', 'group-g');
                selection.group = 'g';
                lastGroup = 'g';
            } else if (Dom.hasClass(el, 'group-g') && nrGroups > 3){
                Dom.replaceClass(el, 'group-g', 'group-h');
                selection.group = 'h';
                lastGroup = 'h';
            } else if (Dom.hasClass(el, 'group-h') && nrGroups > 3){
                Dom.replaceClass(el, 'group-h', 'group-i');
                selection.group = 'i';
                lastGroup = 'i';
            } else if (Dom.hasClass(el, 'group-i') && nrGroups > 3){
                Dom.replaceClass(el, 'group-i', 'group-j');
                selection.group = 'j';
                lastGroup = 'j';
            } else if (Dom.hasClass(el, 'group-j') && nrGroups > 3){
                Dom.replaceClass(el, 'group-j', 'group-k');
                selection.group = 'k';
                lastGroup = 'k';
            } else if (Dom.hasClass(el, 'group-k') && nrGroups > 3){
                Dom.replaceClass(el, 'group-k', 'group-l');
                selection.group = 'l';
                lastGroup = 'l';
            } else if (Dom.hasClass(el, 'group-l') && nrGroups > 3){
                Dom.replaceClass(el, 'group-l', 'group-m');
                selection.group = 'm';
                lastGroup = 'm';
            } else if (Dom.hasClass(el, 'group-m') && nrGroups > 3){
                Dom.replaceClass(el, 'group-m', 'group-n');
                selection.group = 'n';
                lastGroup = 'n';
            } else if (Dom.hasClass(el, 'group-n') && nrGroups > 3){
                Dom.replaceClass(el, 'group-n', 'group-o');
                selection.group = 'o';
                lastGroup = 'o';
            } else if (Dom.hasClass(el, 'group-o') || selection.group){
                Dom.removeClass(el, 'group-a');
                Dom.removeClass(el, 'group-b');
                Dom.removeClass(el, 'group-c');
                Dom.removeClass(el, 'group-d');
                Dom.removeClass(el, 'group-e');
                Dom.removeClass(el, 'group-f');
                Dom.removeClass(el, 'group-g');
                Dom.removeClass(el, 'group-h');
                Dom.removeClass(el, 'group-i');
                Dom.removeClass(el, 'group-j');
                Dom.removeClass(el, 'group-k');
                Dom.removeClass(el, 'group-l');
                Dom.removeClass(el, 'group-m');
                Dom.removeClass(el, 'group-n');
                Dom.removeClass(el, 'group-o');
                selection.group = null;
                lastGroup = 'a';
            } else {
                Dom.addClass(el, 'group-' + lastGroup);
                selection.group = lastGroup;
            }

            processSelections();
        },

        validatePerLine = function(){
            if (linesMode == '@'){
                Dom.replaceClass(dom.linesMode, 'linesmode-at', 'linesmode-eq');
            } else {
                Dom.replaceClass(dom.linesMode, 'linesmode-eq', 'linesmode-at');
            }
        }

        setConfirmPlacebet = function(b){
            confirmPlacebet = b;
        },

        setPerLine = function(isPerLine){
            linesMode = isPerLine ? '@' : '=';
            validatePerLine();
            processSelections();
        },

        setBetTerminalCode = function(btc){
            betTerminalCode = btc;
        },

        sell = function(doSell){
            sellSlips = doSell ? true : false;
        },

        checkForAuth = function(b){
            authCheck = b;
        },

        addPopularBets = function(){
            var soccerId = 0;
            Util.foreach(ZAPNET.BetDB.sports, function(sport){
                if (sport.code == 'soccer'){
                    soccerId = sport.id;
                }
            });
            if (!soccerId){
                return;
            }
            Util.foreach(ZAPNET.BetDB.getMatchesByTime(soccerId), function(match){
                if (match.marketTypes && match.marketTypes[56] && match.marketTypes[56][19.5]){
                    setSelection(match.marketTypes[56][19.5]['Under'].id);
                }
            });
            processSelections();
        },

        tabClick = function(tabEl){
            var tabName = Dom.getAttribute(tabEl, 'tab-type');
            if (tabName == selectedTab){
                return;
            }

            selectedTab = tabName;

            Dom.removeClass($('div.system-head div.tab-head-selected', dom.slip, true), 'tab-head-selected');
            Dom.removeClass($('div.system-content div.tab-selected', dom.slip, true), 'tab-selected');

            Dom.addClass($('div.system-head div.' + tabName + '-head-tab', dom.slip, true), 'tab-head-selected');
            var contentTabEl = $('div.system-content div.' + (tabName == 'COMBINE' ? 'combine' : 'main') + '-tab', dom.slip, true);
            Dom.addClass(contentTabEl, 'tab-selected');

            if (selectedTab == 'COMBINE'){
                Dom.removeClass(dom.slip, 'no-bankers');
            } else {
                Dom.addClass(dom.slip, 'no-bankers');
            }
        },

        slipClick = function(e){
            var el = Event.getTarget(e),
                entry = Dom.getAncestorByClassName(el, 'bet-line'),
                sid, mid, selection, match, group, sys, i;
            if (Dom.hasClass(el, 'banker')){
                mid = Dom.getAttribute(entry, 'mid');
                if (mid){
                    match = getMatch(mid);
                    if (Dom.hasClass(el, 'banker-on')){
                        match.banker = false;
                    } else {
                        match.banker = true;
                    }
                    processSelections();
                }
                isSlipClosed = false;
            } else if (Dom.hasClass(el, 'combine')){
                if (Dom.hasClass(el, 'combine-on')){
                    entry.data.combine = false;
                } else {
                    entry.data.combine = true;
                }
                processSelections();
                isSlipClosed = false;
            } else if (Dom.hasClass(el, 'playall')){
                combinePlayAll();
            } else if (Dom.hasClass(el, 'combine-amount')){
                ZAPNET.Calculator.type(el, combineAmountChanged, combineAmountKeyPressed);
            } else if (Dom.hasClass(el, 'system-select')){
                calculateCombineAmounts();
            } else if (Dom.hasClass(el, 'group') && Dom.hasClass(entry, 'match')){
                groupClicked(entry.data, el);
                isSlipClosed = false;
            } else if (Dom.hasClass(el, 'linesmode')){
                if (Dom.hasClass(el, 'linesmode-at')){
                    Dom.replaceClass(el, 'linesmode-at', 'linesmode-eq');
                    linesMode = '@';
                } else {
                    Dom.replaceClass(el, 'linesmode-eq', 'linesmode-at');
                    linesMode = '=';
                }
                processSelections();
            } else if (Dom.hasClass(el, 'amount')){
                ZAPNET.Calculator.type(el, amountChanged, amountKeyPressed);
            } else if (Dom.hasClass(el, 'page-next') && currentSelectionPage < totalSelectionPages){
                currentSelectionPage += 1;
                fixSelectionPages();
            } else if (Dom.hasClass(el, 'page-previous') && currentSelectionPage > 1){
                currentSelectionPage -= 1;
                fixSelectionPages();
            } else if (Dom.hasClass(el, 'plus')){
                entry.data.plus = !entry.data.plus;
                processSelections();
            } else if (Dom.hasClass(el, 'system-code')){
                entry.data.number -= 1;
                if (entry.data.number == 0){
                    entry.data.number = entry.data.pivot;
                }
                processSelections();
            } else if (Dom.hasClass(el, 'system-number-selected')){
                var num = Dom.getAttribute(el, 'num');
                for(i = 0; i < entry.data.numbers.length; i += 1){
                    if (num == entry.data.numbers[i]){
                        entry.data.numbers.splice(i, 1);
                        break;
                    }
                }
                processSelections();
            } else if (Dom.hasClass(el, 'system-number')){
                entry.data.numbers.push(Dom.getAttribute(el, 'num'));
                processSelections();
            } else if (Dom.hasClass(el, 'system-plus')){
                sys = entry.data;
                systems.push({
                    system: sys.system,
                    number: sys.number,
                    numbers: sys.numbers,
                    pivot: sys.pivot,
                    plus: sys.plus,
                    lines: sys.lines,
                    odds: sys.odds,
                    amount: 0
                });
                processSelections();
            } else if (Dom.hasClass(el, 'group-system-plus')){
                sys = entry.data;
                groupSystems.push({
                    system: sys.system,
                    number: sys.number,
                    numbers: sys.numbers,
                    pivot: sys.pivot,
                    plus: sys.plus,
                    lines: sys.lines,
                    odds: sys.odds,
                    amount: 0
                });
                processSelections();
            } else if (Dom.hasClass(el, 'sort-bankers')){
                matches.sort(bankerSort);
                processSelections();
            } else if (Dom.hasClass(el, 'sort-groups')){
                matches.sort(groupsSort);
                processSelections();
            } else if (Dom.hasClass(el, 'popular-bet')){
                addPopularBets();
            } else if (Dom.hasClass(el, 'slip-cancel')){
                clear();
                slipClosedEvent.fire();
            } else if (Dom.hasClass(el, 'slip-submit')){
                if (confirmPlacebet){
                    Dom.addClass(dom.slip, 'confirm-placebet');
                } else {
                    placeBet();
                }
                Event.stopEvent(e);
            } else if (Dom.hasClass(el, 'slip-confirm')){
                placeBet();
                Event.stopEvent(e);
            } else if (Dom.hasClass(el, 'recover')){
                recoverLastSlip();
            } else if (Dom.hasClass(el, 'slip-head-tab')){
                tabClick(el);
            } else if (el.id == 'slip-accept-odds-changes'){
                acceptOddsChanges = Dom.get('slip-accept-odds-changes').checked;
                render();
            } else if (Dom.getAttribute(el, 'for') == 'slip-accept-odds-changes'){
                acceptOddsChanges = !Dom.get('slip-accept-odds-changes').checked;
                render();
            } else if (Dom.hasClass(el, 'del')){
                if (Dom.hasClass(entry, 'bet-line')){
                    sid = Dom.getAttribute(entry, 'sid');
                    if (outrightsSlip){
                        removeOutrightSelection(sid);
                        outrightRemovedEvent.fire(sid);
                    } else  {
                        removeSelection(sid);
                        selectionRemovedEvent.fire(sid);
                    }
                }
                isSlipClosed = false;
            }
        },

        printToPrinter = function(bool){
            PRINT_TO_PRINTER = bool;
        };

        messageEvent.subscribe(function(msgInfo){
            Util.showErrorMessage(msgInfo.message, Util.t('Error'));
        });
        Event.on(dom.slip, 'click', slipClick);

        ZAPNET.BetDB.matchOddsChangeEvent.subscribe(function(data){
            setSelectionOdds(data.id, data.odds);
        });
        ZAPNET.BetDB.outrightOddsChangeEvent.subscribe(function(data){
            setOutrightOdds(data.id, data.odds);
        });
        ZAPNET.BetDB.selectionRemovedEvent.subscribe(function(selectionId){
            removeSelection(selectionId);
        });
        ZAPNET.BetDB.outrightSelectionRemovedEvent.subscribe(function(selectionId){
            removeOutrightSelection(selectionId);
        });
        ZAPNET.BetDB.matchesChangedEvent.subscribe(function(matches){
            Util.foreach(matches, function(matchId){
                matchChanged(matchId);
            });
        });

        return {
            setSelection: setSelection,
            setSelectionOdds: setSelectionOdds,
            removeSelection: removeSelection,
            removeMatch: removeMatch,
            setOutrightSelection: setOutrightSelection,
            removeOutrightSelection: removeOutrightSelection,
            setOutrightOdds: setOutrightOdds,
            getSelections: getSelections,
            setSystem: setSystem,
            setGroup: setGroup,
            setGroupSystem: setGroupSystem,
            hasSelection: hasSelection,
            isDirty: isDirty,
            hasBets: hasBets,
            isOutrightsSlip: isOutrightsSlip,
            isMatchesSlip: isMatchesSlip,
            show: show,
            placeBet: placeBet,
            placeSmsBet: placeSmsBet,
            print: print,
            clear: clear,
            hide: hide,
            render: render,
            setPerLine: setPerLine,
            shakeOnChange: shakeOnChange,
            selectionAddedEvent: selectionAddedEvent,
            outrightAddedEvent: outrightAddedEvent,
            selectionRemovedEvent: selectionRemovedEvent,
            outrightRemovedEvent: outrightRemovedEvent,
            showPrintSlipEvent: showPrintSlipEvent,
            betsPlacedEvent: betsPlacedEvent,
            betbookEvent: betbookEvent,
            betsSentEvent: betsSentEvent,
            betsResponseEvent: betsResponseEvent,
            messageEvent: messageEvent,
            errorEvent: errorEvent,
            requestAuthEvent: requestAuthEvent,
            changeEvent: changeEvent,
            renderEvent: renderEvent,
            slipClosedEvent: slipClosedEvent,
            printToPrinter: printToPrinter,
            setBetTerminalCode: setBetTerminalCode,
            checkForAuth: checkForAuth,
            sell: sell,
            hasSelections: hasSelections,
            getNumberSelections: getNumberSelections,
            getNumberOfSelections: getNumberSelections,
            getTotalOdds: getTotalOdds,
            getMaxPayout: getMaxPayout,
            getTotalStake: getTotalStake,
            recoverLastSlip: recoverLastSlip,
            setupSlip: setupSlip,
            setConfirmPlacebet: setConfirmPlacebet,
            setStake: setStake,
            clearStake: clearStake
        };
    };

}());
