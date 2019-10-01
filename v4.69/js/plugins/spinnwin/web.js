(function(){

    var Dom = YAHOO.util.Dom,
        Event = YAHOO.util.Event,
        $ = YAHOO.util.Selector.query,
        Util = ZAPNET.util;
        
    (function() {
                
        var Rotate = function(el, attributes, duration,  method) {
            if (el) { // dont break existing subclasses not using YAHOO.extend
                Rotate.superclass.constructor.call(this, el, attributes, duration, method);
            }
        };
        
        Rotate.NAME = 'Rotate';

        // shorthand
        YAHOO.extend(Rotate, YAHOO.util.ColorAnim);

        var superclass = Rotate.superclass;
        var proto = Rotate.prototype;
        var lastAngle = 0;

        proto.doMethod = function(attr, start, end) {
            var val = null;
            if (attr == 'rotate') {
                val = [
                    this.method(this.currentFrame, start, end - start, this.totalFrames),
                ];

            } else {
                val = superclass.doMethod.call(this, attr, start, end);
            }
            return val;
        };

        proto.getAttribute = function(attr) {
            var val = null, valStr;
            var el = this.getEl();

            if (attr == 'rotate') {
                valStr = el.style.transform;
                val = parseInt(valStr.substring(7));
                if (!val){
                    val = 0;
                }
            } else {
                val = superclass.getAttribute.call(this, attr);
            }
            return val;
        };

        proto.setAttribute = function(attr, val, unit) {
            var el = this.getEl();

            if (attr == 'rotate') {
                el.style.transform = 'rotate(' + val[0] + 'deg)';
                el.style.MozTransform = 'rotate(' + val[0] + 'deg)';
                el.style.WebkitTransform = 'rotate(' + val[0] + 'deg)';
                lastAngle = val[0];
            } else {
                superclass.setAttribute.call(this, attr, val, unit);
            }
        };
        
        proto.getLastAngle = function(){
            return lastAngle;
        };

        ZAPNET.Rotate = Rotate;
    })();

    ZAPNET.Spinwin = ZAPNET.Spinwin || {};

    var SALE_BOARD_NUMBERS_LEFT = 56,
        SALE_BOARD_NUMBERS_TOP = 17,
        SALE_BOARD_NUMBERS_WIDTH = 528,
        SALE_BOARD_COL_WIDTH = 44,
        SALE_BOARD_COL_HEIGHT = 44,
        SALE_BOARD_DZN_HEIGHT = 44,
        SALE_BOARD_FRENCH_WIDTH = 39,
        SALE_BOARD_FRENCH_HEIGHT = 39,
        SALE_BOARD_FRENCH_TOP = 10,
        SALE_BOARD_FRENCH_SECOND_TOP = 205,
        SALE_BOARD_FRENCH_LEFT = 27,
        x = 1;
    
    ZAPNET.Spinwin.Web = function(){
        var dom = {},
            betsBusy = false,
            selectedChip = 0,
            bets = [],
            tickets = [],
            delTickets = [],
            draws = 1,
            totalStake = 0,
            lastEventId = 0,
            lastDrawId = 0,
            nextDrawId = 0,
            nextDrawTime,
            jackpotAmount = '',
            bettypeStakes = {},
            userTotalStakes = 0,
            userTotalWinnings = 0,
            betsFlashAnim = false,
            ZAPNET_SPINNWIN_CHIP_AMOUNTS = ZAPNET.SPINNWIN_CHIP_AMOUNTS,
            ticketsText = '',
            statsText = '',
            codeMap = {
                num: 'straight',
                crn: 'corner',
                split: 'split',
                trio: 'trio',
                four: 'four',
                six: 'six',
                dzn: 'dozen',
                col: 'column',
                hilo: 'high_or_low',
                oddeven: 'even_or_odd',
                color: 'color',
                nei: 'neighbors',
                french: 'french'
            },
                
        show = function(){
            if(checkIfClient()) {
                secondMonitor.partialUrl="spinandwin";
                secondMonitor.show();
            }
        },
        
        capitalize = function(str) {
            str = str.split('_').join(' ');
            return str.toLowerCase().split(' ').map(x=>x[0].toUpperCase()+x.slice(1)).join(' ');
        },

        checkIfClient = function(){
            var s = navigator.userAgent;
            if (s.indexOf("BetomallCashier")!= -1){
                return true;
            } else {
                return false;
            }
        },        
        getNeighborsNums = function(num) {
            var frenchNums = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26,0,32,15,19];
            var pos = frenchNums.indexOf(num);
            if(pos <= 1){
                pos = pos + 37;
            }
            return [frenchNums[pos - 2],frenchNums[pos - 1],num,frenchNums[pos +1],frenchNums[pos +2]].join(',');
        },
        
        setupBets = function(){
            var i, n, el, x, y, col, row, width, height, type, sel, sels, hl, text;
            for(i = 0; i <= 36; i += 1){
                el = Util.div('selection number number-' + i);
                Dom.setAttribute(el, 't', 'num');
                Dom.setAttribute(el, 'n', i);
                x = 0; y = SALE_BOARD_NUMBERS_TOP; width = 0; height = 0;
                if (i === 0){
                    width = SALE_BOARD_NUMBERS_LEFT - 15;
                    x = 15;
                    height = SALE_BOARD_COL_HEIGHT * 3;
                } else {
                    col = (i - 1) % 3;
                    row = ((i - 1) - col) / 3;
                    width = SALE_BOARD_NUMBERS_WIDTH / 12;
                    height = SALE_BOARD_COL_HEIGHT;
                    y = ((2 - col) * SALE_BOARD_COL_HEIGHT) + SALE_BOARD_NUMBERS_TOP;
                    x = SALE_BOARD_NUMBERS_LEFT + (row * width);  
                }
                Dom.setStyle(el, 'width', width + 'px');
                Dom.setStyle(el, 'height', height + 'px');
                Dom.setStyle(el, 'left', x + 'px');
                Dom.setStyle(el, 'top', y + 'px');
                Dom.setStyle(el, 'font', '14px/'+height+'px Verdana');
                el.innerHTML = i;
                dom.selections['num-' + i] = el;
                dom.betLayer.appendChild(el);
                dom.maskLayer.appendChild(el.cloneNode(true));
                if (i === 0){
                    
                } else {
                    if (i < 34){
                        sels = [i,i+3].join(',');
                        el = Util.div('selection split split-' + sels);
                        Dom.setAttribute(el, 't', 'split');
                        Dom.setAttribute(el, 'n', sels);
                        Dom.setStyle(el, 'width', '20px');
                        Dom.setStyle(el, 'height', '20px');
                        Dom.setStyle(el, 'left', (x + width - 10) + 'px');
                        Dom.setStyle(el, 'top', (y + (width/2) - 10) + 'px');
                        dom.selections['split-' + sels] = el;
                        dom.betLayer.appendChild(el);                        
                    }
                    if (col <= 1){
                        sels = [i,i+1,i+3,i+4].join(',');
                        el = Util.div('selection corner corner-' + sels);
                        Dom.setAttribute(el, 't', 'crn');
                        Dom.setAttribute(el, 'n', sels);
                        Dom.setStyle(el, 'width', '20px');
                        Dom.setStyle(el, 'height', '20px');
                        Dom.setStyle(el, 'left', (x + width - 10) + 'px');
                        Dom.setStyle(el, 'top', (y - 10) + 'px');
                        dom.selections['crn-' + sels] = el;
                        dom.betLayer.appendChild(el);
                        
                        sels = [i,i+1].join(',');
                        el = Util.div('selection split split-' + sels);
                        Dom.setAttribute(el, 't', 'split');
                        Dom.setAttribute(el, 'n', sels);
                        Dom.setStyle(el, 'width', '20px');
                        Dom.setStyle(el, 'height', '20px');
                        Dom.setStyle(el, 'left', (x + (width/2) - 10) + 'px');
                        Dom.setStyle(el, 'top', (y - 10) + 'px');
                        dom.selections['split-' + sels] = el;
                        dom.betLayer.appendChild(el);                        
                    }
                    if (col === 0){
                        sels = [i,i+1,i+2].join(',');
                        el = Util.div('selection trio trio-' + sels);
                        Dom.setAttribute(el, 't', 'trio');
                        Dom.setAttribute(el, 'n', sels);
                        Dom.setStyle(el, 'width', '20px');
                        Dom.setStyle(el, 'height', '20px');
                        Dom.setStyle(el, 'left', (x + (width/2) - 10) + 'px');
                        Dom.setStyle(el, 'top', (y  + width - 10) + 'px');
                        dom.selections['trio-' + sels] = el;
                        dom.betLayer.appendChild(el);
                        
                        if (i <= 31){
                            sels = [i,i+1,i+2,i+3,i+4,i+5].join(',');
                            el = Util.div('selection six six-' + sels);
                            Dom.setAttribute(el, 't', 'six');
                            Dom.setAttribute(el, 'n', sels);
                            Dom.setStyle(el, 'width', '20px');
                            Dom.setStyle(el, 'height', '20px');
                            Dom.setStyle(el, 'left', (x + width - 10) + 'px');
                            Dom.setStyle(el, 'top', (y  + width - 10) + 'px');
                            dom.selections['six-' + sels] = el;
                            dom.betLayer.appendChild(el);                            
                        }
                    }
                }
            }
            for(i = 1; i <= 3; i += 1){
                el = Util.div('selection col col-' + i);
                Dom.setAttribute(el, 't', 'col');
                Dom.setAttribute(el, 'n', i);
                if (i == 1){
                    Dom.setAttribute(el, 'ns', '1,4,7,10,13,16,19,22,25,28,31,34');
                } else if (i == 2){
                    Dom.setAttribute(el, 'ns', '2,5,8,11,14,17,20,23,26,29,32,35');
                } else {
                    Dom.setAttribute(el, 'ns', '3,6,9,12,15,18,21,24,27,30,33,36');
                }
                x = SALE_BOARD_NUMBERS_LEFT + SALE_BOARD_NUMBERS_WIDTH; 
                y = (3 - i) * SALE_BOARD_COL_HEIGHT + SALE_BOARD_NUMBERS_TOP; 
                width = SALE_BOARD_COL_WIDTH; height = SALE_BOARD_COL_HEIGHT;
                Dom.setStyle(el, 'width', width + 'px');
                Dom.setStyle(el, 'height', height + 'px');
                Dom.setStyle(el, 'left', x + 'px');
                Dom.setStyle(el, 'top', y + 'px');
                dom.selections['col-' + i] = el;
                dom.betLayer.appendChild(el);
            }
            for(i = 1; i <= 3; i += 1){
                el = Util.div('selection dzn dzn-' + i);
                Dom.setAttribute(el, 't', 'dzn');
                Dom.setAttribute(el, 'n', i);
                if (i == 1){
                    Dom.setAttribute(el, 'ns', '1,2,3,4,5,6,7,8,9,10,11,12');
                    el.innerHTML = '1-12';
                } else if (i == 2){
                    Dom.setAttribute(el, 'ns', '13,14,15,16,17,18,19,20,21,22,23,24');
                    el.innerHTML = '13-24';
                } else if (i == 3){
                    Dom.setAttribute(el, 'ns', '25,26,27,28,29,30,31,32,33,34,35,36');
                    el.innerHTML = '25-36';
                }
                width = SALE_BOARD_NUMBERS_WIDTH / 3;
                x = SALE_BOARD_NUMBERS_LEFT + (width * (i - 1));
                y = 3 * SALE_BOARD_COL_HEIGHT + SALE_BOARD_NUMBERS_TOP; 
                height = SALE_BOARD_DZN_HEIGHT;
                Dom.setStyle(el, 'width', width + 'px');
                Dom.setStyle(el, 'height', height + 'px');
                Dom.setStyle(el, 'left', x + 'px');
                Dom.setStyle(el, 'top', y + 'px');
                Dom.setStyle(el, 'font', '12px/'+height+'px Verdana');
                dom.selections['dzn-' + i] = el;
                dom.betLayer.appendChild(el);
            }
            for(i = 0; i < 6; i += 1){
                if (i === 0){
                    type = 'hilo';
                    sel = 'low';
                    hl = '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18';
                    text= '1-18';
                } else if (i == 1){
                    type = 'oddeven';
                    sel = 'even';                    
                    hl = '2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36';
                    text = 'EVEN';
                } else if (i == 2){
                    type = 'color';
                    sel = 'red';                    
                    hl = '1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36';
                    text = 'RED';
                } else if (i == 3){
                    type = 'color';
                    sel = 'black';
                    hl = '2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35';
                    text = 'BLACK';
                } else if (i == 4){
                    type = 'oddeven';
                    sel = 'odd';                    
                    hl = '1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35';
                    text = 'ODD';
                } else if (i == 5){
                    type = 'hilo';
                    sel = 'high';                    
                    hl = '19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36';
                    text = '19-36';
                }
                el = Util.div('selection ' + type + ' ' + type + '-' + sel);
                el.innerHTML = text;
                Dom.setAttribute(el, 't', type);
                Dom.setAttribute(el, 'n', sel);
                Dom.setAttribute(el, 'ns', hl);
                width = SALE_BOARD_NUMBERS_WIDTH / 6;
                x = SALE_BOARD_NUMBERS_LEFT + (width * i);
                y = 3 * SALE_BOARD_COL_HEIGHT + SALE_BOARD_DZN_HEIGHT + SALE_BOARD_NUMBERS_TOP; 
                height = SALE_BOARD_DZN_HEIGHT;
                Dom.setStyle(el, 'width', width + 'px');
                Dom.setStyle(el, 'height', height + 'px');
                Dom.setStyle(el, 'left', x + 'px');
                Dom.setStyle(el, 'top', y + 'px');
                Dom.setStyle(el, 'font', '12px/'+height+'px Verdana');
                dom.selections[type + '-' + sel] = el;                
                dom.betLayer.appendChild(el);
            }
            
            
            var frenchTop = [32,15,19,4,21,2,25,17,34,6,27,13,36,11,30];
            var frenchBot = [35,12,28,7,29,18,22,9,31,14,20,1,33,16,24];
            for(i = 0; i < 15; i += 1){                
                n = frenchTop[i];
                el = Util.div('selection french-selection nei nei-' + n);
                Dom.setAttribute(el, 't', 'nei');
                Dom.setAttribute(el, 'n', getNeighborsNums(n));
                width = SALE_BOARD_FRENCH_WIDTH;
                height = SALE_BOARD_FRENCH_HEIGHT;
                x = SALE_BOARD_FRENCH_LEFT + (width * i);
                y = SALE_BOARD_FRENCH_TOP; 
                Dom.setStyle(el, 'width', width + 'px');
                Dom.setStyle(el, 'height', height + 'px');
                Dom.setStyle(el, 'left', x + 'px');
                Dom.setStyle(el, 'top', y + 'px');
                dom.selections['nei-' + getNeighborsNums(n)] = el;
                el.innerHTML = n;
                Dom.setStyle(el, 'font', '12px/'+height+'px Verdana');
                dom.frenchBetLayer.appendChild(el);
                dom.frenchMaskLayer.appendChild(el.cloneNode(true)); 
                n = frenchBot[i];
                el = Util.div('selection french-selection nei nei-' + n);
                Dom.setAttribute(el, 't', 'nei');
                Dom.setAttribute(el, 'n', getNeighborsNums(n));
                width = SALE_BOARD_FRENCH_WIDTH;
                height = SALE_BOARD_FRENCH_HEIGHT;
                x = SALE_BOARD_FRENCH_LEFT + (width * i);
                y = SALE_BOARD_FRENCH_SECOND_TOP; 
                Dom.setStyle(el, 'width', width + 'px');
                Dom.setStyle(el, 'height', height + 'px');
                Dom.setStyle(el, 'left', x + 'px');
                Dom.setStyle(el, 'top', y + 'px');
                dom.selections['nei-' + getNeighborsNums(n)] = el;
                el.innerHTML = n;
                Dom.setStyle(el, 'font', '12px/'+height+'px Verdana');
                dom.frenchBetLayer.appendChild(el);
                dom.frenchMaskLayer.appendChild(el.cloneNode(true));               
            }
            x = SALE_BOARD_FRENCH_LEFT;
            y = SALE_BOARD_FRENCH_TOP + SALE_BOARD_FRENCH_HEIGHT;
            n = 0;
            el = Util.div('selection french-selection nei nei-' + n);
            Dom.setAttribute(el, 't', 'nei');
            Dom.setAttribute(el, 'n', getNeighborsNums(0));
            Dom.setStyle(el, 'width', width + 'px');
            Dom.setStyle(el, 'height', height*2 + 'px');
            Dom.setStyle(el, 'left', x + 'px');
            Dom.setStyle(el, 'top', y + 'px');
            dom.selections['nei-' + getNeighborsNums(n)] = el;
            el.innerHTML = n;
            Dom.setStyle(el, 'font', '12px/'+height*2+'px Verdana');
            dom.frenchBetLayer.appendChild(el);
            dom.frenchMaskLayer.appendChild(el.cloneNode(true)); 
            y = SALE_BOARD_FRENCH_TOP + (height*3);
            n = 26;
            el = Util.div('selection french-selection nei nei-' + n);
            Dom.setAttribute(el, 't', 'nei');
            Dom.setAttribute(el, 'n', getNeighborsNums(n));
            Dom.setStyle(el, 'width', width + 'px');
            Dom.setStyle(el, 'height', height + 'px');
            Dom.setStyle(el, 'left', x + 'px');
            Dom.setStyle(el, 'top', y + 'px');
            dom.selections['nei-' + getNeighborsNums(n)] = el;
            el.innerHTML = n;
            Dom.setStyle(el, 'font', '12px/'+height+'px Verdana');
            dom.frenchBetLayer.appendChild(el);
            dom.frenchMaskLayer.appendChild(el.cloneNode(true)); 
            n = 3;              
            el = Util.div('selection french-selection nei nei-' + n);
            y = SALE_BOARD_FRENCH_TOP + (height*4);
            Dom.setAttribute(el, 't', 'nei');
            Dom.setAttribute(el, 'n', getNeighborsNums(n));
            Dom.setStyle(el, 'width', width + 'px');
            Dom.setStyle(el, 'height', height + 'px');
            Dom.setStyle(el, 'left', x + 'px');
            Dom.setStyle(el, 'top', y + 'px');
            dom.selections['nei-' + getNeighborsNums(n)] = el;
            el.innerHTML = n;
            Dom.setStyle(el, 'font', '12px/'+height+'px Verdana');
            dom.frenchBetLayer.appendChild(el);
            dom.frenchMaskLayer.appendChild(el.cloneNode(true)); 
            x = SALE_BOARD_FRENCH_LEFT + (SALE_BOARD_FRENCH_WIDTH * 14);
            n = 8;
            y = SALE_BOARD_FRENCH_TOP + (height);           
            el = Util.div('selection french-selection nei nei-' + n);
            Dom.setAttribute(el, 't', 'nei');
            Dom.setAttribute(el, 'n', getNeighborsNums(n));
            Dom.setStyle(el, 'width', width + 'px');
            Dom.setStyle(el, 'height', height + 'px');
            Dom.setStyle(el, 'left', x + 'px');
            Dom.setStyle(el, 'top', y + 'px');
            dom.selections['nei-' + getNeighborsNums(n)] = el;
            el.innerHTML = n;
            Dom.setStyle(el, 'font', '12px/'+height+'px Verdana');
            dom.frenchBetLayer.appendChild(el); 
            dom.frenchMaskLayer.appendChild(el.cloneNode(true)); 
            n = 23; 
            y = SALE_BOARD_FRENCH_TOP + (height*2);            
            el = Util.div('selection french-selection nei nei-' + n);
            Dom.setAttribute(el, 't', 'nei');
            Dom.setAttribute(el, 'n', getNeighborsNums(23));
            Dom.setStyle(el, 'width', width + 'px');
            Dom.setStyle(el, 'height', height + 'px');
            Dom.setStyle(el, 'left', x + 'px');
            Dom.setStyle(el, 'top', y + 'px');
            dom.selections['nei-' + getNeighborsNums(23)] = el;
            el.innerHTML = n;
            Dom.setStyle(el, 'font', '12px/'+height+'px Verdana');
            dom.frenchBetLayer.appendChild(el); 
            dom.frenchMaskLayer.appendChild(el.cloneNode(true)); 
            n = 10; 
            y = SALE_BOARD_FRENCH_TOP + (height*3);                 
            el = Util.div('selection french-selection nei nei-' + n);
            Dom.setAttribute(el, 't', 'nei');
            Dom.setAttribute(el, 'n', getNeighborsNums(n));
            Dom.setStyle(el, 'width', width + 'px');
            Dom.setStyle(el, 'height', height + 'px');
            Dom.setStyle(el, 'left', x + 'px');
            Dom.setStyle(el, 'top', y + 'px');
            dom.selections['nei-' + getNeighborsNums(n)] = el;
            el.innerHTML = n;
            Dom.setStyle(el, 'font', '12px/'+height+'px Verdana');
            dom.frenchBetLayer.appendChild(el);
            dom.frenchMaskLayer.appendChild(el.cloneNode(true));     
            n = 5; 
            y = SALE_BOARD_FRENCH_TOP + (height*4);             
            el = Util.div('selection french-selection nei nei-' + n);
            Dom.setAttribute(el, 't', 'nei');
            Dom.setAttribute(el, 'n', getNeighborsNums(n));
            Dom.setStyle(el, 'width', width + 'px');
            Dom.setStyle(el, 'height', height + 'px');
            Dom.setStyle(el, 'left', x + 'px');
            Dom.setStyle(el, 'top', y + 'px');
            dom.selections['nei-' + getNeighborsNums(n)] = el;
            el.innerHTML = n;
            Dom.setStyle(el, 'font', '12px/'+height+'px Verdana');
            dom.frenchBetLayer.appendChild(el);   
            dom.frenchMaskLayer.appendChild(el.cloneNode(true));              
            
            x = SALE_BOARD_FRENCH_LEFT + SALE_BOARD_FRENCH_WIDTH;
            y = SALE_BOARD_FRENCH_TOP + SALE_BOARD_FRENCH_HEIGHT;   
            height = 156;
            el = Util.div('selection french-selection');
            Dom.setAttribute(el, 't', 'french');
            Dom.setAttribute(el, 'n', 'voisins_zero');
            Dom.setAttribute(el, 'ns', '25,2,21,4,19,15,32,0,26,3,35,12,28,7,29,18,22');
            Dom.setStyle(el, 'width', 235 + 'px');
            Dom.setStyle(el, 'height', height + 'px');
            Dom.setStyle(el, 'left', x + 'px');
            Dom.setStyle(el, 'top', y + 'px');
            dom.selections['french-voisins_zero'] = el;
            el.innerHTML = 'Voisins du Zero';
            Dom.setStyle(el, 'font', '12px/'+height+'px Verdana');
            dom.frenchBetLayer.appendChild(el);
            x = SALE_BOARD_FRENCH_LEFT + SALE_BOARD_FRENCH_WIDTH + 235;
            el = Util.div('selection french-selection');
            Dom.setAttribute(el, 't', 'french');
            Dom.setAttribute(el, 'n', 'orphelins');
            Dom.setAttribute(el, 'ns', '17,34,6,1,20,14,31,9');
            Dom.setStyle(el, 'width', 152 + 'px');
            Dom.setStyle(el, 'height', height + 'px');
            Dom.setStyle(el, 'left', x + 'px');
            Dom.setStyle(el, 'top', y + 'px');
            dom.selections['french-orphelins'] = el;
            el.innerHTML = 'Orphelins';
            Dom.setStyle(el, 'font', '12px/'+height+'px Verdana');
            dom.frenchBetLayer.appendChild(el);
            x = SALE_BOARD_FRENCH_LEFT + SALE_BOARD_FRENCH_WIDTH + 235 + 152;
            el = Util.div('selection french-selection');
            Dom.setAttribute(el, 't', 'french');
            Dom.setAttribute(el, 'n', 'tiers');
            Dom.setAttribute(el, 'ns', '27,13,36,11,30,8,23,10,5,24,16,33');
            Dom.setStyle(el, 'width', 120 + 'px');
            Dom.setStyle(el, 'height', height + 'px');
            Dom.setStyle(el, 'left', x + 'px');
            Dom.setStyle(el, 'top', y + 'px');
            dom.selections['french-tiers'] = el;
            el.innerHTML = 'Tier';
            Dom.setStyle(el, 'font', '12px/'+height+'px Verdana');
            dom.frenchBetLayer.appendChild(el);               
        },
                
        setupChips = function(){
            if (!ZAPNET_SPINNWIN_CHIP_AMOUNTS){
                ZAPNET_SPINNWIN_CHIP_AMOUNTS = [1,2,5,10,20];
            }
            
            var i, chip, amount, amountEnd;
            dom.chips = [];
            for(i = 1; i <= 5; i += 1){
                chip = $('div.chip-' + i, dom.options, true);
                amount = Util.formatAmountCommas(ZAPNET_SPINNWIN_CHIP_AMOUNTS[i - 1]);
                amountEnd = amount.substr(-3, 3);
                if (amountEnd === '.00'){
                    amount = amount.substr(0, amount.length - 3);
                    if(amount.substr(-4, 4) === ',000'){
                        amount = amount.substr(0, amount.length - 4) + 'K';
                    }
                }
                chip.innerHTML = amount;
                Dom.addClass(chip, 'chip-chrs-' + amount.length);
                dom.chips.push(chip);
            }
        },
                
        calculateBets = function(){
            var i, bet, type;
//            var codeMap = {
//                num: 'straight',
//                crn: 'corner',
//                split: 'split',
//                trio: 'trio',
//                four: 'four',
//                six: 'six',
//                dzn: 'dozen',
//                col: 'column',
//                hilo: 'high_or_low',
//                oddeven: 'even_or_odd',
//                color: 'color',
//                nei: 'neighbors',
//                french: 'french'
//            };
            bettypeStakes = {};
            totalStake = 0;
            for(i = 0; i < bets.length; i += 1){
                bet = bets[i];
                totalStake += bet.stake;
                type = bet.type + '-' + bet.sels;
                if (!bettypeStakes[type]){
                    bettypeStakes[type] = {
                        code: codeMap[bet.type],
                        outcome: bet.sels,
                        stake: 0
                    };
                }
                bettypeStakes[type].stake += bet.stake;
            }
        },
                
        showStakes = function(){
            dom.stake.innerHTML = Util.formatAmountCommas(totalStake * draws, true);
            if (bets.length){
                Dom.removeClass(dom.undo, 'undo-off');
                Dom.addClass(dom.placeBet, 'place-on');
            } else {
                Dom.addClass(dom.undo, 'undo-off');
                Dom.removeClass(dom.placeBet, 'place-on');
            }
            var html = [];
            var frenchHtml = [];
            var betHtml;
            var offsets = {};
            Util.foreach(bets, function(bet){
                var type = bet.type + '-' + bet.sels;
                var el = dom.selections[type];
                var x = parseInt(Dom.getStyle(el, 'left'));
                var y = parseInt(Dom.getStyle(el, 'top'));
                var w = parseInt(Dom.getStyle(el, 'width'));
                var h = parseInt(Dom.getStyle(el, 'height'));                
                var bx = x + (w/2);
                var by = y + (h/2);
                if (!offsets[type]){
                    offsets[type] = 0;
                }
                betHtml = bet.type == 'nei' || bet.type == 'french' ? frenchHtml : html;
                betHtml.push('<div class="chip chip-', (bet.stakeChip + 1));                
                betHtml.push('" style="top: ', (by-8) - offsets[type], 'px; left:', (bx-8), 'px;');
                betHtml.push('">'+ bet.stake +'</div>');
                offsets[type] += 4;
            });
            showNewTicket();
            dom.chipsLayer.innerHTML = html.join('');
            dom.frenchChipLayer.innerHTML = frenchHtml.join('');
        },
                
        clearBets = function(){
            bets = [];
            calculateBets();
            showStakes();          
        },
                
        clearDraftBet = function(code, outcome){
            var i;
            for (i = bets.length - 1; i >= 0; i -= 1) {
                var bet = bets[i];
                if(codeMap[bet.type] == code && bet.sels == outcome){
                    bets.splice(i,1);
                }
            }
            calculateBets();
            showStakes(); 
        },
                
        showBetsInformation = function(){
            var stake = Dom.get('bets-total-stake');
            var winnings = Dom.get('bets-winnings');
            if (stake && winnings){
                stake.innerHTML = Util.formatAmountCommas(userTotalStakes, true);
                winnings.innerHTML = Util.formatAmountCommas(userTotalWinnings, true);
            }
        },
             
        flashBetsInfo = function(col1, col2, seconds){
            if (betsFlashAnim){
                betsFlashAnim.stop();
            }
            var startTime = new Date().getTime();
            betsFlashAnim = new YAHOO.util.ColorAnim(dom.betsInfoPanel, {
                backgroundColor: {
                    to: col1
                }
            }, 0.25);
            betsFlashAnim.onComplete.subscribe(function(){
                var now = new Date().getTime();
                if (now - startTime < seconds * 1000){
                    betsFlashAnim.attributes.backgroundColor.to = betsFlashAnim.attributes.backgroundColor.to == col1 ? col2 : col1;
                    betsFlashAnim.animate();
                } else {
                    betsFlashAnim.stop();
                    Dom.setStyle(dom.betsInfoPanel, 'background-color', '');
                    betsFlashAnim = false;
                }
            });
            betsFlashAnim.animate();
        },
             
        clearMarks = function(){
            dom.markLayer.innerHTML = '';
            dom.frenchMarkLayer.innerHTML = '';
        },
        
        markBets = function(bets){
            var html = [];
            var frenchHtml = [];
            var betHtml;
            var offsets = {};
            Util.foreach(bets, function(bet){
                var type = bet.type + '-' + bet.sels;
                var el = dom.selections[type];
                var x = parseInt(Dom.getStyle(el, 'left'));
                var y = parseInt(Dom.getStyle(el, 'top'));
                var w = parseInt(Dom.getStyle(el, 'width'));
                var h = parseInt(Dom.getStyle(el, 'height'));                
                if (offsets[type]){
                    return;
                }
                betHtml = bet.type == 'nei' || bet.type == 'french' ? frenchHtml : html;
                betHtml.push('<div class="betmark betmark-', (bet.stakeChip + 1));                
                betHtml.push('" style="top: ', y, 'px; left:', x, 'px; width: ', w, 'px; height: ', h, 'px;');
                betHtml.push('"></div>');
                offsets[type] = true;
            });
            dom.markLayer.innerHTML += html.join('');
            dom.frenchMarkLayer.innerHTML += frenchHtml.join('');            
        },
              
        placeBets = function(){
            if (!bets.length || betsBusy){
                return;
            }
            betsBusy = true;
            calculateBets();
            var betList = $P.array_values(bettypeStakes);
            var ticketData = {
                type: 'spinnwin',
                draws: draws,
                bets: betList
            };
            var callback = {
                success: function(o){
                    betsBusy = false;
                    var result = YAHOO.lang.JSON.parse(o.responseText);
                    if (result.error){
                        if (ZAPNET.Bet){
                            ZAPNET.Bet.showMessage({
                                    message: result.error,
                                    title: 'Error',
                                    type: 'error'
                                });
                        } else {
                            Util.showErrorMessage(result.error, 'Error');
                        }
                        return;
                    } else {
                        if (ZAPNET.Bet){
                            ZAPNET.Bet.betPlaced(result);
                        } else {
                            if (result.amount && +result.amount){
                                userTotalStakes += +result.amount;
                            }
                            showBetsInformation();
                            flashBetsInfo('#095e2d', '#000000', 2);
                            markBets(bets);
                        }
                        clearBets();
                        getTicketInfo();
                    }
                },
                failure: function(o){
                    betsBusy = false;
                    Util.showErrorMessage('Problem: ' + o.responseText);
                },
                cache: false,
                timeout: 30000
            };

            var data = YAHOO.lang.JSON.stringify(ticketData);
            YAHOO.util.Connect.asyncRequest('POST', '/bet/new.js', callback, data);
        },
        
        getInfo = function(){
            var callback = {
                success: function(o){
                    var result = YAHOO.lang.JSON.parse(o.responseText);
                    if (result && Util.countProperties(result)){
                        lastEventId = result.event;
//                        jackpotAmount = result.jackpot;
                        lastDrawId = result.last.id;
                        nextDrawId = result.next.id;
                        dom.lastDraw.innerHTML = lastDrawId;
                        dom.nextDraw.innerHTML = nextDrawId;
                        if(result.hasOwnProperty('next')){
//                            showNextDrawInfo(result.next);
                            nextDrawTime = result.next.ts;
                            dom.nextTime.innerHTML = $P.date('H:i', nextDrawTime);
                        }
                        if(result.hasOwnProperty('stats')){
                            if(statsText !== JSON.stringify(result.stats)){
                                statsText = JSON.stringify(result.stats);
                                showStatistics(result.stats);
                            }
                        }
                        if(result.hasOwnProperty('tickets')){
                            if(ticketsText !== JSON.stringify(result.tickets)){
                                ticketsText = JSON.stringify(result.tickets);
                                tickets = result.tickets;
                                showTickets(result.tickets);
                            }
                        }
                    }
                },
                failure: function(o){
                    Util.error('Connection Problem: ' + o.responseText);
                },
                cache: false,
                timeout: 30000
            };
            YAHOO.util.Connect.asyncRequest('GET', 'spinandwin/info.js', callback);
        },
            
        showStatistics = function(results){
            var html = [];
            var last10 = results.hasOwnProperty(0) ? results[0] : false;
            var hot = results.hasOwnProperty(3) ? results[3] : false;
            var cold = results.hasOwnProperty(4) ? results[4] : false;
            html.push('<div class="last-numbers-col">');
            var i;
            var sortableLasts = [];
            Util.foreach(last10, function(lastNum){
                sortableLasts.push(lastNum);
            });
            for (i = sortableLasts.length - 1; i >= 0; i -= 1) {
                var lastNum = sortableLasts[i];
                html.push('<div class="history-cell number-color-', lastNum[1], '">'+lastNum[0]+'</div>');
            }
            html.push('</div>');
            html.push('<div class="hotcold-numbers-col">');
            Util.foreach(hot, function(hotNum){
                html.push('<div class="history-cell"><span class="number-color-', hotNum['color'], '">'+hotNum['number']+'</span><span class="freq-num"> ('+hotNum['freq']+')</span></div>');
            });
            html.push('</div>');
            html.push('<div class="hotcold-numbers-col">');
            Util.foreach(cold, function(coldNum){
                html.push('<div class="history-cell"><span class="number-color-', coldNum['color'], '">'+coldNum['number']+'</span><span class="freq-num"> ('+coldNum['freq']+')</span></div>');
            });
            html.push('</div>');
            dom.statistics.innerHTML = html.join('');
        },
        
        getTicketInfo = function(){
            var callback = {
                success: function(o){
                    var result = YAHOO.lang.JSON.parse(o.responseText);
                    if (result){
                        if(ticketsText !== JSON.stringify(result.tickets)){
                            ticketsText = JSON.stringify(result.tickets);
                            tickets = result.tickets;
                            showTickets(result.tickets);
                        }
                    }
                },
                failure: function(o){
                    Util.error('Connection Problem: ' + o.responseText);
                },
                cache: false,
                timeout: 30000
            };
            YAHOO.util.Connect.asyncRequest('GET', 'spinandwin/tickets.js', callback);
        },
           
        showTickets = function(tickets){
            var html = [];
            if (tickets && tickets.length){
                Util.foreach(tickets, function(ticket){
                    if (delTickets.indexOf(ticket.id) < 0){
                        html.push('<div class="ticket-row ', ticket.status, '" tid="', ticket.id, '">');
                        if(ticket.status !== "pending" && ticket.number){
                            html.push('<span style="float: left; padding-left: 5px;">Winner <span class="number-color-'+ticket.number_color+'" style="font: bold 15px/20px sans-serif;">'+ticket.number+'</span></span>');
                        } else {
                            html.push('<span style="float: left; padding-left: 5px;">'+Util.countProperties(ticket.selections)+' Selections</span>');
                        }
//                        html.push('<span style="float: left; padding-left: 5px;">'+Util.countProperties(ticket.selections)+' Selections</span>');
                        html.push('<span style="" class="ticket-clear">&#10006</span>');
                        html.push('</div>');
                        Util.foreach(ticket.selections, function(sel){
                            html.push('<div class="betslip-row ', sel.status, '">');
                            var totSelNums = sel.outcome.split(',');
                            html.push('<div style="float: left; text-align: left; padding-left: 5px; width: 25%";>', capitalize(sel.bet), '</div>');
                            html.push('<div style="float: left; width: 50%; '+(totSelNums.length > 12 ? 'font: 10px/18px Verdana;' : '')+'">', capitalize(sel.outcome), '</div>');
                            html.push('<div style="float: right; text-align: right; padding-right: 5px; width: 25%">', Util.formatAmountCommas(sel.stake), '</div>');
                            html.push('</div>');
                        });
                        html.push('<div class="betslip-total-row">');
                        html.push('<span class="ticket-draws"># ', ticket.sdraw);
                        if (ticket.fdraw > ticket.sdraw){
//                            // if(settled)
                            var ndraw = lastDrawId - ticket.sdraw + 1;
                            if(ticket.status == "pending" && ticket.fdraw-ticket.sdraw + 1 >= ndraw && ticket.sdraw <= lastDrawId){
                                html.push(' - ' + ticket.fdraw, ' (', ndraw, '/', (ticket.fdraw-ticket.sdraw + 1), ')');
                            } else {
                                html.push(' - ' + ticket.fdraw, ' (', (ticket.fdraw-ticket.sdraw + 1), ')');
                            }
                        }
                        html.push('</span>');
                        if(ticket.status == "pending"){
                            html.push('<span style="float: right; padding-right: 5px;">Total Stake: ', Util.formatAmountCommas(ticket.total_stake, true), '</span>');
                        } else {
                            html.push('<span style="float: right; padding-right: 5px;">Payout: ', Util.formatAmountCommas(ticket.total_payout, true), '</span>');
                        }
                        html.push('</div>');
                    }
                });
            }
            dom.ticketsList.innerHTML = html.join('');
        },
          
        showNewTicket = function(){
            var html = [];
            var betList = $P.array_values(bettypeStakes);
            if (betList && betList.length){
                Util.foreach(betList, function(bet){
                    html.push('<div class="bet-row">');
                    html.push('<div style="float: left; text-align: center; width: 5%; cursor: pointer;" class="bet-clear" c="'+bet.code+'" out="'+bet.outcome+'">&#10006</div>');
                    html.push('<div style="float: left; text-align: left; width: 25%;">', capitalize(bet.code), '</div>');
                    html.push('<div style="float: left; width: 40%;">', capitalize(bet.outcome), '</div>');
                    html.push('<div style="float: right; text-align: right; padding-right: 12px; width: 30%;">', Util.formatAmountCommas(bet.stake), '</div>');
                    html.push('</div>');
                });
            }
            dom.betslipList.innerHTML = html.join('');
        },
        
        handleClick = function(e){
            var el = Event.getTarget(e);
            if (Dom.hasClass(el, 'selection')){
                bets.push({
                    type: Dom.getAttribute(el, 't'),
                    sels: Dom.getAttribute(el, 'n'),
                    stakeChip: selectedChip,
                    stake: ZAPNET_SPINNWIN_CHIP_AMOUNTS[selectedChip]
                });
                calculateBets();
                showStakes();
                showNewTicket();
            } else if (Dom.hasClass(el, 'undo')){
                bets.pop();
                calculateBets();
                showStakes();                
            } else if (Dom.hasClass(el, 'clear')){
                clearBets();
            } else if (Dom.hasClass(el, 'spin-draws-plus')){
                draws = draws + 1;
                dom.draws.innerHTML = draws;
                dom.stake.innerHTML = Util.formatAmountCommas(totalStake * draws, true);
            } else if (Dom.hasClass(el, 'spin-draws-minus')){
                draws = draws > 1 ? draws - 1 : 1;
                dom.draws.innerHTML = draws;
                dom.stake.innerHTML = Util.formatAmountCommas(totalStake * draws, true);
            } else if (Dom.hasClass(el, 'board-change')){
                if(Dom.hasClass(el, 'neighbor-board')){
                    Dom.removeClass(dom.saleBoard, 'neighbor-board');
                } else {
                    Dom.addClass(dom.saleBoard, 'neighbor-board');
                }
                
            } else if (Dom.hasClass(el, 'spin-place-bet')){
                placeBets();
                clearBets();
                draws = 1;
                dom.draws.innerHTML = draws;
            } else if (Dom.hasClass(el, 'chip')){
                Dom.removeClass($('div.chip.selected', dom.options), 'selected');
                if (Dom.hasClass(el, 'chip-1')){
                    selectedChip = 0;
                } else if (Dom.hasClass(el, 'chip-2')){
                    selectedChip = 1;
                } else if (Dom.hasClass(el, 'chip-3')){
                    selectedChip = 2;
                } else if (Dom.hasClass(el, 'chip-4')){
                    selectedChip = 3;
                } else if (Dom.hasClass(el, 'chip-5')){
                    selectedChip = 4;
                }
                Dom.addClass($('div.chip-' + (selectedChip + 1), dom.options, true), 'selected');
            }
        },
        
        ticketsClick = function(e){
            var el = Event.getTarget(e);
            if (Dom.hasClass(el, 'bet-clear')){
                var code = Dom.getAttribute(el, 'c');
                var out = Dom.getAttribute(el, 'out');
                clearDraftBet(code, out);
            } else if (Dom.hasClass(el, 'ticket-clear')){
                var t_el = Dom.getAncestorByClassName(el, 'ticket-row');
                var tid = Dom.getAttribute(t_el, 'tid');
                delTickets.push(tid);
                showTickets(tickets);
            } else if (Dom.hasClass(el, 'clear-settled')){
                Util.foreach(tickets, function(ticket){
                    if(ticket && ticket.status !== 'pending'){
                        delTickets.push(ticket.id);
                    }
                });
                showTickets(tickets);
            } else if (Dom.hasClass(el, 'clear-tickets')){
                Util.foreach(tickets, function(ticket){
                    delTickets.push(ticket.id);
                });
                showTickets(tickets);
            }
        },
        
        processEvent = function(event){
            var data = event.d ? YAHOO.lang.JSON.parse(event.d) : false;
            if (event.t == 'winnings' && event.v && +event.v){
                userTotalWinnings += +event.v;
                showBetsInformation();
                flashBetsInfo('#f9ba0f', '#000000', 5);
            } else if (event.t == 'number'){
//                setTimeout(function(){
//                    clearMarks();
//                }, 5000);
                getInfo();
            } else if (event.t == 'spin'){
                getInfo();
                lastDrawId = data.id;
                nextDrawId = data.next.id;
                dom.lastDraw.innerHTML = lastDrawId;
                dom.nextDraw.innerHTML = nextDrawId;
            }
        };
        
        init = function(){
            dom.spinnwin = Dom.get('spinnwinview');
            dom.gameBoard = Dom.get('game-board');
            dom.statistics = Dom.get('spin-stats');
            dom.saleBoard = Dom.get('sale-board');
            dom.footer = Dom.get('spin-footer');
            dom.lastDraw = $('span.spin-last-draw', dom.spinnwin, true);
            dom.nextDraw = $('span.spin-next-draw', dom.spinnwin, true);
            dom.nextTime = $('span.spin-next-time', dom.spinnwin, true);
//            dom.countdown = $('span.spin-countdown', dom.spinnwin, false);
            dom.submit =  $('div.submit-draws', dom.footer, true);
            dom.maskLayer = $('#mask-layer', dom.saleBoard, true);
            dom.chipsLayer = $('#bet-chips', dom.saleBoard, true);
            dom.markLayer = $('#markbets', dom.saleBoard, true);
            dom.betLayer = $('#bet-layer', dom.saleBoard, true);
            dom.options = Dom.get('info-options');
            dom.stake = Dom.get('total-stake');
            dom.undo = $('div.undo', dom.options, true);
            dom.placeBet = $('div.place', dom.options, true);
            dom.frenchSwitch = $('div.french-switch', dom.gameBoard, true);
            dom.frenchMaskLayer = $('#french-mask-layer', dom.saleBoard, true);
            dom.frenchChipLayer = $('#french #french-bet-chips', dom.saleBoard, true);
            dom.frenchMarkLayer = $('#french #french-markbets', dom.saleBoard, true);
            dom.frenchBetLayer = $('#french #french-bet-layer', dom.saleBoard, true);
            dom.betsInfoPanel = $('div.bets-information div.bg', null, true);
            dom.selections = {};
            dom.draws = Dom.get('spin-ticket-draws');
            dom.ticketsBtns = $('div.mytickets-btns', dom.spinnwin, true);
            dom.ticketsList = Dom.get('spin-ticket-list');
            dom.betslipList = Dom.get('spin-betslip-list');
            setupBets();
            setupChips();
            showStakes();
            getInfo();
            Event.on([dom.saleBoard, dom.options, dom.submit], 'click', handleClick);
            Event.on([dom.ticketsList, dom.betslipList, dom.ticketsBtns], 'click', ticketsClick);
            
            Event.on(dom.betLayer, 'mouseover', function(e){
                var el = Event.getTarget(e);
                if (Dom.hasClass(el, 'selection')){
                    Dom.removeClass(dom.maskLayer, 'hidden');
                    Dom.removeClass($('.highlight', dom.maskLayer), 'highlight');
                    var i, hl = Dom.getAttribute(el, 'ns');
                    if (!hl){
                        hl = Dom.getAttribute(el, 'n');
                    }
                    if (hl){
                        var nums = hl.split(',');
                        for(i = 0; i < nums.length; i += 1){
                            Dom.addClass($('.number-' + nums[i], dom.maskLayer, true), 'highlight');
                        }
                    }
                }
            });
            Event.on(dom.betLayer, 'mouseout', function(e){
                var el = Event.getTarget(e);
                if (Dom.hasClass(el, 'selection')){
                    Dom.addClass(dom.maskLayer, 'hidden');
                }
            });
            Event.on(dom.frenchBetLayer, 'mouseover', function(e){
                var el = Event.getTarget(e);
                if (Dom.hasClass(el, 'selection')){
                    Dom.removeClass(dom.frenchMaskLayer, 'hidden');
                    Dom.removeClass($('.highlight', dom.frenchMaskLayer), 'highlight');
                    var i, hl = Dom.getAttribute(el, 'ns');
                    if (!hl){
                        hl = Dom.getAttribute(el, 'n');
                    }
                    if (hl){
                        var nums = hl.split(',');
                        for(i = 0; i < nums.length; i += 1){
                            Dom.addClass($('.nei-' + nums[i], dom.frenchMaskLayer, true), 'highlight');
                        }
                    }
                }
            });
            Event.on(dom.frenchBetLayer, 'mouseout', function(e){
                var el = Event.getTarget(e);
                if (Dom.hasClass(el, 'selection')){
                    Dom.addClass(dom.frenchMaskLayer, 'hidden');
                }
            });
            Event.on(dom.frenchSwitch, 'click', function(){
                if (Dom.hasClass(dom.saleBoard, 'french')){
                    Dom.removeClass(dom.saleBoard, 'french');
                    Dom.removeClass(dom.frenchSwitch, 'rulette');
                    Dom.addClass(dom.frenchSwitch, 'french');
                    Dom.setStyle(dom.maskLayer, 'display', 'block');
                    Dom.setStyle(dom.chipsLayer, 'display', 'block');
                    Dom.setStyle(dom.markLayer, 'display', 'block');
                    Dom.setStyle(dom.betLayer, 'display', 'block');
                    Dom.setStyle(dom.frenchMaskLayer, 'display', 'none');
                    Dom.setStyle(dom.frenchChipsLayer, 'display', 'none');
                    Dom.setStyle(dom.frenchMarkLayer, 'display', 'none');
                    Dom.setStyle(dom.frenchBetLayer, 'display', 'none');
                } else {
                    Dom.addClass(dom.saleBoard, 'french');
                    Dom.removeClass(dom.frenchSwitch, 'french');
                    Dom.addClass(dom.frenchSwitch, 'rulette');
                    Dom.setStyle(dom.maskLayer, 'display', 'none');
                    Dom.setStyle(dom.chipsLayer, 'display', 'none');
                    Dom.setStyle(dom.markLayer, 'display', 'none');
                    Dom.setStyle(dom.betLayer, 'display', 'none');
                    Dom.setStyle(dom.frenchMaskLayer, 'display', 'block');
                    Dom.setStyle(dom.frenchChipsLayer, 'display', 'block');
                    Dom.setStyle(dom.frenchMarkLayer, 'display', 'block');
                    Dom.setStyle(dom.frenchBetLayer, 'display', 'block');
                    
                }
            });
            ZAPNET.Events.setLastEvent(lastEventId);
            ZAPNET.Events.subscribe(processEvent, 'spinnwin');
        };
        
        return {
            show: show,
            init: init,
            clearMarks: clearMarks
        };
    }();
    
    ZAPNET.Spinwin.Draw = function(){
        var nextDrawTime = 0,
            drawRunning = false,
            busy = false,
            lastEventId = 0,
            numberColor =  {0:'green',1:'red',2:'black',3:'red',4:'black',5:'red',6:'black',7:'red',8:'black',9:'red',10:'black',11:'black',12:'red',13:'black',14:'red',15:'black',16:'red',17:'black',18:'red',19:'red',20:'black',21:'red',22:'black',23:'red',24:'black',25:'red',26:'black',27:'red',28:'black',29:'black',30:'red',31:'black',32:'red',33:'black',34:'red',35:'black',36:'red'},
            wheelNumbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26],
            sliceDegrees = 360.0 / 37.0,
            dom = {
                spinnwin: Dom.get('spinandwin'),
                wheel: Dom.get('wheel'),
                countdown: $('span.spin-countdown', Dom.get('spinandwin') , true),
                nextTime: $('span.spin-next-time', Dom.get('spinandwin'), true),
                number: Dom.get('number')
            },

        numberFromAngle = function(deg){
            deg = parseInt(deg);
            var pos = 36 - parseInt(Math.floor(((deg - (sliceDegrees * 0.5))  % 360) / sliceDegrees));
            if (pos in wheelNumbers){
                return wheelNumbers[pos];
            }
            return '-';
        },

        angleFromNumber = function(num){
            var index = wheelNumbers.indexOf(num);
            if (index >= 0){
                return (37 - index) * sliceDegrees;
            }

            return 0;
        },

        nextDraw = function(){
            drawRunning = false;
        },

        stopDraw = function(){
            nextDraw();

            if (window.parent && window.parent.ZAPNET && window.parent.ZAPNET.Display){
                window.parent.ZAPNET.Display.stop(2);
            }
        },

        startDraw = function(number, duration){
            if (drawRunning){
                return;
            }

            if (window.parent && window.parent.ZAPNET && window.parent.ZAPNET.Display){
                window.parent.ZAPNET.Display.start(2);
            }
            drawRunning = true;
            Dom.setStyle(dom.number, 'left', '');
            Dom.setStyle(dom.number, 'top', '');
            var color;
            var degrees = angleFromNumber(+number);
            var anim = new ZAPNET.Rotate(dom.wheel, {
                rotate: { by: 3600 + +degrees },
            }, duration, YAHOO.util.Easing.easeOutStrong);
            dom.wheel.style.transform = 'rotate(0deg)';
            anim.onComplete.subscribe(function(){
                stopDraw();
                dom.moneyPlane.style.transform = dom.wheel.style.transform;
                setTimeout(function(){
                    Dom.addClass(dom.spinnwin, 'show-stakes');
                }, 15000);
            });
            anim.onTween.subscribe(function(){
                var number = numberFromAngle(anim.getLastAngle());
                dom.number.innerHTML = number;
                if(color !== 'undefined'){Dom.removeClass(dom.number, 'number-ball-' + color)};
                color = numberColor[number];
                if(color !== 'undefined'){Dom.addClass(dom.number, 'number-ball-' + color)};
            });
            anim.animate();
        },

        processEvent = function(event){
            var data = event.d ? YAHOO.lang.JSON.parse(event.d) : false;
            if(data.next){
                nextDrawTime = data.next.secs ? new Date().getTime() + (data.next.secs * 1000) : '';
                dom.nextTime.innerHTML = data.next.time ? data.next.time : $P.date('H:i', data.next.ts);
            }
            if (event.t == 'spin'){
                startDraw(+data.n, +data.ds);
//            } else if (event.t == 'number'){
//                nextDrawTime = new Date().getTime() + (data.next.secs * 1000);
//                dom.nextDrawId.innerHTML = data.next.id;
//                dom.nextDrawTime.innerHTML = data.next.time;
//                dom.statistics.innerHTML = data.stats;
//            } else if (event.t == 'stakes'){
//                showStakes(data);
            }
        },

        tick = function(){
            var now = new Date().getTime();
            var timeLeft = nextDrawTime - now;
            if (timeLeft < 0) {
                timeLeft = 0;
            }
            var timeSecs = Math.round(timeLeft / 1000);
            var secs = timeSecs % 60;
            var mins = (timeSecs - secs) / 60;
            if(!drawRunning && secs && secs < 10 || !secs){
                Util.foreach(['green','red','black'], function(color){
                    Dom.removeClass(dom.number, 'number-ball-' + color)
                });
                dom.number.innerHTML = secs ? secs : '';
            }
            dom.countdown.innerHTML = mins || secs ? mins + ':' + Util.timePad(secs) : '';
        };


        nextDraw();
        if (ZAPNET.SPINNWIN_NEXT_DRAW_SECONDS){
            nextDrawTime = new Date().getTime() + (ZAPNET.SPINNWIN_NEXT_DRAW_SECONDS * 1000)
        }
        ZAPNET.Events.subscribe(processEvent, 'spinnwin');
        setInterval(tick, 250);
        
    }();
    
}());
