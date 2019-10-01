(function(){

    var Event = YAHOO.util.Event,
        Dom = YAHOO.util.Dom,
        $ = YAHOO.util.Selector.query,
        Util = ZAPNET.util;

    var validate = function(out){
        if (ZAPNET.WebSite){
            ZAPNET.Website.userRefresh();
            ZAPNET.MainMenu.setup();
            if (out && ZAPNET.Website.isView('account')){
                ZAPNET.Website.show('home');
            }
        } else {
            window.location.href = '/';
        }        
    };
    
    var setupLogin = function(){
        var headerTop = Dom.get('hd');
        var usernameInput = Dom.get('username-input');
        var passwordInput = Dom.get('password-input');
        if (usernameInput && passwordInput){
            var defaultUsername = usernameInput.value;
            var defaultPassword = passwordInput.value;

            Event.on(usernameInput, 'click', function(e){
                if (usernameInput.value == defaultUsername){
                    usernameInput.value = '';
                }
            });
            Event.on(passwordInput, 'click', function(e){
                if (passwordInput.value == defaultPassword){
                    passwordInput.value = '';
                }
            });
            Event.on(usernameInput, 'focus', function(e){
                if (usernameInput.value == defaultUsername){
                    usernameInput.value = '';
                }
            });
            Event.on(passwordInput, 'focus', function(e){
                if (passwordInput.value == defaultPassword){
                    passwordInput.value = '';
                }
            });

            Event.on(usernameInput, 'blur', function(e){
                if ($P.trim(usernameInput.value) == ''){
                    usernameInput.value = defaultUsername;
                }
            });
            Event.on(passwordInput, 'blur', function(e){
                if ($P.trim(passwordInput.value) == ''){
                    passwordInput.value = defaultPassword;
                }
            });

            var login = Dom.get('user-login');
            if (login){
                Event.on(login, 'click', function(e){
                    Event.preventDefault(e);
                    var callback = {
                        success: function(o){
                            var response = eval('(' + o.responseText + ')');
                            if (response.html){
                                Event.purgeElement(headerTop);
                                headerTop.innerHTML = response.html;
                                setupLogin();
                                validate();
                                return;
                            }
                        },
                        failure: function(o){
                        },
                        cache: false,
                        timeout: 30000
                    };
                    YAHOO.util.Connect.asyncRequest('POST', '/sports/login.js', callback, 'username=' +
                        escape($P.trim(usernameInput.value)) + '&password=' +
                        escape($P.trim(passwordInput.value))
                    );
                });
            }
        } else {
            var logout = Dom.get('user-logout');
            if (logout){
                Event.on(logout, 'click', function(e){
                    Event.preventDefault(e);
                    var callback = {
                        success: function(o){
                            var response = eval('(' + o.responseText + ')');
                            if (response.html){
                                Event.purgeElement(headerTop);
                                headerTop.innerHTML = response.html;
                                setupLogin();
                                validate(true);
                                return;
                            }
                        },
                        failure: function(o){
                        },
                        cache: false,
                        timeout: 30000
                    };
                    YAHOO.util.Connect.asyncRequest('GET', '/sports/logout.js', callback);
                });
            }
        }
    };


    Event.onDOMReady(function(){
        setupLogin();
    });
}());