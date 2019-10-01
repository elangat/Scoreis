(function(){
    
    var Event = YAHOO.util.Event,
        Dom = YAHOO.util.Dom,
        $ = YAHOO.util.Selector.query,
        Util = ZAPNET.util;
        
    ZAPNET.PoolsManager = ZAPNET.PoolsManager || {};    

    ZAPNET.PoolsManager = function(){
        var poolsEl,
            maxComb = [],    
            slipBusy = false,
            betTerminalId = null,
            saleTerminalId = null,
            userTotalStakes = 0,
            messageEvent = new YAHOO.util.CustomEvent('Message', this, false, YAHOO.util.CustomEvent.FLAT),
            betsPlacedEvent = new YAHOO.util.CustomEvent('Bet Placed', this, false, YAHOO.util.CustomEvent.FLAT),
            betsSentEvent = new YAHOO.util.CustomEvent('Bets Sent', this, false, YAHOO.util.CustomEvent.FLAT),
            betbookEvent = new YAHOO.util.CustomEvent('Bet Booking', this, false, YAHOO.util.CustomEvent.FLAT),
            betsResponseEvent = new YAHOO.util.CustomEvent('Bets Response', this, false, YAHOO.util.CustomEvent.FLAT),
            
        selectPoolsCoupon = function(couponId){
            var dropdown = Dom.get('dd-results');
            if (Dom.hasClass(dropdown, 'selected')){
                 Dom.removeClass(dropdown, 'selected');
            }
            Dom.removeClass($('.selected', poolsEl), 'selected');
            Dom.addClass($('div[pid="' + couponId + '"].pools-item', poolsEl), 'selected');
        },
        selectReport = function(couponId){
            var dropdown = Dom.get('dd-results');
            if (!Dom.hasClass(dropdown, 'selected')){
                Dom.addClass(dropdown, 'selected');
            }
            Dom.addClass()
            Dom.removeClass($('.pools-item.results.selected', poolsEl), 'selected');
            Dom.addClass($('div[pid="' + couponId + '"].pools-item', poolsEl), 'selected');
        },
        poolsClick = function(e){
            var el = Event.getTarget(e);
            
            if (Dom.hasClass(el, 'pools-square')){
                processSelection(el);
                return;
            } else if (Dom.hasClass(el, 'pools-button-clear')){
                clearCoupon(el);
                return;
            } else if (Dom.hasClass(el, 'pools-button-submit')){
                submitCoupon(el);
                return;
            } else if (Dom.hasClass(el, 'pools-button-random')){
                randomCoupon(el);
                return;
            }else if (Dom.hasClass(el, 'pools-button-favorite')){
                favoritesCoupon(el);
                return;
            }else if (Dom.hasClass(el, 'pools-button-unique')){
                uniqueBetClick(el);
                return;
            }
            
            
            
            var listItem = Dom.hasClass(el, 'pools-item') ? el : Dom.getAncestorByClassName(el, 'pools-item');
            if (listItem && !Dom.hasClass(listItem, 'selected')){
                var pid = Dom.getAttribute(listItem, 'pid');
                selectPoolsCoupon(pid);
            }
            
            if(Dom.hasClass(Dom.get('sh-results'), 'selected')){
                   Dom.addClass(Dom.get('dd-results'), 'selected'); 
              }
            
        },
                
        optionsClick = function(e){
            var el = Event.getTarget(e);
            
            if (Dom.hasClass(el, 'pool-item-results')){
                var selected = el.options[el.selectedIndex];
                var pid = Dom.getAttribute(selected, 'pid');
                if (pid){
                    selectReport(pid);
                }
                return;
            } 
            
            
        
            
        },        
        
        processPoolsCoupon = function(couponId){
            var couponEl = $('.pools-content .pools-item.selected', poolsEl, true);
            var rowEls = $('table.pools tr.match', couponEl);
            var markettype = Dom.getAttribute(couponEl, 'type')
            if(markettype == 10){
                var table = $('table.pools', couponEl, true);
                rowEls = $('tr.match', table);
            } else if(markettype==464 || markettype==332 || markettype == 2 || markettype == 208) {
                var matches = $('div.pools-matches', couponEl, true); 
                rowEls = $('div.matchbox', matches)
            }
            var rows = 0;
            Util.foreach(rowEls, function(rowEl){
                var checked = $('div.pools-square-checked', rowEl);
                var nrChecked = checked && checked.length ? checked.length : 0;
                if (nrChecked){
                    rows = (rows ? rows : 1) * nrChecked;
                }
            });
            var stakeEl = $('.value.pprStake' ,couponEl);
            var ppr = stakeEl[0].innerHTML;
            ppr = ppr.replace(/[^\d.-]/g, '');
            $('div.nr-rows', couponEl, true).innerHTML = rows;
            $('div.nr-cost', couponEl, true).innerHTML = Util.formatAmount(rows * parseFloat(ppr), true);            
        },
        
        processSelection = function(el){
            if (Dom.hasClass(el, 'pools-square-checked')){
                Dom.removeClass(el, 'pools-square-checked');
            } else {
                Dom.addClass(el, 'pools-square-checked');
            }
            var couponEl = Dom.getAncestorByClassName(el, 'pools-item');
            var couponId = Dom.getAttribute(couponEl, 'pid');
            processPoolsCoupon(couponId);
        },
        
        clearCoupon = function(el){
            var couponEl = Dom.getAncestorByClassName(el, 'pools-item');
            var couponId = Dom.getAttribute(couponEl, 'pid');
            var table = $('table.pools', couponEl, true);
            var checked = $('div.pools-square-checked', table);
            Dom.removeClass(checked, 'pools-square-checked');
            processPoolsCoupon(couponId);
        },
        
        setSelections = function(data){
            var selections = {};
            Util.foreach(data.items, function(item){
                selections[item.id] = item.selections;
            });
            var table = $('div[pid="' + data.coupon + '"].pools-item div.pools-matches > table.pools', poolsEl, true);
            var matches = $('tr.match', table);
            Util.foreach(matches, function(match){
                var outcomes = selections[Dom.getAttribute(match, 'mid')];
                var squares = $('div.pools-square', match);
                Util.foreach(squares, function(square){
                    var oc = Dom.getAttribute(square, 'oc');
                    if ($P.in_array(oc, outcomes)){
                        Dom.addClass(square, 'pools-square-checked');
                    } else {
                        Dom.removeClass(square, 'pools-square-checked');
                    }
                });
            });
            processPoolsCoupon(data.coupon);
        },
        getSelections = function(rowEls){
            var emptyLines = false;
            var invalidSelections =false;
            var selections = [];
            Util.foreach(rowEls, function(rowEl){
                var checked = $('div.pools-square-checked', rowEl);
                var nrChecked = checked && checked.length ? checked.length : 0;
                var mid = Dom.getAttribute(rowEl, 'mid');
                var selection = {
                    id: mid,
                    outcomes: []
                };
                if (nrChecked){
                    Util.foreach(checked, function(checkEl){
                        var oc = Dom.getAttribute(checkEl, 'oc');
                        selection.outcomes.push(oc);
                    });
                } else {
                    emptyLines = true;
                }
                selections.push(selection);
            });
            invalidSelections = checkMaxCombinations(selections);
            
            if (invalidSelections){
                Util.showWarningMessage(Util.t('You have selected more than the maximum combinations per match, please refer to the help.'),'Pools Coupon Error');
                return false;
            }
            var maxrows = false;
            maxrows = checkMaxRows();
            
            if(maxrows) {
               Util.showWarningMessage(Util.t('You have selected more than the maximum allowed rows.'),'Pools Coupon Error');
                return false;
            }
            if (emptyLines){
                Util.showWarningMessage(Util.t('You must select an outcome for all events in the coupon'),'Pools Coupon Error');
                return false;
            }
            return selections;
        },  
        submitCoupon = function(el){
            if (slipBusy){
                 Util.showWarningMessage(Util.t('Betting Slip Busy',Util.t('Busy')));
                return;                
            }
            
            var couponEl = Dom.getAncestorByClassName(el, 'pools-item');
            var couponId = Dom.getAttribute(couponEl, 'pid');
            var markettype = Dom.getAttribute(couponEl, 'type')
            if(markettype == 10){
                var table = $('table.pools', couponEl, true);
                rowEls = $('tr.match', table);
            } else if(markettype==464 ||markettype==332 || markettype == 2 || markettype == 208) {
                var matches = $('div.pools-matches', couponEl, true); 
                rowEls = $('div.matchbox', matches)
            }
           
            var emptyLines = false;
            var selections = getSelections(rowEls);
            if(selections) {
                   var callback = {
                   success: function (o) {
                       slipBusy = false;
                            var result = YAHOO.lang.JSON.parse(o.responseText);
                        if (result.error){
                            if (ZAPNET.Bet){
                                ZAPNET.Bet.showMessage({
                                        message: result.error,
                                        title: 'Error',
                                        type: 'error'
                                    });
                                } else {
                                    Util.showErrorMessage(result.error,Util.t('Pools Coupon Error'));
                            
                                }
                                return;
                            } else {
                                if (ZAPNET.Bet){
                                    ZAPNET.Bet.betPlaced(result);
                                }
                                if (result.betbook){
                                    betBooking(result.betbook);
                                } else {
                                    Util.showSuccessMessage(Util.t('Bets placed successfully', Util.t('Pools Coupon')));
                                }
                            clearCoupon(el);
                                }
                        },
                    failure: function (o) {
                        slipBusy = false;
                        Util.showErrorMessage('Problem: ' + o.responseText);
                    },
                    cache: false,
                    timeout: 30000
                };
                var slipData = {
                    id: couponId,
                    type: 'pools',
                    sell:false,
                    selections: selections
                };
                if (betTerminalId){
                    slipData.btid = betTerminalId;
                }
                if (saleTerminalId){
                    slipData.stid = saleTerminalId;
                }                
                var data = YAHOO.lang.JSON.stringify(slipData);
                YAHOO.util.Connect.asyncRequest('POST', '/bet/new.js', callback, data);
                slipBusy = true;
            }
        },
        uniqueBetClick = function(el){
            var couponEl = Dom.getAncestorByClassName(el, 'pools-item');
            var couponId = Dom.getAttribute(couponEl, 'pid');
            var markettype = Dom.getAttribute(couponEl, 'type')
            if(markettype == 10){
                var table = $('table.pools', couponEl, true);
                rowEls = $('tr.match', table);
            } else if(markettype==464 ||markettype==332 || markettype == 2 || markettype == 208) {
                var matches = $('div.pools-matches', couponEl, true); 
                rowEls = $('div.matchbox', matches)
            }
            var selections = getSelections(rowEls);
            if(!selections){
                return;
            }
            var selString = '';
            Util.foreach(selections, function(selection){
              selString += selection.outcomes ;
              selString +='|';
            });
            
            
            selString = selString.replace(/\|$/, '');
            
            var url = '/pools/chkuniqbet.js';
                
                var callback = {
                    success: function(o){
                        var data = eval('(' + o.responseText + ')');
                        if (data.isUnique ){
                            Util.showSuccessMessage(Util.t('The selections are unique'), Util.t('Pools Coupon'));
                        } else {
                            Util.showErrorMessage(Util.t( 'The selections are not unique'), Util.t('Pools Coupon'));
                        }
                    },
                    failure: function(o){
                        Util.showWarningMessage(Util.t('Communication Error!'), Util.t('Pools Coupon'));
                    },
                    cache: false,
                    timeout: 20000
                };
                var data = {
                    'id': couponId,
                    'sel': selString
                };
                
                YAHOO.util.Connect.asyncRequest('POST', url, callback, Util.post(data));
            

        },        
        setBetTerminalId = function(id){
            betTerminalId = id;
        },
        
        setSaleTerminalId = function(id){
            saleTerminalId = id;
        },
        
        processEvents = function(event){
            if (event.o != 'pools'){
                return;
            }
            if (event.t == 'turnover'){
        //        $('div[pid="' + event.oid + '"].pools-item div.turnover', poolsEl, true).innerHTML = Util.formatAmount(event.v, true);
            }
        },
        checkMaxCombinations =function(selections){
            if(!getMaxCombinations()) {
                return false;
            }
            for (var key in maxComb) {
                var countSelections = 0;
                var value = maxComb[key];
                Util.foreach(selections,function(selection){
                    var len = selection.outcomes.length;
                    if(len==key){
                       countSelections++; 
                    }
                });

                if(countSelections>value){
                    return true;
                }
            }
            return false;
        },
        selectSquare = function(rowEl, c) {
            var squares = $('div.pools-square', rowEl);
            Util.foreach(squares, function(square){
                var oc = Dom.getAttribute(square, 'oc');
                if (oc==c) {
                    Dom.addClass(square, 'pools-square-checked');
                }
            });
            var couponEl = Dom.getAncestorByClassName(rowEl, 'pools-item');
            var couponId = Dom.getAttribute(couponEl, 'pid');
            processPoolsCoupon(couponId);
        },
        randomCoupon = function(el) {
            var couponEl = Dom.getAncestorByClassName(el, 'pools-item');  
            var couponId = Dom.getAttribute(couponEl, 'pid');
            var markettype = Dom.getAttribute(couponEl, 'type')
            var rowEls;
            if(markettype == 10){
                var table = $('table.pools', couponEl, true);
                rowEls = $('tr.match', table);
            } else if(markettype==464 ||markettype==332 || markettype == 2 || markettype == 208) {
                var matches = $('div.pools-matches', couponEl, true); 
                rowEls = $('div.matchbox', matches)
            }
            clearCoupon(el);
            Util.foreach(rowEls, function(rowEl){
                var odds = $('.odds', rowEl);
                var array =[];  
                Util.foreach(odds, function(odd){
                    var eltype = Dom.getAttribute(odd, 'type')
                    array.push({
                        type:eltype,
                        value:odd.innerHTML
                    });
                });
                var c = Math.floor((Math.random() * odds.length) + 0);

                selectSquare(rowEl,  array[c].type);
            });
         
        },
        favoritesCoupon = function(el){
            var couponEl = Dom.getAncestorByClassName(el, 'pools-item');
            var couponId = Dom.getAttribute(couponEl, 'pid');
            var markettype = Dom.getAttribute(couponEl, 'type')
            if(markettype == 10){
                var table = $('table.pools', couponEl, true);
                var rowEls = $('tr.match', table);
            } else if (markettype == 332 || markettype ==2 || markettype ==464 || markettype == 208){
                var matches = $('div.pools-matches', couponEl, true); 
                var rowEls = $('div.matchbox', matches)
            }
            clearCoupon(el);
            Util.foreach(rowEls, function(rowEl){
                var odds = $('.odds', rowEl);
                var array =[];  
                Util.foreach(odds, function(odd){
                    var eltype = Dom.getAttribute(odd, 'type')
                    array.push({
                        type:eltype,
                        value: odd.innerText
                    });
                });
                array.sort(function(obj1, obj2) {
                     return obj1.value - obj2.value;
                });
                selectSquare(rowEl,  array[0].type);
            });
        },
        getMaxCombinations = function() {
            var couponEl = Dom.getElementsByClassName('pools-item selected');
            var comb = Dom.getAttribute(couponEl, 'comb');
            if(!comb) {
                return false;
            }
            var combin = comb[0].split('#');
                    
            Util.foreach(combin, function(combin){
                    var arr = combin.split(':');
                    arr[1] && (maxComb[arr[0]] = arr[1]);
                });
            return true;
       
        },
        checkMaxRows = function() {
            var couponEl = $('.pools-content .pools-item.selected', poolsEl, true);
            var maxrows = Number(Dom.getAttribute(couponEl, 'maxrows'));
            var rowEls = $('table.pools tr.match', couponEl);
            var markettype = Dom.getAttribute(couponEl, 'type')
            if(markettype == 10){
                var table = $('table.pools', couponEl, true);
                rowEls = $('tr.match', table);
            } else if(markettype==464 ||markettype==332 || markettype == 2) {
                var matches = $('div.pools-matches', couponEl, true); 
                rowEls = $('div.matchbox', matches)
            }
            var rows = 0;
            Util.foreach(rowEls, function(rowEl){
                var checked = $('div.pools-square-checked', rowEl);
                var nrChecked = checked && checked.length ? checked.length : 0;
                if (nrChecked){
                    rows = (rows ? rows : 1) * nrChecked;
                }
            });
            if(!maxrows) {
                return false;
            } else {
                if(maxrows < rows) {
                   return true
                }
            }
            return false;
        },
        positionInlineBetslipWrapper = function(wrapperEl, panelElement){
            var panelHeight = Util.getDimensions(panelElement).height;
            var viewport = Dom.getClientRegion();
            var viewportHeight = viewport.bottom - viewport.top;
            // console.log(viewportHeight, panelHeight);
            if (panelHeight + 50 > viewportHeight){
                var slipHeight = Util.getDimensions(wrapperEl).height;
                Dom.setStyle(wrapperEl, 'height', (slipHeight - (panelHeight + 50 - viewportHeight)) + 'px');
            // console.log('New height', slipHeight, (slipHeight - (panelHeight + 50 - viewportHeight)));
                wrapperEl.scrollTop = wrapperEl.scrollHeight;
            }
        },

        betBooking = function(betbook){
            var betBookHtml = [];
            betBookHtml.push('<div class="bet-booking"><div class="bet-booking-info"><div class="bet-booking-number">');
            betBookHtml.push(Util.t('Bet Booking Number'), ':&nbsp;&nbsp;<span class="bet-booking-code">', betbook.code, '</span></div>');
            betBookHtml.push('<div class="bet-booking-date">', betbook.time, '</div></div>');
            betBookHtml.push('<div class="bet-booking-body">');
            betBookHtml.push('<div class="bet-book-explain">', Util.t('You Bet has been booked. Use the Bet Booking number in any of our shops to place the bet. Bet not valid until an official ticket is issued. Odds may change or be removed.'), '</div>');
            betBookHtml.push('<div class="bet-book-options">');
            betBookHtml.push('<a href="#" class="bet-book-login">', Util.t('Sign In'), '</a>');
            betBookHtml.push('<a href="/register" class="bet-book-register">', Util.t('Register'), '</a>');
            if (ZAPNET_CONSTANTS.BET_BOOKING_PRINT){
                betBookHtml.push('<a href="/betbooking?id=', betbook.code, '" _target="blank" class="bet-book-print">', Util.t('Print'), '</a>');
            }
            betBookHtml.push('<a href="#" class="bet-book-email">', Util.t('Email'), '</a>');
            betBookHtml.push('</div></div>');

            var panel = Util.showMessage('<div class="inline-slip-wrapper"><div class="inline-betslip">' + betbook.html + '</div>' + betBookHtml.join('') + '</div>', Util.t('Betting Slip'));
            var wrapperEl = $('.inline-slip-wrapper', panel.element, true);
            positionInlineBetslipWrapper(wrapperEl, panel.element);
        },

        init = function(){
            poolsEl = Dom.get('poolsview') || Dom.get('pools');
            Event.on(poolsEl, 'click', poolsClick);
            Event.on(poolsEl, 'change', optionsClick);
            ZAPNET.Events.subscribe(processEvents, 'pools');
       
        };

        return {
            init: init,
            messageEvent: messageEvent,
            betsSentEvent: betsSentEvent,
            betsResponseEvent: betsResponseEvent,
            betsPlacedEvent: betsPlacedEvent, 
            betbookEvent: betbookEvent,
            selectPoolsCoupon: selectPoolsCoupon,
            setSelections: setSelections,
            setBetTerminalId: setBetTerminalId,
            setSaleTerminalId: setSaleTerminalId,
            poolsClick: poolsClick
        };
   }();
   
}());
