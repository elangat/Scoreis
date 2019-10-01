(function(){

    var Dom = YAHOO.util.Dom,
        Event = YAHOO.util.Event,
        $ = YAHOO.util.Selector.query,
        Util = ZAPNET.util;


    ZAPNET.Keno = function(el){
        var dom,
            element = el,
            initialized = false,
            mobile = false,
            allIn = false,
            tickets = [],
            delTickets = [],
            lastEventId = 0,
//            busy = false,
//            interval = null
            stake,
            baseStake,
//            stake = ZAPNET_ONLINE_CONSTANTS.KENO_BASE_PRICE,
            inputStake = '',
            draws = 1,
            lastDrawId = null,
            nextDrawId = null,
            nextTime = null,
            nextSecs = 0,
            nextDrawCountdown = 0,
            jackpotAmount = 0,
            drawBlink = null,
            drawNumbers = {},
            saleNumbers = {},
            showDrawOnboard = true,
            
            
        pageClick = function(e){
            var el = Event.getTarget(e);
            Event.preventDefault(e);
            if (Dom.hasClass(el, 'number-select')){
                var n = parseInt(Dom.getAttribute(el, 'ns'));
                if (n){
                    if (saleNumbers[n]){
                        delete saleNumbers[n];
                        Dom.removeClass(el, 'selected');
                    } else {
                        if (Util.countProperties(saleNumbers) >= 12){
                            if(mobile){
                                alert(Util.t('Error: Maximum Numbers 12'));
                            } else {
                                Util.showErrorMessage('Error: Maximum Numbers 12');
                                
                            }
                            return;
                        }
                        saleNumbers[n] = n;
                        Dom.addClass(el, 'selected');
                    }
                    process();
                }
            } else if (Dom.hasClass(el, 'keno-stake-amount')){
                var st = Dom.getAttribute(el, 'st');
                inputStake = dom.stake.value;
                if(st == '-') {
                    inputStake = inputStake.slice(0, -1);
                } else {
                    inputStake += st;
                }
                stake = inputStake >= baseStake ? inputStake : baseStake;
                dom.stake.value = inputStake;
                process();
            } else if (Dom.hasClass(el, 'board-switch')){
                var ch_el = Dom.get('board-switch');
                if(ch_el.checked){
                    ch_el.checked = false;
                    showDrawOnboard = false;
                    clearDrawBoard();
                } else {
                    ch_el.checked = true;
                    showDrawOnboard = true;
                    showDraw();
                }
            } else if (Dom.hasClass(el, 'keno-draws-minus')){
                draws = draws > 1 ? draws - 1 : 1;
                process();
            } else if (Dom.hasClass(el, 'keno-draws-plus')){
                draws = draws + 1;
                process();
            } else if (Dom.hasClass(el, 'keno-market-num')){
                var mark = Dom.getAttribute(el, 'm');
                setRandomNumbers(mark);
                process();
            } else if (Dom.hasClass(el, 'keno-clear-settled')){
                Util.foreach(tickets, function(ticket){
                    if(ticket && ticket.status !== 'pending'){
                        delTickets.push(ticket.id);
                    }
                });
                showTickets(tickets);
                process();
            } else if (Dom.hasClass(el, 'keno-clear-tickets')){
                Util.foreach(tickets, function(ticket){
                    delTickets.push(ticket.id);
                });
                showTickets(tickets);
            } else if (Dom.hasClass(el, 'keno-clear-numbers')){
                clearNumbers();
                clearChangeBar();
            } else if (Dom.hasClass(el, 'keno-place-bet')){
                placeBets();
                clearChangeBar(); 
                if(allIn){
                    Dom.removeClass(dom.allIn, 'selected');
                }
            } else if (Dom.hasClass(el, 'keno-next') && Util.countProperties(saleNumbers) > 0){
                Dom.setStyle(dom.markets, 'display', 'none');
                Dom.setStyle(dom.submitBlk, 'display', 'block');
            } else if (Dom.hasClass(el, 'keno-back')){
                Dom.setStyle(dom.markets, 'display', 'block');
                Dom.setStyle(dom.submitBlk, 'display', 'none') 
            } else if (Dom.hasClass(el, 'keno-all-in')){
                if(Dom.hasClass(el, 'selected')){
                    Dom.removeClass(el, 'selected');
                    allIn = false;
                } else {
                    Dom.addClass(el, 'selected');
                    allIn = true;
                }
                process();
            } else if (Dom.hasClass(el, 'ticket-clear')){
                var t_el = Dom.getAncestorByClassName(el, 'keno-draw-ticket');
                var tid = Dom.getAttribute(t_el, 't');
                delTickets.push(tid);
                showTickets(tickets);
            } else if (Dom.hasClass(el, 'ticket-replay')){
                clear();
                var t_el = Dom.getAncestorByClassName(el, 'keno-draw-ticket');
                var tid = Dom.getAttribute(t_el, 't');
                Util.foreach(tickets, function(ticket){
                    if(ticket && ticket.id == tid){
                        saleNumbers = {};
                        Util.foreach(ticket.numbers, function(num){
                            saleNumbers[num] = num;
                        });
                        draws = ticket.fdraw - ticket.sdraw + 1;
                        stake = ticket.stake / draws;
                        process();
                    }
                });
                if(mobile){
                    var tabEl = Dom.get('board-tab');
                    tabEl.click();
                }
            }
        },
        
        clearChangeBar = function(){
            if(mobile){
                Dom.setStyle(dom.markets, 'display', 'block');
                Dom.setStyle(dom.submitBlk, 'display', 'none');
            }
        },
                
        showDraw = function(){
            var nDropped = Util.countProperties(drawNumbers);
            var i, nEl, dEl;
            for(i = 1; i <= 20 ; i += 1){
                nEl = $('div[dn="' + i + '"].draw-number', dom.drawBar, true);
                var number = drawNumbers[Object.keys(drawNumbers)[i-1]];
                var dEl = $('div[ns="' + number + '"].number-select', dom.gameBoard, true);
                if (nDropped >= i){
                    nEl.innerHTML = number;
                    Dom.addClass(nEl, 'dropped');
                    if(showDrawOnboard){
                        Dom.addClass(dEl, 'dropped');
                    }
                    var els = $('div.ticket-row.pending span[n="' + number + '"]', dom.tickets);
                    Dom.addClass(els, 'number-hit');
                } else {
                    nEl.innerHTML = i;
                    Dom.removeClass(nEl, 'dropped');
                    Dom.removeClass(dEl, 'dropped');
                    var els = $('div.ticket-row.pending span[n="' + number + '"]', dom.tickets);
                    Dom.removeClass(els, 'number-hit');
                }
            }
        },
        
        showDrawNumber = function(number){
            var dn = Util.countProperties(drawNumbers);
            try{
                var el = $('div[dn="' + dn + '"].draw-number', dom.drawBar, true);
                el.innerHTML = number;
                Dom.addClass(el, 'dropped');
                if(showDrawOnboard && !mobile){
                    var eld = $('div[ns="' + number + '"].number-select', dom.gameBoard, true);
                    Dom.addClass(eld, 'dropped');
                }
            } catch (e){
            }
            try {
                var els = $('div.ticket-row.pending span[n="' + number + '"]', dom.tickets);
                Dom.addClass(els, 'number-hit');
            } catch (e){
            }
        },
        
        doClearDrawNumbers = function(numbers, draw){
            var number = numbers.shift();
            Dom.removeClass(number, 'dropped');
            if(draw){
                number.innerHTML = Dom.getAttribute(number, 'dn');
            }
            if (numbers.length){
                setTimeout(function(){
                    doClearDrawNumbers(numbers, draw);
                }, 50);
            }
        },
        
        clearDrawNumbers = function(){
            drawNumbers = {};
            try{
                var selectedDrawNumbers = $('div.draw-number.dropped', dom.drawBar);
                doClearDrawNumbers(selectedDrawNumbers, true);
                var selectedNumbers = $('div.number-select.dropped', dom.gameBoard);
                if(selectedNumbers){
                    doClearDrawNumbers(selectedNumbers, false);
                }
            } catch (e){
            }
            try{
                var ticketNumbers = $('span.number-hit', dom.tickets);
                Dom.removeClass(ticketNumbers, 'number-hit');
            } catch (e){
            }
        },
            
        clearDrawBoard = function(){
            var selectedNumbers = $('div.number-select.dropped', dom.gameBoard);
            if(selectedNumbers){
                doClearDrawNumbers(selectedNumbers, false);
            }
        },
        
        doOrderDrawNumbers = function(numbers){
            var number = numbers.shift();
            Dom.removeClass(number, 'dropped');
            var dn = Dom.getAttribute(number, 'dn');
            if (numbers.length){
                setTimeout(function(){
                    Dom.addClass(number, 'dropped');
                    number.innerHTML = drawNumbers[Object.keys(drawNumbers)[dn - 1]];
                    doOrderDrawNumbers(numbers);
                }, 50);
            } else {
                Dom.addClass(number, 'dropped');
                number.innerHTML = drawNumbers[Object.keys(drawNumbers)[19]];
            }
        },
        
        setOrderDrawNumbers = function(orderDrawNumbers){
            drawNumbers = {};
            Util.foreach(orderDrawNumbers, function(n){
                drawNumbers[n] = n;
            });
            try{
                var selectedNumbers = $('div.draw-number.dropped', dom.drawBar);
                doOrderDrawNumbers(selectedNumbers);
            } catch (e){
            }
        },
            
        setRandomNumbers = function (n) {
            Dom.removeClass($('div.number-select', dom.gameBoard), 'selected');
            var randomNumbers = [];
            if(n > Util.countProperties(saleNumbers)){
                var selectedNumbers = saleNumbers;
                saleNumbers = {};
                Util.foreach(selectedNumbers, function(num){
                    randomNumbers.push(num);
                    saleNumbers[num] = num;
                });
            } else {
                saleNumbers = {};
            }
            while(randomNumbers.length < n){
                var randomnumber = Math.ceil(Math.random()* 80);
                if(randomNumbers.indexOf(randomnumber) > -1){
                    continue;
                }
                randomNumbers.push(randomnumber);
                saleNumbers[randomnumber] = randomnumber;
            }
        },
        
        showSelections = function(numbers){
            Dom.removeClass($('div.number-select', dom.gameBoard), 'selected');
            Util.foreach(numbers, function(number){
                try{
                    var el = $('div[ns="' + number + '"].number-select', dom.gameBoard, true);
                    Dom.addClass(el, 'selected');
                } catch (e){
                }
            });
            dom.draftNumbers.innerHTML = '';
            if(numbers && Util.countProperties(numbers) > 0){
                Util.foreach(numbers, function(n){
                    dom.draftNumbers.innerHTML += '<span class="number">'+ n + '</span>';
                });
            } else if (mobile){
                dom.draftNumbers.innerHTML = '<span class="helper">Select Number Below for Random</span>';
            } else {
                dom.draftNumbers.innerHTML = '<span class="helper">Numbers</span>';
            }
            if(!mobile){
                var nextDraw = nextDrawId ? nextDrawId : '';
                if(draws > 1){
                    dom.draftDraws.innerHTML = '#' + nextDraw + ' - ' + (parseInt(nextDrawId)+draws-1) + ' (' + draws +')';
                } else if(Util.countProperties(numbers) > 0){
                    dom.draftDraws.innerHTML = '#' + nextDraw;
                } else {
                    dom.draftDraws.innerHTML = '<span class="helper">Draws</span>';
                }
                  
                var drawM_el = $('div.draft-market', element, true);
                if(Util.countProperties(numbers) > 0){
                    drawM_el.innerHTML = Util.countProperties(numbers) + (allIn ? ' All-In ' : '');
                } else {
                    drawM_el.innerHTML = '<span class="helper">Selections</span>';
                }
            } 
        },
                
        clearNumbers = function(){
            saleNumbers = {};
            Dom.removeClass($('div.number', dom.gameBoard), 'selected');
            process();
        },
                
        clear = function(){
            saleNumbers = {};
            var basePrice = mobile ? ZAPNET_ONLINE_CONSTANTS.KENO_BASE_PRICE : ZAPNET.KENO_BASE_PRICE;
            stake = basePrice;
            draws = 1;
            allIn = false;
            Dom.removeClass($('div.number', dom.gameBoard), 'selected');
            process();
        },
                
        showTickets = function(tickets){
            var html = [];
            if (tickets && tickets.length){
                Util.foreach(tickets, function(ticket){
                    if (delTickets.indexOf(ticket.id) < 0){
                        html.push('<div class="ticket-row ', ticket.status, '">');
                        html.push('<div class="keno-draw-ticket ticket-header" t="', ticket.id, '">');
                        html.push('<div class="ticket-replay click-btn">&#8635;</div>');
                        html.push('<div class="ticket-selections"><span class="ticket-numbers">'+ ticket.numbers.length + (ticket.all_in ? ' All In' : ' Numbers')+ '</span>');
                        html.push('<span class="ticket-draws">#', ticket.sdraw);
                        if (ticket.fdraw > ticket.sdraw){
                            // if(settled)
                            var ndraw = lastDrawId - ticket.sdraw + 1
                            if(ticket.status == "pending" && ticket.fdraw-ticket.sdraw + 1 >= ndraw && ticket.sdraw <= lastDrawId){
                                html.push(' - ' + ticket.fdraw, ' (', ndraw, '/', (ticket.fdraw-ticket.sdraw + 1), ')');
                            } else {
                                html.push(' - ' + ticket.fdraw, ' (', (ticket.fdraw-ticket.sdraw + 1), ')');
                            }
                        }
                        html.push('</span></div>');
                        html.push('<div class="ticket-clear click-btn">&#10006</div>');
                        html.push('</div>');
                        html.push('<div class="ticket-numbers">');
                        Util.foreach(ticket.numbers, function(n){
                            html.push('<span class="number" n="', n, '">', n, '</span>');
                        });
                        html.push('</div>');
                        html.push('<div class="ticket-stake-row">');
                        html.push('<div class="ticket-stake">Stake: ');
                        html.push(Util.formatAmountCommas(ticket.stake, true), '</div>');
                        html.push('<div class="ticket-payout">');
                        if (ticket.status != "pending"){
                            html.push('Payout: ' + Util.formatAmountCommas(ticket.payout, true));
                        }
                        html.push('</div>');
                        html.push('</div>');
                        html.push('</div>');
                    }
                });
                if(mobile){
                    html.push('<div style="height: 90px;"></div>');
                }
            }
            dom.tickets.innerHTML = html.join('');
            showDraw ();
        },
        
        placeBets = function(){
            var numbers = $P.array_values(saleNumbers);
            if (!numbers.length){
                if(mobile){
                    alert(Util.t('Error: Must select numbers'));
                } else {
                    Util.showErrorMessage('Error: Must select numbers', 'Error');
                }
                return;
            }
            if (numbers.length > 12){
                if(mobile){
                    alert(Util.t('Error: Too many numbers'));
                } else {
                    Util.showErrorMessage('Error: Too many numbers', 'Error');
                }
                return;
            }
//            var basePrice = mobile ? ZAPNET_ONLINE_CONSTANTS.KENO_BASE_PRICE : ZAPNET.KENO_BASE_PRICE;
            var ticketData = {
                type: 'keno',
                sell: true,
                numbers: numbers,
                system: stake / baseStake,
                draws: draws,
                allin: allIn
            };
            
            var callback = {
                success: function(o){
                    var result = YAHOO.lang.JSON.parse(o.responseText);
                    if (result.error){
                        if(mobile){
                            var placebetError = result.error;
                            alert(Util.t('Error: ' + placebetError.replace('<br/><br/>', ' ')));
                        } else {
                            Util.showErrorMessage('Error: ' + result.error);
                        }
                        
                        return;
                    } else {
                        clear();
                        getTicketInfo();
                    }
                },
                failure: function(o){
                    if(mobile){
                        alert(Util.t('Problem: ' + o.responseText));
                    } else {
                        Util.showErrorMessage('Problem: ' + o.responseText);
                    }
                },
                cache: false,
                timeout: 30000
            };
            var data = YAHOO.lang.JSON.stringify(ticketData);
            YAHOO.util.Connect.asyncRequest('POST', '/bet/new.js', callback, data);
        },
        
        tick = function(){
            var now = new Date().getTime();
            var secsLeft = Math.max(0, Math.round((nextDrawCountdown - now) / 1000));
            var secs = secsLeft % 60;
            var mins = (secsLeft - secs) / 60;
            try {
                Util.foreach(dom.countdown, function(countdown){
                    if(mins || secs){
                        countdown.innerHTML = '&nbsp&#128336;&nbsp' + mins + ':' + (secs < 10 ? '0' + secs : secs);
    //                    countdown.innerHTML = '&nbsp&#128336;&nbsp' + (mins < 10 ? '0' + mins : mins) + ':' + (secs < 10 ? '0' + secs : secs);
                    } else {
                        countdown.innerHTML = '';
                    }
                });
            }catch (e){                
            }
        },
                
        processEvent = function(event){
//            console.log(event.t);
            if (event.t == 'draw'){
                getTicketInfo();
                clearDrawNumbers();
                if(!mobile){
//                    runDraw();
                }
            } else if (event.t == 'nodraw'){
                if(!mobile){
//                    stopDraw();
                }
                setOrderDrawNumbers(drawNumbers);
                getTicketInfo();
            } else if (event.t == 'next'){
                var data = eval('(' + event.d + ')');
                lastDrawId = data.last.id;
                Util.foreach(dom.lastDraw, function(lastDraw){
                    lastDraw.innerHTML = lastDrawId;
                });
                if(data.next) {
                    
                    Util.foreach(dom.nextDrawTime, function(nextDrawTime){
                        nextDrawTime.innerHTML = $P.date('H:i', data.next.ts);
                    });
                    nextDrawCountdown = data.next.ts * 1000;
                    nextDrawId = data.next.id;
                    Util.foreach(dom.nextDraw, function(nextDraw){
                        nextDraw.innerHTML = nextDrawId;
                    });
                }
            } else if (event.t == 'number'){
                var n = parseInt(event.v);
                if (Object.values(drawNumbers).indexOf(n) < 0) {
                    var c = Util.countProperties(drawNumbers);
                    drawNumbers[c] = n;
                    showDrawNumber(n);
                }
            } else if (event.t == 'extra'){

            } else if (event.t == 'pay_jackpot'){
            } else if (event.t == 'extra_number'){
            } else if (event.t == 'jackpot'){
                jackpotAmount = event.v;
                dom.jackpot.innerHTML = Util.formatAmountCommas(jackpotAmount, true);
            } else if (event.t == 'reload'){
            }            
        },
        
        getTicketInfo = function(){
            var callback = {
                success: function(o){
                    var result = YAHOO.lang.JSON.parse(o.responseText);
                    if (result.tickets){
                        showTickets(result.tickets);
                        tickets = result.tickets;
                    }
                },
                failure: function(o){
                    Util.error('Connection Problem: ' + o.responseText);
                },
                cache: false,
                timeout: 30000
            };
            YAHOO.util.Connect.asyncRequest('GET', 'keno/tickets.js', callback);
        },

        load =  function(){
            var callback = {
                success: function(o){
                    var result = YAHOO.lang.JSON.parse(o.responseText);
                    if (result && !result.error){
                        loadKeno(result);
                    }
                },
                failure: function(o){
                    Util.error('Connection Problem: ' + o.responseText);
                },
                cache: false,
                timeout: 30000
            };
            YAHOO.util.Connect.asyncRequest('GET', 'keno/info.js', callback);
        },
        
        loadKeno = function(result){
            initialized = true;
            lastEventId = result.event;
            jackpotAmount = result.jackpot;
            dom.jackpot.innerHTML = Util.formatAmountCommas(jackpotAmount, true);
            if (result.last && result.last.id){
                lastDrawId = result.last.id;
                Util.foreach(dom.lastDraw, function(lastDraw){
                    lastDraw.innerHTML = lastDrawId;
                });
                var countNum = Util.countProperties(result.last.numbers);
                if(countNum >= 20){
                    Util.foreach(result.last.numbers, function(n){
                        drawNumbers[n] = parseInt(n);
                    });
                } else {
                    var i = 0;
                    Util.foreach(result.last.numbers, function(n){
                        drawNumbers[i] = parseInt(n);
                        i++;
                    });
                }
            }
            if (result.next && result.next.id){
                nextDrawId = result.next.id;
                Util.foreach(dom.nextDraw, function(nextDraw){
                    nextDraw.innerHTML = nextDrawId;
                });
                Util.foreach(dom.nextDrawTime, function(nextDrawTime){
                    nextDrawTime.innerHTML = $P.date('H:i', result.next.ts);
                });
                nextTime = result.next.ts;
                nextSecs = result.next.secs; 
                nextDrawCountdown = new Date().getTime() + (nextSecs * 1000);
            }
            if (result.tickets){
                tickets = result.tickets;
                showTickets(result.tickets);
            }
            process();
            var nrNumbers = Util.countProperties(drawNumbers);
            if(!mobile){
                if (nrNumbers > 0 && nrNumbers < 20){
//                    runDraw();
                } else {
//                    stopDraw();
                }
            }
            setInterval(tick, 250);
            ZAPNET.Events.setLastEvent(lastEventId);
            ZAPNET.Events.subscribe(processEvent, 'keno');
        },
                
        runDraw = function(){
            stopDraw();
            var col1 = '#f7a404';
            var col2 = '#eaff00';
            drawBlink = new YAHOO.util.ColorAnim(dom.blink, {
                backgroundColor: {
                    to: col1
                }
            }, 0.5);
            drawBlink.onComplete.subscribe(function(){
                drawBlink.attributes.backgroundColor.to = drawBlink.attributes.backgroundColor.to == col1 ? col2 : col1;
                drawBlink.animate();
            });
            drawBlink.animate();
        },
                
        stopDraw = function(){
            Dom.setStyle(dom.blink, 'background-color', '');
            if (drawBlink){
                try{
                    drawBlink.onComplete.unsubscribeAll();
                    drawBlink.stop();
                }catch (e){}
                drawBlink = null;
            }
        },
        
        process = function(){
            var numbersHtml = [];
            var numbers = $P.array_values(saleNumbers);
            numbers.sort(function(a,b){
                return +a - +b;
            });
            Util.foreach(numbers, function(n){
                numbersHtml.push('<div class="number">', n, '</div>&nbsp;');
            });
            Dom.removeClass($('div.keno-market-num', dom.markets), 'selected');
            var countNum = Util.countProperties(saleNumbers);
            var el = $('div[m="' + countNum + '"].keno-market-num', dom.markets, true);
            Dom.addClass(el, 'selected');
            showSelections(saleNumbers);
            dom.totalStake.innerHTML = Util.formatAmountCommas(stake * draws, true);
            dom.draws.innerHTML = draws;
        },
            
        showMob = function(el, result){
            mobile = true;
            element = el;
            Event.on(element, 'click', pageClick);
            dom = {
                stake: Dom.get('keno-ticket-stake'),
                draws: Dom.get('keno-ticket-draws'),
//                gameBoard: $('div.game-board', element, true),
                gameBoard: Dom.get('keno-board'),
                jackpot: Dom.get('keno-jackpot'),
                markets: Dom.get('keno-markets'),
                tickets: Dom.get('keno-tickets-list'),
                totalStake: $('span.keno-total-stake', element, true),
                drawBar: $('div.keno-draw-numbers', element, true),
                blink: $('div.keno-draw-numbers', element, false),
                allIn : $('div.keno-ticket-draft div.keno-all-in', element, true),
                lastDraw: $('span.keno-last-draw', element, false),
                nextDraw: $('span.keno-next-draw', element, false),
                nextDrawTime: $('span.keno-next-time', element, false),
                countdown: $('span.keno-countdown', element, false),
                submitBlk: Dom.get('keno-submit-blk'),
//                selectNumbers: $('div.select-board', element, true),
                draftNumbers : $('div.keno-ticket-draft div.draft-numbers', element, true)
                
            };
//            KenoCommon = ZAPNET.KenoCommon(dom, element);
            baseStake = ZAPNET_ONLINE_CONSTANTS.KENO_BASE_PRICE;
            stake = baseStake;
            Event.on(dom.stake, 'keyup', function(){
                stake = dom.stake.value > ZAPNET_ONLINE_CONSTANTS.KENO_BASE_PRICE ? dom.stake.value : ZAPNET_ONLINE_CONSTANTS.KENO_BASE_PRICE;
                process();
            });
            Event.on(dom.draws, 'change', function(){
                draws = dom.draws.value > 0 ? dom.draws.value : 1;
                process();
            });
//            if (!initialized){
                loadKeno(result);
//            } else {
//                showDraw();
//            }
        },
                
        show = function(){
            var html = Dom.get('keno-html-wrapper').innerHTML;
            Event.purgeElement(element);
            element.innerHTML = html;
            Event.on(element, 'click', pageClick);
            dom = {
                stake: Dom.get('keno-ticket-stake'),
                draws: Dom.get('keno-ticket-draws'),
                markets: $('div.draw-markets', element, true),
                totalStake: $('span.keno-total-stake', element, true),
                gameBoard: $('div.draw-board', element, true),
                drawBar: $('div.keno-draw-numbers', element, true),
                blink: $('div.keno-draw-numbers', element, false),
                allIn : $('div.keno-all-in', element, true),
                lastDraw: $('span.keno-last-draw', element, false),
                nextDraw: $('span.keno-next-draw', element, false),
                nextDrawTime: $('span.keno-next-time', element, false),
                jackpot: Dom.get('keno-jackpot'),
                countdown: $('span.keno-countdown', element, false),
                tickets: $('div.tickets div.keno-ticket-list', element, true),
                draftNumbers : $('div.draft-numbers', element, true),
                draftDraws : $('div.draft-draws', element, true)
            };
            baseStake = ZAPNET.KENO_BASE_PRICE;
            stake = baseStake;
            Event.on(dom.stake, 'keyup', function(){
                stake = dom.stake.value > ZAPNET.KENO_BASE_PRICE ? dom.stake.value : ZAPNET.KENO_BASE_PRICE;
                process();
            });
            Event.on(dom.draws, 'change', function(){
                draws = dom.draws.value > 0 ? dom.draws.value : 1;
                process();
            });
            process();
            
            if (!initialized){
                load();
            } else {
                showDraw();
            }
        },

        init = function(el){
            element = el;
        };
            
        return {
            init: init,
            show: show,
            showMob: showMob,
            loadKeno: load
        };
    };
    
}());
