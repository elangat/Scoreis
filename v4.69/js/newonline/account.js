(function(){

    var Event = YAHOO.util.Event,
        Dom = YAHOO.util.Dom,
        $ = YAHOO.util.Selector.query,
        Util = ZAPNET.util;


    ZAPNET.SportsBookAccount = function(){
        var dom = {},
            element,
            menuButtons = {
                mybets: {
                    id: 'mybets',
                    label: Util.t('My Bets'),
                    options: [{
                        id: 'openbets',
                        label: Util.t('Open Bets'),
                        onclick: function(){
                            gotoBets();
                        }
                    }, {
                        id: 'bethistory',
                        label: Util.t('Betting History'),
                        onclick: function(){
                            gotoBettingHistory();
                        }
                    }, {
                        id: 'betauth',
                        label: Util.t('Authorisations'),
                        onclick: function(){
                            gotoAuthorisations();
                        }
                }]},
                myprofile: {
                    id: 'myprofile',
                    label: Util.t('My Profile'),
                    options: [{
                        id: 'personal',
                        label: Util.t('Personal Info'),
                        onclick: function(){
                            gotoProfile();
                        }
                    }, {
                        id: 'password',
                        label: Util.t('Change Password'),
                        onclick: function(){
                            gotoChangePassword();
                        }
                }]},
                myprofile_malta: {
                    id: 'myprofilemalta',
                    label: Util.t('My Profile'),
                    options: [{
                        id: 'personal',
                        label: Util.t('Personal Info'),
                        onclick: function(){
                            gotoProfile();
                        }
                    }/*, {
                        id: 'settings',
                        label: 'Settings',
                        onclick: function(){
                            gotoProfileSettings();
                        }
                    }*/, {
                        id: 'responsible',
                        label: Util.t('Responsible Gaming'),
                        onclick: function(){
                            gotoResponsibleGaming();
                        }
                    }, {
                        id: 'password',
                        label: Util.t('Change Password'),
                        onclick: function(){
                            gotoChangePassword();
                        }
                }]},
                myaccount: {
                    id: 'myaccount',
                    label: Util.t('My Account'),
                    options: [{
                        id: 'balance',
                        label: Util.t('Account Info'),
                        onclick: function(){
                            gotoAccount();
                        }
                    }, {
                        id: 'statement',
                        label: Util.t('Statement'),
                        onclick: function(){
                            gotoStatement();
                        }
                    }, {
                        id: 'deposit',
                        label: Util.t('Deposit'),
                        onclick: function(){
                            gotoDeposit();
                        }
                    }, {
                        id: 'withdraw',
                        label: Util.t('Withdraw'),
                        onclick: function(){
                            gotoWithdraw();
                        }
                }]},
                mymessages: {
                    id: 'mymessages',
                    label: Util.t('My Messages'),
                    options: [{
                        id: 'messages',
                        label: Util.t('Messages'),
                        onclick: function(){
                            gotoMessages();
                        }
                    }, {
                        id: 'newmessage',
                        label: Util.t('Send Message'),
                        onclick: function(){
                            gotoNewMessage();
                        }
                }]}
            },
            useraccountButtons = {
                id: 'useraccounts',
                label: Util.t('User Accounts'),
                options: [{
                    id: 'newshop',
                    label: Util.t('New Shop'),
                    onclick: function(){
                        gotoUserAccountNewShop();
                    }
                }, {
                    id: 'newcustomer',
                    label: Util.t('New Customer'),
                    onclick: function(){
                        gotoUserAccountNewCustomer();
                    }
                }]
            },

        getServerLocation = function(){
             if (window.ZAPNET_ONLINE_CONSTANTS &&
                 window.ZAPNET_ONLINE_CONSTANTS.SERVER_LOCATION){
                    return window.ZAPNET_ONLINE_CONSTANTS.SERVER_LOCATION;
             }
             return '';
        },

        getMybetsOptions = function(){
             if (window.ZAPNET_ONLINE_CONSTANTS &&
                 window.ZAPNET_ONLINE_CONSTANTS.NO_AUTH){
                    return menuButtons.mybets.options.slice(0, 2);
             }
             if (menuButtons.mybets){
                return menuButtons.mybets.options;
            }
            return false;
        },

        gotoBets = function(){
            ZAPNET.SportsBookPages.gotoPage('/account/mybets.js');
            ZAPNET.SportsBookPages.setMenu(getMybetsOptions(), 'openbets');
        },

        gotoBet = function(betId){
            ZAPNET.SportsBookPages.gotoPage('/account/betslip/id/' + betId + '?inline');
            ZAPNET.SportsBookPages.setMenu(getMybetsOptions(), 'openbets');
        },

        gotoBettingHistory = function(){
            ZAPNET.SportsBookPages.gotoPage('/account/mybethistory.js');
            ZAPNET.SportsBookPages.setMenu(getMybetsOptions(), 'bethistory');
        },

        gotoBettingHistoryCombined = function(){
            ZAPNET.SportsBookPages.gotoPage('/account/bettinghistory.js');
            ZAPNET.SportsBookPages.setMenu(getMybetsOptions(), 'bethistory');
        },

        gotoAuthorisations = function(){
            ZAPNET.SportsBookPages.gotoPage('/account/mybetauth.js');
            ZAPNET.SportsBookPages.setMenu(getMybetsOptions(), 'betauth');
        },

        getProfileOptions = function(){
            if (!menuButtons.myprofile || !menuButtons.myprofile_malta){
                return menuButtons;
            }
            var location = getServerLocation();
            var options = location == 'malta' ? menuButtons.myprofile_malta.options : menuButtons.myprofile.options;
            options = options.slice(0);
            if (window.ZAPNET_ONLINE_CONSTANTS &&
                window.ZAPNET_ONLINE_CONSTANTS.PROFILE_RESPONSIBLE_GAMING){
                   options.push({
                       id: 'responsible',
                       label: Util.t('Responsible Gaming'),
                       onclick: function(){
                           gotoResponsibleGaming();
                       }
                   });
            }
            if (window.ZAPNET_ONLINE_CONSTANTS &&
                window.ZAPNET_ONLINE_CONSTANTS.PROFILE_KYC){
                   options.push({
                       id: 'kyc',
                       label: Util.t('Documents'),
                       onclick: function(){
                           gotoDocuments();
                       }
                   });
            }
            return options;
        },

        gotoProfile = function(){
            var options = getProfileOptions();
            ZAPNET.SportsBookPages.gotoPage('/account/myprofile.js');
            ZAPNET.SportsBookPages.setMenu(options, 'personal');
        },

        gotoChangePassword = function(){
            var options = getProfileOptions();
            ZAPNET.SportsBookPages.gotoPage('/account/mypassword.js');
            ZAPNET.SportsBookPages.setMenu(options, 'password');
        },

        gotoProfileSettings = function(){
            ZAPNET.SportsBookPages.gotoPage('/settings/settings.js');
            ZAPNET.SportsBookPages.setMenu(menuButtons.myprofile_malta.options, 'settings');
        },

        gotoResponsibleGaming = function(){
            var options = getProfileOptions();
            ZAPNET.SportsBookPages.gotoPage('/settings/respgaming.js');
            ZAPNET.SportsBookPages.setMenu(options, 'responsible');
        },

        gotoDocuments = function(){
            var options = getProfileOptions();
            ZAPNET.SportsBookPages.gotoPage('/settings/kyc.js');
            ZAPNET.SportsBookPages.setMenu(options, 'kyc');
        },

        gotoAccount = function(){
            ZAPNET.SportsBookPages.gotoPage('/account/myaccount.js');
            ZAPNET.SportsBookPages.setMenu(menuButtons.myaccount.options, 'balance');
        },

        gotoAccountPromotions = function(){
            ZAPNET.SportsBookPages.gotoPage('/account/promotions.js');
            ZAPNET.SportsBookPages.setMenu(menuButtons.myaccount.options, 'promotions');
        },

        gotoStatement = function(){
            ZAPNET.SportsBookPages.gotoPage('/account/mystatement.js');
            ZAPNET.SportsBookPages.setMenu(menuButtons.myaccount.options, 'statement');
        },

        gotoDeposit = function(){
            ZAPNET.SportsBookPages.gotoPage('/account/mydeposit.js');
            ZAPNET.SportsBookPages.setMenu(menuButtons.myaccount.options, 'deposit');
        },

        gotoWithdraw = function(){
            ZAPNET.SportsBookPages.gotoPage('/account/mywithdraw.js');
            ZAPNET.SportsBookPages.setMenu(menuButtons.myaccount.options, 'withdraw');
        },

        gotoMessages = function(){
            ZAPNET.SportsBookPages.gotoPage('/account/mymessages.js');
            ZAPNET.SportsBookPages.setMenu(menuButtons.mymessages.options, 'messages');
        },

        gotoMyMessages = function(){
            ZAPNET.SportsBookPages.gotoPage('/account/mymessages.js');
            ZAPNET.SportsBookPages.setMenu(menuButtons.myaccount.options, 'messages');
        },

        gotoNewMessage = function(){
            ZAPNET.SportsBookPages.gotoPage('/account/newmessage.js');
            ZAPNET.SportsBookPages.setMenu(menuButtons.mymessages.options, 'messages');
        },

        gotoUserAccounts = function(){
            ZAPNET.SportsBookPages.gotoPage('/account/useraccounts.js');
            ZAPNET.SportsBookPages.setMenu(useraccountButtons.options, 'useraccounts');
        },

        gotoContent = function(el){
            var href = el ? Dom.getAttribute(el, 'href') : false;
            if (!href){
                href = window.location.href;
            }
            var hrefParts = href.split('#');
            var content = '';
            if (hrefParts.length > 1){
                var qsParts = hrefParts[1].split(':');
                if (qsParts.length > 1){
                    content = qsParts[1];
                }
            }
            ZAPNET.SportsBookPages.gotoPage('/about/content.js?id=' + content);
            ZAPNET.SportsBookPages.setMenu(false);
        },

        gotoHelp = function(){
            ZAPNET.SportsBookPages.gotoPage('/about/help.js');
            ZAPNET.SportsBookPages.setMenu(false);
        },

        gotoNews = function(){
            ZAPNET.SportsBookPages.gotoPage('/about/news.js');
            ZAPNET.SportsBookPages.setMenu(true);
        },

        gotoFaq = function(){
            ZAPNET.SportsBookPages.gotoPage('/about/faq.js');
            ZAPNET.SportsBookPages.setMenu(true);
        },
        
        gotoDeposits = function(){
            ZAPNET.SportsBookPages.gotoPage('/about/deposits.js');
            ZAPNET.SportsBookPages.setMenu(true);
        },

        gotoRegister = function(){
            ZAPNET.SportsBookPages.gotoPage('/register');
            ZAPNET.SportsBookPages.setMenu(false);
        },

        gotoTerms = function(){
            ZAPNET.SportsBookPages.gotoPage('/about/terms.js');
            ZAPNET.SportsBookPages.setMenu(false);
        },

        gotoPrivacy = function(){
            ZAPNET.SportsBookPages.gotoPage('/about/privacy.js');
            ZAPNET.SportsBookPages.setMenu(false);
        },

        gotoRules = function(){
            ZAPNET.SportsBookPages.gotoPage('/about/rules.js');
            ZAPNET.SportsBookPages.setMenu(false);
        },

        gotoPromotions = function(){
            ZAPNET.SportsBookPages.gotoPage('/about/promotions.js');
            ZAPNET.SportsBookPages.setMenu(true);
        },

        gotoCareers = function(){
            ZAPNET.SportsBookPages.gotoPage('/about/careers.js');
            ZAPNET.SportsBookPages.setMenu(true);
        },

        gotoGambling = function(){
            ZAPNET.SportsBookPages.gotoPage('/about/gambling.js');
            ZAPNET.SportsBookPages.setMenu(false);
        },

        gotoAbout = function(){
            ZAPNET.SportsBookPages.gotoPage('/about/about.js');
            ZAPNET.SportsBookPages.setMenu(false);
        },
        gotoPayments = function(){
            ZAPNET.SportsBookPages.gotoPage('/about/payments.js');
            ZAPNET.SportsBookPages.setMenu(false);
        },

        gotoContactUs = function(){
            ZAPNET.SportsBookPages.gotoPage('/about/contactus.js');
            ZAPNET.SportsBookPages.setMenu(false);
        },

        gotoBonus = function(){
            ZAPNET.SportsBookPages.gotoPage('/about/bonus.js');
            ZAPNET.SportsBookPages.setMenu(false);
        },

        gotoStatistics = function(){
            ZAPNET.SportsBookPages.gotoPage('/about/statistics.js');
            ZAPNET.SportsBookPages.setMenu(false);
        },

        gotoResults = function(){
            ZAPNET.SportsBookPages.gotoPage('/about/results.js');
            ZAPNET.SportsBookPages.setMenu(false);
        },

        showMenu = function(el){
            var location = getServerLocation();
            var html = ['<ul class="menu">'];
            var menuActions = {};
            Util.foreach(menuButtons, function(submenu){
                if (location == 'malta'){
                    if (submenu.id == 'myprofile'){
                        return;
                    }
                } else {
                    if (submenu.id == 'myprofilemalta'){
                        return;
                    }
                }
                html.push('<li><div class="header">', submenu.label, '</div></li><ul>');
                Util.foreach(submenu.options, function(option){
                    html.push('<li><a href="#" class="account-menu-item ',option.id ,'" mi="', option.id, '">', option.label, '</a></li>');
                    menuActions[option.id] = option.onclick;
                });
                html.push('</ul></li>');
            });
            html.push('</ul>');
            Event.purgeElement(el);
            el.innerHTML = html.join('');
            Event.on(el, 'click', function(e){
                var el = Event.getTarget(e);
                if (Dom.hasClass(el, 'account-menu-item')){
                    var mi = Dom.getAttribute(el, 'mi');
                    if (menuActions[mi]){
                        menuActions[mi]();
                    }
                }
                Event.preventDefault(e);
            });
        },

        setMenuButtons = function(mButs){
            menuButtons = mButs;
        },

        show = function(){

        };

        return {
            gotoBets: gotoBets,
            gotoBet: gotoBet,
            gotoProfile: gotoProfile,
            gotoAccount: gotoAccount,
            gotoMessages: gotoMessages,
            gotoMyMessages: gotoMyMessages,
            gotoHelp: gotoHelp,
            gotoRegister: gotoRegister,
            gotoTerms: gotoTerms,
            gotoPrivacy: gotoPrivacy,
            gotoRules: gotoRules,
            gotoPromotions: gotoPromotions,
            gotoAccountPromotions: gotoAccountPromotions,
            gotoCareers : gotoCareers,
            gotoAbout: gotoAbout,
            gotoPayments: gotoPayments,
            gotoBonus: gotoBonus,
            gotoDeposit: gotoDeposit,
            gotoWithdraw: gotoWithdraw,
            gotoStatement: gotoStatement,
            gotoStatistics: gotoStatistics,
            gotoResults: gotoResults,
            gotoContactUs: gotoContactUs,
            gotoGambling: gotoGambling,
            gotoDocuments: gotoDocuments,
            gotoUserAccounts: gotoUserAccounts,
            gotoContent: gotoContent,
            setMenuButtons: setMenuButtons,
            gotoBettingHistory: gotoBettingHistory,
            gotoBettingHistoryCombined: gotoBettingHistoryCombined,
            gotoResponsibleGaming: gotoResponsibleGaming,
            showMenu: showMenu,
            show: show,
            gotoFaq: gotoFaq,
            gotoDeposits: gotoDeposits,
            gotoNews: gotoNews,
            gotoChangePassword: gotoChangePassword,
            gotoNewMessage: gotoNewMessage,
            gotoAuthorisations: gotoAuthorisations
        };
    }();

}());