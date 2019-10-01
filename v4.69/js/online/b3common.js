(function(){

    var Event = YAHOO.util.Event,
        Dom = YAHOO.util.Dom,
        $ = YAHOO.util.Selector.query,
        Util = ZAPNET.util,
        Carousel = false;

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

    ZAPNET.Carousel = function(config){
        var n = 0,
            m = config.items.length,
            started = false,
            element = false,
            html = '',
            interval = null,

        render = function(){
            if (!started){
                return;
            }
            try {
                var item = config.items[n];
                if (element){
                    var image = Util.elem('div', 'image');
                    var existingImg = $('.image', element, true);
                    var existingHd = $('.caption-header', image, true);
                    var existingCont = $('.caption-content', image, true);
                    if (item.photo){
                        image.style.backgroundImage= "url(/carousel/image/id/" + item.photo + ")";
                        if(existingImg) {
                           element.removeChild(existingImg);
                        }
                        element.insertBefore(image, element.firstChild);

                        if (item.link && item.linkid){
                            Dom.addClass(image, 'object-link');
                            Dom.setAttribute(image, 'lnk', item.link);
                            Dom.setAttribute(image, 'lnkid', item.linkid);
                        } else if (item.link && item.pageid) {
                            Dom.addClass(image, 'object-link');
                            Dom.setAttribute(image, 'lnk', item.link);
                            Dom.setAttribute(image, 'lnkid', item.pageid);
                        }else {
                            Dom.removeClass(image, 'object-link');
                            Dom.setAttribute(image, 'lnk', '');
                            Dom.setAttribute(image, 'lnkid', '');
                        }
                    } else {
                        stop();
                        return;
                    }
                    if (item.header){
                        if(existingHd) {
                           image.removeChild(existingHd);
                        }
                        var header = Util.elem('div', 'header-content');
                        header.innerHTML = item.header;
                        image.appendChild(header);
                    }
                    if (item.content){
                        if(existingCont) {
                           image.removeChild(existingCont);
                        }
                        var content = Util.elem('div', 'caption-content');
                        content.innerHTML = item.content;
                        image.appendChild(content);
                    }
                    var menu = $('.menu', element, true);
                    if (menu){
                        Dom.removeClass($('.menu-item', menu), 'menu-item-selected');
                        Dom.addClass($('.menu-item-' + (n+1), menu, true), 'menu-item-selected');
                    }
                    var index = $('.photo-index', element, true);
                    if (index){
                        Dom.removeClass($('.selected', index), 'selected');
                        Dom.addClass($('.photo-index-item-' + (n+1), index, true), 'selected');
                    }
                }
            } catch (e){
                stop();
            }
        },

        next = function(){
            if (!started){
                return;
            }
            n = n + 1 < m ? n + 1 : 0;
            render();
        },

        getHtml = function(){
            return html;
        },

        carouselClick = function(e){
            var el = Event.getTarget(e);
            if (Dom.hasClass(el, 'photo-index-item')){
                var id = Dom.getAttribute(el, 'i');
                if (id){
                    n = +id;
                    render();
                    clearInterval(interval);
                    interval = setInterval(next, config.delay * 1000);
                }
            }
            if (Dom.hasClass(el, 'object-link')){
                var lnk = Dom.getAttribute(el, 'lnk');
                var lnkid = Dom.getAttribute(el, 'lnkid');
                if (lnk){
                    ZAPNET.Website.followLink(lnk, lnkid);
                }
            }
        },

        start =  function(el){
            stop();
            started = true;
            if (!element){
                html = el.innerHTML;
            }
            element = el;
            Event.removeListener(element, 'click', carouselClick);
            Event.addListener(element, 'click', carouselClick);
            n = 0;
            var index = $('.photo-index', element, true);
            if (index){
                index.innerHTML = '';
                for(var i = 0; i < config.items.length; i += 1){
                    index.appendChild(Util.elem('span', 'photo-index-item photo-index-item-' + (i + 1), '', {
                        attrs: {
                            i: i
                        }
                    }));
                }
            }
            render();
            interval = setInterval(next, config.delay * 1000);
        },

        stop = function(){
            started = false;
            clearInterval(interval);
        };

        return {
            start: start,
            stop: stop,
            getHtml: getHtml
        };
    };

    ZAPNET.Website = function(){
        var dom = {},

        languageClick = function(){
            var languageSelect = $('#page-top div.top-language-select', null, true);
            if (Dom.hasClass(languageSelect, 'open')){
                Dom.removeClass(languageSelect, 'open');
            } else {
                Dom.addClass(languageSelect, 'open');
            }
        },

        chatClick = function(){
            ZAPNET.ChatService.startChat();
        },

        fundsCheckboxClick = function(){
            if (dom.fundsCheckbox.checked){
                Dom.setStyle(dom.fundsHolder, 'display', 'block');
            } else {
                Dom.setStyle(dom.fundsHolder, 'display', 'none');
            }
        },

        updateFunds = function(data){
            if ('funds' in data && dom.funds){
                dom.funds.innerHTML = data.funds;
            }
        },

        fundsRefresh = function(){
            var url = '/account/funds.js';
            var callback = {
                success: function(o){
                    var data = eval('(' + o.responseText + ')');
                    updateFunds(data);
                },
                failure: function(o){
                    setTimeout(function(){
                        window.location.reload();
                    }, 2500);
                },
                cache: false,
                timeout: 60000
            };
            YAHOO.util.Connect.asyncRequest('GET', url, callback);
        },

        userRefresh = function(){
            dom.fundsCheckbox = Dom.get('user-funds-checkbox');
            dom.fundsRefresh = Dom.get('funds-refresh');
            dom.fundsHolder = $('#hd-top div.user-funds', null, true);
            dom.funds = Dom.get('funds');
            if (dom.fundsCheckbox){
                Event.on(dom.fundsCheckbox, 'change', fundsCheckboxClick);
            }
            if (dom.fundsRefresh){
                Event.on(dom.fundsRefresh, 'click', fundsRefresh);
            }
        },

        infoEvent = function(event){
            if (event.o == 'user'){
                if (event.t == 'balance'){
                    dom.funds.innerHTML = Util.formatAmountCommas(event.v, true);
                }
            }
        },

        tabviewClick = function(e){
            var el = Event.getTarget(e);
            if (Dom.hasClass(el, 'menu-tab')){
                var tabIndex = Dom.getAttribute(el, 'tabIndex');
                if (tabIndex){
                    Event.preventDefault(e);
                    var menu = el.parentNode;
                    Dom.removeClass($('.menu-tab.selected', menu), 'selected');
                    Dom.addClass(el, 'selected');
                    var tabView = Dom.getAncestorByClassName(el, 'account-tabview');
                    Dom.removeClass($('.content-tab.selected', tabView), 'selected');
                    Dom.addClass($('div.content-tab-' + tabIndex, tabView, true), 'selected');
                }
            }
        },

        init = function(){
            ZAPNET_BET_DATA = {
                sports: {},
                outrights: {},
                markets: {},
                last_event_id: 0
            };
            ZAPNET.BetDB = ZAPNET.BetDBGen();
            dom.funds = Dom.get('funds');
            Event.on($('#page-top div.top-language-select', null, true), 'click', languageClick);
            Event.on($('#page-top span.option.chat', null, true), 'click', chatClick);
            Event.on($('div.main-tabview', null, true), 'click', tabviewClick);
            userRefresh();
            ZAPNET.BetDB.infoEvent.subscribe(infoEvent);
        };

        return {
            init: init
        };
    }();

    Event.onDOMReady(function(){
        var carouselEl = $('#bd .page-carousel', null, true);
        if (carouselEl && window.ZAPNET_CAROUSEL_DATA){
            Carousel = ZAPNET.Carousel(ZAPNET_CAROUSEL_DATA);
            Carousel.start(carouselEl);
        }
        ZAPNET.Website.init();
    });
}());