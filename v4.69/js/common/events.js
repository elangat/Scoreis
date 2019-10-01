(function(){
    var Event = YAHOO.util.Event,
        Dom = YAHOO.util.Dom,
        $ = YAHOO.util.Selector.query,
        Util = ZAPNET.util;

    ZAPNET_CHANNEL_UPDATE_RESPONSE_WAIT = 4250;
    ZAPNET_CHANNEL_UPDATE_CONNECT_WAIT = 4500;

    ZAPNET.UPDATE_NODE_URL = ZAPNET_CONSTANTS.URL_PREFIX + '/events/get.js';
    ZAPNET.UPDATE_BACKUP_URL = ZAPNET_CONSTANTS.URL_PREFIX + '/events/get.js';

    ZAPNET.Events = function(){
        var id = 0,
            dataEvent = new YAHOO.util.CustomEvent('Data event', this, false, YAHOO.util.CustomEvent.FLAT),
            startEvent = new YAHOO.util.CustomEvent('Start event', this, false, YAHOO.util.CustomEvent.FLAT),
            eventsProcessed = new YAHOO.util.CustomEvent('Events Processed', this, false, YAHOO.util.CustomEvent.FLAT),
            eventSubscribers = [],
            eventParams = '',
            currentConnection,
            busy = false,
            lastResponseTime = 0,
            lastConnectionTime = 0,
            currentRequest = null,
            eventProducts = {},
            updateUrl = null,
            paused = false,
            connectionBatch = [],
            extraUpdateParams = {},
            filterParams = {},
            mutedProducts = {},
            betMarketList = [],
            betSelectionList = [],
            eventsStarted = false,
            tickInterval = null,
            lastConnectionError = 0,
            events = [],
            counter = 0,
            tickCount = 0,

        reloadPage = function(error){
            cancelConnection();
            if (error){
                Util.error(error);
            }
            window.location.reload();
        },

        cancelConnection = function(){
            if (currentConnection === null){
                return;
            }
            YAHOO.util.Connect.abort(currentConnection, {
                success: function(){},
                failure: function(){}
            }, false);
            currentConnection = null;
            busy = false;
        },

        connectionComplete = function(){
            currentConnection = null;
            lastResponseTime = new Date().getTime();
        },

        connect = function(request){
            request.cb = request.cb ? request.cb : {};
            var successFn = request.cb.success ? request.cb.success : null;
            var failureFn = request.cb.failure ? request.cb.failure : null;
            cancelConnection();
            lastConnectionTime = new Date();
            currentRequest = request;
            if (!request.cb.argument){
                request.cb.argument = {};
            }
            request.cb.argument.request = request;
            request.cb.success = function(o){
                connectionComplete();
                if (successFn){
                    successFn(o);
                }
            }
            request.cb.failure = function(o){
                connectionComplete();
                if (failureFn){
                    failureFn(o);
                }
            }
            request.cb.customevents = {
                onAbort: function(){
                    connectionComplete();
                },
                onComplete: function(){
                    connectionComplete();
                }
            };
            currentConnection = YAHOO.util.Connect.asyncRequest(request.method, request.url, request.cb, request.data);
        },

        batchConnect = function(type, method, url, cb, data){
            connectionBatch.push({
                type: type,
                method: method,
                url: url,
                cb: cb,
                data: data ? data : null
            });
            tick();
        },

        processEvent = function(event){
            id = event.id;
            ZAPNET_LAST_ODDS_EVENT_ID_RECEIVED = id;

            var i, subscr;
            for(i = 0; i < eventSubscribers.length; i += 1){
                subscr = eventSubscribers[i];
                if (event.p == subscr.product){
                    try{
                        subscr.fn(event);
                    } catch(e){
                        console.log(e);
                    }
                }
            }
        },

        foregroundEvents = function(){
            var event;
            while(events.length){
                event = events.shift();
                try {
                    processEvent(event);
                } catch(e){
                    console.log(e);
                }
                if (!events.length){
                    eventsProcessed.fire();
                }
            }
        },

        backgroundEvents = function(){
            var event;
            if(events.length){
                event = events.shift();
                try {
                    processEvent(event);
                } catch(e){
                    console.log(e);
                }
                if (events.length){
                    var t1 = new Date().getTime();
                    setTimeout(function(){
                        var t2 = new Date().getTime();
                        if (t2 - t1 > 500){
                            foregroundEvents();
                        } else {
                            backgroundEvents();
                        }
                    }, 1);
                } else {
                    eventsProcessed.fire();
                }
            }
        },

        processEvents = function(response){
            if (response.events && response.events.length){
                if (events.length){
                    events = events.concat(response.events);
                } else {
                    events = response.events;
                }
                id = response.events[response.events.length - 1].id;

                if (events.length <= 5){
                    foregroundEvents();
                } else {
                    backgroundEvents();
                }
            }
            dataEvent.fire(response);
        },

        setEvents = function(evs){
            var response = {};
            response.events = evs;
            processEvents(response);
        },

        connectResponse = function(o){
            currentConnection = null;
            currentRequest = null;
            lastResponseTime = new Date();
            busy = true;
            try{
                var response;
                try{
                    response = eval('(' + o.responseText + ')');
                } catch (e){
                    Util.error('Error: ' + e.message + ' - ' + Util.dump(e));
                }
                var errorCb = o.argument.errorCb ? o.argument.errorCb : null;
                if (response.error){
                    var msg = (response.error == 'nologin' || response.error == 'login') ? null : 'Error from server: ' + response.error;
                    reloadPage(msg);
                    return;
                }
                if (response.timer){
                    if (window.ZAPNET_MOBILE_AGENT){
                        ZAPNET_CHANNEL_UPDATE_RESPONSE_WAIT = +response.timer + 4000;
                        ZAPNET_CHANNEL_UPDATE_CONNECT_WAIT = +response.timer + 5000;
                    } else {
                        ZAPNET_CHANNEL_UPDATE_RESPONSE_WAIT = +response.timer;
                        ZAPNET_CHANNEL_UPDATE_CONNECT_WAIT = +response.timer + 1000;
                    }
                }
                if (!eventsStarted){
                    startEvent.fire();
                    eventsStarted = true;
                }
                if (response.events && !response.events.length){
                    eventsProcessed.fire();
                }
                processEvents(response);
            } catch (e){
                console.log(e)
            }
            busy = false;
        },

        connectError = function(o){
            currentConnection = null;
            currentRequest = null;
            lastResponseTime = new Date();

            if (o.argument.request.method == 'POST'){
                reloadPage(Util.t('Error in connection for command: ') + o.responseText);
                return;
            }

            var url = o.argument.request.url;
            var qpos = url.indexOf('?');
            if (qpos > 0){
                url = url.substring(0, qpos);
            }
            if (url == updateUrl && url == ZAPNET.UPDATE_NODE_URL){
                updateUrl = ZAPNET.UPDATE_BACKUP_URL;
                setTimeout(function(){
                    updateUrl = ZAPNET.UPDATE_NODE_URL;
                }, 120000);
            }
        },

        update = function(){
            var params = ['id=' + id];
            Util.foreach(extraUpdateParams, function(value, name){
                params.push(name + '=' + value);
            });
            Util.foreach(filterParams, function(value, name){
                params.push(name + '=' + value);
            });
            if (betMarketList && betMarketList.length){
                params.push('b=' + betMarketList.join(','));
            }
            var url = updateUrl + (updateUrl.indexOf('?') > 0 ? '&' : '?') +
                    params.join('&') +
                    (eventParams ? '&' + eventParams : '') +
                    '&c=' + counter++;
            var cb = {
                success: connectResponse,
                failure: connectError,
                cache: false,
                timeout: 45000
            }
            batchConnect('update', 'GET', url, cb);
        },

        action = function(data, onerror){
            var params = ['id=' + id];
            if (!params.length){
                return;
            }
            var url = '/connect.php?' + params.join('&') + '&c=' + counter++;
            var cb = {
                success: connectResponse,
                failure: connectError,
                cache: false,
                timeout: 45000
            }
            if (onerror){
                cb.argument = {
                    errorCb: onerror
                };
            }
            batchConnect('action', 'POST', url, cb, data);
        },

        tick = function(){
            if (!eventSubscribers.length){
                return;
            }
            if (events.length){
                return;
            }
            var request, now = new Date();
            if (paused){
                return;
            }
            if (lastConnectionTime && now - lastConnectionTime > 60000){
                if (!lastConnectionError || now - lastConnectionError > 60000){
                    lastConnectionError = new Date();
                    cancelConnection();
                    Util.error('Late Updates');
                }
            }
            tickCount ++;
            if (busy){
                if (lastConnectionTime){
                    return;
                }
            }
            if (!currentConnection){
                if (!connectionBatch.length){
                    if (!lastResponseTime || (now - lastResponseTime > ZAPNET_CHANNEL_UPDATE_RESPONSE_WAIT) && (now - lastConnectionTime > ZAPNET_CHANNEL_UPDATE_CONNECT_WAIT)){
                        update();
                    }
                } else {
                    request = connectionBatch.shift();
                    connect(request);
                }
                return;
            }
            if (!connectionBatch.length || !currentRequest){
                return;
            }

            if (currentRequest.type == 'update'){
                request = connectionBatch.shift();
                connect(request);
            }
        },

        setLastEvent = function(eId){
            id = eId;
        },

        getLastEventId = function(){
            return id;
        },

        start = function(){
            if (tickInterval){
                return;
            }
            updateUrl = ZAPNET.UPDATE_NODE_URL;
            Event.on(window, 'beforeunload', cancelConnection);
            if (!id){
                id = window.ZAPNET_BET_DATA && ZAPNET_BET_DATA.last_event_id ? ZAPNET_BET_DATA.last_event_id : 0;
            }
            if (window.ZAPNET_MOBILE_AGENT){
                ZAPNET_CHANNEL_UPDATE_RESPONSE_WAIT = 6000;
                ZAPNET_CHANNEL_UPDATE_CONNECT_WAIT = 7000;
            }
            tickInterval = setInterval(tick, 1000);
            tick();
        },

        pause = function(){
            paused = true;
        },

        play = function(){
            lastConnectionTime = 0;
            lastResponseTime = 0;
            paused = false;
        },

        mute = function(product){
            mutedProducts[product] = true;
            buildUpdateParams();
        },

        unmute = function(product){
            if (mutedProducts[product]){
                delete mutedProducts[product];
            }
            buildUpdateParams();
        },

        isActive = function(){
            return !paused;
        },

        isProductSubscribed = function(pr){
            return !!eventProducts[pr];
        },

        buildUpdateParams = function(){
            eventProducts = {};
            var products = [];
            var i, subscr;
            for(i = 0; i < eventSubscribers.length ; i += 1){
                subscr = eventSubscribers[i];
                eventProducts[subscr.product] = subscr.product;
                if (!Util.inArray(subscr.product, products) && !mutedProducts[subscr.product]){
                    products.push(subscr.product);
                }
            }
            if (products.length){
                eventParams = 'p=' + products.join(',');
            } else {
                eventParams = '';
            }
        },

        setParam = function(name, value){
            extraUpdateParams[name] = value;
        },

        setFilterParams = function(params){
            filterParams = params;
        },

        setBetList = function(m, s){
            betMarketList = m;
            betSelectionList = s;
        },

        getBetList = function(){
            return betSelectionList;
        },

        subscribe = function(eventFn, product, tags, section){
            unsubscribe(eventFn, product);
            eventSubscribers.push({
                product: product || false,
                tags: tags || false,
                section: section || false,
                fn: eventFn
            });
            buildUpdateParams();
            setTimeout(start, 1);
        },

        unsubscribe = function(eventFn, product){
            var i;
            for(i = 0; i < eventSubscribers.length; i += 1){
                var sub = eventSubscribers[i];
                if (sub.fn === eventFn && (!product || sub.product == product)){
                    eventSubscribers.splice(i, 1);
                    return;
                }
            }
            buildUpdateParams();
        },

        setUrl = function(url, bUrl){
            ZAPNET.UPDATE_NODE_URL = url;
            ZAPNET.UPDATE_BACKUP_URL = bUrl ? bUrl : url;
        };

        return {
            pause: pause,
            play: play,
            mute: mute,
            unmute: unmute,
            isActive: isActive,
            setParam: setParam,
            setFilterParams: setFilterParams,
            setLastEvent: setLastEvent,
            getLastEventId: getLastEventId,
            setBetList: setBetList,
            getBetList: getBetList,
            setEvents: setEvents,
            dataEvent: dataEvent,
            startEvent: startEvent,
            eventsProcessed: eventsProcessed,
            isProductSubscribed: isProductSubscribed,
            setUrl: setUrl,
            subscribe: subscribe,
            unsubscribe: unsubscribe
        };

    }();

    ZAPNET.EventQueue = function(){
        var queue = [],
            busy = false,
            errorCB = null;

        function process(){
            if (busy || queue.length === 0){
                return;
            }

            busy = true;

            var event = queue.shift();
            event.process();
        }

        return {
            add: function(eventFn, cfg){
                var event = {};

                event.state = 0;
                event.process = function(){
                    if (!cfg || !cfg.notimeout){
                        event.timeout = setTimeout(function(){
                            event.done();
                            if (errorCB){
                                errorCB(Util.t("WARNING: Event Timeout Fired! Fn: " )+ eventFn + (event.debug ? event.debug() : ''));
                            }
                        }, cfg && cfg.timeout ? cfg.timeout : 15000);
                    }
                    try{
                        eventFn(event);
                    }catch(e){
                        event.done();
                        if (errorCB){
                            errorCB(Util.t('Event Loop Error: ') + Util.dump(e) + ' - Event Fn: ' + eventFn);
                        }
                    }
                };
                event.done = function(){
                    if (event.timeout){
                        clearTimeout(event.timeout);
                    }
                    if (event.state == 0){
                        event.state = 1;
                        busy = false;
                        process();
                    }
                };
                queue.push(event);
                process();
            },
            join: function(event){
                this.add(function(innerEvent){
                    event.done();
                    innerEvent.done();
                });
            },
            registerErrorCallback: function(callback){
                errorCB = callback;
            },
            getQueueLength: function(){
                return queue.length;
            }
        };
    };

}());

