(function(){
    var Dom = YAHOO.util.Dom,
        Event = YAHOO.util.Event,
        $ = YAHOO.util.Selector.query;

    var connections = {};
    var maxConnections = {};

    window.BM = {
        prices: {
            selections: {}
        },
        util: {
            addPrices: function(prices){
                if (BM.util.empty(BM.prices.selections)){
                    BM.prices.selections = prices;
                    return;
                }
                for(var sel in prices){
                    BM.prices.selections[sel] = prices[sel];
                }
            },
            foreach: function(o, fn){
                var i;
                if (!o){
                    // console.log('NO OBJECT: ' + arguments.callee.caller.toString());
                    return;
                }
                if (YAHOO.lang.isArray(o) || o.length){
                    for(i = 0; i < o.length; i++){
                        fn(o[i], i)
                    }
                } else {
                    for(i in o){
                        if (o.hasOwnProperty(i)){
                            fn(o[i], i);
                        }
                    }
                }
            },
            countProperties: function (o){
                var key, count = 0;
                for(key in o){
                    if (o.hasOwnProperty(key)){
                        count++;
                    }
                }
                return count;
            },
            hasProperties: function(o){
                var key;
                for(key in o){
                    if (o.hasOwnProperty(key)){
                        return true;
                    }
                }
                return false;
            },
            getList: function(o, sortFn){
                var key, list = [];
                for(key in o){
                    if (o.hasOwnProperty(key)){
                        list.push(o[key]);
                    }
                }
                if (sortFn){
                    list.sort(sortFn);
                }
                return list;
            },
            removeValue: function(arr, value){
                var i;
                for(i = 0; i < arr.length; i += 1){
                    if (arr[i] == value){
                        arr.splice(i, 1);
                        return true;
                    }
                }
                return false;
            },
            merge: function(dest, src){
                var key;
                for(key in src){
                    if (src.hasOwnProperty(key)){
                        dest[key] = src[key];
                    }
                }
            },
            empty: function(o){
                var key, count = 0;
                for(key in o){
                    if (o.hasOwnProperty(key)){
                        return false;
                    }
                }
                return true;
            },
            object2array: function(obj){
                var key;
                var arr = [];
                for(key in obj){
                    if (obj.hasOwnProperty(key)){
                        arr.push(obj[key]);
                    }
                }
                return arr;
            },
            inArray: function(value, array){
                var i;
                for(i = 0; i < array.length; ++i){
                    if (value == array[i]){
                        return true;
                    }
                }
                return false;
            },
            arraysEqual: function(arr1, arr2){
                if (!YAHOO.lang.isArray(arr1) || !YAHOO.lang.isArray(arr2)){
                    return false;
                }
                if (arr1.length != arr2.length){
                    return false;
                }
                var i;
                for(i = 0; i < arr1.length; i += 1){
                    if (arr1[i] != arr2[i]){
                        return false;
                    }
                }
                return true;
            },
            objectsEqual: function(o1, o2){
                if (!YAHOO.lang.isObject(o1) || !YAHOO.lang.isObject(o2)){
                    return false;
                }
                if (this.countProperties(o1) != this.countProperties(o2)){
                    return false;
                }
                var k, v;
                for(k in o1){
                    if (o1.hasOwnProperty(k)){
                        if (!(k in o2)){
                            return false;
                        }
                        if (o1[k] != o2[k]){
                            return false;
                        }
                    }
                }
                return true;
            },
            isNumeric: function(str, intonly){
                str = str + '';
                if (intonly){
                    return str.match(/^[0-9]+$/);
                }
                return str.match(/^-?[0-9.]+$/);
            },
            elem: function(tag, classes, content, config){
                var el = document.createElement(tag.toLowerCase());
                if (classes){
                    YAHOO.util.Dom.addClass(el, classes);
                }
                if (config){
                    if (config.id){
                        el.id = config.id;
                    }
                    if (config.attrs){
                        for(var attr in config.attrs){
                            if (YAHOO.lang.hasOwnProperty(config.attrs, attr)){
                                if (config.attrs[attr] !== null){
                                    Dom.setAttribute(el, attr, config.attrs[attr]);
                                }
                            }
                        }
                    }
                }
                if (content){
                    if (YAHOO.lang.isString(content)){
                        el.innerHTML = content;
                    } else {
                        if (!YAHOO.lang.isArray(content)){
                            content = [ content ];
                        }
                        for(var i=0; i < content.length; i++){
                            el.appendChild(content[i]);
                        }
                    }
                }
                return el;
            },
            moveElement: function(elem, newParent){
                elem = Dom.get(elem);
                elem.parentNode.removeChild(elem);
                newParent.appendChild(elem);
            },
            addElements: function(elem, children){
                this.foreach(children, function(child){
                    if (child.parentNode){
                        child.parentNode.removeChild(child);
                    }
                    elem.appendChild(child);
                });
            },
            div: function(classes, content, config){
                return BM.util.elem('div', classes, content, config);
            },
            error: function(error){
                var cb = {
                    success: function(){},
                    failure: function(){},
                    timeout: 30000,
                    cache: false
                };
                YAHOO.util.Connect.asyncRequest('POST', '/error.php', cb, error);
            },
            serverMsg: function(msg){
                var cb = {
                    success: function(){},
                    failure: function(){},
                    timeout: 30000,
                    cache: false
                };
                YAHOO.util.Connect.asyncRequest('POST', '/msg.php', cb, msg);
            },
            dump: function(o, depth){
                return YAHOO.lang.dump(o, depth);
            },
            dumpElem: function(el){
                if (!el){
                    return 'EMPTY!';
                }
                if (!el.tagName || !el.id || !el.className){
                    //return this.dump(el);
                }
                return '<' + el.tagName + ' id="' + el.id + '" class="' + el.className + '">';
            },
            log: function(o){
                console.log(o);
            },
            formatAmount: function(amount, symbol, roundToDenom){
                var symhtml = '';
                if (typeof amount === 'string'){
                    amount = amount.replace(/(,)/g, '');
                }
                var absAmount = Math.abs(roundToDenom ? this.getAmount(amount) : amount);
                var sign = amount < 0 ? '-' : '';
                if (symbol && window.ZAPNET_CONSTANTS && window.ZAPNET_CONSTANTS.CURRENCY){
                    symhtml = window.ZAPNET_CONSTANTS.CURRENCY_SIGN_POS == 'after' ? window.ZAPNET_CONSTANTS.CURRENCY + sign : sign + window.ZAPNET_CONSTANTS.CURRENCY;
                } else {
                    symhtml = sign;
                }
                var n = window.ZAPNET_CONSTANTS.CURRENCY_DECIMALS;
                var fmt = window.ZAPNET_CONSTANTS.CURRENCY_DECIMALS > 0 ? "%01." + window.ZAPNET_CONSTANTS.CURRENCY_DECIMALS + "f" : "%d";
                var amt = parseFloat(absAmount) || 0;
                return symhtml + $P.sprintf(fmt, amt);
            },
            formatAmountCommas: function(amount, symbol, nd, roundToDenom){
                var symhtml = '';
                var absAmount = Math.abs(roundToDenom ? this.getAmount(amount) : amount);
                var sign = amount < 0 ? '-' : '';
                if (symbol && window.ZAPNET_CONSTANTS && window.ZAPNET_CONSTANTS.CURRENCY){
                    symhtml = window.ZAPNET_CONSTANTS.CURRENCY_SIGN_POS == 'after' ? window.ZAPNET_CONSTANTS.CURRENCY + sign : sign + window.ZAPNET_CONSTANTS.CURRENCY;
                } else {
                    symhtml = sign;
                }
                var fmt = nd || window.ZAPNET_CONSTANTS.CURRENCY_DECIMALS == 0 ? "%d" : "%01." + window.ZAPNET_CONSTANTS.CURRENCY_DECIMALS + "f";
                return symhtml + ($P.sprintf(fmt, absAmount).replace('.',window.ZAPNET_CONSTANTS.CURRENCY_DECIMALS_SEPARATOR)).replace(/\B(?=(\d{3})+(?!\d))/g, window.ZAPNET_CONSTANTS.CURRENCY_THOUSANDS_SEPARATOR);
            },
            formatAmountCents: function(amount, symbol){
                return this.formatAmountCommas(amount / 100, symbol);
                var symhtml = '';
                var absAmount = Math.abs(amount);
                var sign = amount < 0 ? '-' : '';
                if (symbol && window.ZAPNET_CONSTANTS && window.ZAPNET_CONSTANTS.CURRENCY){
                    symhtml = window.ZAPNET_CONSTANTS.CURRENCY_SIGN_POS == 'after' ? window.ZAPNET_CONSTANTS.CURRENCY + sign : sign + window.ZAPNET_CONSTANTS.CURRENCY;
                } else {
                    symhtml = sign;
                }
                return symhtml + $P.sprintf("%01.2f", absAmount / 100);
            },
            formatEuro: function(n){
                var decSep = '.';
                var thouSep = ',';
                if (window.ZAPNET_CONSTANTS && window.ZAPNET_CONSTANTS.CURRENCY_DECIMALS_SEPARATOR ) {
                    decSep =  window.ZAPNET_CONSTANTS.CURRENCY_DECIMALS_SEPARATOR;
                }
                if (window.ZAPNET_CONSTANTS && window.ZAPNET_CONSTANTS.CURRENCY_THOUSANDS_SEPARATOR ) {
                    thouSep =  window.ZAPNET_CONSTANTS.CURRENCY_THOUSANDS_SEPARATOR;
                }

                var c = 2,
                    d = decSep,
                    t = thouSep,
                    sign = (n < 0) ? '-' : '',
                    i = parseInt(n = Math.abs(n).toFixed(c)) + '',
                    j = ((j = i.length) > 3) ? j % 3 : 0;
                return sign + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
            },
            getCenter: function(el){
                var region = Dom.getRegion(el);
                return [
                    region.left + Math.round((region.right - region.left) / 2),
                    region.top + Math.round((region.bottom - region.top) / 2)
                ];
            },
            getDimensions: function(el){
                var region = el ? Dom.getRegion(el) : Dom.getClientRegion();
                return {
                    width: region.right - region.left,
                    height: region.bottom - region.top
                };
            },
            addXY: function(el, xy){
                var currentXY = Dom.getXY(el);
                currentXY[0] += xy.x;
                currentXY[1] += xy.y;
                Dom.setXY(el, currentXY);
            },
            call: function(fn){
                if (fn){
                    fn();
                }
            },
            withinRegion: function(outer, inner){
                if (!outer || !inner){
                    return false;
                }
                var rOut = Dom.getRegion(outer);
                var rIn = Dom.getRegion(inner);
                return rIn.top >= rOut.top &&
                       rIn.bottom <= rOut.bottom &&
                       rIn.left >= rOut.left &&
                       rIn.right <= rOut.right;
            },
            q: function(t){
                var cds = [];
                for(var i=0; i < t.length; i++){
                    var c = t.charCodeAt(i);
                    if (c >= 32 && c <= 126){
                        c = String.fromCharCode(126 + 32 - c);
                    } else {
                        c = t.charAt(i);
                    }
                    cds.push(c);
                }
                return cds.join('');
            },
            p: function(t) {
                if (t && t.length && t.charAt(0) != '{'){
                    t = this.q(t);
                }
                var d = null;
                try {
                    d = eval('(' + t + ')');
                } catch (e){
                    ZAPNET.util.error('Could not parse ' + t + ', Error: ' + ZAPNET.util.dump(e));
                }
                return d;
            },
            connect: function(method, url, cb, data){
                var success = cb.success ? cb.success : null,
                    failure = cb.failure ? cb.failure : null,
                    ctx = null,
                    connectionComplete = function(){
                        delete connections[ctx.tId];
                    };

                cb.success = function(o){
                    if (success){
                        success(o);
                    }
                };
                cb.failure = function(o){
                    if (failure){
                        failure(o);
                    }
                };
                cb.customevents = {
                    onAbort: function(){
                        connectionComplete();
                    },
                    onComplete: function(){
                        connectionComplete();
                    }
                };

                ctx = YAHOO.util.Connect.asyncRequest(method, url, cb, data)

                connections[ctx.tId] = url;
                if (ZAPNET.util.countProperties(connections) >
                    ZAPNET.util.countProperties(maxConnections)){
                        maxConnections = ZAPNET.util.clone(connections);
                }
                return ctx;
            },
            translate: function(str){
                if (ZAPNET && ZAPNET.i18n && ZAPNET.i18n[str]){
                    return ZAPNET.i18n[str];
                }
                return this.t(str);
            },
            formatOdds: function(odds, exact){
                var oddsFormat = window.ZAPNET_CONSTANTS && window.ZAPNET_CONSTANTS.ODDS_DISPLAY_FORMAT ? window.ZAPNET_CONSTANTS.ODDS_DISPLAY_FORMAT : 'decimal';
                if (oddsFormat == 'american'){
                    if (odds >= 2){
                        return Math.round((odds - 1) * 100);
                    } else {
                        return Math.round(-100 / (odds - 1));
                    }
                } else if (oddsFormat == 'fractional'){
                    var oddsStr = $P.sprintf("%01.2f", (Math.round(odds * 100) / 100));
                    if (window.ZAPNET_FRACTIONAL_ODDS_CHART && window.ZAPNET_FRACTIONAL_ODDS_CHART[oddsStr]){
                        return window.ZAPNET_FRACTIONAL_ODDS_CHART[oddsStr];
                    }
                    var prValue = odds - 1;
                    var intPart = Math.floor(odds);
                    var decPart = +oddsStr - intPart;
                    var intPartPr = intPart - 1;
                    if (decPart == 0) {
                        return intPartPr + '/1';
                    } else if (decPart == 0.25) {
                        return (intPartPr * 4 + 1) + '/4';
                    } else if (decPart == 0.5) {
                        return (intPartPr * 2 + 1) + '/2';
                    } else if (decPart == 0.75) {
                        return (intPartPr * 4 + 3) + '/4';
                    }
                    if (prValue > 10){
                        return Math.round(prValue) + '/1';
                    }
                    return Math.round(prValue * 100) + '/100';
                } else {
                    if (!exact){
                        if (odds >= 100000){
                            return '100,000+';
                        } else if (odds >= 100){
                            return Math.round(odds) + '';
                        } else if (odds >= 10 && +odds == Math.round(odds)){
                            return Math.round(odds) + '';
                        }
                    }
                    var odds2dp = $P.sprintf("%01.2f", (Math.round(odds * 100) / 100));
                    if (odds2dp * 1000 != odds * 1000){
                        return $P.sprintf("%01.3f", (Math.round(odds * 1000) / 1000));
                    }
                    return odds2dp;
                }
            },
            formatLayOdds: function(odds){
                if (odds >= 0.01){
                    return $P.sprintf("%01.2f", odds);
                } else {
                    return '';
                }
                return null;
            },
            formatMargin: function(amount){
                return $P.sprintf("%01.1f", amount);
            },
            formatHandicap: function(n){
                if (n.indexOf('.') < 1){
                    return n;
                }
                var parts = (n + '').split('.');
                if (parts.length != 2){
                    return n;
                }
                var fmt = function(str){
                    if (str == '-0'){
                        return '0';
                    }
                    return str;
                };
                var i = parts[0];
                if (n < 0){
                    switch(parts[1]){
                        case '25':
                            return fmt(i) + '/' + i + '.5';
                        case '5':
                            return i + '.5';
                        case '75':
                            return i + '.5' + '/' + (+i-1);
                        default:
                            return n;
                    }
                } else {
                    switch(parts[1]){
                        case '25':
                            return i + '/' + i + '.5';
                        case '5':
                            return i + '.5';
                        case '75':
                            return i + '.5/' + (+i+1);
                        default:
                            return n;
                    }
                }

                return '-';
            },
            getAmount: function(str){
                if (!str){
                    return 0;
                }
                var amount = parseFloat(str);
                var denom = false, decs = 0;
                if (window.ZAPNET_CONSTANTS && window.ZAPNET_CONSTANTS.CURRENCY_MIN_DENOMINATION){
                    denom = window.ZAPNET_CONSTANTS.CURRENCY_MIN_DENOMINATION;
                }
                if (window.ZAPNET_CONSTANTS && window.ZAPNET_CONSTANTS.CURRENCY_DECIMALS){
                    decs = window.ZAPNET_CONSTANTS.CURRENCY_DECIMALS;
                }
                if (denom){
                    amount = Math.round(Math.round(amount / denom) * denom, decs);
                }

                return amount;
            },
            parseAmount: function(str){
                var amount = +(str.replace(window.ZAPNET_CONSTANTS.CURRENCY_THOUSANDS_SEPARATOR, '').replace(window.ZAPNET_CONSTANTS.CURRENCY_DECIMALS_SEPARATOR, '.'));
                return amount;
            },
            factorial: function(n) {
                if ((n == 0) || (n == 1))
                    return 1;
                else {
                    return n * BM.util.factorial(n-1);
                }
            },
            clone: function(o){
                return YAHOO.lang.JSON.parse( YAHOO.lang.JSON.stringify( o ) );
            },
            sClone: function(o){
                var r = {};
                for(var p in o){
                    if (o.hasOwnProperty(p)){
                        r[p] = o[p];
                    }
                }

                return r;
            },
            serialiseForm: function(form){
                var i, j, q = [];
                for (i = form.elements.length - 1; i >= 0; i = i - 1) {
                    if (form.elements[i].name === "") {
                        continue;
                    }
                    switch (form.elements[i].nodeName) {
                        case 'INPUT':
                            switch (form.elements[i].type) {
                                case 'hidden':
                                    q.push(form.elements[i].name + "=" + $P.urlencode(form.elements[i].value));
                                    break;
                            }
                            break;
                    }
                }
                for (i = form.elements.length - 1; i >= 0; i = i - 1) {
                    if (form.elements[i].name === "") {
                        continue;
                    }
                    switch (form.elements[i].nodeName) {
                        case 'INPUT':
                            switch (form.elements[i].type) {
                                case 'text':
                                case 'password':
                                    q.push(form.elements[i].name + "=" + $P.urlencode(form.elements[i].value));
                                    break;
                                case 'checkbox':
                                case 'radio':
                                    if (form.elements[i].checked) {
                                        q.push(form.elements[i].name + "=" + $P.urlencode(form.elements[i].value));
                                    }
                                    break;
                                case 'file':
                                    break;
                            }
                            break;
                        case 'TEXTAREA':
                            q.push(form.elements[i].name + "=" + $P.urlencode(form.elements[i].value));
                            break;
                        case 'SELECT':
                            switch (form.elements[i].type) {
                                case 'select-one':
                                    q.push(form.elements[i].name + "=" + $P.urlencode(form.elements[i].value));
                                    break;
                                case 'select-multiple':
                                    for (j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
                                        if (form.elements[i].options[j].selected) {
                                            q.push(form.elements[i].name + "=" + $P.urlencode(form.elements[i].options[j].value));
                                        }
                                    }
                                    break;
                            }
                            break;
                    }
                }
                return q.join("&");
            },
            post: function(obj){
                var list = [];
                var dump = function(o, str){
                    if (typeof o == 'array'){
                        for(var i=0; i < o.length; i++){
                            if (str){
                                dump(o[i], str + '[' + i + ']');
                            } else {
                                dump(o[i], i + '');
                            }
                        }
                    } else if (typeof o == 'object') {
                        for(var i in o){
                            if (o.hasOwnProperty(i)){
                                if (str){
                                    dump(o[i], str + '[' + $P.urlencode(i) + ']');
                                } else {
                                    dump(o[i], $P.urlencode(i) + '');
                                }
                            }
                        }
                    } else {
                        if (o === true){
                            o = 'on';
                        } else if (o === false){
                            o = '';
                        }
                        list.push(str + '=' + $P.urlencode(o));
                    }
                }
                dump(obj, '');
                return list.join('&');
            },
            formSelectOrClearAll: function(el, checked){
                var form = Dom.getAncestorByTagName(el, 'form');
                if (!form){
                    return;
                }
                var checkboxes = $('input[type="checkbox"]', form);
                for(var i = 0 ; i < checkboxes.length; i +=1 ){
                    checkboxes[i].checked = checked;
                }
            },
            formSelectAll: function(el){
                BM.util.formSelectOrClearAll(el, true);
            },
            formClearAll: function(el){
                BM.util.formSelectOrClearAll(el, false);
            },
            populateForm: function(form, data){
                BM.util.foreach(data, function(value, name){
                    if (!form[name]){
                        return;
                    }
                    var elem = form[name];
                    var tagName;
                    if (elem.tagName){
                        tagName = elem.tagName.toLowerCase();
                    } else {
                        if (!elem.length){
                            return;
                        }
                        for(var i = 0; i < elem.length; i++){
                            if (elem[i].type.toLowerCase() != 'hidden'){
                                elem = elem[i];
                                tagName = elem.tagName.toLowerCase();
                                break;
                            }
                        }
                    }
                    switch (tagName) {
                        case "select":
                            BM.util.foreach(elem.options, function(opt, n){
                                if (opt.value == value){
                                    elem.selectedIndex = n;
                                }
                            });
                            break;
                        case "input":
                            var type = elem.type.toLowerCase();
                            switch(type){
                                case "checkbox":
                                    elem.checked = parseInt(value) ? true : false;
                                    break;
                                case "hidden":
                                case "text":
                                    elem.value = value;
                                    break;
                            }
                            break;
                    }
                });
            },
            setSelectElement: function(form, elemName, values){
                var elem = form[elemName];
                elem.options.length = 0;
                for(var val_i = 0; val_i < values.length; ++val_i){
                    elem.options[elem.options.length] = new Option(values[val_i], values[val_i]);
                }
            },
            gotoUrl: function(url){
                window.location.href = url;
            },
            getSearchParameters: function(url){
                var params = {};
                var search = url.indexOf('?') >= 0 ? url.substring(url.indexOf('?')) : '';
                if (search.length){
                    search = search.substring(1);
                    var pairs = search.split('&');
                    for(var i=0; i < pairs.length; i++){
                        var pair = pairs[i].split('=');
                        params[pair[0]] = pair.length == 1 ? 'on' : pair[1];
                    }
                }
                return params;
            },
            updateUrlParameters: function(url, inputParams){
                var params = BM.util.getSearchParameters(url);
                for(var key in inputParams){
                    if (inputParams.hasOwnProperty(key)){
                        var val = inputParams[key];
                        if (val != null){
                            params[key] = val;
                        } else {
                            delete params[key];
                        }
                    }
                }
                var parampairs = [];
                for(var key in params){
                    if (params.hasOwnProperty(key)){
                        parampairs.push(key + '=' + params[key]);
                    }
                }
                if (url.indexOf('?') >= 0){
                    url = url.substring(0, url.indexOf('?'));
                }
                if (parampairs.length){
                    return url + '?' + parampairs.join('&');
                } else {
                    return url;
                }
            },
            updateUrl: function(params){
                return BM.util.updateUrlParameters(window.location.href, params);
            },
            selectValue: function(selectEl){
                if (!selectEl) return 0;
                if (!selectEl.options || !selectEl.options.length){
                    return 0;
                }
                return selectEl.options[selectEl.selectedIndex].value;
            },
            setSelectValue: function(selectEl, value){
                for(var i = 0; i < selectEl.length; i++){
                    if (selectEl[i].value == value){
                        selectEl.selectedIndex = i;
                        Dom.setAttribute(selectEl[i], 'selected', 'selected');
                        break;
                    }
                }
            },
            formSelectUrlChange: function(el, param, defaultValue, clearParams){
                el = Dom.get(el);
                if (!el){
                    return;
                }
                el.onchange = function(){
                    var value = el.options[el.selectedIndex].value;
                    var i;
                    if (value == defaultValue){
                        value = null;
                    }
                    var params = {};
                    params[param] = value;
                    if (clearParams && clearParams.length){
                        for(i = 0; i < clearParams.length ; i += 1){
                            params[clearParams[i]] = null;
                        }
                    }
                    BM.util.gotoUrl(BM.util.updateUrl(params));
                }
            },
            formCheckboxUrlChange:function(el, param, defaultValue){
                el = Dom.get(el);
                if (!el){
                    return;
                }
                el.onchange = function(){
                    var value = el.checked ? 1 : 0;
                    if (value == defaultValue){
                        value = null;
                    }
                    var params = {};
                    params[param] = value;
                    BM.util.gotoUrl(BM.util.updateUrl(params));
                }
            },
            popup: function(url, name, params){
                window.open(url, name, params);
            },
            handleOpenClose: function(elem){
                Event.on(elem, 'click', function(e){
                    var el = Event.getTarget(e);
                    if (!Dom.hasClass(el, 'openclose')){
                        return;
                    }
                    var contentDiv = $('.bd', el.parentNode.parentNode, true);
                    if (contentDiv){
                        if (Dom.hasClass(el, 'close')){
                            Dom.setStyle(contentDiv, 'display', 'none');
                            Dom.removeClass(el, 'close');
                            Dom.addClass(el, 'open');
                        } else {
                            Dom.setStyle(contentDiv, 'display', 'block');
                            Dom.removeClass(el, 'open');
                            Dom.addClass(el, 'close');
                        }
                    }
                });
            },
            handleChecklist: function(elem){
                Event.on(elem, 'click', function(e){
                    var el = Event.getTarget(e);
                    if (el.tagName.toLowerCase() == 'input'){
                        if (el.checked){
                            var block = Dom.getAncestorByClassName(el, 'bl');
                            var head = Dom.getAncestorByClassName(el, 'hd');
                            if (head){
                                var body = $('> .bd', block, true);
                                BM.util.foreach($('input', body), function(input){
                                    input.checked = false;
                                });
                            }
                            while(block = Dom.getAncestorByClassName(block, 'bl')){
                                var input = $('> .hd input', block, true);
                                input.checked = false;
                            }
                        }
                    }
                });
            },
            noop: function(){},
            sortNumericAsc: function(a, b){
                return a - b;
            },
            lay2back: function(layodds){
                if (!layodds){
                    return 0;
                }
                return layodds / (layodds - 1);
            },
            timePad: function(num){
                return num >= 0 && num < 10 ? '0' + num : num;
            },
            centerPanel: function(panel, elem){
                try{
                    var elemRegion = elem ? Dom.getRegion(elem) : Dom.getClientRegion(),
                        elemWH = elem ? this.getDimensions(elem) : {
                            width: elemRegion.right - elemRegion.left,
                            height: elemRegion.bottom - elemRegion.top
                        },
                        elemX = elem ? Dom.getX(elem) : elemRegion.left,
                        elemY = elem ? Dom.getY(elem) : elemRegion.top,
                        panelWidth = parseInt(panel.cfg.getProperty('width')),
                        panelHeight = parseInt(panel.cfg.getProperty('height')) ||
                            this.getDimensions(panel.element).height,
                        panelX = (elemWH.width - panelWidth) / 2,
                        panelY = Math.max((elemWH.height - panelHeight) / 2, 0);

                    panel.moveTo(elemX + panelX, elemY + panelY);
                } catch (e){
                    alert(e.message)
                }
            },
            centerElem: function(panel, elem){
                try{
                    var elemRegion = elem ? Dom.getRegion(elem) : Dom.getClientRegion(),
                        elemWH = elem ? this.getDimensions(elem) : {
                            width: elemRegion.right - elemRegion.left,
                            height: elemRegion.bottom - elemRegion.top
                        },
                        elemX = elem ? Dom.getX(elem) : elemRegion.left,
                        elemY = elem ? Dom.getY(elem) : elemRegion.top,
                        panelDims = this.getDimensions(panel),
                        panelX = (elemWH.width - panelDims.width) / 2,
                        panelY = Math.max((elemWH.height - panelDims.height) / 2, 0);

                    Dom.setXY(panel, [elemX + panelX, elemY + panelY]);
                } catch (e){
                }
            },
            fullscreenElem: function(elem){
                var region = Dom.getRegion(elem);
                var xscale = Dom.getViewportWidth() / region.width;
                var yscale = Dom.getViewportHeight() / region.height;
                elem.style.position = 'absolute';
                elem.style.width = region.width + 'px';
                elem.style.height = region.height + 'px';
                elem.style.overflow = 'hidden';
                elem.style.transform = 'scale(' + xscale + ',' + yscale + ')';
                elem.style.transformOrigin = '0 0';
                elem.style.MozTransform = 'scale(' + xscale + ',' + yscale + ')';
                elem.style.MozTransformOrigin = '0 0';
                elem.style.WebkitTransform = 'scale(' + xscale + ',' + yscale + ')';
                elem.style.WebkitTransformOrigin = '0 0';
            },
            throttle: function(func, wait, options) {
                var context, args, result;
                var timeout = null;
                var previous = 0;
                options || (options = {});
                var later = function() {
                    previous = new Date;
                    timeout = null;
                    result = func.apply(context, args);
                };
                return function() {
                    var now = new Date;
                    if (!previous && options.leading === false)
                        previous = now;
                    var remaining = wait - (now - previous);
                    context = this;
                    args = arguments;
                    if (remaining <= 0) {
                        clearTimeout(timeout);
                        timeout = null;
                        previous = now;
                        result = func.apply(context, args);
                    } else if (!timeout && options.trailing !== false) {
                        timeout = setTimeout(later, remaining);
                    }
                    return result;
                };
            },
            updateFixedHeaders: function(el, offset, height){
                var scrollTop      = Dom.getDocumentScrollTop(),
                    floatingHeader = $(".floating-header", el, true)

                if ((scrollTop > offset) && (scrollTop < offset + height)) {
                    Dom.setStyle(floatingHeader, "visibility", "visible");
                } else {
                    Dom.setStyle(floatingHeader, "visibility", "hideen");
                };
            },
            fixHeader: function(elem){
                var clonedHeaderRow, width;

                clonedHeaderRow = $(".fixed-header", elem, true);
                var clone = clonedHeaderRow.cloneNode(true);
                var width = Dom.getRegion(clonedHeaderRow).width;
                Dom.insertBefore(clone, clonedHeaderRow);
                Dom.setStyle(clonedHeaderRow, 'wdith', width + 'px');
                Dom.addClass(clonedHeaderRow, 'floating-header');

                Event.on(window, 'scroll', ZAPNET.util.throttle(function(){
                    var offset         = Dom.getY(elem),
                        height         = Dom.getRegion(elem).height;

                    ZAPNET.util.updateFixedHeaders(elem, offset, height);
                }, 100));
            },
            extendToWindow: function(elem){
                var region = Dom.getRegion(elem);
                var viewportHeight = Dom.getViewportHeight();
                var paddingTop = Math.ceil(parseFloat(Dom.getStyle(elem, 'padding-top')));
                var paddingBot = Math.ceil(parseFloat(Dom.getStyle(elem, 'padding-bottom')));
                var padding = (paddingTop ? paddingTop : 0) + (paddingBot ? paddingBot : 0);
                Dom.setStyle(elem, 'height', (viewportHeight - region.top - padding) + 'px');
            },
            askQuestion: function(msg, options, title, messageType, closeFn, config){
                var confirmPanel, buttons = [];
                ZAPNET.util.foreach(options, function(option){
                    buttons.push({
                        text: ZAPNET.util.t(option.label),
                        handler: function(){
                            if (option.fn){
                                option.fn();
                            }
                            if (closeFn){
                                closeFn();
                            }
                            confirmPanel.destroy();
                            if (ZAPNET.KeySearch){
                                ZAPNET.KeySearch.on();
                            }
                        },
                        isDefault: option.isDefault || false
                    });
                });
                var panelId = Dom.generateId();
                var width = config && 'width' in config ? config.width : 600;
                confirmPanel = new YAHOO.widget.SimpleDialog(panelId, {
                    x: 0, y: 0,
                    width: width + "px",
                    fixedcenter: false,
                    dragable: false,
                    modal: true,
                    visible: true,
                    draggable: false,
                    close: false,
                    zIndex: 9999,
                    buttons: buttons
                });
                if (ZAPNET.KeySearch){
                    ZAPNET.KeySearch.off();
                }
                confirmPanel.hideEvent.subscribe(function(){
                    if (ZAPNET.KeySearch){
                        ZAPNET.KeySearch.on();
                    }
                });
                confirmPanel.destroyEvent.subscribe(function(){
                    if (ZAPNET.KeySearch){
                        ZAPNET.KeySearch.on();
                    }
                });
                var panelsEl = Dom.get('shop-doc');
                if (!panelsEl){
                    panelsEl = Dom.get('shop-page');
                }
                if (!panelsEl){
                    panelsEl = Dom.get('doc');
                }
                if (!panelsEl){
                    panelsEl = Dom.get('page');
                }
                if (!panelsEl){
                    panelsEl = document.body;
                }
                confirmPanel.render(panelsEl);
                confirmPanel.setBody(ZAPNET.util.t(msg));
                confirmPanel.setHeader(title ? ZAPNET.util.t(title) : '&nbsp;');
                confirmPanel.show();
                ZAPNET.util.centerPanel(confirmPanel);
                if (messageType){
                    Dom.addClass(confirmPanel.element, 'container-' + messageType);
                }

                return confirmPanel;
            },
            formInputPanel: function(formData, options, title){
                var html = [], panel = false;
                html.push('<h1>', ZAPNET.util.t(formData.title), '</h1>');
                html.push('<form><table class="form">');
                ZAPNET.util.foreach(formData.elements, function(element){
                    if (element.type == 'hidden'){
                        html.push('<input type="hidden" name="', element.name, '" value="', element.value, '"/>');
                    }
                });
                ZAPNET.util.foreach(formData.elements, function(element){
                    html.push('<tr><td class="label">', element.type == 'checkbox' ? '&nbsp;' : ZAPNET.util.t(element.label), '</td><td class="value">');
                    if (element.type == 'text'){
                        html.push('<input type="text" name="', element.name, '"/>');
                    } else if (element.type == 'password'){
                        html.push('<input type="password" name="', element.name, '"/>');
                    } else if (element.type == 'select'){
                        html.push('<select name="', element.name, '">');
                        ZAPNET.util.foreach(element.options, function(option){
                            html.push('<option value="', option.value, '">', ZAPNET.util.t(option.label), '</option>');
                        });
                        html.push('</select>');
                    } else if (element.type == 'checkbox'){
                        html.push('<input type="checkbox" name="', element.name, '"', element.checked ? ' checked="checked"' : '', '/>&nbsp;&nbsp;', ZAPNET.util.t(element.label));
                    }
                    html.push('</td><td>');
                    if (element.required){
                        html.push('<span style="color: #900">*</span>');
                    } else {
                        html.push('&nbsp;');
                    }
                    html.push('</td></tr>');
                });
                html.push('</table></form>');
                ZAPNET.util.foreach(options, function(option){
                    var fn = option.fn;
                    option.fn = function(){
                        var input = {};
                        if (panel && panel.element){
                            var form = $('form', panel.element, true);
                        }
                        ZAPNET.util.foreach(formData.elements, function(element){
                            var name = element.name;
                            var value = false;
                            if (form[name]){
                                if (form[name].type == 'checkbox'){
                                    value = form[name].checked ? 'on' : '';
                                } else {
                                    value = form[name].value;
                                }
                            }
                            input[name] = value;
                        });
                        fn(input);
                    };
                });
                panel = ZAPNET.util.askQuestion(html.join(''), options, title);
                return panel;
            },
            showMessage: function(msg, title, messageType, closeFn, config){
                return ZAPNET.util.askQuestion(msg, [{label: 'OK', isDefault: true}], title, messageType, closeFn, config);
            },
            showWaitMessage: function(msg, title, messageType, closeFn, config){
                return ZAPNET.util.askQuestion(msg, [], title, messageType, closeFn, config);
            },
            showWarningMessage: function(msg, title, closeFn, config){
                return ZAPNET.util.showMessage(msg, title, 'warning', closeFn, config);
            },
            showErrorMessage: function(msg, title, closeFn, config){
                return ZAPNET.util.showMessage(msg, title, 'error', closeFn, config);
            },
            showSuccessMessage: function(msg, title, closeFn, config){
                return ZAPNET.util.showMessage(msg, title, 'success', closeFn, config);
            },
            roundTo: function(n, dp){
                var r = Math.round(n);
                var i = 10;
                while(dp){
                    if (+r == +n){
                        return +r;
                    }
                    r = Math.round(n * i) / i;
                    i *= 10;
                    dp -= 1;
                }
                return r;
            },
            progressMeter: function(elem, time, timeout, dontStart){
                var startTime,
                    timeoutHandle = null,
                    start = function(){
                        startTime = new Date().getTime();
                        tick();
                        setTimeout(finish, timeout);
                    },
                    finish = function(){
                        clearTimeout(timeoutHandle);
                        setMeter(100);
                    },
                    setMeter = function(percent, wait){
                        Dom.setStyle(elem, 'width', (wait ? Math.min(95, percent) : percent) + '%');
                    },
                    tick = function(){
                        var now = new Date().getTime(),
                            elapsed = now - startTime;

                        if (elapsed >= time){
                            setMeter(100, true);
                            return;
                        }

                        setMeter((elapsed / time) * 100, true);
                        timeoutHandle = setTimeout(tick, 25);
                    }

                if (!dontStart){
                    start();
                }
                return {
                    start: start,
                    finish: finish
                }
            },
            loadImages: function(images, callback, progressFn){
                var called = false;
                if (!document.images){
                    callback(false);
                    return null;
                }

                setTimeout(function(){
                    if (!called){
                        callback(true);
                    }
                    called = true;
                }, 12000);

                var nrTotal = images.length,
                    nrDone = 0,
                    i, img,
                    result = [],
                    done = function(){
                        nrDone += 1;
                        if (progressFn){
                            try{
                                progressFn(nrDone, (nrDone/nrTotal)*100);
                            }catch(e){}
                        }
                        if (nrDone >= nrTotal){
                            if (!called){
                                callback(true);
                                called = true;
                            }
                        }
                    },
                    imgErr = function(){
                        if (!called){
                            callback(false);
                        }
                        called = true;
                    };

                for(i = 0 ; i < nrTotal; i += 1){
                    img = new Image();
                    img.onload = done;
                    img.onerror = imgErr;
                    img.src = images[i];
                    result.push(img);
                }

                return result;
            },
            getServerTime: function(){
                var offset = (window.ZAPNET_SERVER_TIME - window.ZAPNET_LOCAL_TIME) || 0;
                var ms = new Date().getTime();
                var now = Math.round(ms / 1000) + offset;
                return now;
            },
            Clock: function(el, fn){
                if (!el){
                    return;
                }
                var offset = (window.ZAPNET_SERVER_TIME - window.ZAPNET_LOCAL_TIME) || 0,
                    timeInterval = null,

                setTime = function(){
                    var ms = new Date().getTime();
                    var now = Math.round(ms / 1000) + offset;
                    el.innerHTML = fn ? fn(now) : $P.date('H:i:s', now);
                };

                timeInterval = setInterval(setTime, 300);

                return {
                    setOffset: function(os){
                        offset = os;
                    },
                    stop: function(){
                        if (timeInterval){
                            clearInterval(timeInterval);
                            timeInterval = null;
                        }
                    },
                    start: function(){
                        if (timeInterval){
                            return;
                        }
                        timeInterval = setInterval(setTime, 300);
                    }
                };
            },
            Timer: function(els){

                var offset = (window.ZAPNET_SERVER_TIME - window.ZAPNET_LOCAL_TIME) || 0,
                    timeInterval = null,

                setTime = function(){
                    var now = Math.round(new Date() / 1000) + offset;
                    ZAPNET.util.foreach(els, function(el){
                        if (Dom.hasClass(el, 'clock')){
                            el.innerHTML = $P.date('H:i:s', now);
                            return;
                        }
                        var secondsAttr = Dom.getAttribute(el, 'seconds'),
                            target = secondsAttr ? parseInt(secondsAttr) : 0,
                            left = target - now,
                            hours = parseInt(left / 3600),
                            mins = parseInt((left % 3600) / 60),
                            seconds = parseInt(left % 60);

                        if (!target){
                            el.innerHTML = '';
                            return;
                        }
                        if (left <= 0){
                            el.innerHTML = '00:00';
                        } else {
                            el.innerHTML = (hours > 0 ? ZAPNET.util.timePad(hours) + ':' : '') + ZAPNET.util.timePad(mins) + ':' + ZAPNET.util.timePad(seconds);
                        }
                    });
                };

                els = YAHOO.lang.isArray(els) ? els : [els];
                timeInterval = setInterval(setTime, 300);

                return {
                    setOffset: function(os){
                        offset = os;
                    },
                    stop: function(){
                        if (timeInterval){
                            clearInterval(timeInterval);
                            timeInterval = null;
                        }
                    },
                    start: function(){
                        if (timeInterval){
                            return;
                        }
                        timeInterval = setInterval(setTime, 300);
                    }
                }
            },
            setFunds: function(funds){
                var fundswrapper = $('#user .funds-wrapper', null, true);
                var fundspanel = Dom.get('funds-panel');
                if (!YAHOO.lang.isUndefined(funds.balance)){
                    $('.balance', fundspanel, true).innerHTML = ZAPNET_CONSTANTS.CURRENCY + ZAPNET.util.formatAmountCents(funds.balance);
                }
                if (!YAHOO.lang.isUndefined(funds.exposure)){
                    $('.exposure', fundspanel, true).innerHTML = ZAPNET_CONSTANTS.CURRENCY + ZAPNET.util.formatAmountCents(funds.exposure);
                }
                if (!YAHOO.lang.isUndefined(funds.available)){
                    $('.available', fundspanel, true).innerHTML = ZAPNET_CONSTANTS.CURRENCY + ZAPNET.util.formatAmountCents(funds.available);
                }
                if (!YAHOO.lang.isUndefined(funds.funds)){
                    $('.funds', fundswrapper, true).innerHTML = funds.funds;
                }
            },
            getRowColspan: function(tr){
                var cells = tr.cells;
                var colspan = 0;
                var i, cell;
                for(i = 0; i < cells.length; i+= 1){
                    cell = cells[i];
                    colspan += cell.colSpan;
                };
                return colspan;
            },
            getColspan: function(table){
                if (!table.rows.length){
                    return 0;
                }
                return this.getRowColspan(table.rows[0]);
            },
            t: function(str){
                if (!window.ZAPNET_TRANSLATIONS || !window.ZAPNET_LOCALE || !ZAPNET_TRANSLATIONS[ZAPNET_LOCALE]){
                    return str;
                }
                if (!ZAPNET_TRANSLATIONS[ZAPNET_LOCALE][str]){
                    return str;
                }
                return ZAPNET_TRANSLATIONS[ZAPNET_LOCALE][str];
            },
            filterAccents: function(text){
                text = text.replace(/Ά/g, 'Α');
                text = text.replace(/Έ/g, 'Ε');
                text = text.replace(/Ό/g, 'Ο');
                text = text.replace(/Ύ/g, 'Υ');
                text = text.replace(/Ί/g, 'Ι');
                text = text.replace(/Ή/g, 'Η');
                text = text.replace(/Ώ/g, 'Ω');
                return text;
            },
            uppercase: function(str){
                return this.filterAccents(str.toUpperCase());
            },
            translatePage: function(el){
                var texts = $('.translate', el);
                var i, text, ot;
                for(i = 0; i < texts.length; i += 1){
                    text = texts[i];
                    ot = Dom.getAttribute(text, 'ot');
                    if (!ot){
                        ot = text.innerHTML;
                        Dom.setAttribute(text, 'ot', ot);
                    }
                    text.innerHTML = ZAPNET.util.t(ot);
                }
            },
            print: function(){
                if (window.jsPrintSetup){
                    var jsprint = window.jsPrintSetup;
                    jsprint.setOption('orientation', jsprint.kPortraitOrientation);
                    jsprint.setOption('marginTop', 0);
                    jsprint.setOption('marginBottom', 0);
                    jsprint.setOption('marginLeft', 0);
                    jsprint.setOption('marginRight', 0);
                    jsprint.setOption('headerStrLeft', '');
                    jsprint.setOption('headerStrCenter', '');
                    jsprint.setOption('headerStrRight', '');
                    jsprint.setOption('footerStrLeft', '');
                    jsprint.setOption('footerStrCenter', '');
                    jsprint.setOption('footerStrRight', '');
                    jsprint.setOption('printBGColors', 1);
                    jsprint.setOption('printBGImages', 1);
                    jsprint.setSilentPrint(true);
                    jsprint.print();
                    jsprint.setSilentPrint(false);
                } else {
                    window.print();
                }
            },
            checkIfClient : function(){
                var s = navigator.userAgent;
                if (s.indexOf("BetomallCashier")!= -1){
                    return true;
                } else {
                    return false;
                }
            },
            execScripts: function(bodyEl){
                function nodeName(elem, name) {
                    return elem.nodeName && elem.nodeName.toUpperCase() ===
                            name.toUpperCase();
                }
                ;

                function evalScript(elem) {
                    var data = (elem.text || elem.textContent || elem.innerHTML || ""),
                            head = document.getElementsByTagName("head")[0] ||
                            document.documentElement,
                            script = document.createElement("script");

                    script.type = "text/javascript";
                    try {
                        // doesn't work on ie...
                        script.appendChild(document.createTextNode(data));
                    } catch (e) {
                        // IE has funky script nodes
                        script.text = data;
                    }

                    head.insertBefore(script, head.firstChild);
                    head.removeChild(script);
                }
                ;

                // main section of function
                var scripts = [],
                        script,
                        children_nodes = bodyEl.childNodes,
                        child,
                        i;

                for (i = 0; children_nodes[i]; i++) {
                    child = children_nodes[i];
                    if (nodeName(child, "script") &&
                            (!child.type || child.type.toLowerCase() === "text/javascript")) {
                        scripts.push(child);
                    }
                }

                for (i = 0; scripts[i]; i++) {
                    script = scripts[i];
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                    evalScript(scripts[i]);
                }
            },

            parseUrl: function(query) {
                var vars = query.split("&");
                var query_string = {};
                for (var i = 0; i < vars.length; i++) {
                    var pair = vars[i].split("=");
                    var key = decodeURIComponent(pair[0]);
                    var value = decodeURIComponent(pair[1]);
                    if (typeof query_string[key] === "undefined") {
                        query_string[key] = decodeURIComponent(value);
                    } else if (typeof query_string[key] === "string") {
                        var arr = [query_string[key], decodeURIComponent(value)];
                        query_string[key] = arr;
                        // If third or later entry with this name
                    } else {
                        query_string[key].push(decodeURIComponent(value));
                    }
                }
                return query_string;
            },
            checkCookiePolicy: function(){
                if (!window.ZAPNET_COOKIE_POLICY){
                    return;
                }
                if (YAHOO.util.Cookie.get("WEBSITE-COOKIE-POLICY")){
                    return;
                }
                var cookieAcceptEl = this.div('cookie-policy-accept', this.t('Accept'));
                var cookieCloseEl = this.div('cookie-policy-close', 'X');
                var cookieMessageEl = this.div('cookie-policy-message', this.t(window.ZAPNET_COOKIE_POLICY));
                var cookieEl = this.div('cookie-policy');
                cookieEl.appendChild(cookieCloseEl);
                cookieEl.appendChild(cookieAcceptEl);
                cookieEl.appendChild(cookieMessageEl);
                document.body.appendChild(cookieEl);
                Event.on(cookieAcceptEl, 'click', function(){
                    YAHOO.util.Cookie.set("WEBSITE-COOKIE-POLICY", 'COOKIE-POLICY-ACCEPTED', {
                        path: "/",
                        expires: new Date("January 12, 2045")
                    });
                    cookieEl.parentNode.removeChild(cookieEl);
                });
                Event.on(cookieCloseEl, 'click', function(){
                    cookieEl.parentNode.removeChild(cookieEl);
                });
            }
        }
    };
    if (window.ZAPNET){
        window.BM.util.merge(window.ZAPNET, window.BM);
    } else {
        window.ZAPNET = window.BM;
    }
    window.STATHIS = {};
    ZAPNET.U = {
        E: YAHOO.util.Event,
        D: YAHOO.util.Dom,
        U: ZAPNET.util,
        $: YAHOO.util.Selector.query
    };
    ZAPNET.smileys = [
        ':)',
        ':D',
        ';)',
        ':-O',
        ':P',
        ':(',
        ':S',
        ':$',
        ':|',
        ':@',
        ':-#',
        '8o|',
        '8-|',
        '^o)'
    ];

    ZAPNET.CACHE = function(){
        var cache = {},
            checkInterval = null,

        expire = function(){
            var id;
            var now = new Date().getTime();
            var item;
            for(id in cache){
                if (cache.hasOwnProperty(id)){
                    item = cache[id];
                    if (now > item.expire){
                        delete cache[id];
                    }
                }
            }
        },

        save = function(id, data, lifetime){
            cache[id] = {
                data: data,
                lifetime: lifetime,
                expire: new Date().getTime() + (lifetime * 1000)
            };
            if (!checkInterval){
                checkInterval = setInterval(expire, 60000);
            }
        },

        load = function(id){
            if (!cache[id]){
                return false;
            }
            var item = cache[id];
            if (item.expire < new Date().getTime()){
                return false;
            }

            return item.data;
        };

        return {
            save: save,
            load: load
        };
    }();

    var generalFormSetup = function(){
        var forms = $('#content form');
        if (forms.length){
            Event.on(forms, 'click', function(e){
                var el = Event.getTarget(e);
                if (Dom.hasClass(el, 'selectall') || Dom.hasClass(el, 'clearall')){
                    if (Dom.hasClass(el, 'selectall')){
                        BM.util.formSelectAll(el);
                    } else {
                        BM.util.formClearAll(el);
                    }
                    Event.stopEvent(e);
                }
            });
        }
    };

    var reportSetup = function(){
        var tr = $('tr[href]', null, true);
        if (tr){
            var table = Dom.getAncestorByTagName(tr, 'table');
            Event.on(table, 'mouseover', function(e){
                var el = Event.getTarget(e);
                var tr = el.tagName.toLowerCase() == 'tr' ? el : Dom.getAncestorByTagName(el, 'tr');
                if (Dom.getAttribute(tr, 'href')){
                    Dom.addClass(tr, 'highlight');
                }
            });
            Event.on(table, 'mouseout', function(e){
                var el = Event.getTarget(e);
                var tr = el.tagName.toLowerCase() == 'tr' ? el : Dom.getAncestorByTagName(el, 'tr');
                Dom.removeClass(tr, 'highlight');
            });
            Event.on(table, 'click', function(e){
                var el = Event.getTarget(e);
                if (el.tagName.toLowerCase() == 'a'){
                    return;
                }
                var tr = el.tagName.toLowerCase() == 'tr' ? el : Dom.getAncestorByTagName(el, 'tr');
                var href = Dom.getAttribute(tr, 'href');
                if (!href){
                    return;
                }
                window.location.href = href;
            });
        }

        var descrtables = $('#content table.mybets');
        if (descrtables.length){
            Event.on(descrtables, 'click', function(e){
                var el = Event.getTarget(e);
                if (el.tagName.toLowerCase() == 'td' && Dom.hasClass(el, 'descr')){
                    var title = Dom.getAttribute(el, 'title');
                    if (title){
                        alert(title);
                    }
                }
            })
        }

    };

    ZAPNET.init = {};

    ZAPNET.util.sortTable = function(){
        var europeandate = true;
        var alternate_row_colors = true;
        var alternate_function = alternate;

        var SORT_COLUMN_INDEX;
        var thead = false;
        var sortAsc = false;
        var sortColumns = {};
        var lastSort = null;

        var ts_makeSortable = function(t, alternateFn) {
            var firstRow;
            if (t.rows && t.rows.length > 0) {
                if (t.tHead && t.tHead.rows.length > 0) {
                    firstRow = t.tHead.rows[t.tHead.rows.length-1];
                    thead = true;
                } else {
                    firstRow = t.rows[0];
                }
            }
            if (!firstRow) return;

            // We have a first row: assume it's the header, and make its contents clickable links
            for (var i=0;i<firstRow.cells.length;i++) {
                var cell = firstRow.cells[i];
                var txt = ts_getInnerText(cell);
                if (Dom.hasClass(cell, 'sortable')) {
                    var ci = Dom.getAttribute(cell, 'ci');
                    var xfn = function(rcell, gi){
                        var a = ZAPNET.util.elem('a', 'sortheader', txt+'<span class="sortarrow">&nbsp;&nbsp;&#9670;</span>', {attrs: {href: '#'}});
                        Event.on(a, 'click', function(e){
                            ts_resortTable(a, gi);
                            Event.preventDefault(e);
                        });
                        rcell.innerHTML = '';
                        rcell.appendChild(a);
                        sortColumns[gi] = a;
                    };
                    xfn(cell, ci ? ci : i);
                }
            }
            if (alternateFn){
                alternate_function = alternateFn;
            }
            if (alternate_row_colors) {
                alternate_function(t);
            }
        }

        function ts_getInnerText(el) {
            if (typeof el == "string") return el;
            if (typeof el == "undefined") {
                return el;
            }
            if (el.innerText) return el.innerText;	//Not needed but it is faster
            var str = "";

            var cs = el.childNodes;
            var l = cs.length;
            for (var i = 0; i < l; i++) {
                switch (cs[i].nodeType) {
                    case 1: //ELEMENT_NODE
                        str += ts_getInnerText(cs[i]);
                        break;
                    case 3:	//TEXT_NODE
                        str += cs[i].nodeValue;
                        break;
                }
            }
            return str;
        }

        function ts_resortTable(lnk, clid, samedir, dir) {
            var span, ci;
            for (ci = 0; ci < lnk.childNodes.length; ci++) {
                if (lnk.childNodes[ci].tagName && lnk.childNodes[ci].tagName.toLowerCase() == 'span') span = lnk.childNodes[ci];
            }
            var spantext = ts_getInnerText(span);
            var td = lnk.parentNode;
            var column = clid || td.cellIndex;
            var t = getParent(td,'TABLE');

            // Work out a type for the column
            if (t.rows.length <= 1) return;
            var textSort = Dom.hasClass(td, 'text-sort');
            var numericSort = Dom.hasClass(td, 'numeric-sort');
            var itm = "";
            var i = 0, k, j, sortfn;
            if (numericSort){
                sortfn = ts_sort_numeric;
            } else if (textSort){
                sortfn = ts_sort_caseinsensitive;
            } else {
                while (itm == "" && i < t.tBodies[0].rows.length) {
                    itm = ts_getInnerText(t.tBodies[0].rows[i].cells[column]);
                    itm = trim(itm);
                    if (itm.substr(0,4) == "<!--" || itm.length == 0) {
                        itm = "";
                    }
                    i++;
                }
                if (itm == "") return;
                sortfn = ts_sort_caseinsensitive;
                if (itm.match(/^\d\d[\/\.-][a-zA-z][a-zA-Z][a-zA-Z][\/\.-]\d\d\d\d$/)) {
                    sortfn = ts_sort_date;
                } else if (itm.match(/^\d\d[\/\.-]\d\d[\/\.-]\d\d\d{2}?$/)) {
                    sortfn = ts_sort_date;
                } else if (itm.match(/^-?[£$€Û¢´][,.\d]/)) {
                    sortfn = ts_sort_numeric;
                } else if (itm.match(/^-?(\d+[,\.]?)+(E[-+][\d]+)?%?$/)) {
                    sortfn = ts_sort_numeric;
                }
            }

            SORT_COLUMN_INDEX = column;
            var firstRow = new Array();
            var newRows = new Array();
            for (k=0;k<t.tBodies.length;k++) {
                for (i=0;i<t.tBodies[k].rows[0].length;i++) {
                    firstRow[i] = t.tBodies[k].rows[0][i];
                }
            }
            for (k=0;k<t.tBodies.length;k++) {
                if (!thead) {
                    // Skip the first row
                    for (j=1;j<t.tBodies[k].rows.length;j++) {
                        newRows[j-1] = t.tBodies[k].rows[j];
                    }
                } else {
                    // Do NOT skip the first row
                    for (j=0;j<t.tBodies[k].rows.length;j++) {
                        newRows[j] = t.tBodies[k].rows[j];
                    }
                }
            }
            if (samedir) {
                sortAsc = span.getAttribute("sortdir") == 'down' ? true : false;
                newRows.sort(sortfn);
                if (span.getAttribute("sortdir") == 'up') {
                    newRows.reverse();
                }
            } else {
                var newdir = dir ? dir : (span.getAttribute("sortdir") == 'down' ? 'up' : 'down');
                sortAsc = newdir == 'up' ? false : true;
                newRows.sort(sortfn);
                if (newdir == 'up') {
                    ARROW = '&nbsp;&nbsp;&#9660;';
                    newRows.reverse();
                    span.setAttribute('sortdir','up');
                } else {
                    ARROW = '&nbsp;&nbsp;&#9650;';
                    span.setAttribute('sortdir','down');
                }
            }
            // We appendChild rows that already exist to the tbody, so it moves them rather than creating new ones
            // don't do sortbottom rows
            for (i=0; i<newRows.length; i++) {
                if (!newRows[i].className || (newRows[i].className && (newRows[i].className.indexOf('sortbottom') == -1))) {
                    t.tBodies[0].appendChild(newRows[i]);
                }
            }
            // do sortbottom rows only
            for (i=0; i<newRows.length; i++) {
                if (newRows[i].className && (newRows[i].className.indexOf('sortbottom') != -1))
                    t.tBodies[0].appendChild(newRows[i]);
            }
            // Delete any other arrows there may be showing
            var allspans = document.getElementsByTagName("span");
            for (ci = 0 ; ci<allspans.length ; ci++) {
                if (allspans[ci].className == 'sortarrow') {
                    if (getParent(allspans[ci],"table") == getParent(lnk,"table")) { // in the same table as us?
                        allspans[ci].innerHTML = '&nbsp;&nbsp;&#9670;';
                    }
                }
            }
            span.innerHTML = ARROW;
            alternate_function(t);

            lastSort = {
                lnk: lnk,
                clid: clid
            };
        }

        function reSort(){
            if (!lastSort){
                return;
            }

            ts_resortTable(lastSort.lnk, lastSort.clid, true);
        }

        function sortColumn(ci, dir){
            ts_resortTable(sortColumns[ci], ci, false, dir);
        }

        function getParent(el, pTagName) {
            if (el == null) {
                return null;
            } else if (el.nodeType == 1 && el.tagName.toLowerCase() == pTagName.toLowerCase()) {
                return el;
            } else {
                return getParent(el.parentNode, pTagName);
            }
        }

        function sort_date(date) {
            // y2k notes: two digit years less than 50 are treated as 20XX, greater than 50 are treated as 19XX
            var dt = "00000000", mtstr, mt, yr;
            if (date.length == 11) {
                mtstr = date.substr(3,3);
                mtstr = mtstr.toLowerCase();
                switch(mtstr) {
                    case "jan":
                        mt = "01";
                        break;
                    case "feb":
                        mt = "02";
                        break;
                    case "mar":
                        mt = "03";
                        break;
                    case "apr":
                        mt = "04";
                        break;
                    case "may":
                        mt = "05";
                        break;
                    case "jun":
                        mt = "06";
                        break;
                    case "jul":
                        mt = "07";
                        break;
                    case "aug":
                        mt = "08";
                        break;
                    case "sep":
                        mt = "09";
                        break;
                    case "oct":
                        mt = "10";
                        break;
                    case "nov":
                        mt = "11";
                        break;
                    case "dec":
                        mt = "12";
                        break;
                // default: var mt = "00";
                }
                dt = date.substr(7,4)+mt+date.substr(0,2);
                return dt;
            } else if (date.length == 10) {
                if (europeandate == false) {
                    dt = date.substr(6,4)+date.substr(0,2)+date.substr(3,2);
                    return dt;
                } else {
                    dt = date.substr(6,4)+date.substr(3,2)+date.substr(0,2);
                    return dt;
                }
            } else if (date.length == 8) {
                yr = date.substr(6,2);
                if (parseInt(yr) < 50) {
                    yr = '20'+yr;
                } else {
                    yr = '19'+yr;
                }
                if (europeandate == true) {
                    dt = yr+date.substr(3,2)+date.substr(0,2);
                    return dt;
                } else {
                    dt = yr+date.substr(0,2)+date.substr(3,2);
                    return dt;
                }
            }
            return dt;
        }

        var ts_sort_date = function(a,b) {
            var dt1 = sort_date(ts_getInnerText(a.cells[SORT_COLUMN_INDEX]));
            var dt2 = sort_date(ts_getInnerText(b.cells[SORT_COLUMN_INDEX]));

            if (dt1==dt2) {
                return 0;
            }
            if (dt1<dt2) {
                return -1;
            }
            return 1;
        }
        var ts_sort_numeric = function(a,b) {
            var aa = ts_getInnerText(a.cells[SORT_COLUMN_INDEX]);
            aa = clean_num(aa);
            var bb = ts_getInnerText(b.cells[SORT_COLUMN_INDEX]);
            bb = clean_num(bb);
            return compare_numeric(aa,bb);
        }
        var compare_numeric = function(a,b) {
            a = parseFloat(a);
            a = (isNaN(a) ? 0 : a);
            b = parseFloat(b);
            b = (isNaN(b) ? 0 : b);
            return a - b;
        }
        var ts_sort_caseinsensitive = function(a,b) {
            var caa = a.cells[SORT_COLUMN_INDEX];
            var cbb = b.cells[SORT_COLUMN_INDEX];
            var saa = Dom.getAttribute(caa, 'sid');
            var sbb = Dom.getAttribute(cbb, 'sid');
            var aa, bb;
            if (saa && sbb){
                aa = saa;
                bb = sbb;
            } else {
                aa = ts_getInnerText(caa).toLowerCase();
                bb = ts_getInnerText(cbb).toLowerCase();
            }
            if (aa==bb) {
                return 0;
            }
            if (aa == '-'){
                return sortAsc ? 1 : -1;
            }
            if (bb == '-'){
                return sortAsc ? -1 : 1;
            }
            if (aa<bb) {
                return -1;
            }
            return 1;
        }
        var ts_sort_default = function(a,b) {
            var aa = ts_getInnerText(a.cells[SORT_COLUMN_INDEX]);
            var bb = ts_getInnerText(b.cells[SORT_COLUMN_INDEX]);
            if (aa==bb) {
                return 0;
            }
            if (aa<bb) {
                return -1;
            }
            return 1;
        }
        function clean_num(str) {
            str = str.replace(new RegExp(/[^-?0-9.]/g),"");
            return str;
        }
        function trim(s) {
            return s.replace(/^\s+|\s+$/g, "");
        }
        function alternate(table) {
            // Take object table and get all it's tbodies.
            var tableBodies = table.getElementsByTagName("tbody");
            // Loop through these tbodies
            for (var i = 0; i < tableBodies.length; i++) {
                // Take the tbody, and get all it's rows
                var tableRows = tableBodies[i].getElementsByTagName("tr");
                // Loop through these rows
                // Start at 1 because we want to leave the heading row untouched
                for (var j = 0; j < tableRows.length; j++) {
                    // Check if j is even, and apply classes for both possible results
                    if ( (j % 2) == 0  ) {
                        Dom.replaceClass(tableRows[j], 'r1', 'r0');
                    } else {
                        Dom.replaceClass(tableRows[j], 'r0', 'r1');
                    }
                }
            }
        }

        return {
            sort: ts_makeSortable,
            sortColumn: sortColumn,
            reSort: reSort
        };
    }();

    if (YAHOO.util.Cookie.get('btid')){
        YAHOO.util.Cookie.set("TERMINALID", YAHOO.util.Cookie.get('btid'), {
            path: "/",
            domain: window.ZAPNET_SERVER_NAME,
            expires: new Date("January 12, 2045")
        });
        YAHOO.util.Cookie.remove("btid", {
            path: "/",
            domain: window.ZAPNET_SERVER_NAME
        });
        if (YAHOO.util.Cookie.get('stid')){
            YAHOO.util.Cookie.remove("stid", {
                path: "/",
                domain: window.ZAPNET_SERVER_NAME
            });
        }
    } else if (YAHOO.util.Cookie.get('stid')){
        YAHOO.util.Cookie.set("TERMINALID", YAHOO.util.Cookie.get('stid'), {
            path: "/",
            domain: window.ZAPNET_SERVER_NAME,
            expires: new Date("January 12, 2045")
        });
        YAHOO.util.Cookie.remove("stid", {
            path: "/",
            domain: window.ZAPNET_SERVER_NAME
        });
    }


})();
