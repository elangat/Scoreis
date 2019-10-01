(function(){

    var Event = YAHOO.util.Event,
        Dom = YAHOO.util.Dom,
        $ = YAHOO.util.Selector.query,
        Util = ZAPNET.util;


    ZAPNET.SportsBookPages = function(){
        var dom = {},
            element,
            lastUrl = false,
            currentUrl = false,
            backBtnExclude = {},
            lastMenu,
            eventListener,
            contentLoadedEvent = new YAHOO.util.CustomEvent('Content Loaded', this, false, YAHOO.util.CustomEvent.FLAT),
            transactionURLs = {},
            showPageContent = function(o){
                var contentEl = $('div.sportsbook-account-content', element, true);
                if (o.responseText.substring(0, 1) == '{'){
                    var response = eval('(' + o.responseText + ')');
                    if (response && response.error){
                        Util.showErrorMessage(Util.t(response.error), Util.t('Error'));
                    }
                } else {
                    Event.purgeElement(contentEl);
                    contentEl.innerHTML = o.responseText;
                    Util.translatePage(contentEl);
                    Event.on(contentEl, 'click', contentClick);
                    Event.on(contentEl, 'submit', contentFormSubmit);
                    Event.on($('select:not(.no-auto-submit)', contentEl), 'change', contentSelectChange);
                    Dom.removeClass(contentEl, 'loading');
                    exec_body_scripts(contentEl);
                    if (transactionURLs[o.tId]){
                        contentLoadedEvent.fire(transactionURLs[o.tId]);
                        delete transactionURLs[o.tId];
                    }
                }
            },
            callbackGet = {
                success: function(o){
                    showPageContent(o);
                },
                failure: function(o){
                    var contentEl = $('div.sportsbook-account-content', element, true);
                    contentEl.innerHTML = 'Error: Could not connect to server. Please try again';
                    Dom.removeClass(contentEl, 'loading');
                },
                cache: false,
                timeout: 15000
            },
            callbackForm = {
                success: function(o){
                    if ($P.in_array(o.responseText.substring(0, 1),  ['{', '['])){
                        var result = eval('(' + o.responseText + ')');
                        if (result.error){
                            Util.showErrorMessage(Util.t(result.error), Util.t('Error'));
                        } else {
                            if (result.message){
                                Util.showSuccessMessage(Util.t(result.message), Util.t('Success'));
                            }
                        }
                        if (!result.donotreload){
                            reloadCurrentPage();
                        }
                    } else {
                        showPageContent(o);
                    }
                },
                failure: function(o){
                    var contentEl = $('div.sportsbook-account-content', element, true);
                    contentEl.innerHTML = Util.t('Error: Could not connect to server. Please try again');
                    Dom.removeClass(contentEl, 'loading');
                },
                cache: false,
                timeout: 25000
            },
            menuButtons,

        menuClick = function(e){
            var el = Event.getTarget(e);
            if (Dom.hasClass(el, 'menu-button')){
                var mid = Dom.getAttribute(el, 'mid');
                if (menuButtons[mid]){
                    menuButtons[mid]();
                }
            }
        },

        contentClick = function(e){
            var el = Event.getTarget(e);

            if (eventListener){
                if (eventListener(e)){
                    return;
                }
            }
            var tag = el.tagName.toLowerCase();

            if (tag == 'a' && !Dom.hasClass(el, 'external-url')){
                var href = Dom.getAttribute(el, 'href');
                Event.preventDefault(e);
                if (href && href != '#'){
                    var tab = Dom.getAncestorByClassName(el, 'content-tab');
                    var tabName = false;
                    if (tab){
                        tabName = Dom.getAttribute(tab, 'tabName');
                    }
                    gotoPageInt(getInlineUrl(href) + (tabName ? '&tab=' + tabName : ''));
                    if (!backBtnExclude[clearInlineUrl(href)]){
                        setupGoBack();
                    }
                }
            }
        },

        exec_body_scripts = function (body_el) {
            // Finds and executes scripts in a newly added element's body.
            // Needed since innerHTML does not run scripts.
            //
            // Argument body_el is an element in the dom.

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
                    children_nodes = body_el.childNodes,
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

        getInlineUrl = function(url){
            if (!url){
                return '';
            }
            var qPos = url.indexOf('?');
            if (qPos >= 0){
                url = url + '&inline';
            } else {
                url = url + '?inline';
            }
            return url;
        },

        clearInlineUrl = function(url){
            url = url.replace('&inline', '');
            url = url.replace('?inline&', '?');
            url = url.replace('?inline', '');
            return url;
        },

        contentFormSubmit = function(e){
            var form = Event.getTarget(e);
            Event.preventDefault(e);
            var data = Util.serialiseForm(form);
            var action = getInlineUrl(Dom.getAttribute(form, 'action'));
            var req = YAHOO.util.Connect.asyncRequest('POST', action, callbackForm, data);
            transactionURLs[req.tId] = action;
        },

        formSubmit = function(action, data){
            var req = YAHOO.util.Connect.asyncRequest('POST', action, callbackForm, data);
            transactionURLs[req.tId] = action;
        },

        contentSelectChange = function(e){
            if (eventListener){
                if (eventListener(e)){
                    return;
                }
            }

            var select = Event.getTarget(e);
            var value = Util.selectValue(select);
            var params = {};
            params[select.name.replace('extra_', '')] = value;
            var url = Util.updateUrlParameters(currentUrl, params);
            gotoPage(url);
            setMenu(lastMenu.buttons, lastMenu.selected);
        },

        setupGoBack = function(){
            setMenuInt([{
                label: Util.t('Go Back'),
                id: 'goback',
                onclick: goBack
            }], null, true);
        },

        goBack = function(){
            gotoPageInt(getInlineUrl(lastUrl));
            setMenuInt(lastMenu.buttons, lastMenu.selected);
        },

        reloadCurrentPage = function(){
            gotoPageInt(getInlineUrl(currentUrl));
            setMenuInt(lastMenu.buttons, lastMenu.selected);
        },

        gotoPageInt = function(url){
            lastUrl = currentUrl;
            currentUrl = url;
            element.innerHTML = '<div class="sporstbook-account"><div class="sportsbook-account-menu"></div><div class="sportsbook-account-content loading"></div></div>';
            var req = YAHOO.util.Connect.asyncRequest('GET', url, callbackGet);
            transactionURLs[req.tId] = url;
        },

        setMenuInt = function(buttons, selected, isBackMenu){
            var menuEl = $('div.sportsbook-account-menu', element, true);
            if (!menuEl){
                return;
            }
            if (!buttons){
                Dom.addClass(menuEl, 'closed');
                return;
            } else {
                Dom.removeClass(menuEl, 'closed');
            }
            if (isBackMenu){
                Dom.addClass(menuEl, 'menu-go-back');
            } else {
                Dom.removeClass(menuEl, 'menu-go-back');
            }
            var html = [];
            menuButtons = {};
            Util.foreach(buttons, function(button){
                html.push('<button class="menu-button');
                if (button.id == selected){
                    html.push(' selected');
                }
                html.push('" mid="', button.id, '">');
                html.push(Util.t(button.label));
                if (isBackMenu && button.id == "goback"){
                    html.push('<span class="goback"></span>');
                }
                html.push('</button>');
                menuButtons[button.id] = button.onclick;
            });
            menuEl.innerHTML = html.join('');
            Event.purgeElement(menuEl);
            Event.on(menuEl, 'click', menuClick);
        },

        gotoPage = function(url, inline, isSubpage){
            var backButton = false;
            if (isSubpage){
                if (currentUrl){
                    backButton = true;
                }
            } else {
                backBtnExclude[url] = url;
            }
            if (inline){
                url = getInlineUrl(url);
            }
            gotoPageInt(url);
            var endUri = url.substr(url.lastIndexOf('/') + 1);
            var hash = endUri.substr(0,endUri.indexOf('.'));
            ZAPNET.Paginator.setPage(hash);
            if (backButton){
                setupGoBack();
            }
            window.scrollTo(0, 0);
        },

        setMenu = function(buttons, selected){
            lastMenu = {
                buttons: buttons,
                selected: selected
            };
            setMenuInt(buttons, selected);
        },

        setEventListener = function(evList){
            eventListener = evList;
        },

        setContainer = function(el){
            element = el;
        };

        return {
            setContainer: setContainer,
            setEventListener: setEventListener,
            contentLoadedEvent: contentLoadedEvent,
            formSubmit: formSubmit,
            gotoPage: gotoPage,
            setMenu: setMenu
        };
    }();

    ZAPNET.Paginator = function() {
        var dom = {},
        pages = {
                sports:['sports', 'favorites', 'antepost', 'worldcup', 'match', 'live'],
                accounts:{ mybets : 'gotoBets',
                           mybethistory : 'gotoBettingHistory',
                           bettinghistory : 'gotoBettingHistoryCombined',
                           mybetauth : 'gotoAuthorisations',
                           myprofile : 'gotoProfile',
                           mypassword : 'gotoChangePassword',
                           settings : 'gotoProfileSettings' ,
                           respgaming : 'gotoResponsibleGaming' ,
                           kyc : 'gotoDocuments',
                           myaccount : 'gotoAccount',
                           mystatement : 'gotoStatement',
                           mydeposit : 'gotoDeposit',
                           mywithdraw : 'gotoWithdraw',
                           mymessages : 'gotoMessages',
                           newmessage : 'gotoNewMessage' ,
                           useraccounts : 'gotoUserAccounts',
                           help : 'gotoHelp',
                           news : 'gotoNews',
                           faq : 'gotoFaq',
                           deposits : 'gotoDeposits',
                           register : 'gotoRegister',
                           terms : 'gotoTerms',
                           privacy : 'gotoPrivacy',
                           rules : 'gotoRules',
                           promotions : 'gotoPromotions',
                           careers : 'gotoCareers',
                           gambling : 'gotoGambling',
                           content : 'gotoContent',
                           about : 'gotoAbout',
                           contactus : 'gotoContactUs',
                           bonus : 'gotoBonus',
                           statistics : 'gotoStatistics',
                           results : 'gotoResults'}
        },
        getCurrentPage = function(){
            return window.ZAPNET.currentPage;
        },
        setCurrentPage = function( page){
            window.ZAPNET.currentPage = page;
        },
        getCurrentHash = function(){
            return window.location.hash;
        },
        loadPage = function(){
            if(window.ZAPNET_CONSTANTS.THEME !== 'betonalfa'){
                return;
            }
            var page = getCurrentHash().substr(1);
            if( page !== null && getCurrentPage() !== page ) {
                console.log('change page to ' + window.location.hash );
                if( pages.sports.indexOf(page) > -1){
                    ZAPNET.SportsBook.gotoProduct(page);

                } else if(pages.accounts.hasOwnProperty(page)) {
                    var accounts = ZAPNET.SportsBookAccount;
                    var fn = accounts[pages.accounts[page]];
                    if(typeof fn === 'function') {
                        fn();
                    }
                } else if (page.indexOf('betslip') > -1){
                    var slipId = page.substr(page.lastIndexOf('-') + 1);
                    ZAPNET.SportsBookAccount.gotoBet(slipId);
                    setPage('betslip-' + slipId);
                }
            }
        },
        setPage = function (pageHash){
            if(pageHash == 'undefined') {
               return;
            }
            if(window.ZAPNET_CONSTANTS.THEME !== 'betonalfa'){
                return;
            }
            if(getCurrentPage() !== pageHash ) {
                setCurrentPage(pageHash);
                window.location.hash = pageHash;
            }
        },
        clearHistory = function() {

        },
        setInlineLink = function(el, type){
           if(type == 'betslip'){
              var link = Dom.getAttribute(el, 'href');
              var slipId = link.substr(link.lastIndexOf('/') + 1);
              setPage('betslip-' + slipId);
           }
        },
        init = function() {
             window.addEventListener('hashchange',  loadPage , false);
        };

     return {
        getCurrentHash : getCurrentHash,
        loadPage : loadPage,
        setPage : setPage,
        clearHistory : clearHistory,
        setInlineLink : setInlineLink,
        init : init
        };
    }();
}());