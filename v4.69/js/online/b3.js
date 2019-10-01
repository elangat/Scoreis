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

    ZAPNET.Calculator = ZAPNET.Calculator || function(){
        var type = function(el, cb, typeCb){
            var input = el.tagName.toLowerCase() == 'input' ? el : $('input', el, true);
            if (!input){
                return;
            }
            if (cb){
                Event.on(input, 'blur', function(e){
                    var value = parseFloat(input.value.replace(/,/g, ''));
                    cb(el, value);
                });
            }
            if (typeCb){
                Event.on(input, 'keyup', function(e){
                    var value = parseFloat(input.value.replace(/,/g, ''));
                    typeCb(el, value);
                });
            }
            return ;
            if (!input){
                var value = parseFloat(el.innerHTML.replace(/,/g, ''));
                input = Util.elem('input', null, null, {
                    attrs: {
                        type: 'text',
                        size: '4'
                    }
                });
                el.innerHTML = '';
                el.appendChild(input);
                if (value){
                    input.value = value;
                }
                input.focus();
                if (cb){
                    Event.on(input, 'blur', function(e){
                        cb(el, input.value.replace(/,/g, ''));
                        ZAPNET.KeySearch.on();
                    });
                }
                if (typeCb){
                    Event.on(input, 'keyup', function(e){
                        typeCb(el, input.value.replace(/,/g, ''));
                    });
                }
            }
        };

        return {
            type: type
        };
    }();

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
                $('.photo', element, true).style.backgroundImage = 'url(/images/online/b3/' + item.photo + ')';
                $('.caption-header', element, true).innerHTML = item.header;
                $('.caption-content', element, true).innerHTML = item.content;
                var menu = $('.menu', element, true);
                Dom.removeClass($('.menu-item', menu), 'menu-item-selected');
                Dom.addClass($('.menu-item-' + (n+1), menu, true), 'menu-item-selected');
                var photoIndex = $('.photo-index', element, true);
                Dom.removeClass($('.photo-index-item', photoIndex), 'selected');
                Dom.addClass($('.photo-index-item-' + (n+1), photoIndex, true), 'selected');
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

        start =  function(el){
            started = true;
            if (!element){
                html = el.innerHTML;
            }
            element = el;
            n = 0;
            render();
            if (interval){
                clearInterval(interval);
            }
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
                    ZAPNET.Website.followLink(lnk, lnkid, e);
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

    ZAPNET.SportsMenu = function(){
        var dom,

        menuClick = function(e){
            var el = Event.getTarget(e),
                tourId, catId, outrightId, groupOutrightsId, li, sportId, groupSportId;

            var openclose = false;
            if (Dom.hasClass(el, 'openclose')){
                openclose = true;
                el = el.parentNode;
            }
            if (Dom.hasClass(el, 'market-count')){
                var menuSelect = $('> input.sport-menu-select', el.parentNode, true);
                if (menuSelect && menuSelect.parentNode == el.parentNode){
                    el = menuSelect;
                    el.checked = !el.checked;
                }
            }
            if (Dom.hasClass(el, 'sport-menu-select')){
                var on = el.checked;
                tourId = Dom.getAttribute(el, 'tid');
                catId = Dom.getAttribute(el, 'cid');
                sportId = Dom.getAttribute(el, 'sid');
                if (on){
                    Dom.removeClass(dom.menuClearAll, 'hidden');
                }
                var li = Dom.getAncestorByTagName(el, 'li');
                if (tourId){
                    ZAPNET.Website.show('coupon');
                    if (on){
                        Dom.addClass(li, 'open');
                        ZAPNET.Coupon.addTournament(tourId);
                    } else {
                        Dom.removeClass(li, 'open');
                        ZAPNET.Coupon.removeTournament(tourId);
                    }
                    scrollToTop();
                } else if (catId){
                    var tourIds = [];
                    var checks = $('input.sport-menu-select', li);
                    Util.foreach(checks, function(check){
                        check.checked = on;
                    });
                    Util.foreach(ZAPNET.BetDB.categories[catId].tournaments, function(tour){
                        tourIds.push(tour.id);
                    });
                    if (on){
                        ZAPNET.Coupon.addTournaments(tourIds);
                    } else {
                        ZAPNET.Coupon.removeTournaments(tourIds);
                    }
                } else if (sportId){
                    var tourIds = [];
                    var checks = $('input.sport-menu-select', li);
                    Util.foreach(checks, function(check){
                        check.checked = on;
                    });
                    Util.foreach(ZAPNET.BetDB.sports[sportId].categories, function(cat){
                        Util.foreach(ZAPNET.BetDB.categories[cat.id].tournaments, function(tour){
                            tourIds.push(tour.id);
                        });
                    });
                    if (on){
                        ZAPNET.Coupon.addTournaments(tourIds);
                    } else {
                        ZAPNET.Coupon.removeTournaments(tourIds);
                    }
                }
            }

            if (el.tagName.toLowerCase() == 'a'){
                Event.preventDefault(e);
                li = Dom.getAncestorByTagName(el, 'li');
                if (openclose && Dom.hasClass(li, 'open')){
                    Dom.removeClass(li, 'open');
                    return;
                } else {
                    Dom.addClass(li, 'open');
                }
                var itemSelected = false;
                tourId = Dom.getAttribute(el, 'tid');
                catId = Dom.getAttribute(el, 'cid');
                sportId = Dom.getAttribute(el, 'sport');
                if (tourId){
                    if (!openclose){
                        ZAPNET.Website.show('coupon');
                        ZAPNET.Coupon.addTournament(tourId);
                        var check = $('input.sport-menu-select', el, true);
                        if (check){
                            check.checked = true;
                        }
                        scrollToTop();
                    }
                    itemSelected = el;
                    /*
                    if (Dom.hasClass(el, 'selected')){
                        Dom.removeClass(el, 'selected');
                        ZAPNET.Website.show('coupon');
                        ZAPNET.Coupon.removeTournament(tourId);
                    } else {
                        Dom.addClass(el, 'selected');
                        ZAPNET.Website.show('coupon');
                        ZAPNET.Coupon.addTournament(tourId);
                    }
                    */
                } else if (catId){
                    if (!openclose){
                        //ZAPNET.Website.show('coupon');
                        //ZAPNET.Coupon.setCategory(catId);
                        //scrollToTop();
                        if (ZAPNET_ONLINE_CONSTANTS.SPORTS_MENU_COUNTRYCLICK_SHOWMATCHES){
                            ZAPNET.Website.show('coupon');
                            ZAPNET.Coupon.setCategory(catId);
                            scrollToTop();

                            var tourIds = [];
                            var checks = $('input.sport-menu-select', li);
                            Util.foreach(checks, function(check){
                                check.checked = true;
                            });
                            Util.foreach(ZAPNET.BetDB.categories[catId].tournaments, function(tour){
                                tourIds.push(tour.id);
                            });
                            if (on){
                                ZAPNET.Coupon.addTournaments(tourIds);
                            }
                        }
                    }
                    itemSelected = el;
                } else if (sportId){
                    if (!openclose){
                        //ZAPNET.Website.show('coupon');
                        //ZAPNET.Coupon.setSport(sportId);
                        //scrollToTop();
                    }
                    itemSelected = el;
                }
                if (itemSelected){
                    if (Dom.hasClass(itemSelected, 'selected') && (catId || sportId)){
                        Dom.removeClass($('.selected', itemSelected), 'selected');
                        Dom.removeClass(itemSelected, 'selected');
                        var menuBlock = Dom.getAncestorByTagName(itemSelected, 'li');
                        Dom.removeClass(menuBlock, 'open');
                    } else {
                        Dom.removeClass($('.selected', dom.sportsMenu), 'selected');
                        Dom.addClass(itemSelected, 'selected');
                        Dom.removeClass($('ul.menu-block > li.open', dom.sportsMenu), 'open');
                        var menuBlock = Dom.getAncestorByClassName(itemSelected, 'menu-block');
                        Dom.addClass($('> li', menuBlock, true), 'open');
                    }
                }
                outrightId = Dom.getAttribute(el, 'oid');
                if (outrightId){
                    if (Dom.hasClass(el, 'selected')){
                        Dom.removeClass(el, 'selected');
                        ZAPNET.Website.show('coupon');
                        ZAPNET.Coupon.removeOutright(outrightId);
                    } else {
                        Dom.addClass(el, 'selected');
                        ZAPNET.Website.show('coupon');
                        ZAPNET.Coupon.addOutright(outrightId);
                    }
                }
                if(ZAPNET_CONSTANTS.SHOW_WORLD_CUP){
                    groupOutrightsId = Dom.getAttribute(el, 'groid');
                    groupSportId = Dom.getAttribute(el, 'grsid');
                    var multiOutrightsIds = ZAPNET.WorldCupManager.getGroupOutrights(groupSportId);
                    if (groupOutrightsId){
                        if (Dom.hasClass(el, 'selected')){
                            Dom.removeClass(el, 'selected');
                            ZAPNET.Website.show('coupon');
                            ZAPNET.Coupon.removeMultiOutrights(multiOutrightsIds[groupOutrightsId]['outright_ids']);
                        } else {
                            Dom.addClass(el, 'selected');
                            ZAPNET.Website.show('coupon');
                            ZAPNET.Coupon.addMultiOutrights(multiOutrightsIds[groupOutrightsId]['outright_ids']);
                        }
                    }
                }
                if (Dom.hasClass(el, 'sport-item') && ZAPNET.Website.isView('home')){
                    sportId = Dom.getAttribute(el, 'sport');
                    ZAPNET.Website.show('coupon');
                    ZAPNET.Coupon.showSportLeagues(sportId);
                }
            }
        },

        close = function(){
            Dom.removeClass($('.selected', dom.matchesMenu), 'selected');
            Dom.removeClass($('li.open', dom.matchesMenu), 'open');
            Dom.removeClass($('.selected', dom.antepostMenu), 'selected');
            Dom.removeClass($('li.open', dom.antepostMenu), 'open');
        },

        render = function(){
            var html = [''];

            var sportList = [];
            var outrightList = [];
            var wcList = [];
            var timeLimit = ZAPNET.BetDB.getTimeLimit();
            Util.foreach(ZAPNET.BetDB.sports, function(sport, sportId){
                if (true || ZAPNET.BetDB.hasPreGameMatches(sport.id)){
                    var oSport = {
                        id: sportId,
                        name: sport.name,
                        code: sport.code,
                        order: sport.order,
                        nrm: 0,
                        categories: []
                    };
                    if (sport.code.substring(0, 7) == 'virtual'){
                        return;
                    }
                    if (sport.code.substring(0, 16) == 'soccer_outrights'){
                        return;
                    }
                    sportList.push(oSport);
                    var categories = ZAPNET.BetDB.sports[sportId].categories;
                    Util.foreach(categories, function(cat){
                        if (true || ZAPNET.BetDB.categoryHasPreGameMatches(cat.id)){
                            var oCat = {
                                id: cat.id,
                                name: cat.name,
                                code: cat.code,
                                order: cat.order,
                                nrm: 0,
                                tournaments: []
                            };
                            oSport.categories.push(oCat);
                            Util.foreach(cat.tournaments, function(tour){
                                var tourMatches = +tour.nrm && !timeLimit ? +tour.nrm : ZAPNET.BetDB.countTournamentMatches(tour.id);
                                if (tourMatches > 0){
                                    var oTour = {
                                        id: tour.id,
                                        name: tour.name,
                                        code: tour.code,
                                        order: tour.order,
                                        nrm: tourMatches
                                    };
                                    oCat.tournaments.push(oTour);
                                    oCat.nrm += tourMatches;
                                    oSport.nrm += tourMatches;
                                }
                            });
                            oCat.tournaments.sort(function(a,b){
                                return a.order - b.order;
                            });
                        }
                    });
                    oSport.categories.sort(function(a,b){
                        return a.name < b.name ? -1 : 1;
                    });
                }
            });
            Util.foreach(ZAPNET.BetDB.outrightCategories, function(categories, sportId){
                var sport = ZAPNET.BetDB.sports[sportId];
                Util.foreach(categories, function (category) {
                    var sportCat = category.sport;
                    if(ZAPNET_CONSTANTS.SHOW_WORLD_CUP && (category.code == 'international' || category.code == 'world_cup' || category.code == 'worldcup') && sportCat.code == 'soccer'){
                        wcList.push({id: sportId, name: 'World Cup', code: 'worldcup', order: '1', nrm: category.nrm});
                    }
                });
                if(Object.keys(wcList).length && Object.keys(categories).length == 1){
                    // NOT SHOW FOOTBALL INTERNATIONAL WHEN SHOW WORLD CUP
                } else {
                    outrightList.push({id: sportId, name: sport.name, code: sport.code, order: sport.order});
                }
            });
            sportList.sort(function(a, b){
                return a.order - b.order;
            });
            outrightList.sort(function(a, b){
                return a.order - b.order;
            });
            var selectedSport = ZAPNET.Coupon.getSport();
            var selectedCategory = ZAPNET.Coupon.getCategory();
            var selectedTournaments = [];
            Util.foreach(ZAPNET.Coupon.getTournaments(), function(tour){
                selectedTournaments[tour.id] = tour.id;
            });
            Util.foreach(sportList, function(sport){
                if (sport.nrm == 0){
                    return;
                }
                html.push('<ul class="menu-block"><li><div class="left-menu-item"><a href="#" class="sport-item sport-', sport.code, '" sport="', sport.id, '">');
                html.push('<div class="openclose"></div>');
                html.push(Util.t(sport.name));
                var checkedSport =  selectedSport == sport.id ? ' checked="checked"' : '';
                html.push('<div class="market-count">', sport.nrm ,'</div></a>');
                html.push('<input type="checkbox" class="sport-menu-select" sid="', sport.id, '"', checkedSport, '/>');
                html.push('</div><ul class="sport-menu-content">');
                var categoryList = [];
                Util.foreach(sport.categories, function(cat){
                    categoryList.push(cat);
                });
                categoryList.sort(function(a, b){
                    if (a.order == b.order){
                        return Util.t(a.name) < Util.t(b.name) ? -1 : 1;
                    }
                    return a.order - b.order;
                });
                Util.foreach(categoryList, function(cat){
                    if (cat.nrm == 0){
                        return;
                    }
                    html.push('<li><div class="left-menu-item"><a href="#" cid="', cat.id, '">');
                    html.push('<div class="openclose"></div>');
                    html.push(Util.t(cat.name));
                    var checkedCategory = selectedCategory == cat.id ? ' checked="checked"' : '';
                    html.push('<div class="market-count">', cat.nrm ,'</div></a>');
                    html.push('<input type="checkbox" class="sport-menu-select" cid="', cat.id, '"', checkedCategory, '/>');
                    html.push('</div><ul>');
                    Util.foreach(cat.tournaments, function(tour){
                        if (tour.nrm == 0){
                            return;
                        }
                        html.push('<li><div class="left-menu-item"><a href="#" tid="');
                        html.push(tour.id, '">');
                        html.push(tour.name);
                        var checkedTournament = selectedTournaments[tour.id] ? ' checked="checked"' : '';
                        html.push('<div class="market-count">', tour.nrm ,'</div></a>');
                        html.push('<input type="checkbox" class="sport-menu-select" tid="', tour.id, '"', checkedTournament, '/>');
                        html.push('<div class="fav"></div></div>');
                    });
                    html.push('</ul></li>');
                });
                html.push('</ul></li></ul>');
            });
            dom.matchesMenu.innerHTML = html.join('');
            html = [];
            Util.foreach(wcList, function(sport){
                html.push('<ul class="menu-block"><li><div class="left-menu-item"><a href="#" class="sport-item sport-outright-item sport-', sport.code, '" sport="', sport.id, '">');
                html.push('<div class="openclose"></div>');
                html.push(sport.name, ' ', Util.t('Outrights'));
                html.push('</a></div>');
                var categories = ZAPNET.WorldCupManager.getGroupOutrights(sport.id);
                var wcOutrightList = [];
                Util.foreach(categories, function(cat){
                    wcOutrightList.push(cat);
                });
                wcOutrightList.sort(function(a, b){
                    if (a.order == b.order){
                        return a.name < b.name ? -1 : 1;
                    }
                    return a.order - b.order;
                });
                html.push('<ul>');
                Util.foreach(wcOutrightList, function(wcOut){
                    html.push('<li><div class="left-menu-item"><a href="#" groid="');
                    html.push(wcOut.id, '" grsid="',sport.id,'">');
                    html.push(Util.t(wcOut.name));
                    html.push('</a><div class="fav"></div></div></li>');
                });
                html.push('</ul></li></ul>');
            });
            Util.foreach(outrightList, function(sport){
                html.push('<ul class="menu-block"><li><div class="left-menu-item"><a href="#" class="sport-item sport-outright-item sport-', sport.code, '" sport="', sport.id, '">');
                html.push('<div class="openclose"></div>');
                html.push(sport.name, ' ', Util.t('Outrights'));
                html.push('</a></div><ul>');
                var categories = ZAPNET.BetDB.outrightCategories[sport.id];
                var categoryList = [];
                Util.foreach(categories, function(cat){
                    if(ZAPNET_CONSTANTS.SHOW_WORLD_CUP && cat.code == 'international' && cat.sport.code == 'soccer'){
                        // NOT SHOW FOOTBALL INTERNATIONAL WHEN SHOW WORLD CUP
                    } else {
                        categoryList.push(cat);
                    }
                });
                categoryList.sort(function(a, b){
                    if (a.order == b.order){
                        return a.name < b.name ? -1 : 1;
                    }
                    return a.order - b.order;
                });
                Util.foreach(categoryList, function(cat){
                    html.push('<li><div class="left-menu-item"><a href="#">');
                    html.push('<div class="openclose"></div>');
                    html.push(cat.name);
                    html.push('</a></div><ul>');
                    Util.foreach(cat.outrights, function(outright){
                        html.push('<li><div class="left-menu-item"><a href="#" oid="');
                        html.push(outright.id, '">');
                        html.push(outright.name, ' ', Util.t(outright.market));
                        html.push('</a><div class="fav"></div></div>');
                    });
                    html.push('</ul></li>');
                });
                html.push('</ul></li></ul>');
            });
            dom.antepostMenu.innerHTML = html.join('');
        };

        init = function(){
            dom = {
                app: Dom.get('app'),
                sportsMenu: Dom.get('sports-menu'),
                matchesMenu: Dom.get('sport-menu-match'),
                antepostMenu: Dom.get('sport-menu-outright'),
                menuClearAll: $('div.sports-period-select span.clear-all-menu-selections', null, true)
            };

            Event.on('sports-menu', 'click', menuClick);

            var sliderEl = Dom.get('period-select-slider');
            var sliderThumb = Dom.get('period-select-slider-thumb');
            if (sliderEl && sliderThumb){
                var slider = YAHOO.widget.Slider.getHorizSlider(sliderEl, sliderThumb, 0, 175, 44);
                slider.setValue(132, true);
                slider.subscribe("change", function(offsetFromStart) {
                    if (offsetFromStart == 0){
                        ZAPNET.Website.periodSelectSetPeriod('3h');
                    } else if(offsetFromStart == 44){
                        ZAPNET.Website.periodSelectSetPeriod('5h');
                    } else if(offsetFromStart == 88){
                        ZAPNET.Website.periodSelectSetPeriod('24h');
                    } else if(offsetFromStart == 132){
                        ZAPNET.Website.periodSelectSetPeriod('all');
                    }
                    render();
                });
                ZAPNET.Website.periodSelectChangeEvent.subscribe(function(p){
                    if (p == '3h'){
                        slider.setValue(0);
                    } else if (p == '5h'){
                        slider.setValue(44);
                    } else if (p == '24h'){
                        slider.setValue(88);
                    } else if (p == 'all'){
                        slider.setValue(132);
                    }
                    render();
                });
            }
        },

        setup = function(){
            render();
        };

        return {
            init: init,
            setup: setup,
            refresh: function(){},
            close: close
        };
    }();

    ZAPNET.MainMenu = function(){
        var dom,

        menuClick = function(e){
            var el = Event.getTarget(e);

            if (Dom.hasClass(el, 'home')){
                ZAPNET.Website.show('home');
                ZAPNET.Website.resize();
                ZAPNET.SportsMenu.close();
                Event.preventDefault(e);
                return;
            } else if (Dom.hasClass(el, 'user-account')){
                ZAPNET.Website.show('account');
                ZAPNET.SportsBookAccount.gotoAccount();
                ZAPNET.SportsBookAccount.showMenu(dom.menu);
                Event.preventDefault(e);
                return;
            } else if (Dom.hasClass(el, 'user-profile')){
                ZAPNET.Website.show('account');
                ZAPNET.SportsBookAccount.gotoProfile();
                ZAPNET.SportsBookAccount.showMenu(dom.menu);
                Event.preventDefault(e);
                return;
            } else if (Dom.hasClass(el, 'user-bets')){
                ZAPNET.Website.show('account');
                ZAPNET.SportsBookAccount.gotoBets();
                ZAPNET.SportsBookAccount.showMenu(dom.menu);
                Event.preventDefault(e);
                return;
            } else if (Dom.hasClass(el, 'user-messages')){
                ZAPNET.Website.show('account');
                ZAPNET.SportsBookAccount.gotoMyMessages();
                ZAPNET.SportsBookAccount.showMenu(dom.menu);
                Event.preventDefault(e);
                return;
            }
        },

        setup = function(){
            dom = {
                app: Dom.get('app'),
                menu: Dom.get('account-menu'),
                content: $('#account', null, true)
            };
            Event.on($('#hd div.linksmenu'), 'click', menuClick);

            if (ZAPNET.SportsBookPages){
                ZAPNET.SportsBookPages.setContainer(dom.content);
            }
        };

        return {
            setup: setup
        };
    }();

    ZAPNET.Website = function(){
        var dom = {},
            settings = {},
            bettingSlip,
            bettingSlipRenderer,
            pleaseWaitPanel,
            authPanel,
            authBuyPanel,
            view = 'sports',
            currentSportId,
            defaultSportId,
            selectedMatchId,
            windowScrollingInterval,
            windowScrolling,
            lastBookingPanel = null,
            lastBookingId = null,
            recentBetsTotal = 0,
            progressAnim,
            visibleSlip = false,
            stakeFromProxy = false,
            gotoAfterLoad = 'sports',
            pageSkin = '',
            periodSelectChangeEvent = new YAHOO.util.CustomEvent('Period Select Change', this, false, YAHOO.util.CustomEvent.FLAT),

        setupSports = function(type){
            var sports = {}, sportList = [];

            var currentSportIdFound = false;
            Util.foreach(ZAPNET.BetDB.sports, function(sport, sportId){
                if ((type == 'matches' && ZAPNET.BetDB.hasMatches(sportId)) ||
                    (type == 'outrights' && ZAPNET.BetDB.hasOutrights(sportId))){
                        sports[sportId] = {name: sport.name, code: sport.code, order: sport.order};
                        if (sportId == currentSportId){
                            currentSportIdFound = true;
                        }
                }
            });
            Util.foreach(sports, function(sport, sportId){
                sportList.push({id: sportId, name: sport.name, code: sport.code, order: sport.order});
            });
            sportList.sort(function(a, b){
                return a.order - b.order;
            });

            if (!currentSportIdFound){
                currentSportId = false;
            }


            dom.subMenu.innerHTML = '';
            var menu = Util.elem('ul', 'menu');
            dom.subMenu.appendChild(menu);
            Util.foreach(sportList, function(sport, i){
                var sportId = sport.id;
                var sportName = Util.elem('a', null, Util.t(sport.name), {attrs: {href: '#'}});
                var sportEl = Util.elem('li', 'menu-item sport sport-' + sport.code, sportName, {attrs: {sport: sportId}});
                Dom.setStyle(sportEl, 'left', (i * 124) + 'px');
                menu.appendChild(sportEl);
                if (!currentSportId){
                    defaultSportId = sportId;
                    currentSportId = sportId;
                    Dom.addClass(sportEl, 'selected');
                } else if (sportId == currentSportId){
                    Dom.addClass(sportEl, 'selected');
                } else {
                    Dom.setStyle(sportEl, 'z-index', (50 - i));
                }
            });
        },

        validateSchedule = function(){
            if (view === 'sports' || view === 'match'){
                if (!ZAPNET.BetDB.hasMatches(currentSportId)){
                    if (ZAPNET.BetDB.hasMatches()){
                        currentSportId = ZAPNET.BetDB.getDefaultMatchSportId();
                    }
                }
                setupSports('matches');
            } else if (view === 'outrights'){
                if (!ZAPNET.BetDB.hasOutrights(currentSportId)){
                    if (ZAPNET.BetDB.hasOutrights()) {
                        currentSportId = ZAPNET.BetDB.getDefaultOutrightSportId();
                    }
                }
                setupSports('outrights');
            }
        },

        subMenuClick = function(e){
            var el = Event.getTarget(e);

            if (el.tagName.toLowerCase() != 'li'){
                el = Dom.getAncestorByTagName(el, 'li');
            }
            if (Dom.hasClass(el, 'sport')){
                Dom.removeClass($('.selected', dom.subMenu), 'selected');
                Dom.addClass(el, 'selected');
                var sportId = Dom.getAttribute(el, 'sport');
                if (view == 'sports' || view == 'match'){
                    showSports(sportId);
                } else if (view == 'outrights'){
                    showOutrights(sportId);
                }
            }

            Event.preventDefault(e);
        },

        showSports = function(sportId){
            view = 'sports';
            clearMatchCoupon();
            if (sportId && sportId != currentSportId){
                currentSportId = sportId;
            }
            setupSports('matches');
            ZAPNET.WebCoupon.showSport(sportId ? sportId : currentSportId);
        },

        showOutrights = function(sportId){
            /*
            view = 'outrights';
            clearMatchCoupon();
            if (sportId && sportId != currentSportId){
                currentSportId = sportId;
            }
            setupSports('outrights');
            ZAPNET.WebCoupon.showOutrightSport(sportId ? sportId : currentSportId);
            */
            var outrightIds = [];
            Util.foreach(ZAPNET.BetDB.outrightsById, function(outright, outrightId){
                outrightIds.push(outrightId);
            });
            ZAPNET.Coupon.setOutrights(outrightIds);
        },

        showLive = function(){
            view = 'live';
            show('live');
            var callback = {
                success: function(){
                    ZAPNET.Coupon.showLive();
                }
            };
            ZAPNET.BetDB.load(callback, {
                g: 'LVM',
                r: [2002,1037,1013,1010,1102,2005,1021,1976,1083,10,20,56,42,60,229,381,382,383]
            });
            clearMatchCoupon();
            showPageLoading();
        },

        showVirtual = function(){
            view = 'virtual';
            clearMatchCoupon();
            ZAPNET.Coupon.showVirtual();
        },

        showLottery = function(){
            view = 'lottery';
            ZAPNET.LotterySale.show();
        },

        showTopEvents = function(){
            Dom.removeClass(document.body, 'welcome-page');
            Dom.removeClass(dom.app, 'welcome-page');
            var matchList = [];
            if (window.ZAPNET_FEATURED_MATCHES){
                Util.foreach(window.ZAPNET_FEATURED_MATCHES, function(sportMatches, sportId){
                    Util.foreach(sportMatches, function(matchId){
                        var match = ZAPNET.BetDB.matches[matchId] ? ZAPNET.BetDB.matches[matchId] : false;
                        if (match && match.status == "open"){
                            matchList.push(match);
                        }
                    });
                });
            }
            ZAPNET.Coupon.renderMatchList(dom.content, matchList, 1500, Util.t('Top Events'));
        },

        showFavorites = function(matchList){
            if (!matchList){
                matchList = ZAPNET.Coupon.getFavoriteMatches();
            }
            Dom.removeClass(document.body, 'welcome-page');
            Dom.removeClass(dom.app, 'welcome-page');
            ZAPNET.Coupon.renderMatchList(dom.content, matchList, 1500, Util.t('Favorite Matches'));
        },

        contentClick = function(e){
            var el = Event.getTarget(e);

            if (Dom.hasClass(el, 'outright-category')){
                var categoryId = Dom.getAttribute(el, 'cid');
                var menu = Dom.getAncestorByTagName(el, 'ul');
                var item = Dom.getAncestorByTagName(el, 'li');
                Dom.removeClass($('li.selected', menu), 'selected');
                Dom.addClass(item, 'selected');
                ZAPNET.WebCoupon.showOutrightCategory(categoryId, item);
                Event.preventDefault(e);
                return;
            } else if (Dom.hasClass(el, 'outright-select')){
                var outrightId = Dom.getAttribute(el, 'oid');
                var menu = Dom.getAncestorByTagName(el, 'ul');
                var item = Dom.getAncestorByTagName(el, 'li');
                Dom.removeClass($('li.selected', menu), 'selected');
                Dom.addClass(item, 'selected');
                ZAPNET.WebCoupon.showOutright(outrightId);
                Event.preventDefault(e);
                return;
            } else if (Dom.hasClass(el, 'more-markets')){
                var matchEl = Dom.getAncestorByClassName(el, 'match');
                if (matchEl){
                    var mid = Dom.getAttribute(matchEl, 'mid');
                    if (mid){
                        showMatchById(mid);
                    }
                }
                return;
            }

            var a = Dom.getAncestorByTagName(el, 'a');
            if (a && Dom.hasClass(a, 'match-item')){
                var mid = Dom.getAttribute(a, 'mid');
                if (mid){
                    showMatchById(mid);
                }
                Event.preventDefault(e);
                return;
            }
        },

        contentHandleClick = function(e){
            if (Dom.hasClass(dom.doc, 'wide')){
                shortenContent();
            } else {
                widenContent();
            }
        },

        showMessage = function(msgInfo){
            Util.showMessage(msgInfo.message, msgInfo.title, msgInfo.type);
        },

        showAccountStatement = function(){
            var datePopup = function(calendarEl, fromImg, fromField, toImg, toField){
                var calendar,
                    datefield;

                var btnClick = function(e){
                    var btnEl = Event.getTarget(e);
                    datefield = btnEl == fromImg ? fromField : toField;

                    if (!calendar) {
                        Event.on(document, "click", function(e) {
                            var el = Event.getTarget(e);
                            if (el != calendarEl && !Dom.isAncestor(calendarEl, el) &&
                                el != fromImg && el != toImg) {
                                Dom.setStyle(calendarEl, 'display', 'none');
                            }
                        });

                        calendar = new YAHOO.widget.Calendar(calendarEl, {
                            iframe:true
                        });
                        calendar.render();

                        calendar.selectEvent.subscribe(function() {
                            if (calendar.getSelectedDates().length > 0) {

                                var selDate = calendar.getSelectedDates()[0];

                                // Pretty Date Output, using Calendar's Locale values: Friday, 8 February 2008
                                var dStr = selDate.getDate();
                                var mStr = selDate.getMonth() + 1;
                                var yStr = selDate.getFullYear();

                                datefield.value = yStr + "-" + $P.str_pad(mStr, 2, '0', 'STR_PAD_LEFT') + "-" + $P.str_pad(dStr, 2, '0', 'STR_PAD_LEFT');
                            } else {
                                datefield.value = "";
                            }
                            Dom.setStyle(calendarEl, 'display', 'none');
                        });
                    }

                    Dom.setStyle(calendarEl, 'display', 'block');
                    Dom.setXY(calendarEl, Dom.getXY(btnEl));

                    var seldate = calendar.getSelectedDates();

                    if (seldate.length > 0) {
                        calendar.cfg.setProperty("pagedate", seldate[0]);
                        calendar.render();
                    }
                };

                Event.on(fromImg, 'click', btnClick);
                Event.on(toImg, 'click', btnClick);
            };

            var calendarEl = $('#statement-form div.calendar', null, true);
            var fromEl = $('#statement-form #statement-period-from', null, true);
            var toEl = $('#statement-form #statement-period-to', null, true);

            datePopup(calendarEl, fromEl, fromEl, toEl, toEl);
        },

        userAccountSearch = function(e){
            var el = Event.getTarget(e);
            var value = el.value;
            var report = $('.sportsbook-account-content table.report', null, true);
            var trs = $('tr.row-useraccount', report);
            if (value){
                Dom.addClass(trs, 'user-row-hidden');
            } else {
                Dom.removeClass(trs, 'user-row-hidden');
            }

            var matchShops = [];
            Util.foreach(trs, function(tr){
                var userName = Dom.getAttribute(tr, 'user');
                if (userName.indexOf(value) > -1){
                    if (Dom.hasClass(tr, 'row-customer')){
                        Dom.removeClass(tr, 'user-row-hidden');
                    } else if (Dom.hasClass(tr, 'row-shop')){
                        matchShops.push(userName);
                    }
                }
            });
            Util.foreach(matchShops, function(shop){
                Dom.removeClass($('tr.shop-' + shop, report), 'user-row-hidden');
            });
        },

        showUserAccounts = function(){
            var search = Dom.get('user-account-search-input');
            if (search){
                Event.on(search, 'keyup', userAccountSearch);
            }
        },

        userAccountPageLoaded = function(url){
            if (url.indexOf('/account/mystatement.js') === 0 || url.indexOf('/account/bettinghistory') === 0 ||
                url.indexOf('/deposit/history.js') === 0 || url.indexOf('/withdraw/history.js') === 0){
                showAccountStatement();
            }
            if (url.indexOf('/account/useraccounts.js') === 0){
                showUserAccounts();
            }
        },

        doBetslipCashout = function(el, amount){
            if (Dom.hasClass(el, 'disabled')){
                return;
            }
            Dom.addClass(el, 'disabled');
            var url = Dom.getAttribute(el, 'href');
            var callback = {
                success: function(o){
                    Dom.removeClass(el, 'disabled');
                    var data = eval('(' + o.responseText + ')');
                    if (data.error){
                        Util.showErrorMessage('Error: ' + data.error, 'Cashout Error');
                    }
                    if (data.result){
                        if (data.result == 'cashout'){
                            Util.showSuccessMessage('<h1>' + Util.t('Cash out Betting Slip') + ': <span style="font-size: 120%">' + Util.formatAmountCommas(data.amount, true) + '</span></h1>', 'Cashout');
                        } else if (data.result == 'amount'){
                            Util.askQuestion('<h1>' + Util.t('Cashout Amount offered is') + ' <span style="font-size: 120%">'  + Util.formatAmountCommas(data.amount, true) + '</span>. ' + Util.t('Accept Amount?') + '</h1>', [{
                                    label: 'Confirm',
                                    fn: function(){
                                        doBetslipCashout(el, data.amount);
                                    },
                                    isDefault: false
                                },{
                                    label: 'Cancel',
                                    fn: function(){},
                                    isDefault: true
                                }
                            ], 'Cashout Betting Slip', 'warning');
                        }
                    }
                },
                failure: function(){
                    Dom.removeClass(el, 'disabled');
                    Util.showErrorMessage('Could not process cashout');
                },
                cache: false,
                timeout: 40000
            };
            YAHOO.util.Connect.asyncRequest('POST', url + (amount ? '&amount=' + amount: ''), callback);
        },

        userPanelClick = function(e){
            var el = Event.getTarget(e);

            if (el.id == 'funds-showhide'){
                if (el.checked){
                    Dom.removeClass('user-account', 'hide-funds');
                } else {
                    Dom.addClass('user-account', 'hide-funds');
                }
                YAHOO.util.Connect.asyncRequest('GET', '/account/showfunds?sf=' + (el.checked ? '1' : '0'), callback);
                return;
            } else if (Dom.hasClass(el, 'login-submit')){
                var form = Dom.getAncestorByTagName(el, 'form');
                var username = form.username.value;
                var password = form.password.value;
                var data = Util.post({
                    username: username,
                    password: password
                });
                var callback = {
                    success: function(o){
                        dom.userPanel.innerHTML = o.responseText;
                        if (o.responseText.indexOf('/login/email') > 0 || o.responseText.indexOf('not yet active') > 0){
                            ZAPNET.util.showWarningMessage('<style type="text/css">ul.security-notice{padding: 20px 0;}ul.security-notice li {font: bold 12px Verdana;position: relative; margin: 2px 0; padding-left: 50px;min-height: 20px;}ul.security-notice li span.num{display: block; position: absolute; top: 0; left: 5px; width: 40px; height: 20px; background-color: #000; color: #fff; font: bold 18px/20px Verdana; text-align: center;}</style><h1 style="font: bold 16px Verdana;">Security Notice</h1><div style="font: 12px Verdana;">For Security reasons we are requiring that all customers provide a valid email account. Please enter your email and telephone. A Link will be sent to your email to activate your account so you can log in.<br/><br/>Withdrawal codes will be sent to your email and will not be visible online for your protection.</div><ul class="security-notice"><h1 style="font: bold 18px/30px Verdana;">Please follow these steps:</h1><li><span class="num">1</span> Enter a telephone and <u>ACTIVE email</u> at the top of the page. This does NOT have to be the same email you used for registration but must be currently ACTIVE.</li><li><span class="num">2</span>A message will be sent to the Email you specified. Open your email and click on the link to verify your email address and activate your account.</li><li><span class="num">3</span>Go back to the website and Log in with your account.</li><li><span class="num">4</span>When you withdraw money from your account the withdrawal code will be sent to the email you have given in STEP 1.</li></ul><div style="font: bold 13px Verdana; padding-top: 10px;">Thank you</div>', 'Security Notification');
                        } else {
                            readNotifications();
                        }
                        setupHome();
                    },
                    failure: function(){
                        setTimeout(function(){
                            window.location.reload();
                        }, 2500);
                    },
                    cache: false,
                    timeout: 40000
                };
                Event.preventDefault(e);
                YAHOO.util.Connect.asyncRequest('POST', '/login/login.js', callback, data);
            } else if (Dom.hasClass(el, 'logout-submit')){
                var callback = {
                    success: function(o){
                        dom.userPanel.innerHTML = o.responseText;
                        setupHome();
                    },
                    failure: function(){
                        setTimeout(function(){
                            window.location.reload();
                        }, 2500);
                    },
                    cache: false,
                    timeout: 40000
                };
                Event.preventDefault(e);
                YAHOO.util.Connect.asyncRequest('POST', '/login/logout.js', callback, '');
            } else if (Dom.hasClass(el, 'email-submit')){
                var form = Dom.getAncestorByTagName(el, 'form');
                var email = form.email.value;
                var telephone = form.telephone.value;
                var data = Util.post({
                    email: email,
                    telephone: telephone
                });
                var callback = {
                    success: function(o){
                        dom.userPanel.innerHTML = o.responseText;
                        setupHome();
                    },
                    failure: function(){
                        setTimeout(function(){
                            window.location.reload();
                        }, 2500);
                    },
                    cache: false,
                    timeout: 40000
                };
                Event.preventDefault(e);
                YAHOO.util.Connect.asyncRequest('POST', '/login/email.js', callback, data);
            }

            if (!window.ZAPNET_WEBSITE_PAGE){
                if (Dom.hasClass(el, 'mybets')){
                    Event.preventDefault(e);
                    ZAPNET.SportsBookAccount.gotoBets();
                    ZAPNET.SportsBookAccount.showMenu(dom.accountMenu);
                    show('account');
                } else if (Dom.hasClass(el, 'myprofile')){
                    Event.preventDefault(e);
                    ZAPNET.SportsBookAccount.gotoProfile();
                    ZAPNET.SportsBookAccount.showMenu(dom.accountMenu);
                    show('account');
                } else if (Dom.hasClass(el, 'myaccount-bethistory')){
                    Event.preventDefault(e);
                    ZAPNET.SportsBookAccount.gotoBettingHistoryCombined();
                    ZAPNET.SportsBookAccount.showMenu(dom.accountMenu);
                    show('account');
                } else if (Dom.hasClass(el, 'myaccount-deposit')){
                    Event.preventDefault(e);
                    ZAPNET.SportsBookAccount.gotoDeposit();
                    ZAPNET.SportsBookAccount.showMenu(dom.accountMenu);
                    show('account');
                } else if (Dom.hasClass(el, 'myaccount-withdraw')){
                    Event.preventDefault(e);
                    ZAPNET.SportsBookAccount.gotoWithdraw();
                    ZAPNET.SportsBookAccount.showMenu(dom.accountMenu);
                    show('account');
                } else if (Dom.hasClass(el, 'myaccount')){
                    Event.preventDefault(e);
                    ZAPNET.SportsBookAccount.gotoAccount();
                    ZAPNET.SportsBookAccount.showMenu(dom.accountMenu);
                    show('account');
                } else if (Dom.hasClass(el, 'mymessages') || Dom.hasClass(el, 'user-messages') || Dom.hasClass(el, 'count-user-messages')){
                    Event.preventDefault(e);
                    ZAPNET.SportsBookAccount.gotoMyMessages();
                    ZAPNET.SportsBookAccount.showMenu(dom.accountMenu);
                    show('account');
                } else if (Dom.hasClass(el, 'xregister')){
                    Event.preventDefault(e);
                    ZAPNET.SportsBookAccount.gotoRegister();
                    ZAPNET.SportsBookAccount.showMenu(dom.accountMenu);
                    show('account');
                }
            }

        },

        pageEventListener = function(e){
            var el = Event.getTarget(e);

            if (el.tagName.toLowerCase() == 'select'){
                if (Dom.hasClass(el, 'bank-acount-select')){
                    var form = Dom.getAncestorByTagName(el, 'form');
                    var setBankDetails = function(values){
                        form.bankname.value = values.name;
                        form.bankaccountnum.value = values.accnum;
                        form.bankiban.value = values.iban;
                        form.bankbranch.value = values.branch;
                    };
                    var value = Util.selectValue(el);
                    var empty = {
                        name: '',
                        accnum: '',
                        swift: '',
                        currency: '',
                        city: '',
                        country: '',
                        iban: '',
                        branch: ''
                    };
                    if (window.ZAPNET_DEPOSIT_BANK_ACCOUNTS && (value + "").length > 0){
                        setBankDetails(ZAPNET_DEPOSIT_BANK_ACCOUNTS[+value] ? ZAPNET_DEPOSIT_BANK_ACCOUNTS[+value] : empty);
                    } else {
                        setBankDetails(empty);
                    }
                    return true;
                }
                return false;
            }

            if (Dom.hasClass(el, 'myaccount-deposit')){
                Event.preventDefault(e);
                ZAPNET.SportsBookAccount.gotoDeposit();
                ZAPNET.SportsBookAccount.showMenu(dom.accountMenu);
                show('account');
                return true;
            } else if (Dom.hasClass(el, 'myaccount-withdraw')){
                Event.preventDefault(e);
                ZAPNET.SportsBookAccount.gotoWithdraw();
                ZAPNET.SportsBookAccount.showMenu(dom.accountMenu);
                show('account');
                return true;
            } else if (Dom.hasClass(el, 'myaccount')){
                Event.preventDefault(e);
                ZAPNET.SportsBookAccount.gotoAccount();
                ZAPNET.SportsBookAccount.showMenu(dom.accountMenu);
                show('account');
                return true;
            }

            if (Dom.hasClass(el, 'menu-tab')){
                var tabIndex = Dom.getAttribute(el, 'tabIndex');
                if (tabIndex){
                    var menu = el.parentNode;
                    Dom.removeClass($('.menu-tab.selected', menu), 'selected');
                    Dom.addClass(el, 'selected');
                    var tabView = Dom.getAncestorByClassName(el, 'account-tabview');
                    Dom.removeClass($('.account-tabview-content .content-tab.selected', tabView), 'selected');
                    Dom.addClass($('.account-tabview-content div.content-tab-' + tabIndex, tabView, true), 'selected');
                    if (Dom.hasClass(el, 'menu-tab-deposit-history')){
                        ZAPNET.SportsBookPages.gotoPage('/deposit/history.js');
                    } else if (Dom.hasClass(el, 'menu-tab-withdraw-history')){
                        ZAPNET.SportsBookPages.gotoPage('/withdraw/history.js');
                    }
                    Event.preventDefault(e);
                    return true;
                }
            }

            if (Dom.hasClass(el, 'slip-handle')){
                clearVisibleSlip();
                var td = Dom.getAncestorByTagName(el, 'td');
                var slipEl = $('div.inline-betslip', td, true);
                if (slipEl){
                    Dom.addClass(slipEl, 'visible');
                    var tr = Dom.getAncestorByTagName(el, 'tr');
                    Dom.addClass(tr, 'highlight');
                    visibleSlip = slipEl;
                    var viewportHeight = Dom.getViewportHeight();
                    var tdPos = Dom.getXY(td);
                    var slipWH = Util.getDimensions(slipEl);
                    Dom.setX(slipEl, tdPos[0] - slipWH.width - 20);
                    if (tdPos[1] + slipWH.height > viewportHeight){
                        Dom.setY(slipEl, tdPos[1] - Math.min(tdPos[1], tdPos[1] + slipWH.height - viewportHeight));
                    } else {
                        Dom.setY(slipEl, tdPos[1]);
                    }
                    Event.stopEvent(e);

                    // Util.showMessage('<div class="inline-betslip">' + slipEl.innerHTML + '</div>', Util.t('Betting Slip'));
                }
                return true;
            }

            var tr = Dom.getAncestorByTagName(el, 'tr');
            if (tr){
                var href = Dom.getAttribute(tr, 'href');
                if (href){
                    ZAPNET.SportsBookPages.gotoPage(href, true, true);
                    Event.preventDefault(e);
                    return true;
                }
            }

            if (Dom.hasClass(el, 'betslip-cashout')){
                Event.stopEvent(e);
                doBetslipCashout(el);
                return true;
            }

            if (Dom.hasClass(el, 'user-accounts-newshop')){
                Event.preventDefault(e);
                var elements = [];
                if (ZAPNET_ONLINE_CONSTANTS.SHOPMANAGER_CREATECUSTOMER_INPUT == 'standard'){
                    elements = [
                        {name: 'first_name', label: 'First Name', type: 'text' },
                        {name: 'last_name', label: 'Last Name', type: 'text' },
                        {name: 'email', label: 'Email', type: 'text', required: true },
                        {name: 'telephone', label: 'Telephone', type: 'text' }
                    ];
                }
                elements.push(
                    {name: 'username', label: 'Username', type: 'text', required: true },
                    {name: 'password', label: 'Password', type: 'password', required: true },
                    {name: 'password2', label: 'Verify Password', type: 'password', required: true },
                    {name: 'allowsubaccounts', label: 'Can create shops', type: 'checkbox', checked: true, required: false }
                );
                if (ZAPNET_ONLINE_CONSTANTS.CASINO){
                    elements.push({name: 'allowcasino', label: 'Can play in casino', type: 'checkbox', checked: true, required: false });
                }
                Util.formInputPanel({
                        title: Util.t('Create New Shop'),
                        elements: elements
                    }, [{
                        label: 'Create Shop',
                        fn: function(input){
                            ZAPNET.SportsBookPages.formSubmit('/account/useraccountshop.js', ZAPNET.util.post(input));
                        },
                        isDefault: false
                    },{
                        label: 'Cancel',
                        fn: function(){},
                        isDefault: true
                    }
                ], 'Create New Shop');
                return true;
            }

            if (Dom.hasClass(el, 'user-accounts-newcustomer')){
                Event.preventDefault(e);
                var elements = [];
                if (ZAPNET_ONLINE_CONSTANTS.SHOPMANAGER_CREATECUSTOMER_INPUT == 'standard'){
                    elements = [
                        {name: 'first_name', label: 'First Name', type: 'text' },
                        {name: 'last_name', label: 'Last Name', type: 'text' },
                        {name: 'email', label: 'Email', type: 'text', required: true },
                        {name: 'telephone', label: 'Telephone', type: 'text' }
                    ];
                }
                elements.push(
                    {name: 'username', label: 'Username', type: 'text', required: true },
                    {name: 'password', label: 'Password', type: 'password', required: true },
                    {name: 'password2', label: 'Verify Password', type: 'password', required: true }
                );
                if (ZAPNET_ONLINE_CONSTANTS.CASINO){
                    elements.push({name: 'allowcasino', label: 'Can play in casino', type: 'checkbox', checked: true, required: false });
                }
                Util.formInputPanel({
                        title: Util.t('Create New Customer'),
                        elements: elements
                    }, [{
                        label: 'Create Customer',
                        fn: function(input){
                            ZAPNET.SportsBookPages.formSubmit('/account/useraccountcustomer.js', ZAPNET.util.post(input));
                        },
                        isDefault: false
                    },{
                        label: 'Cancel',
                        fn: function(){},
                        isDefault: true
                    }
                ], 'Create New Customer');
                return true;
            }

            if (Dom.hasClass(el, 'user-accounts-placebetsas')){
                Event.preventDefault(e);
                var id = Dom.getAttribute(el, 'uid');
                var callback = {
                    success: function(o){
                        var result = eval('(' + o.responseText + ')');
                        if (result && result.error){
                            Util.showErrorMessage(Util.t(result.error));
                        }
                        if (id === '0'){
                            if (result && result.resetproxyuser){
                                var proxyEl = Dom.get('placebetsfor');
                                if (proxyEl){
                                    Dom.addClass(proxyEl, 'hidden');
                                    proxyEl.innerHTML = '';
                                }
                            } else {
                                Util.showErrorMessage('Cannot reset +BET for customer');
                            }
                        } else {
                            if (result && result.proxyuser){
                                var proxyEl = Dom.get('placebetsfor');
                                if (proxyEl){
                                    Dom.removeClass(proxyEl, 'hidden');
                                    proxyEl.innerHTML = '+BET ' + result.proxyuser;
                                }
                            }
                        }
                    },
                    failure: function(o){
                        Util.showErrorMessage('Could not process request')
                    },
                    cache: false,
                    timeout: 20000
                };
                YAHOO.util.Connect.asyncRequest('GET', '/account/useraccountplacebetsfor.js?cid=' + id, callback);
                return true;
            }

            if (Dom.hasClass(el, 'user-accounts-deposit')){
                Event.preventDefault(e);
                if (Dom.hasClass(el, 'disabled')){
                    return;
                }
                var elements = [{name: 'cid', type: 'hidden', value: Dom.getAttribute(el, 'uid')}];
                if (ZAPNET_SHOP_MANAGER_GET_TRANSFERS_TYPE){
                    var depositOptions = [];
                    depositOptions.push({value: 'cash', label: Util.t('Cash')});
                    if (ZAPNET_DEPOSIT_BANK_ACCOUNTS){
                        Util.foreach(ZAPNET_DEPOSIT_BANK_ACCOUNTS, function(account){
                            depositOptions.push({value: 'bank_' + account.name, label: Util.t('Bank') + ' - ' + account.name});
                        });
                    } else {
                        depositOptions.push({value: 'bank', label: Util.t('Bank')});
                    }
                    depositOptions.push({value: 'mobile', label: Util.t('Mobile')});
                    depositOptions.push({value: 'credit', label: Util.t('Credit')});
                    elements.push({name: 'type', type: 'select', label: 'Deposit Type', options: depositOptions});
                }
                elements.push({name: 'amount', label: 'Amount', type: 'text' });
                Util.formInputPanel({
                        title: Util.t('Customer Deposit'),
                        elements: elements
                    }, [{
                        label: 'Deposit',
                        fn: function(input){
                            ZAPNET.SportsBookPages.formSubmit('/account/useraccountdeposit.js', ZAPNET.util.post(input));
                        },
                        isDefault: false
                    },{
                        label: 'Cancel',
                        fn: function(){},
                        isDefault: true
                    }
                ], 'Customer Deposit');
                return true;
            }

            if (Dom.hasClass(el, 'user-accounts-withdraw')){
                Event.preventDefault(e);
                if (Dom.hasClass(el, 'disabled')){
                    return;
                }
                var elements = [{name: 'cid', type: 'hidden', value: Dom.getAttribute(el, 'uid')}];
                if (ZAPNET_SHOP_MANAGER_GET_TRANSFERS_TYPE){
                    var depositOptions = [];
                    depositOptions.push({value: 'cash', label: Util.t('Cash')});
                    if (ZAPNET_DEPOSIT_BANK_ACCOUNTS){
                        Util.foreach(ZAPNET_DEPOSIT_BANK_ACCOUNTS, function(account){
                            depositOptions.push({value: 'bank_' + account.name, label: Util.t('Bank') + ' - ' + account.name});
                        });
                    } else {
                        depositOptions.push({value: 'bank', label: Util.t('Bank')});
                    }
                    depositOptions.push({value: 'mobile', label: Util.t('Mobile')});
                    depositOptions.push({value: 'credit', label: Util.t('Credit')});
                    elements.push({name: 'type', type: 'select', label: 'Withdrawal Type', options: depositOptions});
                }
                elements.push({name: 'amount', label: 'Amount', type: 'text' });
                Util.formInputPanel({
                        title: Util.t('Customer Withdraw'),
                        elements: elements
                    }, [{
                        label: 'Withdraw',
                        fn: function(input){
                            ZAPNET.SportsBookPages.formSubmit('/account/useraccountwithdraw.js', ZAPNET.util.post(input));
                        },
                        isDefault: false
                    },{
                        label: 'Cancel',
                        fn: function(){},
                        isDefault: true
                    }
                ], 'Customer Withdraw');
                return true;
            }

            if (Dom.hasClass(el, 'user-accounts-password')){
                Event.preventDefault(e);
                Util.formInputPanel({
                        title: Util.t('Change Password'),
                        elements: [
                            {name: 'cid', type: 'hidden', value: Dom.getAttribute(el, 'uid')},
                            {name: 'password', label: 'New Password', type: 'password' },
                            {name: 'password2', label: 'Verify Password', type: 'password' }
                        ]
                    }, [{
                        label: Util.t('Change Password'),
                        fn: function(input){
                            ZAPNET.SportsBookPages.formSubmit('/account/useraccountpassword.js', ZAPNET.util.post(input));
                        },
                        isDefault: false
                    },{
                        label: 'Cancel',
                        fn: function(){},
                        isDefault: true
                    }
                ], Util.t('Change Password'));
                return true;
            }

            if (Dom.hasClass(el, 'user-accounts-active')){
                Event.preventDefault(e);
                var input = {
                    cid: Dom.getAttribute(el, 'uid'),
                    active: el.checked ? 1 : 0
                };
                ZAPNET.SportsBookPages.formSubmit('/account/useraccountactivate.js', ZAPNET.util.post(input));
                return true;
            }

            var matchEl = Dom.hasClass(el, 'match-link') ? el : Dom.getAncestorByClassName(el, 'match-link');
            if (matchEl){
                var matchId = Dom.getAttribute(matchEl, 'mid');
                if (matchId && ZAPNET.BetDB.matches[matchId]){
                    ZAPNET.Coupon.gotoLiveMatch(matchId);
                    return true;
                }
            }

            return false;
        },

        setProductMenuTab = function(el){
            var menu = Dom.getAncestorByTagName(el, 'ul');
            Dom.removeClass($('.selected', menu), 'selected');
            Dom.addClass(Dom.getAncestorByTagName(el, 'li'), 'selected');
        },

        headerClick = function(e){
            var el = Event.getTarget(e);
            if (window.ZAPNET_WEBSITE_PAGE){
                return;
            }
            if (Dom.hasClass(el, 'product-sports')){
                Event.stopEvent(e);
                setSportsProduct();
            } else if (Dom.hasClass(el, 'product-in-play')){
                Event.stopEvent(e);
                setLiveProduct();
            } else if (Dom.hasClass(el, 'product-outrights')){
                Event.stopEvent(e);
                setProductMenuTab(el);
                show('sports');
                showOutrights(3);
            } else if (Dom.hasClass(el, 'product-favorites')){
                Event.stopEvent(e);
                var matchList = ZAPNET.Coupon.getFavoriteMatches();
                if (!matchList.length){
                    Util.showErrorMessage(Util.t('No favorite matches selected'), Util.t('Error'));
                    return;
                }
                setProductMenuTab(el);
                show('sports');
                showFavorites(matchList);
            } else if (Dom.hasClass(el, 'product-topevents')){
                Event.stopEvent(e);
                setProductMenuTab(el);
                show('sports');
                showTopEvents();
            } else if (Dom.hasClass(el, 'product-keno')){
                //Event.stopEvent(e);
            } else if (Dom.hasClass(el, 'product-virtual')){
//                Event.stopEvent(e);
//                setProductMenuTab(el);
//                show('virtual');
//                showVirtual();
            } else if (Dom.hasClass(el, 'product-casino')){
                //Event.stopEvent(e);
            } else if (Dom.hasClass(el, 'sports-bonus')){
                show('pages');
                ZAPNET.SportsBookAccount.gotoBonus();
            } else if (Dom.hasClass(el, 'extra-help')){
                show('pages');
                ZAPNET.SportsBookAccount.gotoHelp();
            } else if (Dom.hasClass(el, 'extra-results')){
                show('pages');
                ZAPNET.SportsBookAccount.gotoResults();
            } else if (Dom.hasClass(el, 'company-contact')){
                show('pages');
                ZAPNET.SportsBookAccount.gotoContactUs();
            } else if (Dom.hasClass(el, 'company-about')){
                show('pages');
                ZAPNET.SportsBookAccount.gotoAbout();
            } else if (Dom.hasClass(el, 'company-news')){
                show('pages');
                ZAPNET.SportsBookAccount.gotoNews();
            } else if (Dom.hasClass(el, 'extra-faq')){
                show('pages');
                ZAPNET.SportsBookAccount.gotoFaq();
            } else if (Dom.hasClass(el, 'company-deposits')){
                show('pages');
                ZAPNET.SportsBookAccount.gotoDeposits();
            } else if (Dom.hasClass(el, 'company-promotions')){
                gotoPromotions(e);
            } else if (Dom.hasClass(el, 'company-careers')){
                show('pages');
                ZAPNET.SportsBookAccount.gotoCareers();
            } else if (Dom.hasClass(el, 'company-content')){
                show('pages');
                ZAPNET.SportsBookAccount.gotoContent(el);
            }
        },

        setSportsView = function(){
            if (!ZAPNET.BetDB){
                gotoAfterLoad = 'sports';
                return;
            }
            show('sports');
            setProductMenuTab($('#product-menu .product-sports', null, true));
        },

        setLiveView = function(){
            if (!ZAPNET.BetDB){
                gotoAfterLoad = 'live';
                return;
            }
            show('live');
            setProductMenuTab($('#product-menu .product-in-play', null, true));
        },

        setSportsProduct = function(){
            if (!ZAPNET.BetDB){
                gotoAfterLoad = 'sports';
                return;
            }
            if (!isView('sports')){
                setProductMenuTab($('#product-menu .product-sports', null, true));
                show('sports');
                ZAPNET.Coupon.resetTournaments();
                ZAPNET.SportsMenu.refresh();
                sportsReload();
            }
        },

        setLiveProduct = function(){
            if (!ZAPNET.BetDB){
                gotoAfterLoad = 'live';
                return;
            }
            if (!isView('live')){
                setProductMenuTab($('#product-menu .product-in-play', null, true));
                show('live');
                showLive();
            }
        },

        setVirtualProduct = function(force){
            if (force || !isView('virtual')){
                setProductMenuTab($('#product-menu .product-virtual', null, true));
                show('virtual');
                showVirtual();
            }
        },

        setLotteryProduct = function(force){
            if (force || !isView('lottery')){
                setProductMenuTab($('#product-menu .product-lottery', null, true));
                show('lottery');
                showLottery();
            }
        },

        gotoPromotions = function(e){
            if (window.ZAPNET_COMPANYNAME && ZAPNET_COMPANYNAME == 'SpartaBet' && !ZAPNET.user){
                if (e){
                    Util.showErrorMessage('Please Log In to view this information', 'Error');
                    Event.stopEvent(e);
                } else {
                    window.location.href = '/';
                }
                return;
            }
            setProductMenuTab($('#product-menu a.company-promotions', null, true));
            show('pages');
            ZAPNET.SportsBookAccount.gotoPromotions();
        },

        footerClick = function(e){
            if (window.ZAPNET_WEBSITE_PAGE){
                return;
            }

            var el = Event.getTarget(e);
            if (el.tagName.toLowerCase() == 'img'){
                el = el.parentNode;
            }


            if (Dom.hasClass(el, 'company-about')){
                show('pages');
                ZAPNET.SportsBookAccount.gotoAbout();
            } else if (Dom.hasClass(el, 'company-content')){
                show('pages');
                ZAPNET.SportsBookAccount.gotoContent(el);
            } else if (Dom.hasClass(el, 'company-terms')){
                show('pages');
                ZAPNET.SportsBookAccount.gotoTerms();
            } else if (Dom.hasClass(el, 'company-privacy')){
                show('pages');
                ZAPNET.SportsBookAccount.gotoPrivacy();
            } else if (Dom.hasClass(el, 'company-gambling')){
                show('pages');
                ZAPNET.SportsBookAccount.gotoGambling();
            } else if (Dom.hasClass(el, 'company-contact')){
                show('pages');
                ZAPNET.SportsBookAccount.gotoContactUs();
            } else if (Dom.hasClass(el, 'company-rules')){
                show('pages');
                ZAPNET.SportsBookAccount.gotoRules();
            } else if (Dom.hasClass(el, 'company-promotions')){
                gotoPromotions(e);
            } else if (Dom.hasClass(el, 'company-careers')){
                show('pages');
                ZAPNET.SportsBookAccount.gotoCareers();
            } else if (Dom.hasClass(el, 'product-sports')){
                return headerClick(e);
            } else if (Dom.hasClass(el, 'product-in-play')){
                return headerClick(e);
            } else if (Dom.hasClass(el, 'product-virtual')){
                return headerClick(e);
            } else if (Dom.hasClass(el, 'extra-livescore')){
                Event.preventDefault(e);
            } else if (Dom.hasClass(el, 'extra-statistics')){
                Event.preventDefault(e);
            } else if (Dom.hasClass(el, 'extra-help')){
                show('pages');
                ZAPNET.SportsBookAccount.gotoHelp();
            } else if (Dom.hasClass(el, 'extra-results')){
                show('pages');
                ZAPNET.SportsBookAccount.gotoResults();
            } else if (Dom.hasClass(el, 'extra-bonus')){
                show('pages');
                ZAPNET.SportsBookAccount.gotoBonus();
            } else if (Dom.hasClass(el, 'company-register')){
                show('pages');
                window.location.href = '/register';
            } else if (Dom.hasClass(el, 'company-news')){
                show('pages');
                ZAPNET.SportsBookAccount.gotoNews();
            } else if (Dom.hasClass(el, 'extra-faq')){
                show('pages');
                ZAPNET.SportsBookAccount.gotoFaq();
            } else if (Dom.hasClass(el, 'company-deposits')){
                show('pages');
                ZAPNET.SportsBookAccount.gotoDeposits();
            }
        },

        openLivescore = function(){
            window.open('/statistics/livescore', null, 'height=750,width=1154,location=no,menubar=no,status=no,titlebar=no,toolbar=no');
        },

        pageClick = function(e){
            var el = Event.getTarget(e);

            if (el.tagName.toLowerCase() == 'img'){
                el = el.parentNode;
            }

            if (Dom.hasClass(el, 'bet-book-login')){
                lastBookingPanel.destroy();
                Event.preventDefault(e);

                var loginEl = $('#user-panel input[name="username"]', null, true);
                if (loginEl){
                    loginEl.focus();
                }
                return;
            }

            if (Dom.hasClass(el, 'bet-book-email')){
                if (!Dom.hasClass(el, 'send')){
                    el.innerHTML = '<input type="text" class="email" placeholder="' + Util.t('Email') + '"/><button class="bet-book-email-send">&#10151;</button>';
                    Dom.addClass(el, 'send');
                }
                Event.preventDefault(e);
                return;
            }

            if (Dom.hasClass(el, 'bet-book-email-send')){
                var email = $('input.email', Dom.getAncestorByClassName(el, 'bet-book-email'), true);
                if ($P.trim(email.value)){
                    emailBooking(lastBookingId, email.value);
                    lastBookingPanel.destroy();
                }
                Event.preventDefault(e);
                return;
            }

            if (Dom.hasClass(el, 'email') && el.tagName.toLowerCase() == 'input'){
                Event.preventDefault(e);
                return;
            }

            if (Dom.hasClass(el, 'extra-livescore')){
                Event.preventDefault(e);
                openLivescore();
            } else if (Dom.hasClass(el, 'extra-results')){
                Event.preventDefault(e);
                show('pages');
                ZAPNET.SportsBookAccount.gotoResults();
            }

            if (Dom.hasClass(el, 'object-link')){
                var lnk = Dom.getAttribute(el, 'lnk');
                var lnkid = Dom.getAttribute(el, 'lnkid');
                if (lnk){
                    followLink(lnk, lnkid, e);
                    Event.preventDefault(e);
                    return;
                }
            }

            if (Dom.hasClass(el, 'product-sports')){
                return headerClick(e);
            } else if (Dom.hasClass(el, 'product-in-play')){
                return headerClick(e);
            } else if (Dom.hasClass(el, 'product-virtual')){
                return headerClick(e);
            } else if (Dom.hasClass(el, 'company-about')){
                return footerClick(e);
            } else if (Dom.hasClass(el, 'company-content')){
                return footerClick(e);
            } else if (Dom.hasClass(el, 'company-contact')){
                return footerClick(e);
            } else if (Dom.hasClass(el, 'company-promotions')){
                return gotoPromotions(e);
            } else if (Dom.hasClass(el, 'extra-help')){
                return footerClick(e);
            } else if (Dom.hasClass(el, 'extra-bonus')){
                return footerClick(e);
            }

            if (Dom.hasClass(el, 'show-betting-history')){
                Event.preventDefault(e);
                ZAPNET.SportsBookAccount.gotoBettingHistoryCombined();
                ZAPNET.SportsBookAccount.showMenu(dom.accountMenu);
                show('account');
            } else if (Dom.hasClass(el, 'reload-last-bet')){
                bettingSlip.recoverLastSlip();
            }

            var languageSelect = $('#nav-right div.language-options', null, true);
            if (languageSelect){
                Dom.removeClass(languageSelect, 'open');
            }

            if (Dom.hasClass(el, 'sports-daily-coupon')){
                ZAPNET.Coupon.renderTodaysMatches();
            }

            var openCloseBets = Dom.hasClass(el, 'open-close-open-bets') ? el : Dom.getAncestorByClassName(el, 'open-close-open-bets');
            if (openCloseBets){
                var navBlock = Dom.getAncestorByClassName(el, 'betslip-open-bets');
                if (navBlock){
                    if (Dom.hasClass(navBlock, 'open')){
                        Dom.removeClass(navBlock, 'open');
                    } else {
                        Dom.addClass(navBlock, 'open');
                    }
                }
                Event.stopEvent(e);
                return;
            }

            if (Dom.hasClass(el, 'betslip-cashout')){
                Event.stopEvent(e);
                doBetslipCashout(el);
                return;
            }

            if (Dom.hasClass(el, 'menu-item') && !Dom.hasClass(el, 'selected')){
                var preparedBetsEl = Dom.getAncestorByClassName(el, 'preparedbets');
                Dom.removeClass($('.menu-item.selected', preparedBetsEl), 'selected');
                Dom.removeClass($('.bet-content.selected', preparedBetsEl), 'selected');
                Dom.addClass(el, 'selected');
                var code = Dom.getAttribute(el, 'code');
                Dom.addClass($('div[code="' + code + '"].bet-content', preparedBetsEl, true), 'selected');
            }

            if (Dom.hasClass(el, 'preparedbets-load')){
                var preparedBetsEl = Dom.getAncestorByClassName(el, 'preparedbets');
                var betCont = $('.bet-content.selected', preparedBetsEl, true);
                var code = Dom.getAttribute(betCont, 'code');
                if (code){
                    if (window.ZAPNET_PREPARED_BETS && ZAPNET_PREPARED_BETS[code]){
                        bettingSlip.clear();
                        Util.foreach(ZAPNET_PREPARED_BETS[code].selections, function(sel){
                            bettingSlip.setSelection(sel.selection_id);
                        });
                        var amountEl = $('input.prepared-bet-stake', betCont, true);
                        if (amountEl && +amountEl.value){
                            bettingSlip.setStake(+amountEl.value);
                        }
                        if (bettingSlipRenderer){
                            bettingSlipRenderer.refresh();
                        }
                    }
                }
            }

        },

        reparedBetType = function(e){
            var el = Event.getTarget(e);
            var amount = +el.value;
            var lineEl = Dom.getAncestorByClassName(el, 'bet-info');
            var payout = $('.bet-total-payout', lineEl, true);
            var odds = Dom.getAttribute(el, 'odds');
            if (amount){
                payout.innerHTML = Util.formatAmountCommas(odds * amount, true);
            } else {
                payout.innerHTML = '-';
            }
        },

        scrollClick = function(e){
            scrollToTop();
        },

        closePleaseWait = function(){
            if (pleaseWaitPanel && pleaseWaitPanel.element){
                pleaseWaitPanel.destroy();
                pleaseWaitPanel = null;
            }
        },

        showWait = function(){
            closePleaseWait();
            Dom.setStyle(dom.docMask, 'display', 'block');
            Dom.addClass(dom.slipProxy, 'waiting');
        },

        hideWait = function(){
            closePleaseWait();
            Dom.setStyle(dom.docMask, 'display', 'none');
            Dom.removeClass(dom.slipProxy, 'waiting');
        },

        fundsClick = function(e){
            if (Dom.hasClass(dom.funds, 'hidden')){
                Dom.removeClass(dom.funds, 'hidden');
            } else {
                Dom.addClass(dom.funds, 'hidden');
            }
        },

        widenContent = function(){
            dom.slipOpenClose.innerHTML = Util.t('Open Slip');
            Dom.replaceClass(dom.slipOpenClose, 'closeslip', 'openslip');
            Dom.addClass(dom.doc, 'wide');
            ZAPNET.WebCoupon.setWide();
        },

        shortenContent = function(){
            dom.slipOpenClose.innerHTML = Util.t('Close Slip');
            Dom.replaceClass(dom.slipOpenClose, 'openslip', 'closeslip');
            Dom.removeClass(dom.doc, 'wide');
            ZAPNET.WebCoupon.setShort();
            bettingSlip.render();
        },

        periodSelectSetPeriod = function(p){
            Dom.removeClass($('a.period-select-option', dom.periodSelect), 'selected');
            Dom.addClass($('a.period-select-' + p, dom.periodSelect), 'selected');
            ZAPNET.BetDB.setTimeLimit(p);
            if (dom.nrmarkets){
                dom.nrmarkets.innerHTML = ZAPNET.BetDB.countMatches();
            }
            ZAPNET.SportsMenu.refresh();
        },

        periodSelectClick = function(e){
            var el = Event.getTarget(e);

            if (Dom.hasClass(el, 'period-select-option')){
                Event.preventDefault(e);
                var p = Dom.getAttribute(el, 'p');
                periodSelectSetPeriod(p);
                periodSelectChangeEvent.fire(p);
            }

            if (Dom.hasClass(el, 'clear-all-menu-selections')){
                Event.preventDefault(e);
                setProductMenuTab(el);
                show('sports');
                ZAPNET.Coupon.resetTournaments();
                ZAPNET.SportsMenu.refresh();
                setupHome();
            }
        },

        oddsLessThanClick = function(e){
            var el = Event.getTarget(e);
            if (Dom.hasClass(el, 'odds-less-than')){
                Event.preventDefault(e);
                var od = Dom.getAttribute(el, 'od');
                if (od){
                    try{
                    ZAPNET.Website.show('coupon');
                    ZAPNET.Coupon.showFavoriteOdds(od / 100);
                    }catch(e){
                        console.log(e)
                    }
                }
                return;
            }
        },

        slipProxyClick = function(e){
            var el = Event.getTarget(e);

            if (Dom.hasClass(el, 'clear')){
                bettingSlip.clear();
                widenContent();
            } else if (Dom.hasClass(el, 'submit')){
                bettingSlip.placeBet();
            } else if (Dom.hasClass(el, 'openslip')){
                shortenContent();
            } else if (Dom.hasClass(el, 'closeslip')){
                widenContent();
            } else if (Dom.hasClass(el, 'reloadslip')){
                bettingSlip.recoverLastSlip();
            }

            Event.preventDefault(e);
        },

        slipPlacedClick = function(e){
            var el = Event.getTarget(e);

            if (Dom.hasClass(el, 'reloadslip')){
                bettingSlip.recoverLastSlip();
                Event.preventDefault(e);
            } else if (Dom.hasClass(el, 'printslip')){
                Util.print();
                Event.preventDefault(e);
            } else if (Dom.hasClass(el, 'placebetok')){
                bettingSlip.render();
                Event.preventDefault(e);
            }

        },

        slipStake = function(){
            var amount = parseFloat(dom.slipStake.value);
            stakeFromProxy = amount;
            if (amount){
                bettingSlip.setStake(amount);
            } else {
                bettingSlip.clearStake();
            }
        },

        showAccountNotification = function(message){
        },

        hideAccountNotification = function(){
        },

        infoEvent = function(event){
            if (event.o == 'user'){
                if (event.t == 'balance'){
                    dom.funds.innerHTML = Util.formatAmountCommas(event.v, true);
                }
                if (event.t == 'authorise'){
                    Dom.addClass(dom.accountLaunch, 'highlight');
                    showAccountNotification('Authorisation Notification');
                }
            }
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

            lastBookingId = betbook.code;
            lastBookingPanel = panel;
        },

        betslipPlaced = function(response){
            /*
            if (response.result == "ok"){
                bettingSlip.clear();
                if (dom.slip){
                    setTimeout(function(){
                        dom.slip.innerHTML = '<div class="slip-content"><div class="bets-placed">' + Util.t('Bets Placed') + '.&nbsp;&nbsp;&nbsp;' + (false ? '<a href="#" class="printslip">Print Slip</a>&nbsp;&nbsp;&nbsp;&nbsp;' : '') + '<a href="#" class="placebetok">' + Util.t('OK') + '</a></div></div>';
                    }, 0);
                }
            }*/
            updateFunds(response);
            if (response.html && dom.print){
                dom.print.innerHTML = response.html;
            }

            addRecentBet(response);

            addOpenBets(response);
        },

        addRecentBet = function(slip){
            if (!dom.recentBets){
                return;
            }
            Dom.addClass(dom.recentBets, 'active');
            var bid = Util.div('betid');
            var bts = Util.div('time');
            var descr = Util.div('descr');
            var amount = Util.div('amount');
            var line = Util.div('line');
            Util.addElements(line, [bid, bts, descr, amount]);
            recentBetsTotal += +slip.amount;
            bid.innerHTML = slip.id;
            bts.innerHTML = $P.date('H:i', slip.ts);
            descr.innerHTML = slip.description;
            descr.title = slip.description;
            amount.innerHTML = Util.formatAmountCommas(slip.amount, true);
            dom.recentBetList.appendChild(line);
            dom.recentBetsTotal.innerHTML = Util.formatAmountCommas(recentBetsTotal, true);
            Dom.setAttribute(line, 'bid', slip.id);
            Dom.addClass(dom.recentBets, 'active');
        },

        addOpenBets = function(slip){
            if (!dom.openBets || !slip.openbets){
                return;
            }
            dom.openBets.innerHTML = slip.openbets;
            if (slip.openbetmatches){
                Util.foreach(slip.openbetmatches, function(mId){
                    ZAPNET.Coupon.addFavoriteMatch(mId);
                });
                ZAPNET.Coupon.refreshLiveMatchList();
            }
        },

        recentBetsClear = function(){
            Dom.removeClass(dom.recentBets, 'active');
            dom.recentBetList.innerHTML = '';
            dom.recentBetsTotal.innerHTML = '';
            recentBetsTotal = 0;
        },

        recentBetsClick = function(e){
            var el = Event.getTarget(e);

            if (Dom.hasClass(el, 'clear')){
                recentBetsClear();
            } else {
                var line = Dom.getAncestorByClassName(el, 'line');
                if (line){
                    var betId = Dom.getAttribute(line, 'bid');
                    if (betId){
                        ZAPNET.Website.show('account');
                        ZAPNET.SportsBookAccount.gotoBet(betId);
                        ZAPNET.SportsBookAccount.showMenu(dom.accountMenu);
                    }
                }
            }
        },

        languageClick = function(e){
            var el = Event.getTarget(e);
            if (el.tagName.toLowerCase() == 'a'){
                return;
            }
            var languageSelect = $('#page-top div.top-language-select', null, true);
            if (Dom.hasClass(languageSelect, 'open')){
                Dom.removeClass(languageSelect, 'open');
            } else {
                Dom.addClass(languageSelect, 'open');
            }
            Event.stopEvent(e);
        },

        languageRightClick = function(e){
            var el = Event.getTarget(e);
            if (el.tagName.toLowerCase() == 'a'){
                return;
            }
            var languageSelect = $('#nav-right div.language-options', null, true);
            if (Dom.hasClass(languageSelect, 'open')){
                Dom.removeClass(languageSelect, 'open');
            } else {
                Dom.addClass(languageSelect, 'open');
            }
            Event.stopEvent(e);
        },

        chatClick = function(){
            ZAPNET.ChatService.startChat();
        },

        emailBooking = function(bookingCode, email){
            var url = '/betbooking/email?id=' + bookingCode + '&e=' + email;
            var callback = {
                success: function(o){},
                failure: function(o){},
                cache: false,
                timeout: 20000
            };
            YAHOO.util.Connect.asyncRequest('GET', url, callback);
        },

        requestAuth = function(slipId){
            var url = '/bet/reqauth.js?id=' + slipId;
            var callback = {
                success: function(o){
                    var data = eval('(' + o.responseText + ')');
                    if (data.error){
                        Util.showErrorMessage(data.error, 'Error');
                    } else {
                        Util.showSuccessMessage(Util.t('Authorisation Request Submitted', 'Authorisation'));
                    }
                },
                failure: function(o){
                    Util.showErrorMessage('Error: ' + o.responseText, 'Error');
                },
                cache: false,
                timeout: 20000
            };
            YAHOO.util.Connect.asyncRequest('GET', url, callback);
        },

        betslipAuth = function(slip){
            authPanel.show();
            var error = false;
            if (slip.cleared <= 0){
                error = Util.t('Bet cannot be placed without authorisation');
            }

            if (error){
                Dom.addClass(dom.authBuy, 'disabled');
                dom.authBuy.innerHTML = Util.t('Place Bets');
            } else {
                Dom.removeClass(dom.authBuy, 'disabled');
                dom.authBuy.innerHTML = Util.t('Place Bets for ') + Util.formatAmountCommas(slip.cleared, true);
            }
            dom.authRequestAuth.innerHTML = Util.t('Request Auth for ') + Util.formatAmountCommas(slip.amount, true);

            Event.purgeElement(dom.authBuy);
            Event.on(dom.authBuy, 'click', function(){
                if (error){
                    Util.showErrorMessage(error, 'Error');
                } else {
                    authPanel.hide();
                    bettingSlip.setStake(slip.cleared);
                    bettingSlip.placeBet();
                }
            });
            Event.purgeElement(dom.authRequestAuth);
            Event.on(dom.authRequestAuth, 'click', function(){
                authPanel.hide();
                requestAuth(slip.id);
            });
            Event.purgeElement(dom.authCancel);
            Event.on(dom.authCancel, 'click', function(){
                authPanel.hide();
            });

            dom.authPanelSlip.innerHTML = '<div class="inline-betslip inline-betslip-simple">' + slip.html + '</div>';
            Dom.setStyle(dom.authPanelSlip, 'height', 'auto');

            var panelHeight = Util.getDimensions(authPanel.element).height;
            var viewport = Dom.getClientRegion();
            var viewportHeight = viewport.bottom - viewport.top;
            if (panelHeight + 50 > viewportHeight){
                var slipHeight = Util.getDimensions(dom.authPanelSlip).height;
                Dom.setStyle(dom.authPanelSlip, 'height', (slipHeight - (panelHeight + 50 - viewportHeight)) + 'px');
                dom.authPanelSlip.scrollTop = dom.authPanelSlip.scrollHeight;
            }
            Util.centerPanel(authPanel);
        },

        authBuySlip = function(slipId){
            var url = '/bet/sell.js?id=' + slipId;
            var callback = {
                success: function(o){
                    var data = eval('(' + o.responseText + ')');
                    if (data.error){
                        Util.showErrorMessage(data.error, 'Error');
                    } else if (data.result === 'ok') {
                        Util.showSuccessMessage('Bets Placed');
                        addRecentBet(data);
                    }
                },
                failure: function(o){
                    Util.showErrorMessage('Error: ' + o.responseText, 'Error');
                },
                cache: false,
                timeout: 20000
            };
            YAHOO.util.Connect.asyncRequest('GET', url, callback);
        },

        betEvent = function(event){
            if (event.a === "declined"){
                Util.showErrorMessage('Authorisation declined');
            } else if (event.a === 'approved' || event.a === 'limit'){
                if (event.d){
                    var data = eval('(' + event.d + ')');
                    if (!data.id){
                        data.id = event.b;
                    }
                    authResponse(data, event.a);
                    if (data.sold){
                        addRecentBet({
                            id: data.id,
                            amount: data.stake,
                            ts: data.ts,
                            description: data.description
                        });
                    }
                }
            }
        },

        authResponse = function(slip, action){
            authBuyPanel.show();
            var message = Util.t(slip.sold ? 'Bets Accepted' : 'Authorisation Approval');

            if (action === 'limit'){
                message += ' ' + Util.t('for') + ' ' + Util.formatAmountCommas(slip.amount, true);
                dom.authBuyBuy.innerHTML =Util.t( 'Place Bets for ') + Util.formatAmountCommas(slip.amount, true);
            } else {
                dom.authBuyBuy.innerHTML = Util.t('Place Bets');
            }

            if (slip.newodds){
                message += ' * ' + Util.t('NEW ODDS') + ' *';
            }

            if (slip.sold){
                Dom.replaceClass(dom.authBuyPanel, 'auth-approval', 'auth-sale');
                Event.purgeElement(dom.authBuyPanel);
                Event.on(dom.authBuyPanelOK, 'click', function(){
                    authBuyPanel.hide();
                });
            } else {
                Dom.replaceClass(dom.authBuyPanel, 'auth-sale', 'auth-approval');
                Event.purgeElement(dom.authBuyBuy);
                Event.on(dom.authBuyBuy, 'click', function(){
                    authBuyPanel.hide();
                    authBuySlip(slip.id);
                });
                Event.purgeElement(dom.authBuyCancel);
                Event.on(dom.authBuyCancel, 'click', function(){
                    authBuyPanel.hide();
                });
            }

            dom.authBuyPanelSlip.innerHTML = '<h1 class="auth-head">' + message + '</h1><div class="inline-betslip inline-betslip-simple">' + slip.html + '</div>';
            Dom.setStyle(dom.authBuyPanelSlip, 'height', 'auto');

            var panelHeight = Util.getDimensions(authBuyPanel.element).height;
            var viewport = Dom.getClientRegion();
            var viewportHeight = viewport.bottom - viewport.top;
            if (panelHeight + 50 > viewportHeight){
                var slipHeight = Util.getDimensions(dom.authBuyPanelSlip).height;
                Dom.setStyle(dom.authBuyPanelSlip, 'height', (slipHeight - (panelHeight + 50 - viewportHeight)) + 'px');
                dom.authBuyPanelSlip.scrollTop = dom.authBuyPanelSlip.scrollHeight;
            }
            Util.centerPanel(authBuyPanel);
            setTimeout(function(){
                Dom.removeClass(dom.accountLaunch, 'highlight');
            }, 10);
        },

        setupBettingSlip = function(){
            bettingSlip = ZAPNET.BettingSlip({fixHeight: false, acceptbet: false});
            bettingSlip.betbookEvent.subscribe(betBooking);
            bettingSlip.betsPlacedEvent.subscribe(betslipPlaced);
            bettingSlip.requestAuthEvent.subscribe(betslipAuth);
            bettingSlip.betsSentEvent.subscribe(function(){
                //showWait();
            });
            bettingSlip.betsResponseEvent.subscribe(function(){
                //hideWait();
            });
            if (window.ZAPNET_ONLINE_CONSTANTS && ZAPNET_ONLINE_CONSTANTS.BET_PLACE_CONFIRM){
                bettingSlip.setConfirmPlacebet(true);
            }
            //bettingSlip.messageEvent.subscribe(showMessage);
            if (window.ZAPNET_BETSLIP_SCHEDULE){
                ZAPNET.BetDB.addMatches(window.ZAPNET_BETSLIP_SCHEDULE);
            }
            if (window.ZAPNET_PREPARED_BETS_SCHEDULE){
                ZAPNET.BetDB.addMatches(window.ZAPNET_PREPARED_BETS_SCHEDULE);
            }
            if (window.ZAPNET_BETSLIP_DATA){
                bettingSlip.setupSlip(window.ZAPNET_BETSLIP_DATA);
            }

            if (ZAPNET.BettingSlipRenderer){
                var renderer = ZAPNET.BettingSlipRenderer(bettingSlip);
                renderer.setup(Dom.get('slip'));
                if (ZAPNET.BetomallService){
                    ZAPNET.BetomallService.betsPlacedEvent.subscribe(betslipPlaced);
                    bettingSlip.requestAuthEvent.unsubscribe(betslipAuth);
                    ZAPNET.BetomallService.requestAuthEvent.subscribe(betslipAuth);
                    ZAPNET.BetomallService.betbookEvent.subscribe(betBooking);
                }
                bettingSlipRenderer = renderer;
            }

            if (window.ZAPNET_ONLINE_CONSTANTS && ZAPNET_ONLINE_CONSTANTS.BETSLIP_SCROLL){
                Event.on(window, 'scroll', repositionBetslip);
                Event.on(window, 'resize', repositionBetslip);
                bettingSlip.renderEvent.subscribe(function(){
                    repositionBetslip();
                });
            }

            if (window.ZAPNET_WEBSITE_PAGE == 'virtual'){
                bettingSlip.renderEvent.subscribe(function(){
                    ZAPNET.Coupon.postRenderVirtual();
                });
            }

            var betRegisterWrapperEl = $('#nav-right .bet-register-wrapper', null, true);
            if (betRegisterWrapperEl && ZAPNET.BetRegister){
                var onlineBetRegister = ZAPNET.BetRegister(betRegisterWrapperEl, bettingSlip);
                onlineBetRegister.matchSelectedEvent.subscribe(function(matchId){
                    ZAPNET.Coupon.showMatch(matchId, true);
                });
                onlineBetRegister.betSelectedEvent.subscribe(bettingSlip.setSelection);
                onlineBetRegister.enterEvent.subscribe(function(){
                    console.log('ENTER');
                });
                var quickFindListener = new YAHOO.util.KeyListener(window, {keys: [111]},{
                    fn: function(type, args){
                        var el = Event.getTarget(args[1]);
                        if (el.tagName.toLowerCase() == 'input' || (el.type && el.type == 'text')){
                            return;
                        }
                        Event.stopEvent(args[1]);
                        onlineBetRegister.search();
                    }
                });
                quickFindListener.enable();
            }
            ZAPNET.PageBettingSlip = bettingSlip;
        },

        showMatchById = function(mid){
            if (ZAPNET.WebCoupon.showMatch(mid)){
                selectedMatchId = mid;
                view = 'match';
                Dom.addClass(dom.content, 'show-match');
                Dom.setAttribute(dom.content, 'mid', mid);
            } else {
                showSports();
            }
        },

        matchSelected = function(mCode){
            if (!ZAPNET.BetDB.matchcodes[mCode]){
                return;
            }
            var mid = ZAPNET.BetDB.matchcodes[mCode].id;
            showMatchById(mid);
        },

        selectionSelected = function(selectionCodes){
            if (selectedMatchId){
                if (ZAPNET.BetDB.matches[selectedMatchId]){
                    var match = ZAPNET.BetDB.matches[selectedMatchId];
                    var i, sp, spMrk;
                    var selectionCode;
                    var candidates = [];
                    for(i = 0; i < selectionCodes.length; i += 1){
                        selectionCode = selectionCodes[i];
                        var marketType = selectionCode.m;
                        var outcome = selectionCode.o;
                        var special = selectionCode.s ? selectionCode.s : '';
                        if (match.marketTypes[marketType]){
                            if (match.marketTypes[marketType][special] && match.marketTypes[marketType][special].market){
                                if (match.marketTypes[marketType][special].market.status == "open"){
                                    if (match.marketTypes[marketType][special].outcomes[outcome]){
                                        var selection = match.marketTypes[marketType][special].outcomes[outcome];
                                        if (selection.odds && selection.odds >= 1){
                                            candidates.push(selection);
                                        }
                                    }
                                }
                            } else if (!selectionCode.s) {
                                for(sp in match.marketTypes[marketType]){
                                    if (match.marketTypes[marketType].hasOwnProperty(sp)){
                                        spMrk = match.marketTypes[marketType][sp];
                                        if (spMrk && spMrk.market && spMrk.market.status == 'open'){
                                            if (spMrk.outcomes[outcome]){
                                                var selection = spMrk.outcomes[outcome];
                                                if (selection.odds && selection.odds >= 1){
                                                    candidates.push(selection);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (candidates.length == 1){
                        bettingSlip.setSelection(candidates[0].id);
                    } else {
                        var liveSelection = null;
                        var preSelection = null;
                        for(i = 0; i < candidates.length; i += 1){
                            if (candidates[0].market.live){
                                liveSelection = candidates[0];
                            } else {
                                preSelection = candidates[0];
                            }
                        }
                        if (liveSelection && !preSelection){
                            bettingSlip.setSelection(liveSelection.id);
                        } else if (preSelection && !liveSelection){
                            bettingSlip.setSelection(preSelection.id);
                        } else {
                            bettingSlip.setSelection(match.live ? liveSelection.id : preSelection.id);
                        }
                    }
                }

                showSports();
            }
        },

        clearMatchCoupon = function(){
            Dom.removeClass(dom.content, 'show-match');
            Dom.setAttribute(dom.content, 'mid', '');
            selectedMatchId = 0;
        },

        escapePressed = function(){
        },

        lineTyped = function(){

        },

        processCommand = function(){

        },

        resize = function(){
            return;
            var leftWidth = Dom.getRegion(dom.mainLeft).width || 0;

            Dom.setStyle(dom.mainMiddle, 'width', settings.mainMiddleWidth + (settings.mainMiddleWidth - leftWidth) + 'px');
            Dom.setStyle(dom.app, 'width', settings.appWidth + 'px');
            Dom.setStyle(dom.mainTable, 'width', 'auto');

            var middleWidth = Dom.getRegion(dom.mainMiddle).width;

            Dom.setStyle(dom.app, 'width', (settings.appWidth + (leftWidth - settings.mainLeftWidth) + (middleWidth - settings.mainMiddleWidth)) + 'px');
            Dom.setStyle(dom.mainTable, 'width', '100%');
        },

        repositionBetslip = function(){
            var elem = dom.slipPositionRegion;
            Dom.setStyle(elem, 'margin-top', '0');
            var region = Dom.getRegion(elem);
            if (Dom.hasClass(dom.slip, 'empty') || region.top >= window.pageYOffset){
                Dom.setStyle(elem, 'position', 'relative');
                return;
            }
            Dom.setStyle(elem, 'position', 'absolute');
            var maxDown = Dom.getViewportHeight() - (region.bottom - window.pageYOffset);
            var down = Math.min(maxDown, Math.max(0, window.pageYOffset - region.top));
            Dom.setStyle(elem, 'margin-top', down + 'px');
        },

        windowScroll = function(){
            if (windowScrollingInterval){
                clearTimeout(windowScrollingInterval);
            }
            windowScrolling = true;
            windowScrollingInterval = setTimeout(repositionBetslip, 200);
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

        show = function(view){
            if (view != 'sports'){
                Dom.removeClass(document.body, 'welcome-page');
                Dom.removeClass(dom.app, 'welcome-page');
            }
            var classes = dom.app.className.split(" ");
            Util.foreach(classes, function(cl){
                if (cl.substring(0, 5) == 'view-'){
                    Dom.removeClass(dom.app, cl);
                    Dom.removeClass(document.body, cl);
                }
            });
            Dom.addClass(dom.app, 'view-' + view);
            Dom.addClass(document.body, 'view-' + view);
            //resize();
        },

        isView = function(view){
            return Dom.hasClass(dom.app, 'view-' + view);
        },

        showAccount = function(page){
            show('account');
            dom.accountIFrame.src = '/account/' + page + '?inline';
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

        handleScroll = function(){
            if (window.pageYOffset > 20){
                Dom.setStyle(dom.scrollToTop, 'display', 'block');
            } else {
                Dom.setStyle(dom.scrollToTop, 'display', 'none');
            }
        },

        windowResize = function(){
            if (Dom.hasClass(document.body, 'view-live')){
                ZAPNET.Coupon.postRenderLive();
            }
        },

        clearVisibleSlip = function(){
            if (visibleSlip){
                Dom.removeClass(visibleSlip, 'visible');
                var tr = Dom.getAncestorByTagName(visibleSlip, 'tr');
                Dom.removeClass(tr, 'highlight');
                visibleSlip = false;
            }
        },

        windowClick = function(){
            clearVisibleSlip();
        },

        setupUpcomingMatches = function(el){
            var matches = ZAPNET.BetDB.getMatchesByTime();
            var matchList = [], i, match, count = 0;
            for(i = 0; i < matches.length; i += 1){
                if (count < 8){
                    match = ZAPNET.BetDB.matches[matches[i]];
                    if (match.status == "open"){
                        matchList.push(match);
                        count += 1;
                    }
                } else {
                    break;
                }
            };
            ZAPNET.Coupon.renderMatchList(el, matchList, 10, 'Highlights', ZAPNET.Coupon.getHighlightMenuHtml());
        },

        setupLiveCouponMatches = function(el){
            var sports = ZAPNET.BetDB.getLiveMatchesBySport(true);
            var matchList = [], i, j, match, count = 0, sport;
            outer:
            for(i = 0; i < sports.length; i += 1){
                sport = sports[i];
                if (sport.sport.code == 'soccer'){
                    for(j = 0; j < sport.matches.length; j += 1){
                        if (count < 6){
                            match = sport.matches[j];
                            matchList.push(match);
                            count += 1;
                        } else {
                            break outer;
                        }
                    }
                }
            };
            ZAPNET.Coupon.renderMatchList(el, matchList, 2002, 'Live Bets');
        },

        setupTopOddsMatches = function(el){
            var matches = ZAPNET.BetDB.getTopLeagueMatches();
            var matchList = [], i, match, count = 0;
            for(i = 0; i < matches.length; i += 1){
                if (count < 16){
                    match = ZAPNET.BetDB.matches[matches[i]];
                    if (match.status == "open"){
                        matchList.push(match);
                        count += 1;
                    }
                } else {
                    break;
                }
            };
            ZAPNET.Coupon.renderMatchList(el, matchList, 1500, Util.t('Top Events'));
        },

        setupLiveMatches = function(){
            if (!dom.liveMatches){
                return;
            }
            var matches = ZAPNET.BetDB.getLiveMatches();
            var matchList = [], i, match;
            for(i = 0; i < matches.length; i += 1){
                if (i < 3){
                    match = ZAPNET.BetDB.matches[matches[i]];
                    matchList.push(match);
                } else {
                    break;
                }
            };
            ZAPNET.Coupon.renderSideBarLiveMatch(dom.liveMatches, matchList);
        },

        setupMatchResults = function(){
            if (!dom.matchResults){
                return;
            }
            if (!ZAPNET_MATCH_RESULTS || !ZAPNET_MATCH_RESULTS.length){
                return;
            }
            ZAPNET.Coupon.renderSideBarMatchResults(dom.matchResults, ZAPNET_MATCH_RESULTS);
        },

        setupMarketMovers = function(){
            if (!dom.marketMovers){
                return;
            }
            if (!ZAPNET_MARKET_MOVERS || !ZAPNET_MARKET_MOVERS.length){
                return;
            }
            ZAPNET.Coupon.renderSideBarMarketMovers(dom.marketMovers, ZAPNET_MARKET_MOVERS);
        },

        setupFeaturedMatches = function(el, matches){
            var sports = {}, i, j, match, sport, matchList, topList, topMatch;
            var liveCount = 0, now = Math.round(new Date().getTime() / 1000);
            var allLive = [], allTop = [], allLast = [];
            for(i = 0; i < matches.length; i += 1){
                match = ZAPNET.BetDB.matches[matches[i]];
                if (!match.tournament){
                    return;
                }
                sport = match.tournament.category.sport;
                if (!sports[sport.id]){
                    sports[sport.id] = {
                        matches: [],
                        live: [],
                        top: []
                    };
                    if (window.ZAPNET_FEATURED_MATCHES && window.ZAPNET_FEATURED_MATCHES[sport.id]){
                        for(j = 0; j < window.ZAPNET_FEATURED_MATCHES[sport.id].length; j += 1){
                            topMatch = ZAPNET.BetDB.matches[window.ZAPNET_FEATURED_MATCHES[sport.id][j]];
                            if (topMatch && topMatch.status == "open"){
                                if (sports[sport.id].top.length < 15){
                                    sports[sport.id].top.push(topMatch);
                                }
                                allTop.push(topMatch);
                            }
                        };
                    }
                }
                if (match.status == "live"){
                    allLive.push(match);
                    matchList = sports[sport.id].live;
                    matchList.push(match);
                } else {
                    matchList = sports[sport.id].matches;
                    matchList.push(match);
                    if (matchList < 15){
                        matchList.push(match);
                    }
                    if (match.ts - 18000 > now){
                        allLast.push(match);
                    }
                }
            };
            var sportList = [];
            Util.foreach(sports, function(sport, sportId){
                if (window.ZAPNET_COMPANYNAME != 'AP'){
                    sport.live.reverse();
                }
                sportList.push({
                    id: sportId,
                    matches: sport.matches,
                    top: sport.top,
                    live: sport.live.slice(0, ZAPNET_SPORT_LIST_LIVE_LIMIT)
                });
            });
            sportList.sort(function(a, b){
                var sportA = ZAPNET.BetDB.sports[a.id];
                var sportB = ZAPNET.BetDB.sports[b.id];
                return sportA.order - sportB.order;
            });
            if (ZAPNET_ONLINE_CONSTANTS.VIEW_THEME == 'rv'){
                var html = [];
                var liveView = {
                    rows: 1,
                    cols: [
                        {
                            header: 'Match Odds',
                            outcomeHeaders: ['1', 'X', '2'],
                            outcomes: ['1', 'X', '2'],
                            size: 3,
                            rows: [{
                                markets: [{
                                    type: 2002
                                }, {
                                    type: 1010
                                }, {
                                    type: 1102
                                }, {
                                    type: 1037
                                }, {
                                    type: 1106
                                }]
                            }]
                        },
                        {
                            header: 'Under Over',
                            outcomeHeaders: ['-', '+'],
                            outcomes: ['Under', 'Over'],
                            specialAlign: 'left',
                            varSpecial: true,
                            size: 3,
                            rows: [{
                                markets: [{
                                    type: 2005
                                },  {
                                    type: 1083
                                }, {
                                    type: 1039
                                }]
                            }]
                        }
                    ]
                };
                var allView = {
                    rows: 1,
                    cols: [
                        {
                            header: 'Match Odds',
                            outcomeHeaders: ['1', 'X', '2'],
                            outcomes: ['1', 'X', '2'],
                            size: 3,
                            rows: [{
                                markets: [{
                                    type: 10
                                }, {
                                    type: 20
                                }]
                            }]
                        }
                    ]
                };
                var liveSettings = {
                    html: html,
                    tabviewHeader: 'Live',
                    sportTabview: true,
                    maxSports: 6,
                    showMoreMarkets: pageSkin == 'ubet',
                    extraClasses: 'lobby-match-coupon lobby-live-match-coupon',
                    maxSectionMatches: 8
                };
                var topSettings = {
                    html: html,
                    tabviewHeader: 'Top Events',
                    sportTabview: true,
                    maxSports: 6,
                    extraClasses: 'lobby-match-coupon lobby-top-match-coupon',
                    maxSectionMatches: 8,
                    matchOptions: [
                        'playerSelections',
                        'statistics',
                        'tvChannels',
                        'willGoLive'
                    ]
                };
                var lastSettings = {
                    html: html,
                    tabviewHeader: 'Last Minute',
                    sportTabview: true,
                    maxSports: 6,
                    extraClasses: 'lobby-match-coupon lobby-soon-match-coupon',
                    maxSectionMatches: 8,
                    matchOptions: [
                        'playerSelections',
                        'statistics',
                        'tvChannels',
                        'willGoLive'
                    ]
                };
                if (ZAPNET.MATCH_VIEW_RENDER_FN){
                    liveSettings.matchRenderFn = ZAPNET.MATCH_VIEW_RENDER_FN;
                    topSettings.matchRenderFn = ZAPNET.MATCH_VIEW_RENDER_FN;
                    lastSettings.matchRenderFn = ZAPNET.MATCH_VIEW_RENDER_FN;
                }
                ZAPNET.SportsCouponView.render(allLive, liveView, liveSettings);
                html.push('<div class="lobby-live-link product-in-play">', Util.t('All Events & Odds'), '</div>');
                ZAPNET.SportsCouponView.render(allTop, allView, topSettings);
                ZAPNET.SportsCouponView.render(allLast, allView, lastSettings);
                el.innerHTML = html.join('');
            } else {
                ZAPNET.Coupon.renderMatchSections(el, sportList, false, 15, ZAPNET_SPORT_LIST_LIVE_LIMIT);
            }
        },

        setupClosingSoon = function(el, matches){
            var i, match, matchList = [];
            for(i = 0; i < matches.length; i += 1){
                match = ZAPNET.BetDB.matches[matches[i]];
                if (matchList.length < 5){
                    if (match.status == "open"){
                        matchList.push(match);
                    }
                } else {
                    break;
                }
            };

            var html = [];
            html.push('<div class="closingsoon"><div class="header">', Util.t('Closing Soon'), '</div>');
            html.push('</div>');
            for(i = 0; i < matchList.length; i += 1){
                match = matchList[i];
                html.push('<div class="match match-link" mid="', match.id, '">');
                html.push('<div class="match-time">', $P.date('H:i', match.ts), '</div>');
                html.push('<div class="sport sport-', match.tournament.category.sport.code, ' match-name">', match.name, '</div>');
                html.push('</div>');
            }

            el.innerHTML = html.join('');
        },

        setupLatestOddsChanges = function(el){
            if (window.ZAPNET_MARKET_MOVERS){
                ZAPNET.Coupon.renderSideBarMarketMovers(el, window.ZAPNET_MARKET_MOVERS);
            }
            window.ZAPNET_MARKET_MOVERS = false;
        },

        getMenuContentHtml = function(){
            var html = [];
            html.push('<div class="page-carousel">');
            html.push(Carousel.getHtml());
            html.push('</div>');
            html.push('</div><div class="featured-matches"></div>');

            return html.join('');
        },

        setupHome = function(){
            if (!ZAPNET.BetDB){
                sportsReload();
                return;
            }
            if(window.ZAPNET_WEBSITE_PAGE){
                window.location.href = '/sports';
                return;
            }
            show('sports');
            Dom.addClass(document.body, 'loading');
            Dom.addClass(document.body, 'welcome-page');
            Dom.addClass(dom.app, 'welcome-page');
            setProductMenuTab($('#hd a.product-sports', null, true));
            ZAPNET.Coupon.resetTournaments();
            ZAPNET.SportsMenu.refresh();
            var matches = ZAPNET.BetDB.getMatchesByTime(false, false, 'all');
            dom.content.innerHTML = getMenuContentHtml();
            var elCar = $('div.page-carousel', dom.content, true);
            Carousel.start(elCar);
            var featMatchesEl = $('div.featured-matches', dom.content, true);
            setupFeaturedMatches(featMatchesEl, matches);
            Dom.addClass(dom.menuClearAll, 'hidden');

            setupClosingSoon(Dom.get('closingsoon'), matches);
            setupLatestOddsChanges($('#latestoddschanges div.content', null, true));

            /*
            var elUp = $('div.home-upcoming', dom.content, true);
            var elLive = $('div.home-live', dom.content, true);
            var elTop = $('div.home-top-bets', dom.content, true);
            setupUpcomingMatches(elUp);
            setupLiveCouponMatches(elLive);
            setupTopOddsMatches(elTop);
            setupLiveMatches();
            setupMatchResults();
            setupMarketMovers();
            */
        },

        readNotifications = function(id){
            var callback = {
                success: function(o){
                    var response = eval('(' + o.responseText + ')');
                    if (response && response.id){
                        var panelWidth = Math.min(750, Math.floor(Dom.getViewportWidth() * 0.9));
                        var message = '<div style="font: bold 14px/18px Verdana; padding: 0 0 20px 0">' + response.subject + '</div>' +
                                '<div class="user-notification-body">' + response.body.replace(/\n/g, '<br/>') + '</div>';
                        Util.showMessage(message, 'New Message', '', function(){
                            readNotifications(response.id);
                        }, {width: panelWidth});
                    }
                },
                failure: function(){
                },
                cache: false,
                timeout: 40000
            };
            YAHOO.util.Connect.asyncRequest('POST', '/account/notifications.js?inline' + (id ? '&id=' + id : ''), callback, '');
        },

        showPageLoading = function(){
            dom.content.innerHTML = '<div class="coupon-loading"><div class="loader" title="2"><svg version="1.1" id="loader-1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="40px" viewBox="0 0 50 50" style="enable-background:new 0 0 50 50;" xml:space="preserve"><path fill="#000" d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z"><animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.6s" repeatCount="indefinite"/></path></svg></div><div class="loading-label">' + Util.t('Loading') + '...</div></div>';
        },

        objectRedirectAfterLoad = function(){
            var hash = window.location.hash;
            var iQ = hash.indexOf('#');
            if (iQ > -1){
                hash = hash.substring(iQ + 1);
            }
            if (!hash){
                return;
            }
            hash = $P.trim(hash);
            if (hash == 'live'){
                setLiveProduct();
            } else if (hash == 'keno') {
                window.location.href = '/sports';
            } else if (hash == 'virtual') {
                setVirtualProduct();
            } else if (hash == 'casino') {
                window.location.href = '/sports';
            } else if (hash == 'livescore') {
                window.location.href = '/sports';
            } else if (hash == 'statistics') {
                window.location.href = '/sports';
            }
        },

        objectRedirectBeforeLoad = function(){
            var hash = window.location.hash;
            var iQ = hash.indexOf('#');
            if (iQ > -1){
                hash = hash.substring(iQ + 1);
            }
            if (!hash){
                return true;
            }
            hash = $P.trim(hash);
            if (hash == 'about'){
                show('pages');
                ZAPNET.SportsBookAccount.gotoAbout();
                return true;
            } else if (hash == 'terms'){
                show('pages');
                ZAPNET.SportsBookAccount.gotoTerms();
                return true;
            } else if (hash.substring(0, 8) == 'content:'){
                show('pages');
                ZAPNET.SportsBookAccount.gotoContent();
                return true;
            } else if (hash == 'privacy'){
                show('pages');
                ZAPNET.SportsBookAccount.gotoPrivacy();
                return true;
            } else if (hash == 'gambling'){
                show('pages');
                ZAPNET.SportsBookAccount.gotoGambling();
                return true;
            } else if (hash == 'contact'){
                show('pages');
                ZAPNET.SportsBookAccount.gotoContactUs();
                return true;
            } else if (hash == 'rules'){
                show('pages');
                ZAPNET.SportsBookAccount.gotoRules();
                return true;
            } else if (hash == 'promotions'){
                gotoPromotions();
                return true;
            } else if (hash == 'careers'){
                show('pages');
                ZAPNET.SportsBookAccount.gotoCareers();
                return true;
            } else if (hash == 'help'){
                show('pages');
                ZAPNET.SportsBookAccount.gotoHelp();
                return true;
            } else if (hash == 'results'){
                show('pages');
                ZAPNET.SportsBookAccount.gotoResults();
                return true;
            } else if (hash == 'bonus'){
                show('pages');
                ZAPNET.SportsBookAccount.gotoBonus();
                return true;
            } else if (hash == 'bethistory'){
                ZAPNET.SportsBookAccount.gotoBettingHistoryCombined();
                ZAPNET.SportsBookAccount.showMenu(dom.accountMenu);
                show('account');
                return true;
            } else if (hash == 'account'){
                ZAPNET.SportsBookAccount.gotoAccount();
                ZAPNET.SportsBookAccount.showMenu(dom.accountMenu);
                show('account');
                return true;
            } else if (hash == 'deposit'){
                ZAPNET.SportsBookAccount.gotoDeposit();
                ZAPNET.SportsBookAccount.showMenu(dom.accountMenu);
                show('account');
                return true;
            } else if (hash == 'withdraw'){
                ZAPNET.SportsBookAccount.gotoWithdraw();
                ZAPNET.SportsBookAccount.showMenu(dom.accountMenu);
                show('account');
                return true;
            } else if (hash == 'messages'){
                ZAPNET.SportsBookAccount.gotoMyMessages();
                ZAPNET.SportsBookAccount.showMenu(dom.accountMenu);
                show('account');
                return true;
            } else if (hash == 'live'){
                setLiveProduct();
                return true;
            }

            return false;
        },

        hasObjectRedirect = function(){
            var hash = window.location.hash;
            var iQ = hash.indexOf('#');
            if (iQ > -1){
                hash = hash.substring(iQ + 1);
            }
            if (!hash){
                return false;
            }
            hash = $P.trim(hash);
            if (!hash){
                return false;
            }

            return true;
        },

        followLink = function(link, linkid, e){
            if (link == 'match'){
                show('sports');;
                ZAPNET.Coupon.showMatch(linkid);
            } else if (link == 'tournament'){
                show('sports');
                ZAPNET.Coupon.setTournaments(linkid.split(','));
            } else if (link == 'category'){
                show('sports');
                ZAPNET.Coupon.setCategory(linkid);
            } else if (link == 'sport'){
                show('sports');
                ZAPNET.Coupon.setSport(linkid);
            } else if (link == 'outright'){
                show('coupon');
                ZAPNET.Coupon.addOutright(linkid);
            } else if (link == 'page') {
                pagesClick(linkid, e);
            } else if (link == 'bet'){
                setupHome();
            }
        },
        pagesClick = function(pageid, e) {
            if (pageid == 'company-about'){
                show('pages');
                ZAPNET.SportsBookAccount.gotoAbout();
            } else if (pageid == 'company-content'){
                show('pages');
                ZAPNET.SportsBookAccount.gotoContent(window.location.href);
            } else if (pageid == 'company-terms'){
                show('pages');
                ZAPNET.SportsBookAccount.gotoTerms();
            } else if (pageid == 'company-privacy'){
                show('pages');
                ZAPNET.SportsBookAccount.gotoPrivacy();
            } else if (pageid == 'company-gambling'){
                show('pages');
                ZAPNET.SportsBookAccount.gotoGambling();
            } else if (pageid == 'company-contact'){
                show('pages');
                ZAPNET.SportsBookAccount.gotoContactUs();
            } else if (pageid == 'company-rules'){
                show('pages');
                ZAPNET.SportsBookAccount.gotoRules();
            } else if (pageid == 'company-promotions'){
                gotoPromotions(e);
            } else if (pageid == 'company-careers'){
                show('pages');
                ZAPNET.SportsBookAccount.gotoCareers();
            } else if (pageid == 'company-news'){
                show('pages');
                ZAPNET.SportsBookAccount.gotoFaq();
            } else if (pageid == 'company-deposits'){
                show('pages');
                ZAPNET.SportsBookAccount.gotoDeposits();
            } else if (pageid == 'extra-faq'){
                show('pages');
                ZAPNET.SportsBookAccount.gotoNews();
            } else if (pageid == 'extra-livescore'){
                Event.preventDefault(e);
            } else if (pageid == 'extra-statistics'){
                Event.preventDefault(e);
            } else if (pageid == 'extra-help'){
                show('pages');
                ZAPNET.SportsBookAccount.gotoHelp();
            } else if (pageid == 'extra-results'){
                show('pages');
                ZAPNET.SportsBookAccount.gotoResults();
            } else if (pageid == 'extra-bonus' || pageid == 'bonus' || pageid == 'sports-bonus'){
                show('pages');
                ZAPNET.SportsBookAccount.gotoBonus();
            } else if (pageid == 'company-register'){
                show('pages');
                window.location.href = '/register';
            } else if(pageid == 'product-sports'){
                Event.stopEvent(e);
                setSportsProduct();
            } else if (pageid == 'product-in-play'){
                Event.stopEvent(e);
                setLiveProduct();
            } else if (pageid ==  'product-keno'){
                //Event.preventDefault(e);
            } else if (pageid == 'product-virtual'){
//                Event.preventDefault(e);
//                setProductMenuTab(el);
//                show('virtual');
//                showVirtual();
            } else if (pageid == 'product-casino'){
                //Event.preventDefault(e);
            } else if (pageid == 'product-pools'){
                  show('pools');
                  document.location = '/pools';
            }

        }  ,
        objectSportRedirect = function(){
            var search = window.location.search;
            var iQ = search.indexOf('?');
            if (iQ > -1){
                search = search.substring(iQ + 1);
            }
            if (!search){
                return false;
            }
            var params = search.split('&');
            Util.foreach(params, function(param){
                var parts = param.split('=');
                if (parts.length === 2){
                    followLink(parts[0], parts[1]);
                }
            });
        },

        hasObjectSportRedirect = function(){
            var search = window.location.search;
            var iQ = search.indexOf('?');
            if (iQ > -1){
                search = search.substring(iQ + 1);
            }
            if (!search){
                return false;
            }
            var params = search.split('&');
            var found = false;
            Util.foreach(params, function(param){
                var parts = param.split('=');
                if (parts.length === 2){
                    found = true;
                }
            });

            return found;
        },

        isSearchMatchToken = function(str, searchItems){
            var strTokens = str.split(' ');
            var i, j, itemFound, st, si;
            for(i = 0; i < searchItems.length ; i += 1){
                itemFound = false;
                for(j = 0; j < strTokens.length ; j += 1){
                    st = strTokens[j].toLowerCase();
                    si = searchItems[i].toLowerCase();
                    if (st.indexOf(si) > -1){
                        itemFound = true;
                        break;
                    }
                }
                if (!itemFound){
                    return false;
                }
            }
            return true;
        },

        isSearchMatch = function(str, searchItems){
            var i;
            if (YAHOO.lang.isArray(str)){
                for(i = 0; i < str.length; i += 1){
                    if (isSearchMatchToken(str[i], searchItems)){
                        return true;
                    }
                }
                return false;
            } else {
                return isSearchMatchToken(str, searchItems);
            }
        },

        globalSearchKey = function(e){
            var searchStr = $P.trim(dom.globalSearch.value);
            var matchList = false;
            if (searchStr.length == 0){
                matchList = [];
            } else if (searchStr.length >= 3){
                var searchTokenList = searchStr.split(' ');
                var searchTokens = [];
                Util.foreach(searchTokenList, function(st){
                    var stt = $P.trim(st);
                    var foundSub = false, replaceSub = false;
                    if (Util.inArray(stt, searchTokens)){
                        return;
                    }
                    Util.foreach(searchTokens, function(st, i){
                        if (st.indexOf(stt) > -1){
                            foundSub = true;
                        }
                        if (stt.indexOf(st) > - 1){
                            searchTokens[i] = stt;
                            replaceSub = true;
                        }
                    });
                    if (!foundSub && !replaceSub && stt.length > 1){
                        searchTokens.push(stt);
                    }
                });
                if (searchTokens.length > 0 && (searchTokens.length > 1 || searchTokens[0].length >= 3)){
                    matchList = [];
                    Util.foreach(ZAPNET.BetDB.sports, function(sport){
                        var allSport = isSearchMatch(sport.names && sport.names.length ? sport.names : sport.name, searchTokens);
                        Util.foreach(sport.categories, function(category){
                            var allCategory = isSearchMatch(category.names && category.names.length ? category.names : category.name, searchTokens);
                            Util.foreach(category.tournaments, function(tournament){
                                var allTournament = isSearchMatch(tournament.names && tournament.names.length ? tournament.names : tournament.name, searchTokens);
                                Util.foreach(tournament.matches, function(match){
                                    var matchNames = [];
                                    if (match.names && match.names.length){
                                        Util.foreach(match.names, function(name){
                                            matchNames.push(name.replace(' v ', ' '));
                                        });
                                    } else {
                                        matchNames.push(match.name.replace(' v ', ' '));
                                    }
                                    var isMatchMatched = isSearchMatch(matchNames, searchTokens);
                                    if (allSport || allCategory || allTournament || isMatchMatched){
                                        matchList.push(match);
                                    }
                                });
                            });
                        });
                    });
                }
            }
            if (matchList !== false){
                Dom.removeClass(document.body, 'welcome-page');
                Dom.removeClass(dom.app, 'welcome-page');
                dom.globalSearchComments.innerHTML = Util.t(matchList.length ? $P.sprintf(Util.t('%s matches found'), matchList.length) : Util.t('No matches found'));
                ZAPNET.Coupon.renderMatchList(dom.content, matchList, 10, Util.t('Search'));
            } else {
                dom.globalSearchComments.innerHTML = Util.t('Type some more letters') + '...';
            }
        },

        setupAutocomplete = function(){
            var matches = [];
            Util.foreach(ZAPNET.BetDB.matches, function(match){
                matches.push({name: $P.date('d/m H:i', match.ts) + ' ' + match.code + ' ' + match.name, id: match.id});
            });
            var oDS = new YAHOO.util.LocalDataSource(matches);
            oDS.responseSchema = {fields : ["name", "id"]};
            var oAC = new YAHOO.widget.AutoComplete(dom.search, dom.autocomplete, oDS);
            oAC.useIFrame = true;
            oAC.maxResultsDisplayed = 12;
            oAC.minQueryLength = 3;
            oAC.queryDelay = 0.2;
            oAC.applyLocalFilter = true;
            oAC.queryMatchCase = false;
            oAC.queryMatchContains = true;

            oAC.doBeforeLoadData = function(sQuery , oResponse , oPayload){
                oResponse.results.sort(function(a, b){
                    return a.ts - b.ts;
                });
                return true;
            };

            oAC.itemSelectEvent.subscribe(function(type, args){
                var matchId = args[2][1];
                dom.search.value = '';
                var match = ZAPNET.BetDB.matches[matchId];
                ZAPNET.Coupon.renderMatchList(dom.content, [match], 10, match.name);
                show('sports');
            });
        },

        start = function(){
            ZAPNET.BetDB.matchRemovedEvent.subscribe(function(matchId){
                if (Dom.hasClass(dom.content, 'show-match')){
                    if (selectedMatchId == matchId){
                        showSports();
                    }
                }
                try{ZAPNET.Coupon.refreshMatch(matchId);}catch(e){console.log(e);}
                var matchEls = $('div[mid="' + matchId + '"].match');
                if (matchEls){
                    Util.foreach(matchEls, function(matchEl){
                        matchEl.parentNode.removeChild(matchEl);
                    });
                }
            });
            ZAPNET.BetDB.matchStatusChangeEvent.subscribe(function(matchId){
                if (!ZAPNET.BetDB.matches[matchId]){
                    return;
                }
                var match = ZAPNET.BetDB.matches[matchId];
                if (match.status == "open"){
                    return;
                }
                var matchEl = $('#closingsoon div[mid="' + matchId + '"].match', null, true);
                if (matchEl){
                    var matches = ZAPNET.BetDB.getMatchesByTime(false, false, 'all');
                    setupClosingSoon(Dom.get('closingsoon'), matches);
                }
            });
            ZAPNET.BetDB.matchesChangedEvent.subscribe(function(){
                var liveMatchEl = Dom.get('in-play-nrgames');
                if (liveMatchEl){
                    var lmatches = ZAPNET.BetDB.getLiveMatches(false, 'live');
                    if (lmatches && lmatches.length){
                        liveMatchEl.innerHTML = lmatches.length;
                        Dom.removeClass(liveMatchEl, 'hidden');
                    } else {
                        Dom.addClass(liveMatchEl, 'hidden');
                    }
                }
                if (Dom.hasClass(dom.app, 'view-live')){
                    ZAPNET.Coupon.refreshLiveMatchList();
                }
            });
            ZAPNET.BetDB.matchChangedEvent.subscribe(function(matchId){
                try{
                    ZAPNET.Coupon.refreshMatch(matchId);
                }catch(e){
                }
            });
            ZAPNET.BetDB.errorEvent.subscribe(function(){
                window.location.reload();
            });
            ZAPNET.BetDB.scheduleChangedEvent.subscribe(function(){
            });
            ZAPNET.BetDB.infoEvent.subscribe(infoEvent);
            ZAPNET.BetDB.betEvent.subscribe(betEvent);

            ZAPNET.MainMenu.setup();
            if (Dom.get('sports-menu')){
                ZAPNET.SportsMenu.init();
            }
            setupBettingSlip();
            ZAPNET.Coupon.setBettingSlip(bettingSlip);
            ZAPNET.Coupon.renderEvent.subscribe(resize);
            if (ZAPNET.SportsBookPages){
                ZAPNET.SportsBookPages.setContainer(dom.content);
            }

            if (window.ZAPNET_WEBSITE_PAGE == 'virtual'){
                setVirtualProduct(true);
            } else if (window.ZAPNET_WEBSITE_PAGE == 'lottery'){
                ZAPNET.LotterySale.init(dom.content, bettingSlip);
                setLotteryProduct(true);
            } else if (!window.ZAPNET_WEBSITE_PAGE) {
                if (isView("sports")){
                    if (gotoAfterLoad == 'live'){
                        showLive();
                    } else {
                        if (hasObjectRedirect()){
                            objectRedirectAfterLoad();
                        } else if (hasObjectSportRedirect()) {
                            objectSportRedirect();
                        } else {
                            if (gotoAfterLoad == 'live'){
                                showLive();
                            } else {
                                setupHome();
                            }
                        }
                    }
                }
            }

            if (window.ZAPNET_OPEN_BET_MATCHES){
                Util.foreach(ZAPNET_OPEN_BET_MATCHES, function(mId){
                    ZAPNET.Coupon.addFavoriteMatch(mId);
                });
            }
        },

        processBetDbSports = function(data){
            if (data.outrights){
                for(var sid in data.outrights){
                    if (data.outrights.hasOwnProperty(sid)){
                        if (data.outrights[sid].code.indexOf('prerec') >= 0){
                            delete data.outrights[sid];
                        } else if (data.outrights[sid].code.indexOf('virtual') >= 0){
                            delete data.outrights[sid];
                        } else if (data.outrights[sid].code.indexOf('horse-racing') >= 0){
                            delete data.outrights[sid];
                        }
                    }
                }
            }
        },

        sportsReload = function(){
            if (!ZAPNET.BetDB){
                load();
                return;
            }
            var productMenuSports = $('#product-menu .product-sports', null, true);
            if (productMenuSports){
                setProductMenuTab(productMenuSports);
            }
            show('sports');
            Dom.addClass(document.body, 'loading');
            Dom.addClass(document.body, 'welcome-page');
            Dom.addClass(dom.app, 'welcome-page');
            showPageLoading();
            ZAPNET.Coupon.resetTournaments();
            ZAPNET.LoadBetDb({
                success: function(o){
                    ZAPNET_BET_DATA = eval('(' + o.responseText + ')');
                    processBetDbSports(ZAPNET_BET_DATA);
                    ZAPNET.BetDB.addMatches(ZAPNET_BET_DATA);
                    var lastEventId = ZAPNET_BET_DATA.last_event_id ? ZAPNET_BET_DATA.last_event_id : false;
                    if (lastEventId){
                        ZAPNET.Events.setLastEvent(lastEventId);
                    }
                    ZAPNET.Events.play();
                    ZAPNET.Events.setFilterParams({r: '10,20,810,820,2002,1037,1010,1102,56,856,60,2005,52,1021,226,1083'});
                    ZAPNET.SportsMenu.refresh();
                    setupHome();
                    if (dom.nrmarkets){
                        dom.nrmarkets.innerHTML = ZAPNET.BetDB.countMatches();
                    }
                    Dom.removeClass(document.body, 'loading');
                },
                failure: function(){
                    setTimeout(function(){
                        window.location.reload();
                    }, 20000);
                },
                cache: false,
                timeout: 90000
            });
        },

        load = function(){
            ZAPNET.LoadBetSchedule({
                success: function(oSched){
                    ZAPNET.LoadBetDb({
                        success: function(o){
                            var schedData = eval('(' + oSched.responseText + ')');
                            var oddsData = eval('(' + o.responseText + ')');
                            processBetDbSports(oddsData);
                            ZAPNET_BET_DATA = schedData;
                            ZAPNET.BetDB = ZAPNET.BetDBGen();
                            ZAPNET.BetDB.addPersistData(oSched.responseText);
                            ZAPNET.BetDB.addMatches(oddsData);
                            ZAPNET.BetDB.setReady(true);
                            ZAPNET.Events.setFilterParams({r: '10,20,810,820,2002,1037,1010,1102,56,856,60,2005,52,1021,226,1083'});
                            start();
                            if (dom.nrmarkets){
                                dom.nrmarkets.innerHTML = ZAPNET.BetDB.countMatches();
                            }
                            Dom.removeClass(document.body, 'loading');
                        },
                        failure: function(){
                            setTimeout(function(){
                                window.location.reload();
                            }, 20000);
                        },
                        cache: false,
                        timeout: 90000
                    });
                },
                failure: function(){
                    setTimeout(function(){
                        window.location.reload();
                    }, 20000);
                },
                cache: false,
                timeout: 90000
            });
        },

        loadVirtual = function(){
            ZAPNET.LoadBetDbMarkets({
                success: function(o){
                    ZAPNET_BET_DATA = {};
                    ZAPNET_BET_SCHEDULE_MARKETS = eval('(' + o.responseText + ')');
                    ZAPNET.BetDB = ZAPNET.BetDBGen();
                    ZAPNET.BetDB.setReady(true);
                    start();
                    if (dom.nrmarkets){
                        dom.nrmarkets.innerHTML = ZAPNET.BetDB.countMatches();
                    }
                    Dom.removeClass(document.body, 'loading');
                },
                failure: function(){
                    setTimeout(function(){
                        window.location.reload();
                    }, 5000);
                },
                cache: false,
                timeout: 90000
            });
        },

        loadLottery = function(){
            ZAPNET.LoadBetDbMarkets({
                success: function(o){
                    ZAPNET_BET_DATA = {};
                    ZAPNET_BET_SCHEDULE_MARKETS = eval('(' + o.responseText + ')');
                    ZAPNET.BetDB = ZAPNET.BetDBGen();
                    ZAPNET.BetDB.setReady(true);
                    start();
                    Dom.removeClass(document.body, 'loading');
                },
                failure: function(){
                    setTimeout(function(){
                        window.location.reload();
                    }, 5000);
                },
                cache: false,
                timeout: 90000
            });
        },

        sendSmsBet = function(){
            var smsBetText = Dom.get('smsbettext');
            if (smsBetText.value){
                bettingSlip.placeSmsBet(smsBetText.value);
             }
            smsBetText.value = '';
        },

        sendCheckSlip = function(){
            var checkSlipInput = Dom.get('online-check-slip');
            if (checkSlipInput.value){
                var url = '/bet/load.js?id=' + checkSlipInput.value;
                var callback = {
                    success: function(o){
                        var data = eval('(' + o.responseText + ')');
                        if (data.error){
                            Util.showErrorMessage(Util.t(data.error), 'Error');
                        } else {
                            var statusClass = '';
                            var statusCont = '';
                            if (data.status == 'accepted'){
                                statusClass = 'betslip-pending';
                                statusCont = Util.t('Pending');
                            } else if (data.status == 'void'){
                                statusClass = 'betslip-cancelled';
                                statusCont = Util.t('Cancelled');
                            } else if (data.status == 'settled'){
                                if (data.payout == 0){
                                    statusClass = 'betslip-lost';
                                    statusCont = Util.t('Lost');
                                } else {
                                    statusClass = 'betslip-won';
                                    statusCont = Util.t('Winner') + '. ' + Util.t('Payout') + ': ' + data.payout;
                                }
                            }
                            var statusHtml = [];
                            statusHtml.push('<div class="betslip-status ', statusClass, '">', statusCont, '</div>');
                            var panel = Util.showMessage('<div class="inline-slip-wrapper"><div class="inline-betslip">' + data.html + '</div>' + statusHtml.join('') + '</div>', Util.t('Betting Slip'));
                            var wrapperEl = $('.inline-slip-wrapper', panel.element, true);
                            positionInlineBetslipWrapper(wrapperEl, panel.element);

                            checkSlipInput.value = '';
                        }
                    },
                    failure: function(o){
                        Util.showErrorMessage('Error: ' + o.responseText, 'Error');
                    },
                    cache: false,
                    timeout: 20000
                };
                YAHOO.util.Connect.asyncRequest('GET', url, callback);
            }
            checkSlipInput.value = '';
        },

        init = function(){
            dom = {
                app: Dom.get('page'),
                hd: Dom.get('hd'),
                slip: Dom.get('slip'),
                print: Dom.get('print'),
                search: Dom.get('search'),
                autocomplete: Dom.get('autocomplete'),
                content: $('#bd div.content', null, true),
                userPanel: Dom.get('user-panel'),
                accountMenu: Dom.get('account-menu'),
                accountIFrame: $('#account iframe', null, true),
                slipWrapper: Dom.get('slip-wrapper'),
                fundsCheckbox: Dom.get('user-funds-checkbox'),
                fundsRefresh: Dom.get('funds-refresh'),
                fundsHolder: $('#hd-top div.user-funds', null, true),
                funds: Dom.get('funds'),
                slipPositionRegion: $('#nav-right div.slip-position-region', null, true),
                nrmarkets: Dom.get('period-select-nrmarkets'),
                ft: Dom.get('ft'),
                accountMenu: Dom.get('account-menu'),
                matchInfoPanels: Dom.get('match-info-panels'),
                oddsLessThanMenu: Dom.get('odds-less-than-menu'),
                periodSelect: $('div.sports-period-select', null, true),
                menuClearAll: $('div.sports-period-select span.clear-all-menu-selections', null, true),
                scrollToTop: Dom.get('scroll-to-top'),
                balance: Dom.get('balance'),
                mainTable: $('#bd table.main', null, true),
                mainLeft: $('#bd table.main td.left', null, true),
                mainMiddle: $('#bd table.main td.middle', null, true),
                upcomingMatches: $('#bd div.upcoming-matches', null, true),
                mainLiveMatches: $('#home-page div.main-live-matches', null, true),
                liveMatches: $('#bd table.main td.right div.live-matches', null, true),
                matchResults: $('#bd table.main td.right div.match-results', null, true),
                marketMovers: $('#block-movers div.content', null, true),
                recentBets: $('#recent-bets', null, true),
                recentBetList: $('#recent-bets div.betlist', null, true),
                recentBetsClear: $('#recent-bets div.clear', null, true),
                recentBetsTotal: $('#recent-bets div.total', null, true),
                openBets: $('#nav-right div.betslip-open-bets', null, true),
                globalSearch: Dom.get('grobal-search-input'),
                globalSearchComments: $('#bd div.global-search div.search-results-comments', null, true),
                authPanelSlip: Dom.get('auth-panel-slip'),
                authBuyPanel: Dom.get('auth-buy-panel'),
                authBuyPanelOK: Dom.get('auth-panel-sale-ok'),
                authBuy: Dom.get('auth-panel-buy'),
                authRequestAuth: Dom.get('auth-panel-auth'),
                authCancel: Dom.get('auth-panel-cancel'),
                authBuyPanelSlip: Dom.get('auth-buy-panel-slip'),
                authBuyBuy: Dom.get('auth-buy-panel-buy'),
                authBuyCancel: Dom.get('auth-buy-panel-cancel')
            };

            settings = {
                appWidth: Dom.getRegion(dom.app).width,
                mainLeftWidth: Dom.getRegion(dom.mainLeft).width,
                mainMiddleWidth: Dom.getRegion(dom.mainMiddle).width
            };
            pageSkin = window.ZAPNET_KIOSKSKIN;
            if (pageSkin){
                Dom.addClass(document.body, 'skin-' + pageSkin);
            }

            if (ZAPNET.SportsBookPages){
                ZAPNET.SportsBookPages.setContainer(dom.content);
            }
            ZAPNET.Coupon.setElement(dom.content);
            if (Dom.hasClass(dom.app, 'view-virtual')){
                show('virtual');
            } else {
                show('sports');
            }

            if (hasObjectRedirect()){
                objectRedirectBeforeLoad();
            }

            //start();
            if (Dom.hasClass(dom.app, 'view-virtual')){
                loadVirtual();
            } else if (Dom.hasClass(dom.app, 'view-lottery')){
                loadLottery();
            } else {
                load();
            }

            Event.on(dom.slip, 'click', slipPlacedClick);
            Event.on(dom.userPanel, 'click', userPanelClick);
            Event.on(dom.hd, 'click', headerClick);
            Event.on(dom.periodSelect, 'click', periodSelectClick);
            Event.on(dom.oddsLessThanMenu, 'click', oddsLessThanClick);
            Event.on(dom.ft, 'click', footerClick);
            Event.on(dom.app, 'click', pageClick);
            // Event.on(dom.content, 'click', contentClick);
            // Event.on(window, 'scroll', windowScroll);
            // Event.on(window, 'resize', windowScroll);

            if (ZAPNET.SportsBookPages){
                ZAPNET.SportsBookPages.setEventListener(pageEventListener);
                ZAPNET.SportsBookPages.contentLoadedEvent.subscribe(userAccountPageLoaded);
            }

            Event.on(window, 'resize', windowResize);
            Event.on(window, 'scroll', handleScroll);
            Event.on(window, 'click', windowClick);
            Event.on(dom.scrollToTop, 'click', scrollClick);
            Event.on(dom.recentBets, 'click', recentBetsClick);
            Event.on($('#page-top div.top-language-select', null, true), 'click', languageClick);
            Event.on($('#page-top span.option.chat', null, true), 'click', chatClick);
            Event.on($('#nav-right div.current-language, #selected-language'), 'click', languageRightClick);
            Event.on($('#nav-right div.preparedbets input.prepared-bet-stake', null), 'keyup', reparedBetType);

            if (dom.globalSearch){
                Event.on(dom.globalSearch, 'keyup', globalSearchKey);
            }

            var clockEl = Dom.get('site-clock');
            if (clockEl){
                Util.Clock(clockEl);
            }

            var smsBetText = Dom.get('smsbettext');
            var smsBetSubmit = Dom.get('smsbetsubmit');
            if (smsBetText && smsBetSubmit){
                Event.on(smsBetSubmit, 'click', sendSmsBet);
                var smsBetEnter = new YAHOO.util.KeyListener(smsBetText, {keys: [13]},{
                        fn: function(type, args){
                            sendSmsBet();
                        }
                    });
                smsBetEnter.enable();
            }

            var onlineCheckSlipText = Dom.get('online-check-slip');
            var onlineCheckSlipSubmit = Dom.get('online-check-slip-submit');
            if (onlineCheckSlipText && onlineCheckSlipSubmit){
                Event.on(onlineCheckSlipSubmit, 'click', sendCheckSlip);
                var checkSlipEnter = new YAHOO.util.KeyListener(onlineCheckSlipText, {keys: [13]},{
                        fn: function(type, args){
                            sendCheckSlip();
                        }
                    });
                checkSlipEnter.enable();
            }

            //ZAPNET.MainMenu.setup();
            ZAPNET.BetDBReadyEvent.subscribe(function(){
                setupAutocomplete();
            });

            /*
            Event.on(['user-account', 'account-menu'], 'mouseover', function(){
                Dom.addClass(document.body, 'user-account-hover');
            });
            Event.on(['user-account', 'account-menu'], 'mouseout', function(){
                Dom.removeClass(document.body, 'user-account-hover');
            });
            */
            jQuery('#page-top a.logout, #account-menu, #user-account').hover(function(){
                Dom.addClass(document.body, 'user-account-hover');
            },function(){
                Dom.removeClass(document.body, 'user-account-hover');
            });

            if (dom.accountMenu){
                ZAPNET.SportsBookAccount.showMenu(dom.accountMenu);
            }

            if (Dom.hasClass(document.body, 'skin-ubet')){
                ZAPNET.MATCH_VIEW_RENDER_FN = function(html, match, settings){
                    var fav = ZAPNET.Coupon.isFavoriteMatch(match.id);
                    var liveMsg = Util.t('No live betting available');
                    var liveClass = '';
                    if (match.status == 'live'){
                        liveClass = 'live-match';
                        liveMsg = Util.t('Live betting available');
                    } else if (match.willgolive) {
                        liveClass = 'will-go-live';
                        liveMsg = Util.t('Live betting will be available when match starts');
                    }
                    html.push('<div class="match-options">');
                    html.push('<div class="match-option match-favorite ', fav ? 'match-favorite-on' : '', '" title="', fav ? Util.t('Remove favorite match') : Util.t('Add favorite match'), '"></div>');
                    html.push('<div class="match-option match-statistics match-statistics-link" title="', Util.t('Open match statistics'), '"></div>');
                    html.push('<div class="match-option match-live-status ', liveClass, '" title="', liveMsg, '"></div>');
                    html.push('<div class="match-option match-tv-channels" title="', match.tvchn ? match.tvchn : Util.t('No TV channel info'), '"></div>');
                    html.push('</div>');
                };
            }

            authPanel = new YAHOO.widget.Panel('auth-panel', {
                x: 0, y: 0,
                width: "650px",
                fixedcenter: false,
                dragable: false,
                modal: true,
                visible: false,
                draggable: false,
                close: false
            });
            authPanel.render();
            authPanel.hide();

            authBuyPanel = new YAHOO.widget.Panel('auth-buy-panel', {
                x: 0, y: 0,
                width: "650px",
                fixedcenter: false,
                dragable: false,
                modal: true,
                visible: false,
                draggable: false,
                close: false
            });
            authBuyPanel.render();

            var slipSearchEnter = new YAHOO.util.KeyListener(dom.slip, {keys: [13]},{
                    fn: function(type, args){
                        bettingSlip.placeBet();
                    }
                });
            slipSearchEnter.enable();

            userRefresh();

            readNotifications();
        };

        return {
            init: init,
            resize: resize,
            show: show,
            isView: isView,
            setupHome: setupHome,
            sportsReload: sportsReload,
            showFavorites: showFavorites,
            setLiveProduct: setLiveProduct,
            setSportsProduct: setSportsProduct,
            setSportsView: setSportsView,
            setLiveView: setLiveView,
            showAccount: showAccount,
            userRefresh: userRefresh,
            followLink: followLink,
            periodSelectSetPeriod: periodSelectSetPeriod,
            periodSelectChangeEvent: periodSelectChangeEvent
        };
    }();

    Event.onDOMReady(function(){
        if (window.ZAPNET_CAROUSEL_DATA){
            Carousel = ZAPNET.Carousel(ZAPNET_CAROUSEL_DATA);
            Carousel.start($('#bd div.page-carousel', null, true));
        }
        if (ZAPNET.SportsBookAccount){
            var menuOptions = [{
                    id: 'balance',
                    label: Util.t('Account Info'),
                    onclick: function(){
                        ZAPNET.SportsBookAccount.gotoAccount();
                        ZAPNET.Website.show('account');
                    }
                }, {
                    id: 'deposit',
                    label: Util.t('Deposit'),
                    onclick: function(){
                        ZAPNET.SportsBookAccount.gotoDeposit();
                        ZAPNET.Website.show('account');
                    }
                }, {
                    id: 'withdraw',
                    label: Util.t('Withdraw'),
                    onclick: function(){
                        ZAPNET.SportsBookAccount.gotoWithdraw();
                        ZAPNET.Website.show('account');
                    }
                }, {
                    id: 'statement',
                    label: Util.t('Account Details'),
                    onclick: function(){
                        ZAPNET.SportsBookAccount.gotoStatement();
                        ZAPNET.Website.show('account');
                    }
                }, {
                    id: 'respgamng',
                    label: Util.t('Responsible Gaming'),
                    onclick: function(){
                        ZAPNET.SportsBookAccount.gotoResponsibleGaming();
                        ZAPNET.Website.show('account');
                    }
                }, {
                    id: 'profile',
                    label: Util.t('Profile Details'),
                    onclick: function(){
                        ZAPNET.SportsBookAccount.gotoProfile();
                        ZAPNET.Website.show('account');
                    }
                }, {
                    id: 'bethistory',
                    label: Util.t('Betting History'),
                    onclick: function(){
                        ZAPNET.SportsBookAccount.gotoBettingHistoryCombined();
                        ZAPNET.Website.show('account');
                    }
                }];
            if (!window.ZAPNET_ONLINE_CONSTANTS ||
                !window.ZAPNET_ONLINE_CONSTANTS.PROFILE_RESPONSIBLE_GAMING){
                     menuOptions.splice(4,1);
            }
            if (window.ZAPNET_COMPANYNAME == 'LAVABET'){
                menuOptions.splice(3,1);
            }
            if (window.ZAPNET_ONLINE_CONSTANTS && ZAPNET_ONLINE_CONSTANTS.ACCOUNT_MENU_MESSAGES){
                menuOptions.push({
                    id: 'messages',
                    label: Util.t('Messages'),
                    onclick: function(){
                        ZAPNET.SportsBookAccount.gotoMyMessages();
                        ZAPNET.Website.show('account');
                    }
                });
            }
            if (window.ZAPNET_ONLINE_CONSTANTS && ZAPNET_ONLINE_CONSTANTS.ACCOUNT_MENU_PROMOTIONS){
                menuOptions.splice(1, 0, {
                    id: 'promotions',
                    label: Util.t('Promotions'),
                    onclick: function(){
                        ZAPNET.SportsBookAccount.gotoAccountPromotions();
                        ZAPNET.Website.show('account');
                    }
                });
            }
            if (window.ZAPNET_ONLINE_CONSTANTS && ZAPNET_ONLINE_CONSTANTS.SHOPMANAGER){
                menuOptions.push({
                    id: 'shopmanager',
                    label: Util.t('User Accounts'),
                    onclick: function(){
                        ZAPNET.SportsBookAccount.gotoUserAccounts();
                        ZAPNET.Website.show('account');
                    }
                });
            }
            ZAPNET.SportsBookAccount.setMenuButtons({
                myaccount: {
                        id: 'myaccount',
                        label: Util.t('My Account'),
                        options: menuOptions
                }
            });
        }
        try{
        ZAPNET.Website.init();
        if (window.ZAPNET_COMPANYNAME == 'MegaGame'){
            setTimeout(function(){
                var html = ['<div><h1 style="padding: 5px 0; font-weight: bold; text-align: center; font-size: 150%;">Terms and conditions</h1>',
                    '<p style="padding: 5px 0">In order to use the MEGAGAME betting platform all bets have to be placed on the MEGAGAME floor</p>',
                    '<p style="padding: 5px 0">Via cashier kiosk mobile and laptop, free Wi-Fi is offered for your betting module on the MEGAGAME floor</p>',
                    '<h4 style="padding: 5px 0; font-weight: bold">Cash-in</h4>',
                    '<p style="padding: 5px 0">A voucher can be bought over the counter then entered into self-betting platform on MEGAGAME floor</p>',
                    '<h4 style="padding: 5px 0; font-weight: bold">Cash-out</h4>',
                    '<p style="padding: 5px 0">All winning bets can be cashed out over the counter on MEGAGAME floor</p>',
                    '<p style="padding: 5px 0">FOR BETTING RULES PLEASE READ OUR TERMS AND CONDITIONS ON THE MEGAGAME FLOOR.</p>',
                    '<p style="padding: 5px 0">If you AGREE to our TERMS AND CONDITIONS click OK to proceed to our betting site.</p>',
                    '</div>'];
                Util.showMessage(html.join(''));
            }, 250);
        }
        } catch(e){
            console.log(e);
        }
    });
}());