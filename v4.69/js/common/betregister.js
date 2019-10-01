(function(){
    var Event = YAHOO.util.Event,
        Dom = YAHOO.util.Dom,
        $ = YAHOO.util.Selector.query,
        Util = ZAPNET.util;
    
    var NUMPAD_CONST_MARGIN = 8;
    var OUTRIGHT_CONST_MATCHCODE = 0;
        

    ZAPNET.BetRegister = function(element){
        var dom = {},
            errorStatus = false,
            focusedElement = null,
            matchSelectedEvent = new YAHOO.util.CustomEvent('Match Selected', this, false, YAHOO.util.CustomEvent.FLAT),
            betSelectedEvent = new YAHOO.util.CustomEvent('Bet Selected', this, false, YAHOO.util.CustomEvent.FLAT),
            outrightSelectedEvent = new YAHOO.util.CustomEvent('Outright Selected', this, false, YAHOO.util.CustomEvent.FLAT),
            enterEvent = new YAHOO.util.CustomEvent('Enter', this, false, YAHOO.util.CustomEvent.FLAT),

        showLoading = function(){
            Dom.removeClass(dom.mask, 'hidden');
            Dom.removeClass(dom.loading, 'hidden');
        },

        hideLoading = function(){
            Dom.addClass(dom.mask, 'hidden');
            Dom.addClass(dom.loading, 'hidden');
        },

        setMessage = function(str){
            errorStatus = true;
            dom.message.innerHTML = str;
            Dom.removeClass(dom.message, 'hidden');
        },

        clearMessage = function(){
            errorStatus = false;
            dom.message.innerHTML = '';
            Dom.addClass(dom.message, 'hidden');
        },

        clear = function(){
            clearMessage();
            dom.matchCodeInput.value = '';
            dom.betCodeInput.value = '';
        },

        betClick = function(e){
            var el = Event.getTarget(e);
            if (el == dom.matchCodeInput || el == dom.betCodeInput || Dom.hasClass(el, 'message')){
                clearMessage();
            }
        },

        matchCodeEnter = function(){
            var code = $P.trim(dom.matchCodeInput.value);
            if (code){
                dom.betCodeInput.focus();
            } else {
                enterEvent.fire();
            }
        },

        betCodeEnter = function(){
            if (errorStatus){
                search();
                return;
            }
            var matchCode = dom.matchCodeInput.value;
            var betCode = dom.betCodeInput.value;

            if (!matchCode){
                dom.betCodeInput.value = '';
                dom.matchCodeInput.focus();
                return;
            }
            if (!betCode){
                return loadMatch(matchCode);
            } else if (betCode == 'q'){
                return loadMatch(matchCode);
            }

            if (matchCode && Util.isNumeric(matchCode, true)){
                loadBet(matchCode, betCode);
            } else {
                dom.matchCodeInput.value = '';
                dom.betCodeInput.value = '';
                dom.matchCodeInput.focus();
            }
        },

        betFocus = function(){
            showNumpad();
            clearMessage();
            focusElement(dom.betCodeInput);
            
        },

        matchFocus = function(){
            showNumpad();
            search();
            focusElement(dom.matchCodeInput);
           
        },
        showNumpad = function() {
            if (ZAPNET.Terminal && ZAPNET_TERMINAL_SETTINGS.SHOW_HIDE_NUMPAD){
                var slipNumpadEl = $('div.sports-slip .betting-slip div.fixed-bottom div.amount-input', null, true);
                if(slipNumpadEl && Dom.hasClass(slipNumpadEl , 'hide')) {
                    var slipSelections = $('div.sports-slip .betting-slip .betslip-selections', null, true);
                    Dom.addClass(slipNumpadEl , 'show');
                    Dom.removeClass(slipNumpadEl , 'hide');
                    var npHeight = slipNumpadEl.clientHeight;
                    var selsHeight = slipSelections.clientHeight - npHeight - 2 * NUMPAD_CONST_MARGIN;
                    Dom.setStyle(slipSelections, 'height', selsHeight + 'px');
                    var numberInputEl = $('.number-input', betRegEl, true);
                    var y = Dom.getY(slipNumpadEl);
                    Dom.setY(numberInputEl, y);
                }
            }
        },
            
        hideNumpad = function() {
            if (ZAPNET.Terminal && ZAPNET_TERMINAL_SETTINGS.SHOW_HIDE_NUMPAD){
                var slipNumpadEl = $('div.sports-slip .betting-slip div.fixed-bottom div.amount-input', null, true);
                if(slipNumpadEl && Dom.hasClass(slipNumpadEl , 'show')) {
                    Dom.addClass(slipNumpadEl , 'hide');
                    Dom.removeClass(slipNumpadEl , 'show');
                }
            }
        },

        loadMatch = function(matchCode){
            var match = ZAPNET.BetDB.getMatchByCode(matchCode);
            if (match && match.full){
                matchSelectedEvent.fire(match.id);
                return;
            }
            var callback = {
                success: function(){
                    var match = ZAPNET.BetDB.getMatchByCode(matchCode);
                    if (match && match.full){
                        matchSelectedEvent.fire(match.id);
                        search();
                    } else {
                        setMessage(Util.t('Match not found'));
                    }
                },
                done: function(){
                    hideLoading();
                }
            };
            showLoading();
            if (match){
                ZAPNET.BetDB.loadMatches(callback, match.id);
            } else {
                ZAPNET.BetDB.loadMatches(callback, matchCode, false, 'mc');
            }
        },

        loadBet = function(matchCode, betCode){
            if(matchCode == OUTRIGHT_CONST_MATCHCODE ) {
               loadOutrightSelection(betCode);
               return;
            }
            var selection = ZAPNET.BetDB.getBetSelection(matchCode, betCode);
            if (selection){
                betSelectedEvent.fire(selection.id);
            } else {
                var callback = {
                    success: function(data){
                        if (data.selection){
                            betSelectedEvent.fire(data.selection.id);
                            search();
                        } else {
                            setMessage(Util.t('Bet not found'));
                        }
                    },
                    done: function(){
                        hideLoading();
                    },
                    skipEvents: true,
                    clearDb: false
                };
                showLoading();
                ZAPNET.BetDB.loadBet(callback, matchCode, betCode);
            }
        },
        loadOutrightSelection = function (cid) {
            var sid = 0;
            Util.foreach(ZAPNET.BetDB.outrightCompetitors , function (competitor) {
                if(competitor.outright_competitor_info == cid ) {
                   console.log(competitor.id);
                   sid = competitor.id;
                }
            });
            
            if(sid > 0) {
               outrightSelectedEvent.fire(sid);
                dom.matchCodeInput.value = '';
                dom.betCodeInput.value = '';
                dom.matchCodeInput.focus();
            } else {
                var callback = {
                    success: function(data){
                        if (data){
                            Util.foreach(ZAPNET.BetDB.outrightCompetitors , function (competitor) {
                                if(competitor.outright_competitor_info == cid ) {
                                   console.log(competitor.id);
                                   sid = competitor.id;
                                   
                                }
                            });
                            if(sid > 0) {
                                outrightSelectedEvent.fire(sid);
                                dom.matchCodeInput.value = '';
                                dom.betCodeInput.value = '';
                                dom.matchCodeInput.focus();
                            } else {
                                setMessage(Util.t('Outright not found'));
                            }
                        } else {
                            setMessage(Util.t('Outright not found'));
                        }
                    },
                    done: function(){
                        hideLoading();
                    },
                    skipEvents: true,
                    clearDb: false
                };
                showLoading();
                ZAPNET.BetDB.load(callback, {
                        g: 'OTR'
                    });
            }
        },
            
        resizePage = function(){
            if (ZAPNET.Terminal && !ZAPNET_TERMINAL_SETTINGS.BET_REGISTER_NUM_PAD){
                return;
            }
            var numberInputEl = $('.number-input', betRegEl, true);
            var slipNumpadEl = $('div.sports-slip .betting-slip div.fixed-bottom div.amount-input', null, true);
            var y = Dom.getY(slipNumpadEl);
            Dom.setY(numberInputEl, y);
        },

        windowClick = function(e){
            var el = Event.getTarget(e);
            var br = Dom.getAncestorByClassName(el, 'bet-register');
            if (!br){
                close();
                clear();
            }
            clearMessage();
        },

        focusElement = function(el){
            close();
            Dom.addClass(el, 'focused');
            Dom.addClass(betRegEl, 'active');
            focusedElement = el;
            resizePage();
            el.focus();
        },

        close = function(){
            Dom.removeClass(dom.matchCodeInput, 'focused');
            Dom.removeClass(dom.betCodeInput, 'focused');
            Dom.removeClass(betRegEl, 'active');
            focusedElement = null;

        },

        numPadClick = function(e){
            if (!focusedElement){
                close();
                return;
            }

            var el = Event.getTarget(e);
            var key = null;
            if (Dom.hasClass(el, 'number-input-key-clear')){
                focusedElement.value = '';
            } else if (Dom.hasClass(el, 'number-input-key-bs')){
                if (focusedElement.value.length > 0){
                    focusedElement.value = focusedElement.value.substr(0, focusedElement.value.length - 1);
                } else if (focusedElement === dom.betCodeInput){
                    focusElement(dom.matchCodeInput);
                }
            } else if (Dom.hasClass(el, 'number-input-key-enter')){
                if (focusedElement === dom.matchCodeInput){
                    matchCodeEnter();
                } else if (focusedElement === dom.betCodeInput){
                    betCodeEnter();
                }
            } else if (Dom.hasClass(el, 'number-input-key-number')){
                key = Dom.getAttribute(el, 'nr');
            } else if (Dom.hasClass(el, 'number-input-key-decimal')){
                key = '.';
            } else if (Dom.hasClass(el, 'number-input-key-shortcut-cs')){
                key = 'CS';
            }

            if (key){
                focusedElement.value += key;
            }

            clearMessage();
        },

        search = function(){
            clear();
            dom.matchCodeInput.focus();
        };

        var betRegEl = Util.div('bet-register');
        var html = [], i;
        html.push('<span class="match-code"><input type="text" class="match-code-input" placeholder="');
        html.push(Util.t('Match code'), '"/></span><span class="match-code-submit"></span><span class="bet-code">');
        html.push('<input type="text" class="bet-code-input" placeholder="');
        html.push(Util.t('Bet code'), '"/></span><span class="bet-code-submit"></span>');
        html.push('<span class="loading hidden"></span><div class="message hidden"></div><div class="mask hidden"></div>');

        if (ZAPNET.Terminal && ZAPNET_TERMINAL_SETTINGS.BET_REGISTER_NUM_PAD){
            html.push('<div class="number-input number-input-numpad">');
            html.push('<div class="number-input-key number-input-key-shortcut number-input-key-shortcut-cs" amt="cs">CS</div>');
            html.push('<div class="number-input-key number-input-key-shortcut number-input-key-shortcut-empty-1" amt=""></div>');
            html.push('<div class="number-input-key number-input-key-shortcut number-input-key-shortcut-empty-2" amt=""></div>');
            html.push('<div class="number-input-key number-input-key-shortcut number-input-key-shortcut-empty-3" amt=""></div>');

            html.push('<div class="number-input-key number-input-key-clear">', Util.t('Clear'), '</div>');
            html.push('<div class="number-input-key number-input-key-bs">', Util.t('Back'), '</div>');
            html.push('<div class="number-input-key number-input-key-enter">', Util.t('Enter'), '</div>');
            html.push('<div class="number-input-key number-input-key-decimal">.</div>');
            for(i = 0; i < 10 ; i += 1){
                html.push('<div class="number-input-key number-input-key-number number-input-key-number-', i, '" nr="', i, '">', i, '</div>');
            }
            html.push('</div>');
        }

        betRegEl.innerHTML = html.join('');
        element.appendChild(betRegEl);

        dom.matchCodeInput = $('input.match-code-input', betRegEl, true);
        dom.betCodeInput = $('input.bet-code-input', betRegEl, true);
        dom.numPad = $('.number-input', betRegEl, true);
        dom.message = $('div.message', betRegEl, true);
        dom.loading = $('span.loading', betRegEl, true);
        //Event.on(betRegEl, 'click', betClick);
        var matchCodeEnterListener = new YAHOO.util.KeyListener(dom.matchCodeInput, {keys: [13]},{
            fn: function(type, args){
                matchCodeEnter();
            }
        });
        matchCodeEnterListener.enable();
        var betCodeEnterListener = new YAHOO.util.KeyListener(dom.betCodeInput, {keys: [13]},{
            fn: function(type, args){
                betCodeEnter();
            }
        });
        betCodeEnterListener.enable();
        Event.on(dom.matchCodeInput, 'focus', matchFocus);
        Event.on(dom.betCodeInput, 'focus', betFocus);
        Event.on(window, 'click', windowClick);
        Event.on(dom.matchCodeInput, 'keyup', clearMessage);
        Event.on(dom.betCodeInput, 'keyup', clearMessage);
        if (dom.numPad){
            Event.on(dom.numPad, 'click', numPadClick);
        }

        if (ZAPNET.Terminal){
            ZAPNET.Terminal.windowResizeEvent.subscribe(resizePage);
        }

        return {
            matchSelectedEvent: matchSelectedEvent,
            betSelectedEvent: betSelectedEvent,
            outrightSelectedEvent: outrightSelectedEvent,
            enterEvent: enterEvent,
            search: search
        };
    };

}());

